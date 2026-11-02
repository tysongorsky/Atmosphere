const test = require('node:test');
const assert = require('node:assert/strict');
const { createSacnPacket, parseSacnPacket } = require('../server/lighting');

test('sACN parser accepts valid packets', () => {
  const packet = createSacnPacket({ universe: 8, priority: 200, sequence: 5, sourceName: 'DemoConsole', channels: [10, 20, 30, 40, 50, 60] });
  const parsed = parseSacnPacket(packet, { source: '127.0.0.1', sourceName: 'DemoConsole' });

  assert.equal(parsed.ok, true);
  assert.equal(parsed.protocol, 'sACN');
  assert.equal(parsed.universe, 8);
  assert.equal(parsed.priority, 200);
  assert.deepEqual(parsed.channels.slice(0, 6), [10, 20, 30, 40, 50, 60]);
});

test('sACN parser rejects malformed framing data', () => {
  const packet = Buffer.from('bad-sacn-data');
  const parsed = parseSacnPacket(packet, { source: '127.0.0.1' });
  assert.equal(parsed.ok, false);
  assert.equal(parsed.reason, 'sacn-root');
});
