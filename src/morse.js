export const MORSE = Object.freeze({
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', 0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.', '.': '.-.-.-',
  ',': '--..--', '?': '..--..', '/': '-..-.', '=': '-...-', '+': '.-.-.', '-': '-....-',
  '@': '.--.-.', "'": '.----.', ':': '---...'
});
const reverse = new Map(Object.entries(MORSE).map(([letter, code]) => [code, letter]));
export const decode = code => reverse.get(code) ?? null;
export const pretty = code => code.replaceAll('.', '·').replaceAll('-', '−');
export const classify = (duration, threshold) => duration < 25 ? null : duration < threshold ? '.' : '-';

// Timing is independent of rendering and audio. A cancelled gesture never emits a mark.
export class MorseKeyer {
  constructor({ threshold = 180, gap = 600, onSequence = () => {}, onLetter = () => {}, onWord = () => {}, now = () => performance.now(), schedule = (callback, delay) => setTimeout(callback, delay), unschedule = id => clearTimeout(id) } = {}) {
    Object.assign(this, { threshold, gap, onSequence, onLetter, onWord, now, schedule, unschedule });
    this.sequence = ''; this.started = null; this.lastRelease = null; this.letterTimer = null; this.wordTimer = null;
  }
  clearTimers() { this.unschedule(this.letterTimer); this.unschedule(this.wordTimer); this.letterTimer = this.wordTimer = null; }
  press() {
    if (this.started !== null) return false;
    const now = this.now();
    // Input can reach the main thread before an overdue timer callback.
    if (this.lastRelease !== null) {
      if (this.sequence && now - this.lastRelease >= this.gap) this.flush();
      if (this.wordTimer !== null && now - this.lastRelease >= this.gap * 7 / 3) this.onWord();
    }
    this.clearTimers(); this.started = now; return true;
  }
  release() {
    if (this.started === null) return;
    this.lastRelease = this.now();
    const mark = classify(this.lastRelease - this.started, this.threshold);
    this.started = null;
    if (mark) {
      this.sequence += mark;
      this.onSequence(this.sequence);
    }
    if (this.sequence) {
      this.letterTimer = this.schedule(() => this.flush(), this.gap);
      this.wordTimer = this.schedule(() => { this.wordTimer = null; this.onWord(); }, this.gap * 7 / 3);
    }
  }
  flush() {
    this.unschedule(this.letterTimer);
    this.letterTimer = null;
    if (!this.sequence) return;
    const code = this.sequence; this.sequence = '';
    this.onLetter(decode(code), code); this.onSequence('');
  }
  reset() { this.clearTimers(); this.started = null; this.lastRelease = null; this.sequence = ''; this.onSequence(''); }
  configure(threshold, gap) { this.reset(); this.threshold = threshold; this.gap = gap; }
}
