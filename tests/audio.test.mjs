import test from 'node:test';
import assert from 'node:assert/strict';
import { Sidetone } from '../src/audio.js';
test('late audio resume never starts a released or muted tone', async () => {
  const changes = []; let resume;
  const priorWindow = globalThis.window;
  globalThis.window = { AudioContext: class {
    currentTime = 0;
    createGain() { return { gain: { value: 0, cancelScheduledValues() {}, setTargetAtTime: value => changes.push(value) }, connect() {} }; }
    createOscillator() { return { frequency: {}, connect() {}, start() {} }; }
    resume() { return new Promise(resolve => { resume = resolve; }); }
  } };
  try {
    const tone = new Sidetone(() => assert.fail('Unexpected audio error'));
    const start = tone.start(); tone.stop(); resume(); await start;
    assert.deepEqual(changes, [0]);
    const second = tone.start(); tone.setEnabled(false); resume(); await second;
    assert.deepEqual(changes, [0, 0]);
    tone.setEnabled(true); const third = tone.start(); resume(); await third;
    assert.equal(changes.at(-1), 0.15); tone.stop(); assert.equal(changes.at(-1), 0);
  } finally { globalThis.window = priorWindow; }
});
