import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeService, ThemeSetting } from '../../../core/theme/theme.service';
import { TooltipDirective } from '../../../shared/tooltip/tooltip.directive';
import { HEADER_MENU_ICON_PATHS, HEADER_NAV_ITEMS, HEADER_THEME_OPTIONS, HEADER_THEME_TRIGGER_ICON_PATHS } from '../header-icons';

@Component({
  selector: 'app-mobile-header',
  imports: [NgClass, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.css', './mobile-header.theme.css']
})
export class MobileHeaderComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly themeService = inject(ThemeService);
  readonly closeIconPath = HEADER_MENU_ICON_PATHS.close;
  readonly menuIconPath = HEADER_MENU_ICON_PATHS.menu;
  readonly navItems = HEADER_NAV_ITEMS;
  readonly menuOpen = signal(false);
  readonly themeMenuOpen = signal(false);
  readonly themeOptions = HEADER_THEME_OPTIONS;
  readonly themeTriggerIconPaths = HEADER_THEME_TRIGGER_ICON_PATHS;

  toggleMenu(): void {
    this.themeMenuOpen.set(false);
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.blurActiveElement();
    this.menuOpen.set(false);
  }

  toggleThemeMenu(): void {
    this.menuOpen.set(false);
    this.themeMenuOpen.update((open) => !open);
  }

  setTheme(setting: ThemeSetting): void {
    this.blurActiveElement();
    this.themeService.setTheme(setting);
    this.themeMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  closeOpenPanelsOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.blurActiveElement();
      this.menuOpen.set(false);
      this.themeMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeOpenPanelsOnEscape(): void {
    this.blurActiveElement();
    this.menuOpen.set(false);
    this.themeMenuOpen.set(false);
  }

  private blurActiveElement(): void {
    const activeElement = this.elementRef.nativeElement.ownerDocument.activeElement;

    if (activeElement instanceof HTMLElement && this.elementRef.nativeElement.contains(activeElement)) {
      activeElement.blur();
    }
  }
}
