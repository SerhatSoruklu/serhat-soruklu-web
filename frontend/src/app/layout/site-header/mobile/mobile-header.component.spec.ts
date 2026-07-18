import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mdiThemeLightDark, mdiTranslate, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';

import { routes } from '../../../app.routes';
import {
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
    expect(component.themeOptions).toBe(HEADER_THEME_OPTIONS);
    expect(component.languageIconPath).toBe(HEADER_LANGUAGE_ICON_PATH);
    expect(component.languageIconPath).toBe(mdiTranslate);
    expect(component.themeTriggerIconPaths).toBe(HEADER_THEME_TRIGGER_ICON_PATHS);
    expect(component.themeTriggerIconPaths.dark).toBe(mdiWeatherNight);
    expect(component.themeTriggerIconPaths.light).toBe(mdiWhiteBalanceSunny);
    expect(component.themeTriggerIconPaths.system).toBe(mdiThemeLightDark);
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
  });
});
