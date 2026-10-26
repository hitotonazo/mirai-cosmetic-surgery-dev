(() => {
  'use strict';
  const state = window.FiorneaGame?.getState();
  if (!state?.found?.external) { location.replace('index.html'); return; }
  document.querySelector('[data-final-report-link]')?.addEventListener('click', (event) => {
    event.preventDefault();
    const nextState = window.FiorneaGame?.getState();
    if (!nextState?.found?.external) return;
    nextState.phase = Math.max(nextState.phase, 4);
    // Legacy save field retained for compatibility; it now records log-scope confirmation.
    nextState.simulationConfirmed = true;
    try { localStorage.setItem('fiornea_arg_v1', JSON.stringify(nextState)); } catch {}
    location.assign(event.currentTarget.href);
  });
})();
