const { buildChannelPayload } = require('../server/protocol');
const test = require('node:test');
const assert = require('node:assert/strict');

test('buildChannelPayload returns normalized scene payload', () => {
  const payload = buildChannelPayload({ scene: 'festival', channels: [255, 128, 64, 32] });

  assert.equal(payload.scene, 'festival');
  assert.deepEqual(payload.channels, [255, 128, 64, 32]);
  assert.ok(payload.metadata.timestamp);
});

test('buildChannelPayload clamps invalid values', () => {
  const payload = buildChannelPayload({ scene: 'pulse', channels: [-20, 999, '50', 'abc'] });

  assert.deepEqual(payload.channels, [0, 255, 50, 0]);
});
