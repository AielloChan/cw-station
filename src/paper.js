// One cancellable transport for lesson, mode and random changes.
export class PaperTransport {
  constructor(assembly, paper, onReady = () => {}) {
    this.assembly = assembly; this.paper = paper;
    this.onReady = onReady;
    this.generation = 0; this.animation = null; this.pending = null;
  }
  get busy() { return this.pending !== null; }
  async replace(update) {
    const generation = ++this.generation;
    const transform = getComputedStyle(this.paper).transform;
    this.animation?.cancel(); this.pending = update;
    this.assembly.setAttribute('aria-busy', 'true');
    this.assembly.dataset.transport = 'eject';
    if (!this.paper.animate || matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) { this.finish(); return; }
    const move = async (frames, duration, easing) => {
      this.animation?.cancel();
      this.animation = this.paper.animate(frames, { duration, easing, fill: 'forwards' });
      try { await this.animation.finished; } catch { return false; }
      return generation === this.generation;
    };
    if (!await move([
      { transform: transform === 'none' ? 'translateY(0) rotateX(0deg)' : transform, offset: 0 },
      { transform: 'translateY(-106%) rotateX(6deg)', offset: 1 }
    ], 260, 'cubic-bezier(.4,0,.8,.6)')) return;
    this.pending(); this.pending = () => {};
    this.assembly.dataset.transport = 'feed';
    if (!await move([
      { transform: 'translateY(-106%) rotateX(6deg)', offset: 0 },
      { transform: 'translateY(0) rotateX(0deg)', offset: 1 }
    ], 420, 'cubic-bezier(.16,.55,.3,1)')) return;
    this.finish();
  }
  finish() {
    ++this.generation; this.animation?.cancel(); this.animation = null;
    const update = this.pending; this.pending = null; update?.();
    delete this.assembly.dataset.transport;
    this.assembly.removeAttribute('aria-busy');
    this.onReady();
  }
}
