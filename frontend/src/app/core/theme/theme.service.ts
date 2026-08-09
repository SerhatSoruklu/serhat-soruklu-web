import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, REQUEST, signal } from '@angular/core';

export type ThemeSetting = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'serhatsoruklu-theme';
export const THEME_RESOLVED_COOKIE_KEY = 'serhatsoruklu-resolved-theme';
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const THEME_CLASSES = [
  'theme-dark',
  'theme-light',
  'theme-system',
  'theme-resolved-dark',
  'theme-resolved-light',
];
const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#07090d',
  light: '#ffffff',
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly request = inject(REQUEST, { optional: true });
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;
  private readonly mediaQuery: MediaQueryList | null = this.browserWindow?.matchMedia
    ? this.browserWindow.matchMedia('(prefers-color-scheme: light)')
    : null;
  private readonly initialThemeState = this.readInitialThemeState();
  private readonly settingValue = signal<ThemeSetting>(this.initialThemeState.setting);
  private readonly resolvedThemeValue = signal<ResolvedTheme>(this.initialThemeState.resolvedTheme);

  readonly setting = this.settingValue.asReadonly();
  readonly resolvedTheme = this.resolvedThemeValue.asReadonly();
  readonly themeTooltipText = computed(() => {
    const setting = this.setting();

    if (setting === 'light') {
      return 'Light theme';
    }

    if (setting === 'system') {
      return 'System theme';
    }

    return 'Dark theme';
  });
  readonly triggerIcon = computed(() => {
    const setting = this.setting();

    if (setting === 'system') {
      return 'contrast';
    }

    return this.resolvedTheme() === 'dark' ? 'dark_mode' : 'light_mode';
  });

  constructor() {
    if (this.isBrowser) {
      this.mediaQuery?.addEventListener('change', this.handleSystemThemeChange);
      this.writeThemeCookies(this.setting(), this.resolvedTheme());
    }

    effect(() => {
      this.applyThemeClass(this.setting(), this.resolvedTheme());
      this.updateColorScheme(this.resolvedTheme());
    });
  }

  setTheme(setting: ThemeSetting): void {
    this.settingValue.set(setting);
    const resolvedTheme = this.resolveTheme(setting);

    this.resolvedThemeValue.set(resolvedTheme);
    this.writeStoredSetting(setting, resolvedTheme);
  }

  private readonly handleSystemThemeChange = (): void => {
    if (this.settingValue() === 'system') {
      const resolvedTheme = this.resolveTheme('system');

      this.resolvedThemeValue.set(resolvedTheme);
      this.writeThemeCookies('system', resolvedTheme);
    }
  };

  private readInitialThemeState(): {
    setting: ThemeSetting;
    resolvedTheme: ResolvedTheme;
  } {
    if (this.isBrowser) {
      const setting = this.readBrowserSetting();

      return { setting, resolvedTheme: this.resolveTheme(setting) };
    }

    const cookieHeader = this.request?.headers.get('cookie') ?? '';
    const setting = this.readCookieThemeSetting(cookieHeader) ?? 'dark';
    const resolvedTheme =
      setting === 'system' ? (this.readCookieResolvedTheme(cookieHeader) ?? 'dark') : setting;

    return { setting, resolvedTheme };
  }

  private readBrowserSetting(): ThemeSetting {
    try {
      const storedSetting = this.browserWindow?.localStorage.getItem(THEME_STORAGE_KEY);

      if (this.isThemeSetting(storedSetting)) {
        return storedSetting;
      }
    } catch {
      // Fall back to the SSR-readable cookie when local storage is unavailable.
    }

    return this.readCookieThemeSetting(this.document.cookie) ?? 'dark';
  }

  private writeStoredSetting(setting: ThemeSetting, resolvedTheme: ResolvedTheme): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      this.browserWindow?.localStorage.setItem(THEME_STORAGE_KEY, setting);
    } catch {
      // The selector remains functional and the cookie still preserves SSR parity.
    }

    this.writeThemeCookies(setting, resolvedTheme);
  }

  private writeThemeCookies(setting: ThemeSetting, resolvedTheme: ResolvedTheme): void {
    if (!this.isBrowser) {
      return;
    }

    const secureAttribute = this.document.location.protocol === 'https:' ? '; Secure' : '';
    const attributes = `; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secureAttribute}`;

    try {
      this.document.cookie = `${THEME_STORAGE_KEY}=${setting}${attributes}`;
      this.document.cookie = `${THEME_RESOLVED_COOKIE_KEY}=${resolvedTheme}${attributes}`;
    } catch {
      // Theme selection remains available for the current page if cookies are unavailable.
    }
  }

  private readCookieThemeSetting(cookieHeader: string): ThemeSetting | null {
    const value = this.readCookieValue(cookieHeader, THEME_STORAGE_KEY);

    return this.isThemeSetting(value) ? value : null;
  }

  private readCookieResolvedTheme(cookieHeader: string): ResolvedTheme | null {
    const value = this.readCookieValue(cookieHeader, THEME_RESOLVED_COOKIE_KEY);

    return value === 'dark' || value === 'light' ? value : null;
  }

  private readCookieValue(cookieHeader: string, name: string): string | null {
    const cookie = cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith(`${name}=`));

    return cookie?.slice(name.length + 1) ?? null;
  }

  private isThemeSetting(value: string | null | undefined): value is ThemeSetting {
    return value === 'dark' || value === 'light' || value === 'system';
  }

  private resolveTheme(setting: ThemeSetting): ResolvedTheme {
    if (setting === 'light') {
      return 'light';
    }

    if (setting === 'system' && this.mediaQuery?.matches) {
      return 'light';
    }

    return 'dark';
  }

  private applyThemeClass(setting: ThemeSetting, resolvedTheme: ResolvedTheme): void {
    const themeClass = `theme-${setting}`;
    const resolvedThemeClass = `theme-resolved-${resolvedTheme}`;
    const root = this.document.documentElement;
    const body = this.document.body;
    const appRoot = this.document.querySelector('app-root');

    root.classList.remove(...THEME_CLASSES);
    root.classList.add(themeClass, resolvedThemeClass);

    if (body) {
      body.classList.remove(...THEME_CLASSES);
      body.classList.add(themeClass, resolvedThemeClass);
    }

    if (appRoot) {
      appRoot.classList.remove(...THEME_CLASSES);
      appRoot.classList.add(themeClass, resolvedThemeClass);
    }
  }

  private updateColorScheme(resolvedTheme: ResolvedTheme): void {
    this.document.documentElement.style.colorScheme = resolvedTheme;
    this.document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[resolvedTheme]);

    if (this.document.body) {
      this.document.body.style.colorScheme = resolvedTheme;
    }
  }
}
