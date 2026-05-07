import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  mdiBriefcaseOutline,
  mdiClose,
  mdiEmailOutline,
  mdiGithub,
  mdiMenu,
  mdiNoteTextOutline,
  mdiSitemapOutline,
  mdiThemeLightDark,
  mdiWeatherNight,
  mdiWhiteBalanceSunny
} from '@mdi/js';

import { ThemeService, ThemeSetting } from '../../../core/theme/theme.service';
import { TooltipDirective } from '../../../shared/tooltip/tooltip.directive';

interface ThemeOption {
  iconPath: string;
  label: string;
  value: ThemeSetting;
}

@Component({
  selector: 'app-mobile-header',
  imports: [NgClass, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.css', './mobile-header.theme.css']
})
export class MobileHeaderComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly themeService = inject(ThemeService);
  readonly githubIconPath = mdiGithub;
  readonly menuIconPath = mdiMenu;
  readonly closeIconPath = mdiClose;
  readonly workIconPath = mdiBriefcaseOutline;
  readonly systemsIconPath = mdiSitemapOutline;
  readonly writingIconPath = mdiNoteTextOutline;
  readonly contactIconPath = mdiEmailOutline;
  readonly menuOpen = signal(false);
  readonly themeMenuOpen = signal(false);
  readonly themeOptions: ThemeOption[] = [
    { iconPath: mdiWeatherNight, label: 'Dark', value: 'dark' },
    { iconPath: mdiWhiteBalanceSunny, label: 'Light', value: 'light' },
    { iconPath: mdiThemeLightDark, label: 'System', value: 'system' }
  ];

  themeTriggerIconPath(): string {
    const setting = this.themeService.setting();

    if (setting === 'system') {
      return mdiThemeLightDark;
    }

    return this.themeService.resolvedTheme() === 'dark' ? mdiWeatherNight : mdiWhiteBalanceSunny;
  }

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
