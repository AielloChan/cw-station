import test from 'node:test';
import assert from 'node:assert/strict';
import { MORSE, decode, classify, MorseKeyer } from '../src/morse.js';
import { LESSONS } from '../src/content.js';
function fixture() {
  let time = 0, next = 0; const timers = new Map(), letters = [], sequences = [], words = [];
  const key = new MorseKeyer({ now: () => time, schedule: (callback, delay) => { const id = ++next; timers.set(id, { callback, at: time + delay }); return id; }, unschedule: id => timers.delete(id), onLetter: (letter, code) => letters.push([letter, code]), onSequence: sequence => sequences.push(sequence), onWord: () => words.push(' ') });
  function advance(ms) {
    const end = time + ms;
    while (true) {
      const pending = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!pending) break;
      time = pending[1].at; timers.delete(pending[0]); pending[1].callback();
    }
    time = end;
  }
  function tap(duration) { key.press(); advance(duration); key.release(); }
  return { key, letters, sequences, words, advance, tap };
}
test('International Morse alphabet and lesson content are decodable', () => {
  assert.equal(decode('...'), 'S'); assert.equal(decode('---'), 'O'); assert.equal(decode('..--..'), '?'); assert.equal(decode('........'), null);
  assert.equal(new Set(Object.values(MORSE)).size, Object.keys(MORSE).length);
  for (const lessons of Object.values(LESSONS)) for (const lesson of lessons) for (const character of lesson.text) assert.ok(character === ' ' || MORSE[character], character);
});
test('timing boundary and accidental micro-taps', () => { assert.equal(classify(24, 180), null); assert.equal(classify(25, 180), '.'); assert.equal(classify(179, 180), '.'); assert.equal(classify(180, 180), '-'); assert.equal(classify(180, 250), '.'); });
test('short and long presses form A only after the inter-character gap', () => {
  const f = fixture(); f.tap(80); f.advance(120); f.tap(260); f.advance(599); assert.deepEqual(f.letters, []);
  f.advance(1); assert.deepEqual(f.letters, [['A', '.-']]); f.advance(900); assert.equal(f.words.length, 1);
});
test('pressing again cancels a pending letter boundary and held key never auto-completes', () => {
  const f = fixture(); f.tap(80); f.advance(500); f.key.press(); f.advance(1000); assert.equal(f.letters.length, 0); f.key.release(); f.advance(600); assert.deepEqual(f.letters, [['A', '.-']]);
});
test('reset cancels a held gesture, incomplete character and word timer', () => {
  const f = fixture(); f.tap(80); f.key.press(); f.advance(300); f.key.reset(); f.key.release(); f.advance(5000); assert.deepEqual(f.letters, []); assert.deepEqual(f.words, []);
});
test('repeated press/release events do not duplicate symbols', () => {
  const f = fixture(); f.key.press(); f.advance(50); assert.equal(f.key.press(), false); f.advance(50); f.key.release(); f.key.release(); f.advance(600); assert.deepEqual(f.letters, [['E', '.']]);
});
test('configuration changes discard pending code and use new timing', () => {
  const f = fixture(); f.tap(60); f.key.configure(300, 900); f.advance(1600); assert.equal(f.letters.length, 0); f.tap(240); f.advance(900); assert.deepEqual(f.letters, [['E', '.']]);
});
