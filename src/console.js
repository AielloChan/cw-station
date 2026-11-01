export function setupConsole(onLayoutChange) {
  const compact = matchMedia('(max-width: 767px), (max-height: 500px) and (max-width: 1100px)');
  const button = document.getElementById('immersive-toggle');
  const label = document.getElementById('immersive-label');
  let manual = false, wasFullscreen = !!document.fullscreenElement;
  try { manual = localStorage.getItem('cw-station-immersive') === 'true'; } catch { /* Optional preference. */ }
  const save = () => { try { localStorage.setItem('cw-station-immersive', String(manual)); } catch { /* Optional preference. */ } };
  function sync() {
    const enabled = compact.matches || manual;
    const changed = document.body.classList.contains('console-mode') !== enabled;
    if (changed) onLayoutChange();
    document.body.classList.toggle('console-mode', enabled);
    document.documentElement.classList.toggle('console-root', enabled);
    if (enabled && changed) window.scrollTo(0, 0);
    label.textContent = compact.matches ? document.fullscreenElement ? '退出' : '全屏' : manual ? '退出' : '沉浸';
    button.setAttribute('aria-pressed', String(compact.matches ? !!document.fullscreenElement : manual));
    button.setAttribute('aria-label', compact.matches ? '切换全屏' : '切换沉浸模式');
    button.hidden = compact.matches && (!document.fullscreenEnabled || matchMedia('(display-mode: standalone)').matches);
  }
  button.addEventListener('click', async () => {
    onLayoutChange();
    if (document.fullscreenElement || (!compact.matches && manual)) {
      manual = false; save(); sync();
      if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen().catch(() => {});
    } else {
      if (!compact.matches) { manual = true; save(); }
      sync();
      if (document.documentElement.requestFullscreen) {
        try { await document.documentElement.requestFullscreen(); } catch { /* Viewport layout still works without native fullscreen. */ }
      }
    }
    sync();
  });
  document.addEventListener('fullscreenchange', () => {
    if (wasFullscreen && !document.fullscreenElement && !compact.matches) { manual = false; save(); }
    wasFullscreen = !!document.fullscreenElement; sync();
  });
  compact.addEventListener('change', sync);
  // Keep modal sheets within the visual viewport when the software keyboard opens.
  const viewport = () => {
    document.documentElement.style.setProperty('--dialog-viewport', `${window.visualViewport?.height || innerHeight}px`);
    document.documentElement.style.setProperty('--visual-top', `${window.visualViewport?.offsetTop || 0}px`);
  };
  window.visualViewport?.addEventListener('resize', viewport);
  window.visualViewport?.addEventListener('scroll', viewport);
  window.addEventListener('resize', viewport);
  sync(); viewport();
}
