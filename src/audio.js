export class Sidetone {
  constructor(onError) { this.onError = onError; this.active = false; this.enabled = true; this.generation = 0; }
  async start() {
    this.active = true;
    const generation = ++this.generation;
    if (!this.enabled) return;
    try {
      if (!this.context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        this.context = new Audio();
        this.gain = this.context.createGain(); this.gain.gain.value = 0;
        this.oscillator = this.context.createOscillator();
        this.oscillator.type = 'sine'; this.oscillator.frequency.value = 600;
        this.oscillator.connect(this.gain); this.gain.connect(this.context.destination); this.oscillator.start();
      }
      await this.context.resume();
      if (!this.active || !this.enabled || generation !== this.generation) return;
      this.gain.gain.cancelScheduledValues(this.context.currentTime);
      this.gain.gain.setTargetAtTime(0.15, this.context.currentTime, 0.004);
    } catch { this.onError('声音暂不可用，仍可继续练习。'); }
  }
  stop() {
    this.active = false; this.generation++;
    if (this.context) {
      this.gain.gain.cancelScheduledValues(this.context.currentTime);
      this.gain.gain.setTargetAtTime(0, this.context.currentTime, 0.004);
    }
  }
  setEnabled(enabled) { this.enabled = enabled; if (!enabled) this.stop(); }
}
