import { getStatusProp } from './status';
import {
  SYNC_ACTION,
} from './const.js';

export default function middleware(syncStateEngine) {
  const syncActionFilter = syncStateEngine.syncActionFilter;

  return () => next => action => {
    const source = getStatusProp(action, 'source');

    const filteredAction = syncActionFilter.filterOutbound(action);
    if (!filteredAction) {
      return next(action);
    }

    const syncAction = [SYNC_ACTION, filteredAction];

    const subscribers = syncStateEngine.getActionsSyncSubscribers();
    subscribers.forEach((subscriber) => subscriber(syncAction, source));

    return next(action);
  };
};

