const dgram = require('node:dgram');

const HEADER_LENGTH = 7;
const MAX_CHANNELS = 512;
const DEFAULT_OPCODE = 0;

function createEspNetPacket({ universe = 1, opcode = DEFAULT_OPCODE, channels = [] } = {}) {
  if (!Number.isInteger(universe) || universe < 0 || universe > 0xffff) {
    throw new RangeError('ESP-NET universe must be an integer from 0 to 65535.');
  }
  if (!Number.isInteger(opcode) || opcode < 0 || opcode > 0xff) {
    throw new RangeError('ESP-NET opcode must be an integer from 0 to 255.');
  }
  if (!Array.isArray(channels) || channels.length < 1 || channels.length > MAX_CHANNELS) {
    throw new RangeError(`ESP-NET channel data must contain 1 to ${MAX_CHANNELS} values.`);
  }

  const packet = Buffer.alloc(HEADER_LENGTH + channels.length);
  packet.write('ES', 0, 2, 'ascii');
  packet[2] = opcode;
  packet.writeUInt16LE(universe, 3);
  packet.writeUInt16LE(channels.length, 5);
  channels.forEach((value, index) => {
    const channel = Number(value);
    packet[HEADER_LENGTH + index] = Number.isFinite(channel)
      ? Math.min(255, Math.max(0, Math.round(channel)))
      : 0;
  });
  return packet;
}

function parseEspNetPacket(packet, { source = null, expectedOpcode = DEFAULT_OPCODE } = {}) {
  if (!Buffer.isBuffer(packet) || packet.length < HEADER_LENGTH) {
    return { ok: false, reason: 'espnet-length' };
  }
  if (packet[0] !== 0x45 || packet[1] !== 0x53) {
    return { ok: false, reason: 'espnet-magic' };
  }
  if (packet[2] !== expectedOpcode) {
    return { ok: false, reason: 'espnet-opcode' };
  }

  const universe = packet.readUInt16LE(3);
  const dataLength = packet.readUInt16LE(5);
  if (dataLength < 1 || dataLength > MAX_CHANNELS || packet.length !== HEADER_LENGTH + dataLength) {
    return { ok: false, reason: 'espnet-data-length' };
  }

  return {
    ok: true,
    protocol: 'ESP-NET',
    universe,
    opcode: packet[2],
    source,
    channels: Array.from(packet.subarray(HEADER_LENGTH)),
  };
}

function startEspNetReceiver(config = {}, httpPort = 3000) {
  if (config.enabled === false) return null;

  const listenPort = Number(config.listenPort || 3333);
  const receiveHost = config.receiveHost || '0.0.0.0';
  const expectedUniverse = Number(config.universe ?? 1);
  const expectedOpcode = Number(config.opcode ?? DEFAULT_OPCODE);
  const socket = dgram.createSocket('udp4');

  socket.on('error', (error) => {
    console.error('ESP-NET socket error:', error.message || error);
    socket.close();
  });

  socket.on('message', (message, rinfo) => {
    const parsed = parseEspNetPacket(message, { source: rinfo.address, expectedOpcode });
    if (!parsed.ok || parsed.universe !== expectedUniverse) return;

    fetch(`http://127.0.0.1:${httpPort}/api/lighting`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        protocol: parsed.protocol,
        universe: parsed.universe,
        channels: parsed.channels,
        source: parsed.source,
      }),
    }).catch((error) => {
      console.error('ESP-NET state update failed:', error.message || error);
    });
  });

  socket.bind(listenPort, receiveHost, () => {
    console.log(`ESP-NET receiver listening on UDP ${listenPort}, universe ${expectedUniverse}`);
  });
  return socket;
}

module.exports = { createEspNetPacket, parseEspNetPacket, startEspNetReceiver };
