const test = require('node:test');
const assert = require('node:assert/strict');
const { createArtDmxPacket, parseArtDmxPacket } = require('../server/lighting');

test('Art-Net parser accepts valid DMX payloads', () => {
  const packet = createArtDmxPacket({ universe: 3, sequence: 7, channels: [255, 128, 64, 32, 0, 1] });
  const parsed = parseArtDmxPacket(packet, { source: '127.0.0.1' });

  assert.equal(parsed.ok, true);
  assert.equal(parsed.protocol, 'Art-Net');
  assert.equal(parsed.universe, 3);
  assert.equal(parsed.sequence, 7);
  assert.deepEqual(parsed.channels.slice(0, 6), [255, 128, 64, 32, 0, 1]);
});

test('Art-Net parser rejects invalid identifiers', () => {
  const packet = Buffer.from('bad-packet');
  const parsed = parseArtDmxPacket(packet, { source: '127.0.0.1' });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.reason, 'artnet-identifier');
});
