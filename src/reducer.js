import _ from 'lodash';
import diff from '@shoutem/deep-diff';
import {
  SYNC_STATE,
} from './const.js';

export default function enableStateSync(reducer, syncStateEngine) {
  const {
    stateSerializer,
    shouldApplyDifference,
    selectSyncState,
    getActionSource,
  } = syncStateEngine;

  return (state, action) => {
    // Due to the nature of combineReducer to create new state only based on defined reducers,
    // every other key of static data will not be moved to new state instance. Sync state engine
    // allow syncing state without knowledge of reducers and thus needs to keep those missing
    // keys. Assumption is that case is only valid for root keys.
    if (action.type !== SYNC_STATE) {
      const newState = reducer(state, action);

      const stateKeys = _.keys(state);
      const newStateKeys = _.keys(newState);

      const missingKeys = _.difference(stateKeys, newStateKeys);
      if (_.isEmpty(missingKeys)) {
        return newState;
      }

      const missingState = _.pick(state, missingKeys);

      return {
        ...newState,
        ...missingState,
      };
    }

    const source = getActionSource(action);

    const { payload: serializedDifferences } = action;
    const differences = stateSerializer.deserialize(serializedDifferences);

    const stateToSync = selectSyncState(state, source);
    const newStateToSync = stateSerializer.deserialize(stateSerializer.serialize(stateToSync));
    const newState = {
      ...state,
      ...newStateToSync,
    };

    _.forEach(_.reverse(differences), difference => {
      if (!shouldApplyDifference(difference, source)) {
        return;
      }

      diff.applyChange(newState, {}, difference);
    });

    return newState;
  };
}
