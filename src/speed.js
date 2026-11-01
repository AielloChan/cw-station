// Throughput, not PARIS timing: five decoded non-space characters = one word.
export class SendingSpeed {
  constructor(now = () => performance.now()) {
    this.now = now;
    this.reset();
  }
  reset() { this.events = []; this.started = null; }
  start() { if (this.started === null) this.started = this.now(); }
  record(letter, matched = null) {
    this.start();
    this.events.push({ time: this.now(), recognized: !!letter && letter !== ' ', matched });
  }
  snapshot() {
    const now = this.now();
    this.events = this.events.filter(event => event.time > now - 30000);
    const recognized = this.events.filter(event => event.recognized).length;
    const graded = this.events.filter(event => event.matched !== null);
    const correct = graded.filter(event => event.matched).length;
    return {
      wpm: recognized * 0.4, cpm: recognized * 2, recognized,
      invalid: this.events.length - recognized,
      accuracy: graded.length ? Math.round(correct / graded.length * 100) : null,
      correctWpm: correct * 0.4,
      sampledSeconds: this.started === null ? 0 : Math.min(30, Math.floor((now - this.started) / 1000)),
      started: this.started !== null
    };
  }
}
