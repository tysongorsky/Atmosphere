const test = require('node:test');
const assert = require('node:assert/strict');
const { ArtNetController } = require('../server/artnet');

test('ArtNetController connects and reports status', () => {
  const controller = new ArtNetController({ universe: 7, ip: '10.0.0.1' });

  assert.equal(controller.isEnabled(), true);
  assert.deepEqual(controller.status(), {
    enabled: true,
    connected: false,
    universe: 7,
    ip: '10.0.0.1',
    port: 6454,
  });

  assert.deepEqual(controller.sendFrame([255, 128, 32]), {
    sent: true,
    protocol: 'Art-Net',
    universe: 7,
    channelCount: 3,
  });
});
