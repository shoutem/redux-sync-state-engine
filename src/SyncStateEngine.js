import diff from 'deep-diff';
import _ from 'lodash';
import {
  SYNC_STATE,
  SYNC_ACTION,
} from './const.js';
import { setStatus } from './status';
import {
  DefaultSyncActionFilter,
  DefaultStateSerializer,
} from './services';

export default class SyncStateEngine {
  constructor(config = {}) {
    this.subscribeToActionsSync = this.subscribeToActionsSync.bind(this);
    this.unsubscribeToActionsSync = this.unsubscribeToActionsSync.bind(this);
    this.getActionsSyncSubscribers = this.getActionsSyncSubscribers.bind(this);
    this.calculateDifferences = this.calculateDifferences.bind(this);

    this.actionSyncSubscribers = [];

    const {
      syncActionFilter,
      stateSerializer,
      shouldApplyDifference,
      selectSyncState,
    } = config;

    this.syncActionFilter = syncActionFilter || new DefaultSyncActionFilter();
    this.stateSerializer = stateSerializer || new DefaultStateSerializer();
    this.shouldApplyDifference = shouldApplyDifference || (() => true);
    this.selectSyncState = selectSyncState || _.identity;
  }

  subscribeToActionsSync(subscriber) {
    this.actionSyncSubscribers.push(subscriber);
  }

  unsubscribeToActionsSync(subscriber) {
    const index = _.indexOf(this.actionSyncSubscribers, subscriber);

    if (index >= 0) {
      this.actionSyncSubscribers.splice(index, 1);
    }
  }

  getActionsSyncSubscribers() {
    return this.actionSyncSubscribers;
  }

  calculateDifferences(state = {}, nextState = {}, pathScope) {
    if (state === nextState) {
      return null;
    }

    const differences = diff(state, nextState, (d, k) => {
      if (_.isEmpty(d) && k === pathScope) {
        return false;
      }
      if (d[0] === pathScope) {
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

  processExternalSync(message, source) {
    switch (message.type) {
      case SYNC_ACTION: {
        const actionToSync = message.payload;

        const filteredActionToSync = this.syncActionFilter.filterInbound(actionToSync);
        if (!filteredActionToSync) {
          return null;
        }

        setStatus(filteredActionToSync, {
          source,
        });

        console.log('EXT rcv SYNC_ACTION', filteredActionToSync);
        return filteredActionToSync;
      }
      case SYNC_STATE: {
        const stateToSync = message;

        setStatus(stateToSync, {
          source,
        });

        console.log('EXT rcv SYNC_STATE', stateToSync);
        return stateToSync;
      }
      default:
        return null;
    }
  }
}
