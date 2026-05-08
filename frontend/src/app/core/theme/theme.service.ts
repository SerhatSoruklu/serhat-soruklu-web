import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

export type ThemeSetting = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'serhatsoruklu-theme';
const THEME_CLASSES = ['theme-dark', 'theme-light', 'theme-system', 'theme-resolved-dark', 'theme-resolved-light'];
const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#07090d',
  light: '#ffffff'
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;
  private readonly mediaQuery: MediaQueryList | null = this.browserWindow?.matchMedia
    ? this.browserWindow.matchMedia('(prefers-color-scheme: light)')
    : null;
  private readonly settingValue = signal<ThemeSetting>(this.isBrowser ? this.readStoredSetting() : 'dark');
  private readonly resolvedThemeValue = signal<ResolvedTheme>(this.resolveTheme(this.settingValue()));

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
    }

    effect(() => {
      this.applyThemeClass(this.setting(), this.resolvedTheme());
      this.updateColorScheme(this.resolvedTheme());
    });
  }

  setTheme(setting: ThemeSetting): void {
    this.settingValue.set(setting);
    this.resolvedThemeValue.set(this.resolveTheme(setting));
    this.writeStoredSetting(setting);
  }

  private readonly handleSystemThemeChange = (): void => {
    if (this.settingValue() === 'system') {
      this.resolvedThemeValue.set(this.resolveTheme('system'));
    }
  };

  private readStoredSetting(): ThemeSetting {
    try {
      const storedSetting = this.browserWindow?.localStorage.getItem(THEME_STORAGE_KEY);

      if (storedSetting === 'dark' || storedSetting === 'light' || storedSetting === 'system') {
        return storedSetting;
      }
    } catch {
      return 'dark';
    }

    return 'dark';
  }

  private writeStoredSetting(setting: ThemeSetting): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      this.browserWindow?.localStorage.setItem(THEME_STORAGE_KEY, setting);
    } catch {
      return;
    }
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
    this.document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[resolvedTheme]);

    if (this.document.body) {
      this.document.body.style.colorScheme = resolvedTheme;
    }
  }
}
