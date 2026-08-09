import { PLATFORM_ID, REQUEST } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { THEME_RESOLVED_COOKIE_KEY, THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    clearThemeCookies();
    globalThis.document.documentElement.className = '';
    globalThis.document.body.className = '';
    globalThis.document.head.innerHTML = '<meta name="theme-color" content="#07090d">';
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    globalThis.localStorage.clear();
    clearThemeCookies();
  });

  it('defaults to dark theme and updates document theme state', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.setting()).toBe('dark');
    expect(service.resolvedTheme()).toBe('dark');
    expect(service.triggerIcon()).toBe('dark_mode');
    expect(service.themeTooltipText()).toBe('Dark theme');
    expect(globalThis.document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(
      globalThis.document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    ).toBe('#07090d');
  });

  it('persists light theme selection', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('light');
    TestBed.flushEffects();

    expect(service.setting()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
    expect(service.triggerIcon()).toBe('light_mode');
    expect(service.themeTooltipText()).toBe('Light theme');
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(globalThis.document.cookie).toContain(`${THEME_STORAGE_KEY}=light`);
    expect(globalThis.document.cookie).toContain(`${THEME_RESOLVED_COOKIE_KEY}=light`);
    expect(globalThis.document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(
      globalThis.document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    ).toBe('#ffffff');
  });

  it('falls back to the SSR theme cookie when local storage has no selection', () => {
    globalThis.document.cookie = `${THEME_STORAGE_KEY}=light; Path=/; SameSite=Lax`;
    globalThis.document.cookie = `${THEME_RESOLVED_COOKIE_KEY}=light; Path=/; SameSite=Lax`;

    const service = TestBed.inject(ThemeService);

    expect(service.setting()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
  });

  it('supports system theme selection', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('system');
    TestBed.flushEffects();

    expect(service.setting()).toBe('system');
    expect(service.triggerIcon()).toBe('contrast');
    expect(service.themeTooltipText()).toBe('System theme');
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    expect(globalThis.document.cookie).toContain(`${THEME_STORAGE_KEY}=system`);
    expect(globalThis.document.cookie).toContain(`${THEME_RESOLVED_COOKIE_KEY}=dark`);
  });

  it('uses an explicit theme cookie during server rendering', () => {
    configureServerThemeTest(`${THEME_STORAGE_KEY}=light; ${THEME_RESOLVED_COOKIE_KEY}=dark`);

    const service = TestBed.inject(ThemeService);

    expect(service.setting()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
  });

  it('uses the last resolved system theme cookie during server rendering', () => {
    configureServerThemeTest(`${THEME_STORAGE_KEY}=system; ${THEME_RESOLVED_COOKIE_KEY}=light`);

    const service = TestBed.inject(ThemeService);

    expect(service.setting()).toBe('system');
    expect(service.resolvedTheme()).toBe('light');
  });
});

function clearThemeCookies(): void {
  globalThis.document.cookie = `${THEME_STORAGE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
  globalThis.document.cookie = `${THEME_RESOLVED_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function configureServerThemeTest(cookie: string): void {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: PLATFORM_ID, useValue: 'server' },
      {
        provide: REQUEST,
        useValue: new Request('https://serhatsoruklu.com/', { headers: { cookie } }),
      },
    ],
  });
}
