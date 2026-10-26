(() => {
  'use strict';
  const widget = document.querySelector('[data-price-tabs]');
  if (!widget) return;
  const tabs = [...widget.querySelectorAll('[role="tab"]')];
  const panels = [...widget.querySelectorAll('[role="tabpanel"]')];
  const activate = (tab, focus = false) => {
    tabs.forEach((item) => { const selected = item === tab; item.setAttribute('aria-selected', String(selected)); item.tabIndex = selected ? 0 : -1; });
    panels.forEach((panel) => { panel.hidden = panel.id !== tab.getAttribute('aria-controls'); });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      let next = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault(); activate(tabs[next], true);
    });
  });
  activate(tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);
})();
