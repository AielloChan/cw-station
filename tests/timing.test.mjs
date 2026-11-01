import test from 'node:test';
import assert from 'node:assert/strict';
import { timingForTempo, loadTiming } from '../src/timing.js';
import { MorseKeyer } from '../src/morse.js';

test('tempo links dot/dash threshold and character gap, including fast rates', () => {
  assert.deepEqual(timingForTempo(20), {tempo:20,unit:60,threshold:120,gap:180});
  assert.equal(timingForTempo(25).gap,144);
  assert.equal(timingForTempo(40).gap,90);
  assert.equal(timingForTempo(40).threshold,60);
  assert.equal(timingForTempo(5).gap,720);
});
test('legacy defaults upgrade to linked timing; deliberate old custom values survive', () => {
  assert.deepEqual(loadTiming({threshold:180,gap:600}),{tempo:12,timingMode:'tempo',threshold:200,gap:300});
  assert.deepEqual(loadTiming({threshold:250,gap:900}),{tempo:12,timingMode:'manual',threshold:250,gap:900});
  assert.equal(loadTiming({tempo:30,timingMode:'tempo',gap:900}).gap,120);
  assert.equal(loadTiming({tempo:30,timingMode:'manual',gap:900}).gap,900);
});
test('saved speeds are finite and bounded; fastest dots remain above the debounce floor', () => {
  for(const value of [undefined,NaN,Infinity,-10,0,500,'abc']) {
    const timing=timingForTempo(value);
    assert.ok(timing.tempo>=5&&timing.tempo<=40&&timing.unit>=30);
  }
});
test('actual keyer emits word space at seven dot units from the final release', () => {
  let now=0, next=0; const timers=new Map(),events=[];
  const timing=timingForTempo(20);
  const key=new MorseKeyer({...timing,now:()=>now,schedule:(cb,delay)=>{timers.set(++next,{cb,at:now+delay});return next;},unschedule:id=>timers.delete(id),onLetter:l=>events.push(l),onWord:()=>events.push(' ')});
  const advance=ms=>{const end=now+ms;while(true){const found=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!found)break;timers.delete(found[0]);now=found[1].at;found[1].cb();}now=end;};
  key.press();advance(60);key.release();advance(179);assert.deepEqual(events,[]);
  advance(1);assert.deepEqual(events,['E']);advance(239);assert.deepEqual(events,['E']);
  advance(1);assert.deepEqual(events,['E',' ']);
});

test('a new press after the character deadline commits the old letter even if its timer was delayed', () => {
  let now=0; const letters=[];
  const key=new MorseKeyer({...timingForTempo(20),now:()=>now,schedule:()=>1,unschedule:()=>{},onLetter:l=>letters.push(l)});
  key.press();now=60;key.release();
  now=240;key.press(); // 180ms gap elapsed, but a busy UI has not run the timer yet.
  assert.deepEqual(letters,['E']);
  now=300;key.release();key.flush();assert.deepEqual(letters,['E','E']);
});
