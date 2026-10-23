(() => {
  'use strict';
  const simulator = document.querySelector('[data-recruitment-simulator]');
  if (!simulator) return;
  const submit = simulator.querySelector('[data-recruitment-submit]');
  const result = simulator.querySelector('[data-recruitment-result]');
  const choice = simulator.querySelector('[data-player-choice]');
  const confirm = simulator.querySelector('[data-recruitment-confirm]');
  const learning = simulator.querySelector('[data-learning-result]');
  const reportLink = simulator.querySelector('[data-final-report-link]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  simulator.addEventListener('change', (event) => {
    if (event.target.matches('input[name="candidate"]')) submit.disabled = false;
  });
  submit.addEventListener('click', () => {
    const selected = simulator.querySelector('input[name="candidate"]:checked');
    if (!selected) return;
    choice.textContent = `候補者${selected.value}`;
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
  });
  confirm.addEventListener('click', () => {
    confirm.disabled = true;
    learning.hidden = false;
    const state = window.FiorneaGame?.getState();
    if (state) {
      state.phase = Math.max(state.phase, 4);
      state.simulationConfirmed = true;
      try { localStorage.setItem('fiornea_arg_v1', JSON.stringify(state)); } catch {}
    }
    window.setTimeout(() => {
      reportLink.hidden = false;
      reportLink.focus({ preventScroll: true });
    }, reduced.matches ? 0 : 800);
  });

  if (window.FiorneaGame?.getState().simulationConfirmed) {
    confirm.disabled = true;
    learning.hidden = false;
    reportLink.hidden = false;
  }
})();
