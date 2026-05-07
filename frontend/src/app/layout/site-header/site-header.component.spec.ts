import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../app.routes';
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
