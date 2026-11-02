const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseWinningSource } = require('../server/lighting');

test('Stale sources are ignored by arbitration', () => {
  const stale = { protocol: 'sACN', priority: 150, channels: [10, 10, 10, 50, 0, 1], lastUpdated: Date.now() - 60000 };
  const fresh = { protocol: 'Art-Net', priority: 80, channels: [100, 90, 80, 110, 0, 2], lastUpdated: Date.now() };

  const winner = chooseWinningSource([stale, fresh]);
  assert.equal(winner.protocol, 'Art-Net');
});
