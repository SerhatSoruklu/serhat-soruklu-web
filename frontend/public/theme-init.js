(function () {
  'use strict';

  var browserGlobal = globalThis;
  var storageKey = 'serhatsoruklu-theme';
  var themeClasses = [
    'theme-dark',
    'theme-light',
    'theme-system',
    'theme-resolved-dark',
    'theme-resolved-light'
  ];
  var setting = 'dark';
  var resolvedTheme = 'dark';

  try {
    var storedSetting = browserGlobal.localStorage.getItem(storageKey);

    if (storedSetting === 'dark' || storedSetting === 'light' || storedSetting === 'system') {
      setting = storedSetting;
    }
  } catch (error) {
    if (browserGlobal.console && typeof browserGlobal.console.debug === 'function') {
      browserGlobal.console.debug('Stored theme preference is unavailable.', error);
    }
    setting = 'dark';
  }

  if (
    setting === 'light' ||
    (setting === 'system' && browserGlobal.matchMedia && browserGlobal.matchMedia('(prefers-color-scheme: light)').matches)
  ) {
    resolvedTheme = 'light';
  }

  function applyTheme(target) {
    if (!target) {
      return;
    }

    target.classList.remove.apply(target.classList, themeClasses);
    target.classList.add('theme-' + setting, 'theme-resolved-' + resolvedTheme);
    target.style.colorScheme = resolvedTheme;
  }

  applyTheme(document.documentElement);

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(document.body);
  }, { once: true });

  var themeColor = document.querySelector('meta[name="theme-color"]');

  if (themeColor) {
    themeColor.setAttribute('content', resolvedTheme === 'light' ? '#ffffff' : '#07090d');
  }
})();
