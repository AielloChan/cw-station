import test from 'node:test';
import assert from 'node:assert/strict';
import { LESSONS } from '../src/content.js';
import { READINGS } from '../src/readings.js';
import { filterLessons, randomLessonIndex, characterCount } from '../src/library.js';

test('100 distinct attributed classic excerpts are bundled and normalized', () => {
  assert.equal(READINGS.length, 100);
  assert.equal(new Set(READINGS.map(item => item.id)).size, 100);
  assert.equal(new Set(READINGS.map(item => item.text)).size, 100);
  assert.equal(new Set(READINGS.map(item => item.work)).size, 10);
  for (const item of READINGS) {
    assert.ok(item.author && item.year && item.source.startsWith('https://www.gutenberg.org/ebooks/'));
    assert.ok(item.text.split(' ').length >= 28);
    assert.equal(item.text.trim(), item.text);
  }
});
test('library combines search, category and exact length boundaries', () => {
  const found = filterLessons(LESSONS.english, { query: 'austen', category: '经典小说' });
  assert.equal(found.length, 10);
  assert.equal(filterLessons(LESSONS.qso, { query: 'QRS' }).length, 2);
  assert.equal(filterLessons(LESSONS.english, { query: 'no such title here' }).length, 0);
  assert.equal(characterCount({ text: 'A B C' }), 3);
  const boundaries = [150,151,250,251].map(count => ({ text: 'A'.repeat(count), title: 'Test', level: 'Test' }));
  assert.deepEqual(filterLessons(boundaries, { length: 'short' }).map(r=>r.index), [0]);
  assert.deepEqual(filterLessons(boundaries, { length: 'medium' }).map(r=>r.index), [1,2]);
  assert.deepEqual(filterLessons(boundaries, { length: 'long' }).map(r=>r.index), [3]);
});
test('random choice stays in results and excludes current whenever possible', () => {
  assert.equal(randomLessonIndex([2,4,8], 4, () => 0), 2);
  assert.equal(randomLessonIndex([2,4,8], 4, () => .999), 8);
  assert.equal(randomLessonIndex([4], 4), 4);
  assert.equal(randomLessonIndex([], 4), null);
});
