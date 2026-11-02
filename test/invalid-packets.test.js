const test = require('node:test');
const assert = require('node:assert/strict');
const { mapDMXToState } = require('../server/lighting');

test('Video cue values map to configured cue indexes', () => {
  const mapped = mapDMXToState([0, 0, 0, 180, 160, 1]);
  assert.equal(mapped.videoCue, 160);
  assert.equal(mapped.videoCueIndex, 32);
  assert.equal(mapped.effect, 'Solid');
});
