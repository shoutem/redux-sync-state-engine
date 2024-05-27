import diff from '@shoutem/deep-diff';
import _ from 'lodash';
import {
  SYNC_STATE,
  SYNC_ACTION,
  METADATA,
} from './const.js';
import { setMetadata, getMetadataProp } from './services/metadata';
import {
  DefaultSyncActionSanitizer,
  DefaultStateSerializer,
} from './services';

export default class SyncStateEngine {
  constructor(config = {}) {
    this.subscribeToActions = this.subscribeToActions.bind(this);
    this.unsubscribeFromActions = this.unsubscribeFromActions.bind(this);
    this.calculateDifferences = this.calculateDifferences.bind(this);
    this.processAction = this.processAction.bind(this);
    this.processExternalChange = this.processExternalChange.bind(this);
    this.getActionSource = this.getActionSource.bind(this);
    this.setActionSource = this.setActionSource.bind(this);

    this.actionsSubscribers = [];

    const {
      syncActionSanitizer,
      stateSerializer,
      shouldApplyDifference,
      selectSyncState,
    } = config;

    this.syncActionSanitizer = syncActionSanitizer || new DefaultSyncActionSanitizer();
    this.stateSerializer = stateSerializer || new DefaultStateSerializer();
    this.shouldApplyDifference = shouldApplyDifference || (() => true);
    this.selectSyncState = selectSyncState || _.identity;
  }

  subscribeToActions(subscriber) {
    this.actionsSubscribers.push(subscriber);
  }

  unsubscribeFromActions(subscriber) {
    _.remove(this.actionsSubscribers, s => s === subscriber);
  }

  /**
   * Calculates differences between two instances of state. Differences are described in array
   * containing each description of difference between instances. PathScope allows to scope
   * search for differences to a key in root level.
   * @param state previous instance of state
   * @param nextState current instance of state
   * @param pathScope defines root state property key that will bound search for differences only
   * to content under such key, otherwise default behaviour is search for diff in whole state
   * @returns {*} Sync action
   */
  calculateDifferences(state = {}, nextState = {}, pathScope = null) {
    if (state === nextState) {
      return null;
    }

    // calculate differences only for allowed paths
    const differences = diff(state, nextState, (path, key) => {
      if (!pathScope) {
        return false;
      }
      if (_.isEmpty(path) && key === pathScope) {
        return false;
      }
      if (path[0] === pathScope) {
        return false;
      }

      return true;
    });

    if (!differences) {
      return null;
    }

    const serializedDifferences = this.stateSerializer.serialize(differences);
    return [SYNC_STATE, serializedDifferences];
  }

  processAction(action) {
    const sanitizedAction = this.syncActionSanitizer.sanitizeOutbound(action);
    if (!sanitizedAction) {
      return;
    }

    const syncAction = [SYNC_ACTION, sanitizedAction];
    const source = this.getActionSource(action);
    this.actionsSubscribers.forEach((subscriber) => (
      subscriber(syncAction, source)
    ));
  }

  processExternalChange(message, source) {
    switch (message.type) {
      case SYNC_ACTION: {
        const syncAction = message.payload;

        const sanitizedAction = this.syncActionSanitizer.sanitizeInbound(syncAction);
        if (!sanitizedAction) {
          return null;
        }

        this.setActionSource(sanitizedAction, source);
        return sanitizedAction;
      }
      case SYNC_STATE: {
        const syncState = message;
        this.setActionSource(syncState, source);
        return syncState;
      }
      default:
        return null;
    }
  }

  getActionSource(action) {
    return getMetadataProp(action, 'source', METADATA);
  }

  setActionSource(action, source) {
    const metadata = {
      source,
    };

    setMetadata(
      action,
      metadata,
      METADATA,
    );
  }
}
