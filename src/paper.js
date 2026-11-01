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
    const move = async (frames, duration) => {
      this.animation?.cancel();
      this.animation = this.paper.animate(frames, { duration, fill: 'forwards' });
      try { await this.animation.finished; } catch { return false; }
      return generation === this.generation;
    };
    if (!await move([
      { transform: transform === 'none' ? 'translateY(0) rotateX(0deg)' : transform, offset: 0 },
      { transform: 'translateY(-5%) rotateX(3deg)', offset: .14, easing: 'cubic-bezier(.5,0,.9,.4)' },
      { transform: 'translateY(-108%) rotateX(10deg)', offset: 1 }
    ], 330)) return;
    this.pending(); this.pending = () => {};
    this.assembly.dataset.transport = 'feed';
    if (!await move([
      { transform: 'translateY(-106%) rotateX(11deg) rotateZ(-.7deg)', offset: 0, easing: 'cubic-bezier(.2,.7,.3,1)' },
      { transform: 'translateY(-79%) rotateX(8deg) rotateZ(-.7deg)', offset: .23 },
      // The paper head is caught; release pressure and square its edges.
      { transform: 'translateY(-79%) rotateX(8deg) rotateZ(0deg)', offset: .37, easing: 'cubic-bezier(.2,.6,.35,1)' },
      { transform: 'translateY(-34%) rotateX(4deg)', offset: .67 },
      { transform: 'translateY(-34%) rotateX(4deg)', offset: .73, easing: 'cubic-bezier(.16,1,.3,1)' },
      { transform: 'translateY(.6%) rotateX(-.4deg)', offset: .94 },
      { transform: 'translateY(0) rotateX(0deg)', offset: 1 }
    ], 760)) return;
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
