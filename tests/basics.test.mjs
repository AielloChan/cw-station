import test from 'node:test';
import assert from 'node:assert/strict';
import { BASICS } from '../src/basics.js';

test('beginner lessons start with separate repeated A/B/C/D rows and cover every letter and digit', () => {
  assert.deepEqual(BASICS[0].rows,['AAAAAAAA','BBBBBBBB','CCCCCCCC','DDDDDDDD']);
  assert.equal(BASICS.length,53);
  assert.equal(new Set(BASICS.map(item=>item.id)).size,BASICS.length);
  for(const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    const single=BASICS.find(item=>item.id===`basic-single-${char}`);
    assert.ok(single); assert.equal(single.text.replaceAll(' ',''),char.repeat(16));
  }
  for(const item of BASICS) {
    assert.equal(item.rows.join(' '),item.text);
    assert.ok(item.rows.every(row=>row.length===8));
  }
});
