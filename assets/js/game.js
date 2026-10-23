(() => {
  'use strict';

  const STORAGE_KEY = 'fiornea_arg_v1';
  const phases = ['PHASE0', 'PHASE1', 'PHASE2', 'PHASE3', '最終確認', 'Ending'];
  const initialState = () => ({
    phase: 0,
    found: { diagnosis: false, cases: false, external: false },
    simulationConfirmed: false,
    endingReached: false
  });
  let memoryState = initialState();

  const normalize = (value) => {
    const source = value && typeof value === 'object' ? value : {};
    const found = source.found && typeof source.found === 'object' ? source.found : {};
    const state = {
      phase: Math.max(0, Math.min(5, Number.isInteger(source.phase) ? source.phase : 0)),
      found: {
        diagnosis: Boolean(found.diagnosis),
        cases: Boolean(found.cases),
        external: Boolean(found.external)
      },
      simulationConfirmed: Boolean(source.simulationConfirmed),
      endingReached: Boolean(source.endingReached)
    };
    if (state.phase >= 1) state.found.diagnosis = true;
    if (state.phase >= 2) state.found.cases = true;
    if (state.phase >= 3) state.found.external = true;
    if (state.phase >= 4) state.simulationConfirmed = true;
    if (state.phase >= 5) state.endingReached = true;
    if (state.endingReached) state.phase = 5;
    else if (state.simulationConfirmed) state.phase = Math.max(state.phase, 4);
    else if (state.found.external) state.phase = Math.max(state.phase, 3);
    else if (state.found.cases) state.phase = Math.max(state.phase, 2);
    else if (state.found.diagnosis) state.phase = Math.max(state.phase, 1);
    return state;
  };

  const read = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      memoryState = normalize(stored ? JSON.parse(stored) : memoryState);
    } catch {
      memoryState = normalize(memoryState);
    }
    return memoryState;
  };

  const write = (state) => {
    memoryState = normalize(state);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState)); } catch {}
    document.dispatchEvent(new CustomEvent('fiornea:state-changed', { detail: memoryState }));
    return memoryState;
  };

  const setPhase = (label) => {
    const index = phases.indexOf(label);
    if (index < 0) return;
    write({
      phase: index,
      found: { diagnosis: index >= 1, cases: index >= 2, external: index >= 3 },
      simulationConfirmed: index >= 4,
      endingReached: index >= 5
    });
    location.reload();
  };

  const revealAvailableAnomaly = () => {
    const state = read();
    if (state.found.diagnosis) window.FiorneaAnomalyUI?.show('phase2');
    if (state.found.cases) window.FiorneaAnomalyUI?.show('phase3');
  };

  const anomalyConfig = {
    phase1: { flag: 'diagnosis', phase: 1 },
    phase2: { flag: 'cases', phase: 2 },
    phase3: { flag: 'external', phase: 3 }
  };

  document.addEventListener('click', (event) => {
    const link = event.target.closest('[data-anomaly-link]');
    if (!link) return;
    event.preventDefault();
    const config = anomalyConfig[link.dataset.anomalyLink];
    if (!config) return;
    const state = read();
    const navigate = () => location.assign(link.href);
    if (state.found[config.flag]) {
      navigate();
      return;
    }
    window.SiteAlteration?.play({
      focusOverlay: true,
      onChange: () => write({
        ...state,
        phase: Math.max(state.phase, config.phase),
        found: { ...state.found, [config.flag]: true }
      })
    }).then(navigate);
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    revealAvailableAnomaly();
    window.SiteAlterationDebug?.init({
      storagePrefix: 'fiornea',
      state: { phases, getPhase: () => phases[read().phase], setPhase }
    });
  });

  window.FiorneaGame = { getState: read, setPhase, phases };
})();
