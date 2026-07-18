import {
  mdiBriefcaseOutline,
  mdiClose,
  mdiEmailOutline,
  mdiGithub,
  mdiMenu,
  mdiNoteTextOutline,
  mdiSitemapOutline,
  mdiThemeLightDark,
  mdiTranslate,
  mdiWeatherNight,
  mdiWhiteBalanceSunny,
} from '@mdi/js';

import { ResolvedTheme, ThemeSetting } from '../../core/theme/theme.service';

export interface HeaderNavItem {
  exact: boolean;
  iconClass?: string;
  iconPath: string;
  label: string;
  path: string;
}

export interface HeaderThemeOption {
  iconPath: string;
  label: string;
  value: ThemeSetting;
}

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { exact: true, iconPath: mdiBriefcaseOutline, label: 'Work', path: '/work' },
  { exact: false, iconPath: mdiSitemapOutline, label: 'Systems', path: '/systems' },
  { exact: true, iconPath: mdiNoteTextOutline, label: 'Writing', path: '/writing' },
  { exact: true, iconClass: 'github-icon', iconPath: mdiGithub, label: 'GitHub', path: '/github' },
  { exact: true, iconPath: mdiEmailOutline, label: 'Contact', path: '/contact' },
];

export const HEADER_THEME_OPTIONS: HeaderThemeOption[] = [
  { iconPath: mdiWeatherNight, label: 'Dark', value: 'dark' },
  { iconPath: mdiWhiteBalanceSunny, label: 'Light', value: 'light' },
  { iconPath: mdiThemeLightDark, label: 'System', value: 'system' },
];

export const HEADER_MENU_ICON_PATHS = {
  close: mdiClose,
  menu: mdiMenu,
};

export const HEADER_THEME_TRIGGER_ICON_PATHS = {
  dark: mdiWeatherNight,
  light: mdiWhiteBalanceSunny,
  system: mdiThemeLightDark,
};

export const HEADER_LANGUAGE_ICON_PATH = mdiTranslate;

export function getThemeTriggerIconPath(
  setting: ThemeSetting,
  resolvedTheme: ResolvedTheme,
): string {
  if (setting === 'system') {
    return HEADER_THEME_TRIGGER_ICON_PATHS.system;
  }

  return resolvedTheme === 'dark'
    ? HEADER_THEME_TRIGGER_ICON_PATHS.dark
    : HEADER_THEME_TRIGGER_ICON_PATHS.light;
}
