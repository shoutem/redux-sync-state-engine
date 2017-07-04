export default function middleware(syncStateEngine) {
  return () => next => action => {
    syncStateEngine.processAction(action);

    return next(action);
  };
}
