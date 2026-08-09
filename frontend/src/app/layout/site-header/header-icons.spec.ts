import {
  mdiShieldOutline,
  mdiThemeLightDark,
  mdiTranslate,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from '@mdi/js';

import {
  getThemeTriggerIconPath,
  HEADER_IDENTITY_ICON_PATH,
  HEADER_IDENTITY_ITEMS,
  HEADER_IDENTITY_NAVIGATION,
  HEADER_LANGUAGE_ICON_PATH,
  HEADER_MENU_ICON_PATHS,
  HEADER_NAV_ITEMS,
  HEADER_THEME_OPTIONS,
} from './header-icons';

describe('header icons', () => {
  it('defines the shared navigation and theme option sets', () => {
    expect(HEADER_NAV_ITEMS.map((item) => item.path)).toEqual([
      '/work',
      '/systems',
      '/writing',
      '/github',
      '/contact',
    ]);
    expect(HEADER_NAV_ITEMS.map((item) => item.exact)).toEqual([true, false, true, true, true]);
    expect(HEADER_THEME_OPTIONS.map((option) => option.value)).toEqual(['dark', 'light', 'system']);
    expect(HEADER_MENU_ICON_PATHS.menu).toContain('M3');
    expect(HEADER_MENU_ICON_PATHS.close).toContain('M19');
    expect(HEADER_LANGUAGE_ICON_PATH).toBe(mdiTranslate);
    expect(HEADER_IDENTITY_ICON_PATH).toBe(mdiShieldOutline);
    expect(HEADER_IDENTITY_ITEMS).toEqual([
      { label: 'About', path: '/about' },
      { label: 'Soruklu Surname', path: '/soruklu-surname' },
      { label: 'Soruklu Order', path: '/soruklu-order' },
      { label: 'Velari', path: '/velari' },
    ]);
    expect(HEADER_IDENTITY_NAVIGATION.en.note).toBe('About · Surname · Order · Velari');
    expect(HEADER_IDENTITY_NAVIGATION.tr.note).toBe('Hakkında · Soyadı · Order · Velari');
    expect(HEADER_IDENTITY_NAVIGATION.tr.items).toEqual([
      { label: 'Hakkında', path: '/about' },
      { label: 'Soruklu Soyadı', path: '/soruklu-surname' },
      { label: 'Soruklu Order', path: '/soruklu-order' },
      { label: 'Velari', path: '/velari' },
    ]);
  });

  it('selects the trigger icon from theme setting and resolved theme', () => {
    expect(getThemeTriggerIconPath('dark', 'dark')).toBe(mdiWeatherNight);
    expect(getThemeTriggerIconPath('light', 'light')).toBe(mdiWhiteBalanceSunny);
    expect(getThemeTriggerIconPath('dark', 'light')).toBe(mdiWhiteBalanceSunny);
    expect(getThemeTriggerIconPath('system', 'dark')).toBe(mdiThemeLightDark);
    expect(getThemeTriggerIconPath('system', 'light')).toBe(mdiThemeLightDark);
  });
});
