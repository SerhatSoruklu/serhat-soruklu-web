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

export { mdiShieldOutline as HEADER_IDENTITY_ICON_PATH } from '@mdi/js';

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

export interface HeaderIdentityItem {
  label: string;
  path: string;
}

export interface HeaderIdentityNavigation {
  availabilityNote: string;
  label: string;
  note: string;
  routesAriaLabel: string;
  routesHeading: string;
  triggerAriaLabel: string;
  items: HeaderIdentityItem[];
}

export const HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { exact: true, iconPath: mdiBriefcaseOutline, label: 'Work', path: '/work' },
  { exact: false, iconPath: mdiSitemapOutline, label: 'Systems', path: '/systems' },
  { exact: true, iconPath: mdiNoteTextOutline, label: 'Writing', path: '/writing' },
  { exact: true, iconClass: 'github-icon', iconPath: mdiGithub, label: 'GitHub', path: '/github' },
  { exact: true, iconPath: mdiEmailOutline, label: 'Contact', path: '/contact' },
];

export const HEADER_IDENTITY_ITEMS: HeaderIdentityItem[] = [
  { label: 'About', path: '/about' },
  { label: 'Soruklu Surname', path: '/soruklu-surname' },
  { label: 'Soruklu Order', path: '/soruklu-order' },
  { label: 'Velari', path: '/velari' },
];

export const HEADER_IDENTITY_NAVIGATION: Record<'en' | 'tr', HeaderIdentityNavigation> = {
  en: {
    availabilityNote:
      'Only Identity pages have a Turkish translation. The rest of the site is in English.',
    label: 'Identity',
    note: 'About · Surname · Order · Velari',
    routesAriaLabel: 'Identity routes',
    routesHeading: 'Identity routes',
    triggerAriaLabel: 'Explore identity pages',
    items: HEADER_IDENTITY_ITEMS,
  },
  tr: {
    availabilityNote:
      'Şu anda yalnızca Kimlik sayfalarının Türkçe çevirisi var. Sitenin geri kalanı İngilizcedir.',
    label: 'Kimlik',
    note: 'Hakkında · Soyadı · Order · Velari',
    routesAriaLabel: 'Kimlik sayfaları',
    routesHeading: 'Kimlik sayfaları',
    triggerAriaLabel: 'Kimlik sayfalarını keşfedin',
    items: [
      { label: 'Hakkında', path: '/about' },
      { label: 'Soruklu Soyadı', path: '/soruklu-surname' },
      { label: 'Soruklu Order', path: '/soruklu-order' },
      { label: 'Velari', path: '/velari' },
    ],
  },
};

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
