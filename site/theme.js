(() => {
  'use strict';
  const storageKey = 'drone-quiz-theme';
  const root = document.documentElement;
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  let unsavedPreference = false;

  function validPreference(value) {
    return value === 'dark' || value === 'light' ? value : null;
  }
  function readPreference() {
    try { return validPreference(localStorage.getItem(storageKey)); }
    catch { return preference; }
  }
  function applyTheme() {
    const theme = preference || (systemTheme.matches ? 'dark' : 'light');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#101b18' : '#155e52';
    const button = document.getElementById('theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.title = theme === 'dark' ? '切換至淺色模式' : '切換至深色模式';
    }
  }

  // Apply the preference before the stylesheet and page content are rendered.
  preference = readPreference();
  applyTheme();

  function setupToggle() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    button.hidden = false;
    button.addEventListener('click', () => {
      preference = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(storageKey, preference); unsavedPreference = false; }
      catch { unsavedPreference = true; }
      applyTheme();
    });
    applyTheme();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupToggle, { once: true });
  else setupToggle();

  systemTheme.addEventListener('change', () => { if (!preference) applyTheme(); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validPreference(event.newValue);
    unsavedPreference = false;
    applyTheme();
  });
  window.addEventListener('pageshow', () => {
    if (!unsavedPreference) preference = readPreference();
    applyTheme();
  });
})();
