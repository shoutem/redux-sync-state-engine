export default class DefaultSyncActionFilter {
  constructor() {
    this.filterInbound = this.filterInbound.bind(this);
    this.filterOutbound = this.filterOutbound.bind(this);
  }

  filterInbound(action) {
    return action;
  }

  filterOutbound(action) {
    return action;
  }
}
