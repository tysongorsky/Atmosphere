function clamp(value, min = 0, max = 255) {
  return Math.min(Math.max(value, min), max);
}

function normalizeColor(value) {
  if (typeof value === 'number') {
    return clamp(Math.round(value));
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return clamp(Math.round(parsed));
    }
  }

  return 0;
}

function normalizeChannels(channels = []) {
  return channels.map((value) => normalizeColor(value));
}

function buildChannelPayload(input = {}) {
  const scene = input.scene || 'festival';
  const channels = normalizeChannels(input.channels || [255, 128, 64, 32]);
  const metadata = {
    scene,
    label: input.label || 'Scene update',
    timestamp: new Date().toISOString(),
  };

  return {
    scene,
    channels,
    metadata,
  };
}

function parseMessage(message = {}) {
  if (typeof message === 'string') {
    try {
      return parseMessage(JSON.parse(message));
    } catch (error) {
      return { ok: false, error: 'invalid-json' };
    }
  }

  if (Array.isArray(message.channels)) {
    return buildChannelPayload({ scene: message.scene || 'decoded', channels: message.channels });
  }

  return {
    ok: true,
    payload: buildChannelPayload(message),
  };
}

module.exports = {
  normalizeColor,
  normalizeChannels,
  buildChannelPayload,
  parseMessage,
};
