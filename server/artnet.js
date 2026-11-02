class ArtNetController {
  constructor(config = {}) {
    this.config = {
      enabled: true,
      universe: 1,
      ip: '127.0.0.1',
      port: 6454,
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
      ip: this.config.ip,
      port: this.config.port,
    };
  }

  sendFrame(channels = []) {
    if (!this.isEnabled()) {
      return { sent: false, reason: 'disabled' };
    }

    this.connect();

    return {
      sent: true,
      protocol: 'Art-Net',
      universe: this.config.universe,
      channelCount: channels.length,
    };
  }
}

module.exports = { ArtNetController };
