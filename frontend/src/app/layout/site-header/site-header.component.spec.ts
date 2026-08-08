import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mdiThemeLightDark, mdiTranslate, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';

import { routes } from '../../app.routes';
import {
  HEADER_IDENTITY_ICON_PATH,
  HEADER_IDENTITY_ITEMS,
  HEADER_IDENTITY_NAVIGATION,
  HEADER_LANGUAGE_ICON_PATH,
  HEADER_NAV_ITEMS,
  HEADER_THEME_OPTIONS,
  HEADER_THEME_TRIGGER_ICON_PATHS,
} from './header-icons';
import { SiteHeaderComponent } from './site-header.component';

describe('SiteHeaderComponent', () => {
  beforeEach(async () => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  afterEach(() => {
    globalThis.localStorage.clear();
    globalThis.sessionStorage.clear();
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
    expect(component.identityNavigation()).toBe(HEADER_IDENTITY_NAVIGATION.en);
    expect(component.identityNavigation().items).toBe(HEADER_IDENTITY_ITEMS);
    expect(component.identityIconPath).toBe(HEADER_IDENTITY_ICON_PATH);
    expect(component.themeOptions).toBe(HEADER_THEME_OPTIONS);
    expect(component.languageIconPath).toBe(HEADER_LANGUAGE_ICON_PATH);
    expect(component.languageIconPath).toBe(mdiTranslate);
    expect(component.themeTriggerIconPaths).toBe(HEADER_THEME_TRIGGER_ICON_PATHS);
    expect(component.themeTriggerIconPaths.dark).toBe(mdiWeatherNight);
    expect(component.themeTriggerIconPaths.light).toBe(mdiWhiteBalanceSunny);
    expect(component.themeTriggerIconPaths.system).toBe(mdiThemeLightDark);
  });

  it('selects and saves Turkish from the desktop Identity menu', () => {
    const fixture = TestBed.createComponent(SiteHeaderComponent);
    const component = fixture.componentInstance;

    component.openIdentityMenu();
    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector(
      '[data-testid="desktop-identity-menu"]',
    ) as HTMLElement;
    const turkishButton = menu.querySelector<HTMLButtonElement>(
      '[data-testid="identity-language-tr"]',
    );

    expect(
      menu.querySelector<HTMLButtonElement>('[data-testid="identity-language-en"]')?.getAttribute(
        'aria-pressed',
      ),
    ).toBe('true');

    turkishButton?.click();
    fixture.detectChanges();

    const routeLabels = Array.from(menu.querySelectorAll('.identity-selector__route')).map(
      (link) => link.textContent?.replace(/\s+/g, ' ').trim(),
    );

    expect(component.identityLanguage.language()).toBe('tr');
    expect(component.identityNavigation()).toBe(HEADER_IDENTITY_NAVIGATION.tr);
    expect(
      fixture.nativeElement.querySelector('[data-testid="desktop-header"]')?.getAttribute('lang'),
    ).toBe('en-GB');
    expect(
      fixture.nativeElement.querySelector('.identity-selector')?.getAttribute('lang'),
    ).toBe('tr-TR');
    expect(
      fixture.nativeElement
        .querySelector('[data-testid="desktop-identity-button"]')
        ?.textContent?.replace(/\s+/g, ' '),
    ).toContain('Kimlik');
    expect(menu.getAttribute('aria-label')).toBe('Kimlik sayfaları');
    expect(routeLabels).toEqual(['01 Soruklu Soyadı→', '02 Soruklu Order→', '03 Velari→']);
    expect(turkishButton?.getAttribute('aria-pressed')).toBe('true');
    expect(globalThis.localStorage.getItem('serhatsoruklu-identity-language')).toBe('tr');
    expect(globalThis.sessionStorage.getItem('serhatsoruklu-surname-language')).toBe('tr');
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
