import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { mdiThemeLightDark, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';

import { routes } from '../../app.routes';
import { HEADER_NAV_ITEMS, HEADER_THEME_OPTIONS, HEADER_THEME_TRIGGER_ICON_PATHS } from './header-icons';
import { SiteHeaderComponent } from './site-header.component';

describe('SiteHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteHeaderComponent],
      providers: [provideRouter(routes)]
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
    expect(component.themeOptions).toBe(HEADER_THEME_OPTIONS);
    expect(component.themeTriggerIconPaths).toBe(HEADER_THEME_TRIGGER_ICON_PATHS);
    expect(component.themeTriggerIconPaths.dark).toBe(mdiWeatherNight);
    expect(component.themeTriggerIconPaths.light).toBe(mdiWhiteBalanceSunny);
    expect(component.themeTriggerIconPaths.system).toBe(mdiThemeLightDark);
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
  });
});
