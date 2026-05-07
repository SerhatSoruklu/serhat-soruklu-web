import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    globalThis.document.documentElement.className = '';
    globalThis.document.body.className = '';
    globalThis.document.head.innerHTML = '<meta name="theme-color" content="#07090d">';
    TestBed.configureTestingModule({});
  });

  it('defaults to dark theme and updates document theme state', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.flushEffects();

    expect(service.setting()).toBe('dark');
    expect(service.resolvedTheme()).toBe('dark');
    expect(service.triggerIcon()).toBe('dark_mode');
    expect(service.themeTooltipText()).toBe('Theme: Dark. Switch appearance.');
    expect(globalThis.document.documentElement.classList.contains('theme-dark')).toBe(true);
    expect(globalThis.document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#07090d');
  });

  it('persists light theme selection', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('light');
    TestBed.flushEffects();

    expect(service.setting()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
    expect(service.triggerIcon()).toBe('light_mode');
    expect(service.themeTooltipText()).toBe('Theme: Light. Switch appearance.');
    expect(globalThis.localStorage.getItem('serhatsoruklu-theme')).toBe('light');
    expect(globalThis.document.documentElement.classList.contains('theme-light')).toBe(true);
    expect(globalThis.document.querySelector('meta[name="theme-color"]')?.getAttribute('content')).toBe('#ffffff');
  });

  it('supports system theme selection', () => {
    const service = TestBed.inject(ThemeService);

    service.setTheme('system');
    TestBed.flushEffects();

    expect(service.setting()).toBe('system');
    expect(service.triggerIcon()).toBe('contrast');
    expect(service.themeTooltipText()).toBe('Theme: System. Follows your device setting.');
    expect(globalThis.localStorage.getItem('serhatsoruklu-theme')).toBe('system');
  });
});
