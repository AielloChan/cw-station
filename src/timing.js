const bounded = (value, min, max, fallback) => Number.isFinite(+value) ? Math.max(min, Math.min(max, +value)) : fallback;
export function timingForTempo(value) {
  const tempo = Math.round(bounded(value, 5, 40, 12));
  const unit = 1200 / tempo;
  return { tempo, unit, threshold: Math.round(unit * 2), gap: Math.round(unit * 3) };
}
export function loadTiming(saved = {}) {
  const linked = timingForTempo(saved.tempo);
  // Preserve deliberately changed settings from the old independent controls.
  const legacyCustom = saved.timingMode === undefined &&
    ((saved.threshold !== undefined && +saved.threshold !== 180) || (saved.gap !== undefined && +saved.gap !== 600));
  const timingMode = saved.timingMode === 'manual' || legacyCustom ? 'manual' : 'tempo';
  return { tempo: linked.tempo, timingMode,
    threshold: timingMode === 'manual' ? bounded(saved.threshold, 60, 600, linked.threshold) : linked.threshold,
    gap: timingMode === 'manual' ? bounded(saved.gap, 80, 1200, linked.gap) : linked.gap };
}
