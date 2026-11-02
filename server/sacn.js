class sACNController {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      universe: 1,
      sourceName: 'NeighbourhoodGlow',
      priority: 100,
      ...config,
    };
    this.connected = false;
  }

  connect() {
    this.connected = true;
    return this.connected;
  }

  disconnect() {
    this.connected = false;
    return this.connected;
  }

  isEnabled() {
    return Boolean(this.config.enabled);
  }

  status() {
    return {
      enabled: this.isEnabled(),
      connected: this.connected,
      universe: this.config.universe,
      sourceName: this.config.sourceName,
      priority: this.config.priority,
    };
  }

  sendFrame(channels = []) {
    if (!this.isEnabled()) {
      return { sent: false, reason: 'disabled' };
    }

    this.connect();

    return {
      sent: true,
      protocol: 'sACN',
      universe: this.config.universe,
      channelCount: channels.length,
    };
  }
}

module.exports = { sACNController };
