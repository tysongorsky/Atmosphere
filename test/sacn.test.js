const test = require('node:test');
const assert = require('node:assert/strict');
const { sACNController } = require('../server/sacn');

test('sACNController reports configuration and frame delivery', () => {
  const controller = new sACNController({ universe: 3, sourceName: 'Demo' });

  assert.equal(controller.isEnabled(), true);
  assert.equal(controller.status().sourceName, 'Demo');
  assert.deepEqual(controller.sendFrame([1, 2, 3, 4]), {
    sent: true,
    protocol: 'sACN',
    universe: 3,
    channelCount: 4,
  });
});
