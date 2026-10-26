(() => {
  'use strict';

  const panels = (phase) => [...document.querySelectorAll(`[data-anomaly-panel="${phase}"]`)];
  const normalPanels = (phase) => [...document.querySelectorAll(`[data-anomaly-normal="${phase}"]`)];
  const show = (phase) => {
    panels(phase).forEach((panel) => {
      panel.hidden = false;
      panel.classList.add('is-revealed');
    });
    normalPanels(phase).forEach((panel) => { panel.hidden = false; });
    document.dispatchEvent(new CustomEvent('fiornea:anomaly-shown', { detail: { phase } }));
  };

  const hide = (phase) => {
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
