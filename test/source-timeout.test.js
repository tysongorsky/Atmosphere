const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseWinningSource } = require('../server/lighting');

test('Input arbitration picks highest priority source', () => {
  const sources = [
    { protocol: 'Art-Net', priority: 50, channels: [20, 20, 20, 100, 0, 1], lastUpdated: 10 },
    { protocol: 'sACN', priority: 200, channels: [255, 100, 50, 180, 0, 2], lastUpdated: 50 },
  ];

  const winner = chooseWinningSource(sources);
  assert.equal(winner.protocol, 'sACN');
  assert.equal(winner.priority, 200);
});
