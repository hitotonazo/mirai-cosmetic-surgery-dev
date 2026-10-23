(() => {
  'use strict';
  const phaseSection = document.querySelector('[data-anomaly-panel="phase2"]');
  const openButton = phaseSection?.querySelector('[data-case-comparison-open]');
  const section = phaseSection?.querySelector('[data-case-comparison-panel]');
  const slider = section?.querySelector('[data-case-comparison]');
  const detected = section?.querySelector('[data-case-detected]');
  const anomalyImages = [...document.querySelectorAll('[data-case-anomaly-image]')];
  if (!phaseSection || !openButton || !slider || !section || !detected) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let observer = null;

  const alterImage = (image) => {
    if (image.dataset.anomalyActive === 'true') return;
    image.dataset.anomalyActive = 'true';
    const normalSrc = image.getAttribute('src');
    const anomalySrc = image.dataset.anomalySrc;
    let showingAnomaly = false;
    const swap = () => {
      const figure = image.closest('figure');
      figure?.classList.add('is-case-glitching');
      window.setTimeout(() => {
        showingAnomaly = !showingAnomaly;
        image.src = showingAnomaly ? anomalySrc : normalSrc;
        image.alt = showingAnomaly ? image.alt.replace('通常施術後', 'MODEL-01変換後') : image.alt.replace('MODEL-01変換後', '通常施術後');
      }, reduced.matches ? 0 : 350);
      window.setTimeout(() => figure?.classList.remove('is-case-glitching'), reduced.matches ? 0 : 900);
    };
    window.setInterval(swap, 2000);
  };

  const observeAnomalyImages = () => {
    if (phaseSection.hidden || observer) return;
    if (!('IntersectionObserver' in window)) {
      anomalyImages.forEach(alterImage);
      return;
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        alterImage(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.45 });
    anomalyImages.forEach((image) => observer.observe(image));
  };

  const update = () => {
    const value = Math.min(100, Math.max(0, Number(slider.value)));
    section.style.setProperty('--comparison-position', `${value}%`);
    detected.hidden = value !== 100;
  };
  slider.addEventListener('input', update);
  slider.addEventListener('change', update);
  openButton.addEventListener('click', () => {
    section.hidden = false;
    openButton.setAttribute('aria-expanded', 'true');
    section.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    section.querySelector('input')?.focus({ preventScroll: true });
  });
  document.addEventListener('fiornea:anomaly-shown', (event) => {
    if (event.detail?.phase === 'phase2') observeAnomalyImages();
  });
  update();
  window.setTimeout(observeAnomalyImages, 0);
})();
