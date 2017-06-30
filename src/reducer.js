import _ from 'lodash';
import diff from 'deep-diff';
import { getStatusProp } from './status';
import {
  SYNC_STATE,
} from './const.js';

// reducer
export default function syncStateEngineReducer(reducer, syncStateEngine) {
  const { stateSerializer } = syncStateEngine;

  return (state, action) => {
    if (action.type !== SYNC_STATE) {
      const newState = reducer(state, action);

      const stateKeys = _.keys(state);
      const newStateKeys = _.keys(newState);

      const missingKeys = _.difference(stateKeys, newStateKeys);
      const missingState = _.pick(state, missingKeys);

      return {
        ...newState,
        ...missingState,
      };
    }

    /*const source = getStatusProp(action, 'source');
    const { id: sourceId, ownExtensionName } = source;
    if (!sourceId || sourceId === 'builder') {
      return state;
    }*/

    const { payload: serializedDifferences } = action;
    const differences = stateSerializer.deserialize(serializedDifferences);

    /*const ownExtensionState = state[ownExtensionName] || {};
    const newOwnExtensionState = fromSerializableFormat(toSerializableFormat(ownExtensionState));
    const newState = {
      ...state,
      [ownExtensionName]: newOwnExtensionState,
    };*/
    const newState = stateSerializer.deserialize(stateSerializer.serialize((state)));

    _.forEach(_.reverse(differences), difference => {
      /*const extensionPath = _.get(difference, 'path.0');
      if (extensionPath !== ownExtensionName) {
        return;
      }*/

      diff.applyChange(newState, {}, difference);
    });

    return newState;
  };
}
