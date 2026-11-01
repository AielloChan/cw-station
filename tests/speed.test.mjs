import test from 'node:test';
import assert from 'node:assert/strict';
import { SendingSpeed } from '../src/speed.js';

test('fixed 30-second denominator includes warmup and idle time', () => {
  let now = 1000; const speed = new SendingSpeed(() => now);
  assert.equal(speed.snapshot().started, false);
  speed.start(); now = 2000; speed.record('A', true);
  assert.equal(speed.snapshot().wpm, 0.4);
  assert.equal(speed.snapshot().cpm, 2);
  assert.equal(speed.snapshot().sampledSeconds, 1);
  now = 30000; assert.equal(speed.snapshot().wpm, 0.4);
  now = 32000; assert.equal(speed.snapshot().wpm, 0);
});
test('events expire individually at exactly the rolling-window boundary', () => {
  let now = 0; const speed = new SendingSpeed(() => now);
  speed.record('A', true); now = 1000; speed.record('B', false);
  now = 29999; assert.equal(speed.snapshot().wpm, 0.8);
  now = 30000; assert.equal(speed.snapshot().wpm, 0.4);
  assert.equal(speed.snapshot().accuracy, 0);
  now = 31000; assert.equal(speed.snapshot().wpm, 0);
  assert.equal(speed.snapshot().accuracy, null);
  now = 90000; assert.equal(speed.snapshot().sampledSeconds, 30);
});
test('incorrect recognized characters count as throughput; invalid codes only affect accuracy', () => {
  const speed = new SendingSpeed(() => 0);
  speed.record('A', true); speed.record('E', false); speed.record(null, false);
  assert.deepEqual(speed.snapshot(), { wpm: 0.8, cpm: 4, recognized: 2, invalid: 1, accuracy: 33, correctWpm: 0.4, sampledSeconds: 0, started: true });
});
test('free mode has no target grade and reset clears prior samples', () => {
  const speed = new SendingSpeed(() => 0);
  speed.record('E'); assert.equal(speed.snapshot().accuracy, null);
  speed.reset(); assert.equal(speed.snapshot().wpm, 0);
  assert.equal(speed.snapshot().started, false);
});
