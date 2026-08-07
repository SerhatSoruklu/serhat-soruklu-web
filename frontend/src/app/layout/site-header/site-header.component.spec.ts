import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mdiThemeLightDark, mdiTranslate, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';

import { routes } from '../../app.routes';
import {
  HEADER_IDENTITY_ICON_PATH,
  HEADER_IDENTITY_ITEMS,
  HEADER_LANGUAGE_ICON_PATH,
  HEADER_NAV_ITEMS,
  HEADER_THEME_OPTIONS,
  HEADER_THEME_TRIGGER_ICON_PATHS,
} from './header-icons';
import { SiteHeaderComponent } from './site-header.component';

describe('SiteHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('toggles the desktop theme menu and selects a theme', () => {
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    const component = fixture.componentInstance;

    expect(component.themeMenuOpen()).toBe(false);
    component.toggleThemeMenu();
    expect(component.themeMenuOpen()).toBe(true);
    component.setTheme('light');
    expect(component.themeMenuOpen()).toBe(false);
    expect(component.themeService.setting()).toBe('light');
  });

  it('uses shared navigation, theme options, and trigger icon paths', () => {
    const fixture = TestBed.createComponent(SiteHeaderComponent);
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

  it('opens the desktop identity picker without navigating and renders all identity routes', () => {
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    const component = fixture.componentInstance;

    fixture.detectChanges();
    expect(component.identityMenuOpen()).toBe(false);

    component.openIdentityMenu();
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="desktop-identity-button"]',
    ) as HTMLButtonElement;
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="desktop-identity-menu"] a'),
    ).map((link) => (link as HTMLAnchorElement).getAttribute('href'));

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(links).toEqual(['/soruklu-surname', '/soruklu-order', '/velari']);

    component.closeIdentityMenu();
    expect(component.identityMenuOpen()).toBe(false);
  });

  it('renders the language availability dialog trigger', () => {
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="desktop-language-button"]',
    ) as HTMLButtonElement;

    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('closes the theme menu on outside click and escape', () => {
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    const component = fixture.componentInstance;

    component.toggleThemeMenu();
    component.closeThemeMenuOnOutsideClick(new MouseEvent('click'));
    expect(component.themeMenuOpen()).toBe(false);

    component.toggleThemeMenu();
    component.closeThemeMenuOnEscape();
    expect(component.themeMenuOpen()).toBe(false);

    component.openIdentityMenu();
    component.closeThemeMenuOnEscape();
    expect(component.identityMenuOpen()).toBe(false);
  });
});
