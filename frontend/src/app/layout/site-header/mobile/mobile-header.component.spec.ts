import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { routes } from '../../../app.routes';
import { MobileHeaderComponent } from './mobile-header.component';

describe('MobileHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileHeaderComponent],
      providers: [provideRouter(routes)]
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
