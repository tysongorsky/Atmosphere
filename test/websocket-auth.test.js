const test = require('node:test');
const assert = require('node:assert/strict');
const { mapDMXToState } = require('../server/lighting');

test('DMX mapping resolves colour and effect correctly', () => {
  const mapped = mapDMXToState([255, 128, 64, 180, 128, 3]);

  assert.deepEqual(mapped.red, 255);
  assert.deepEqual(mapped.green, 128);
  assert.deepEqual(mapped.blue, 64);
  assert.equal(mapped.brightness, 180);
  assert.equal(mapped.effectCode, 3);
  assert.equal(mapped.effect, 'Gentle fade');
  assert.equal(mapped.videoCue, 128);
  assert.equal(mapped.videoEnabled, true);
});

test('DMX channel 5 selects video cue and channel 6 resolves effect', () => {
  const mapped = mapDMXToState([128, 64, 32, 200, 200, 2]);
  assert.equal(mapped.videoCueIndex, 72);
  assert.equal(mapped.effect, 'Slow pulse');
});
