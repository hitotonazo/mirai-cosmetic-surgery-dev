(() => {
  'use strict';

  const desktopMedia = window.matchMedia('(min-width: 64em)');
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-navigation]');
  const resetButton = document.querySelector('[data-exploration-reset]');

  resetButton?.addEventListener('click', () => {
    if (!window.confirm('探索状況をリセットしてTOPへ戻りますか？')) return;

    try {
      window.localStorage.removeItem('fiornea_arg_v1');
      window.sessionStorage.removeItem('fiorneaDebug');
      window.sessionStorage.removeItem('fiorneaDebugPanelVisible');
    } catch {
      // Storageが使用できない環境でもTOPへの帰還は維持する。
    }

    window.location.assign('index.html');
  });

  if (!header || !toggle || !navigation) return;

  const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let previouslyFocused = null;

  const setMenuState = (open, { restoreFocus = false } = {}) => {
    header.classList.toggle('is-menu-open', open);
    document.documentElement.classList.toggle('is-menu-locked', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');

    if (open) {
      previouslyFocused = document.activeElement;
      navigation.querySelector(focusableSelector)?.focus({ preventScroll: true });
    } else if (restoreFocus && previouslyFocused instanceof HTMLElement) {
      previouslyFocused.focus({ preventScroll: true });
    }
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setMenuState(!isOpen(), { restoreFocus: isOpen() }));

  navigation.addEventListener('click', (event) => {
    if (!desktopMedia.matches && event.target.closest('a')) setMenuState(false);
  });

  document.addEventListener('click', (event) => {
    if (!desktopMedia.matches && isOpen() && !header.contains(event.target)) setMenuState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      setMenuState(false, { restoreFocus: true });
      return;
    }

    if (event.key !== 'Tab' || !isOpen() || desktopMedia.matches) return;
    const focusable = [...header.querySelectorAll(focusableSelector)].filter((element) => !element.hidden);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  desktopMedia.addEventListener('change', (event) => {
    if (event.matches) setMenuState(false);
  });

  window.addEventListener('pageshow', () => setMenuState(false));

})();
