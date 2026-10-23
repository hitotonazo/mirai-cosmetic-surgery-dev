(() => {
  'use strict';

  const STORAGE_KEY = 'fiornea_arg_v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { state = null; }

  if (!state?.simulationConfirmed) {
    location.replace('index.html');
    return;
  }

  document.documentElement.classList.add('is-report-authorized');

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.remove('is-report-checking');
    state.phase = 5;
    state.endingReached = true;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}

    const comparison = document.querySelector('[data-truth-compare]');
    const button = comparison?.querySelector('[data-compare-toggle]');
    const status = comparison?.querySelector('[data-compare-status]');
    const images = comparison ? [...comparison.querySelectorAll('[data-before][data-after]')] : [];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let afterVisible = false;

    button?.addEventListener('click', () => {
      afterVisible = !afterVisible;
      comparison.classList.add('is-switching');
      images.forEach((image) => {
        image.src = afterVisible ? image.dataset.after : image.dataset.before;
        image.alt = `${image.dataset.patient}${afterVisible ? 'の施術後' : 'の施術前'}`;
      });
      comparison.classList.toggle('is-after', afterVisible);
      button.setAttribute('aria-pressed', String(afterVisible));
      button.textContent = afterVisible ? '施術前の顔形状に戻す' : '施術後の顔形状を比較する';
      status.textContent = afterVisible
        ? '東京都心部の同一拠点で記録された3患者の顔形状が、同じMODEL-01へ近づいている。'
        : 'FC-001の患者A・B・Cの施術前画像。';
      window.setTimeout(() => comparison.classList.remove('is-switching'), reduced.matches ? 0 : 360);
    });
  });
})();
