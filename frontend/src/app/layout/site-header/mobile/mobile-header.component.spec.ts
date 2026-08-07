import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mdiThemeLightDark, mdiTranslate, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';

import { routes } from '../../../app.routes';
import {
  HEADER_IDENTITY_ICON_PATH,
  HEADER_IDENTITY_ITEMS,
  HEADER_LANGUAGE_ICON_PATH,
  HEADER_NAV_ITEMS,
  HEADER_THEME_OPTIONS,
  HEADER_THEME_TRIGGER_ICON_PATHS,
} from '../header-icons';
import { MobileHeaderComponent } from './mobile-header.component';

describe('MobileHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileHeaderComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('keeps menu and theme dropdown mutually exclusive', () => {
    const fixture = TestBed.createComponent(MobileHeaderComponent);
    const component = fixture.componentInstance;

    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
    expect(component.themeMenuOpen()).toBe(false);

    component.toggleThemeMenu();
    expect(component.menuOpen()).toBe(false);
    expect(component.themeMenuOpen()).toBe(true);

    component.setTheme('light');
    expect(component.themeMenuOpen()).toBe(false);
    expect(component.themeService.setting()).toBe('light');
  });

  it('uses shared navigation, theme options, and trigger icon paths', () => {
    const fixture = TestBed.createComponent(MobileHeaderComponent);
    const component = fixture.componentInstance;

    expect(component.navItems).toBe(HEADER_NAV_ITEMS);
    expect(component.identityItems).toBe(HEADER_IDENTITY_ITEMS);
    expect(component.identityIconPath).toBe(HEADER_IDENTITY_ICON_PATH);
    expect(component.themeOptions).toBe(HEADER_THEME_OPTIONS);
    expect(component.languageIconPath).toBe(HEADER_LANGUAGE_ICON_PATH);
    expect(component.languageIconPath).toBe(mdiTranslate);
    expect(component.themeTriggerIconPaths).toBe(HEADER_THEME_TRIGGER_ICON_PATHS);
    expect(component.themeTriggerIconPaths.dark).toBe(mdiWeatherNight);
    expect(component.themeTriggerIconPaths.light).toBe(mdiWhiteBalanceSunny);
    expect(component.themeTriggerIconPaths.system).toBe(mdiThemeLightDark);
  });

  it('expands the compact identity chooser without navigating', () => {
    const fixture = TestBed.createComponent(MobileHeaderComponent);
    const component = fixture.componentInstance;

    component.toggleMenu();
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="mobile-identity-button"]',
    ) as HTMLButtonElement;

    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    component.toggleIdentityMenu();
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="mobile-identity-routes"] a'),
    ).map((link) => (link as HTMLAnchorElement).getAttribute('href'));

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(component.menuOpen()).toBe(true);
    expect(links).toEqual(['/soruklu-surname', '/soruklu-order', '/velari']);

    component.closeMenu();
    expect(component.identityMenuOpen()).toBe(false);
  });

  it('renders the mobile language availability dialog trigger', () => {
    const fixture = TestBed.createComponent(MobileHeaderComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="mobile-language-button"]',
    ) as HTMLButtonElement;

    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('closes open panels on outside click and escape', () => {
    const fixture = TestBed.createComponent(MobileHeaderComponent);
    const component = fixture.componentInstance;

    component.toggleMenu();
    component.closeOpenPanelsOnOutsideClick(new MouseEvent('click'));
    expect(component.menuOpen()).toBe(false);

    component.toggleThemeMenu();
    component.closeOpenPanelsOnEscape();
    expect(component.themeMenuOpen()).toBe(false);

    component.toggleMenu();
    component.toggleIdentityMenu();
    component.closeOpenPanelsOnEscape();
    expect(component.identityMenuOpen()).toBe(false);
  });
});
