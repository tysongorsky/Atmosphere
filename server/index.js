const DEFAULT_EFFECTS = ['Off', 'Solid', 'Slow pulse', 'Gentle fade'];

function clamp(value, minimum = 0, maximum = 255) {
  return Math.min(maximum, Math.max(minimum, Number(value) || 0));
}

function normalizeChannels(channels = []) {
  const normalized = Array.from({ length: 6 }, (_, index) => clamp(channels[index] ?? 0));
  return normalized;
}

function hexToRgb(hex = '#ffffff') {
  const normalized = `${hex}`.replace('#', '');
  const safe = normalized.length === 3 ? normalized.split('').map((item) => item + item).join('') : normalized;
  const int = Number.parseInt(safe, 16) || 0xffffff;
  const red = (int >> 16) & 255;
  const green = (int >> 8) & 255;
  const blue = int & 255;
  return { red, green, blue };
}

function rgbToCss(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

function mapDMXToState(channels = []) {
  const normalized = normalizeChannels(channels);
  const [red, green, blue, brightness, videoCueValue, effectValue] = normalized;
  const brightnessPercent = clamp(Math.round((brightness / 255) * 100), 0, 100);
  const effectIndex = clamp(Number(effectValue || 0), 0, 3);
  const effectName = DEFAULT_EFFECTS[effectIndex] || 'Solid';
  const color = rgbToCss(red, green, blue);
  const videoCue = clamp(Number(videoCueValue || 0), 0, 255);

  return {
    red,
    green,
    blue,
    brightness,
    brightnessPercent,
    color,
    effect: effectName,
    effectCode: effectIndex,
    videoCue,
    videoCueIndex: videoCue >= 128 ? Math.max(0, videoCue - 128) : null,
    videoEnabled: videoCue >= 128,
    protocol: 'Art-Net',
  };
}

function createArtDmxPacket({ universe = 1, sequence = 1, channels = [] }) {
  const payload = Buffer.alloc(18 + 512);
  payload.write('Art-Net\x00', 0, 8, 'ascii');
  payload.writeUInt16LE(0x5000, 8);
  payload.writeUInt16LE(14, 10);
  payload[12] = sequence & 0xff;
  payload[13] = 0;
  payload.writeUInt16BE(universe & 0x0fff, 14);
  payload.writeUInt16BE(Math.min(512, channels.length || 512), 16);
  payload[17] = 0;

  const data = Array.from({ length: Math.min(512, channels.length || 512) }, (_, index) => clamp(channels[index] ?? 0));
  data.forEach((value, index) => {
    payload[18 + index] = value;
  });

  return payload.subarray(0, 18 + Math.min(512, channels.length || 512));
}

function parseArtDmxPacket(buffer, metadata = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 18) {
    return { ok: false, reason: 'artnet-too-short' };
  }

  const identifier = buffer.subarray(0, 8).toString('ascii');
  if (identifier !== 'Art-Net\x00') {
    return { ok: false, reason: 'artnet-identifier' };
  }

  const opcode = buffer.readUInt16LE(8);
  if (opcode !== 0x5000) {
    return { ok: false, reason: 'artnet-opcode' };
  }

  const protocolVersion = buffer.readUInt16LE(10);
  if (protocolVersion < 14) {
    return { ok: false, reason: 'artnet-version' };
  }

  const sequence = buffer[12] ?? 0;
  const physics = buffer[13] ?? 0;
  const universe = buffer.readUInt16BE(14);
  const length = buffer.readUInt16BE(16);
  const dataIndex = 18;

  if (buffer.length < dataIndex + length) {
    return { ok: false, reason: 'artnet-length' };
  }

  const channels = Array.from({ length }, (_, index) => buffer[dataIndex + index] ?? 0);
  return {
    ok: true,
    protocol: 'Art-Net',
    source: metadata.source || 'unknown',
    universe,
    sequence,
    physical: physics,
    channels,
    priority: metadata.priority || 50,
    lastUpdated: Date.now(),
  };
}

function createSacnPacket({ universe = 1, priority = 100, sequence = 1, sourceName = 'NeighbourhoodGlow', channels = [] }) {
  const packet = Buffer.alloc(126 + Math.max(512, channels.length || 512));
  packet.write('ACN-SDT', 0, 7, 'ascii');
  packet.write('\x00\x00\x00\x00', 7, 4, 'ascii');
  packet.write('ASC-E1.17', 12, 8, 'ascii');
  packet[20] = 0x00;
  packet[21] = 0x00;
  packet[22] = priority & 0xff;
  packet[23] = sequence & 0xff;
  packet.writeUInt16BE(universe & 0x0fff, 24);
  const sourceId = Buffer.alloc(16);
  sourceId.write(sourceName.slice(0, 15), 0, 'ascii');
  sourceId.copy(packet, 26);

  const dataOffset = 42;
  packet[dataOffset] = 0x00;
  packet[dataOffset + 1] = 0x00;
  packet[dataOffset + 2] = 0x00;
  packet[dataOffset + 3] = 0x00;
  packet[dataOffset + 4] = 0x00;
  packet[dataOffset + 5] = 0x00;
  packet[dataOffset + 6] = 0x00;
  packet[dataOffset + 7] = 0x00;

  const dmxChannels = Array.from({ length: 512 }, (_, index) => clamp(channels[index] ?? 0));
  dmxChannels.forEach((value, index) => {
    packet[126 + index] = value;
  });
  return packet.subarray(0, 126 + dmxChannels.length);
}

function parseSacnPacket(buffer, metadata = {}) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 126) {
    return { ok: false, reason: 'sacn-too-short' };
  }

  const rootMarker = buffer.subarray(0, 7).toString('ascii');
  if (rootMarker !== 'ACN-SDT') {
    return { ok: false, reason: 'sacn-root' };
  }

  const framingMarker = buffer.subarray(12, 20).toString('ascii');
  if (!framingMarker.startsWith('ASC-E1.17')) {
    return { ok: false, reason: 'sacn-framing' };
  }

  const priority = buffer[22] ?? 0;
  const sequence = buffer[23] ?? 0;
  const universe = buffer.readUInt16BE(24) || 1;
  const dataLength = Math.max(1, Math.min(512, buffer.length - 126));
  const channels = Array.from({ length: dataLength }, (_, index) => buffer[126 + index] ?? 0);

  return {
    ok: true,
    protocol: 'sACN',
    source: metadata.source || 'unknown',
    sourceName: metadata.sourceName || 'Unknown source',
    universe,
    sequence,
    priority,
    channels,
    lastUpdated: Date.now(),
  };
}

function chooseWinningSource(sources = []) {
  const active = sources.filter((source) => source && source.ok !== false && source.channels);
  if (active.length === 0) {
    return null;
  }

  active.sort((left, right) => {
    const priorityDelta = (right.priority ?? 0) - (left.priority ?? 0);
    if (priorityDelta !== 0) return priorityDelta;
    return (right.lastUpdated ?? 0) - (left.lastUpdated ?? 0);
  });

  return active[0];
}

function formatHexColor(red, green, blue) {
  return `#${[red, green, blue].map((value) => clamp(value, 0, 255).toString(16).padStart(2, '0')).join('')}`;
}

module.exports = {
  DEFAULT_EFFECTS,
  clamp,
  normalizeChannels,
  mapDMXToState,
  createArtDmxPacket,
  parseArtDmxPacket,
  createSacnPacket,
  parseSacnPacket,
  chooseWinningSource,
  formatHexColor,
  hexToRgb,
  rgbToCss,
};
