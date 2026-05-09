import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeService, ThemeSetting } from '../../core/theme/theme.service';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';
import { HEADER_NAV_ITEMS, HEADER_THEME_OPTIONS, HEADER_THEME_TRIGGER_ICON_PATHS } from './header-icons';
import { MobileHeaderComponent } from './mobile/mobile-header.component';

@Component({
  selector: 'app-site-header',
  imports: [MobileHeaderComponent, NgClass, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css', './site-header.theme.css', './site-header.responsive.css']
})
export class SiteHeaderComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly themeService = inject(ThemeService);
  readonly navItems = HEADER_NAV_ITEMS;
  readonly themeMenuOpen = signal(false);
  readonly themeOptions = HEADER_THEME_OPTIONS;
  readonly themeTriggerIconPaths = HEADER_THEME_TRIGGER_ICON_PATHS;

  toggleThemeMenu(): void {
    this.themeMenuOpen.update((open) => !open);
  }

  setTheme(setting: ThemeSetting): void {
    this.themeService.setTheme(setting);
    this.themeMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeThemeMenuOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.themeMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeThemeMenuOnEscape(): void {
    this.themeMenuOpen.set(false);
  }
}
