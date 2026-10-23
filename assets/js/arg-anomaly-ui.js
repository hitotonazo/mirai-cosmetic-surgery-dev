(() => {
  'use strict';

  const panels = (phase) => [...document.querySelectorAll(`[data-anomaly-panel="${phase}"]`)];
  const normalPanels = (phase) => [...document.querySelectorAll(`[data-anomaly-normal="${phase}"]`)];
  const alternationTimers = new Map();

  const stopAlternation = (phase) => {
    const timer = alternationTimers.get(phase);
    if (timer) window.clearInterval(timer);
    alternationTimers.delete(phase);
    [...panels(phase), ...normalPanels(phase)].forEach((panel) => {
      panel.classList.remove('is-anomaly-switching');
    });
  };

  const switchPanels = (phase, showAnomaly) => {
    const incoming = showAnomaly ? panels(phase) : normalPanels(phase);
    const outgoing = showAnomaly ? normalPanels(phase) : panels(phase);

    outgoing.forEach((panel) => {
      panel.hidden = true;
      panel.classList.remove('is-anomaly-switching');
    });
    incoming.forEach((panel) => {
      panel.hidden = false;
      panel.classList.remove('is-anomaly-switching');
      void panel.offsetWidth;
      panel.classList.add('is-anomaly-switching');
      window.setTimeout(() => panel.classList.remove('is-anomaly-switching'), 520);
    });
  };

  const startAlternation = (phase) => {
    stopAlternation(phase);
    let showAnomaly = true;
    switchPanels(phase, showAnomaly);
    alternationTimers.set(phase, window.setInterval(() => {
      showAnomaly = !showAnomaly;
      switchPanels(phase, showAnomaly);
    }, 2000));
  };

  const show = (phase) => {
    panels(phase).forEach((panel) => {
      panel.hidden = false;
      panel.classList.add('is-revealed');
    });
    normalPanels(phase).forEach((panel) => { panel.hidden = true; });
    if (phase === 'phase3') startAlternation(phase);
    document.dispatchEvent(new CustomEvent('fiornea:anomaly-shown', { detail: { phase } }));
  };

  const hide = (phase) => {
    stopAlternation(phase);
    panels(phase).forEach((panel) => {
      panel.hidden = true;
      panel.classList.remove('is-revealed');
    });
    normalPanels(phase).forEach((panel) => { panel.hidden = false; });
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-anomaly-link]');
    if (!link) return;
    document.dispatchEvent(new CustomEvent('fiornea:anomaly-activated', {
      cancelable: true,
      detail: { phase: link.dataset.anomalyLink, targetUrl: link.href, source: link }
    }));
  });

  window.FiorneaAnomalyUI = { show, hide };
})();
