import { NgClass } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { mdiGithub } from '@mdi/js';

import { ThemeService, ThemeSetting } from '../../core/theme/theme.service';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';
import { MobileHeaderComponent } from './mobile/mobile-header.component';

interface ThemeOption {
  icon: string;
  label: string;
  value: ThemeSetting;
}

@Component({
  selector: 'app-site-header',
  imports: [MobileHeaderComponent, NgClass, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css', './site-header.theme.css', './site-header.responsive.css']
})
export class SiteHeaderComponent {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly themeService = inject(ThemeService);
  readonly githubIconPath = mdiGithub;
  readonly themeMenuOpen = signal(false);
  readonly themeOptions: ThemeOption[] = [
    { icon: 'dark_mode', label: 'Dark', value: 'dark' },
    { icon: 'light_mode', label: 'Light', value: 'light' },
    { icon: 'contrast', label: 'System', value: 'system' }
  ];

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
