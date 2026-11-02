const test = require('node:test');
const assert = require('node:assert/strict');
const { createEspNetPacket, parseEspNetPacket } = require('../server/espnet');

test('ESP-NET parser accepts valid little-endian DMX frames', () => {
  const packet = createEspNetPacket({ universe: 8, channels: [10, 20, 30, 40, 50, 60] });
  const parsed = parseEspNetPacket(packet, { source: '127.0.0.1' });

  assert.equal(parsed.ok, true);
  assert.equal(parsed.protocol, 'ESP-NET');
  assert.equal(parsed.universe, 8);
  assert.equal(packet.readUInt16LE(5), 6);
  assert.deepEqual(parsed.channels, [10, 20, 30, 40, 50, 60]);
});

test('ESP-NET parser rejects malformed signatures, opcodes, and lengths', () => {
  assert.equal(parseEspNetPacket(Buffer.from('bad-packet')).reason, 'espnet-magic');

  const wrongOpcode = createEspNetPacket({ channels: [1] });
  wrongOpcode[2] = 1;
  assert.equal(parseEspNetPacket(wrongOpcode).reason, 'espnet-opcode');

  const truncated = createEspNetPacket({ channels: [1, 2] }).subarray(0, 8);
  assert.equal(parseEspNetPacket(truncated).reason, 'espnet-data-length');
});

test('ESP-NET packet builder enforces the DMX universe limit', () => {
  assert.throws(() => createEspNetPacket({ channels: Array(513).fill(0) }), /1 to 512/);
});
