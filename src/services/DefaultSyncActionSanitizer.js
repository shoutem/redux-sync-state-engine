export default class DefaultSyncActionSanitizer {
  constructor() {
    this.sanitizeInbound = this.sanitizeInbound.bind(this);
    this.sanitizeOutbound = this.sanitizeOutbound.bind(this);
  }

  sanitizeInbound(action) {
    return action;
  }

  sanitizeOutbound(action) {
    return action;
  }
}
