import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, inject, OnDestroy, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ThemeService, ThemeSetting } from '../../../core/theme/theme.service';
import { TooltipDirective } from '../../../shared/tooltip/tooltip.directive';
import { HEADER_MENU_ICON_PATHS, HEADER_NAV_ITEMS, HEADER_THEME_OPTIONS, HEADER_THEME_TRIGGER_ICON_PATHS } from '../header-icons';

const SCROLLED_ENABLE_THRESHOLD = 20;
const SCROLLED_DISABLE_THRESHOLD = 2;

@Component({
  selector: 'app-mobile-header',
  imports: [NgClass, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.css', './mobile-header.theme.css']
})
export class MobileHeaderComponent implements AfterViewInit, OnDestroy {
  private animationFrameId: number | null = null;
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly scheduleScrollProgressUpdate = (): void => {
    const browserWindow = this.document.defaultView;

    if (!browserWindow || this.animationFrameId !== null) {
      return;
    }

    this.animationFrameId = browserWindow.requestAnimationFrame(() => {
      this.animationFrameId = null;
      this.updateScrollProgress();
    });
  };

  readonly themeService = inject(ThemeService);
  readonly closeIconPath = HEADER_MENU_ICON_PATHS.close;
  readonly isScrolled = signal(this.getScrollTop() >= SCROLLED_ENABLE_THRESHOLD);
  readonly menuIconPath = HEADER_MENU_ICON_PATHS.menu;
  readonly navItems = HEADER_NAV_ITEMS;
  readonly menuOpen = signal(false);
  readonly scrollProgress = signal(this.getScrollProgress());
  readonly themeMenuOpen = signal(false);
  readonly themeOptions = HEADER_THEME_OPTIONS;
  readonly themeTriggerIconPaths = HEADER_THEME_TRIGGER_ICON_PATHS;

  ngAfterViewInit(): void {
    const browserWindow = this.document.defaultView;

    if (!this.isBrowser || !browserWindow) {
      return;
    }

    this.updateScrollProgress();
    browserWindow.addEventListener('scroll', this.scheduleScrollProgressUpdate, { passive: true });
    browserWindow.addEventListener('resize', this.scheduleScrollProgressUpdate);
  }

  ngOnDestroy(): void {
    const browserWindow = this.document.defaultView;

    if (!this.isBrowser || !browserWindow) {
      return;
    }

    browserWindow.removeEventListener('scroll', this.scheduleScrollProgressUpdate);
    browserWindow.removeEventListener('resize', this.scheduleScrollProgressUpdate);

    if (this.animationFrameId !== null) {
      browserWindow.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
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

  private updateScrollProgress(): void {
    const browserWindow = this.document.defaultView;
    const documentElement = this.document.documentElement;
    const body = this.document.body;

    if (!browserWindow || !documentElement || !body) {
      this.isScrolled.set(false);
      this.scrollProgress.set(0);
      return;
    }

    const scrollTop = this.getScrollTop();

    this.updateScrolledState(scrollTop);
    this.scrollProgress.set(this.getScrollProgress());
  }

  private updateScrolledState(scrollTop: number): void {
    if (this.isScrolled()) {
      this.isScrolled.set(scrollTop > SCROLLED_DISABLE_THRESHOLD);

      return;
    }

    this.isScrolled.set(scrollTop >= SCROLLED_ENABLE_THRESHOLD);
  }

  private getScrollTop(): number {
    const browserWindow = this.document.defaultView;
    const documentElement = this.document.documentElement;
    const body = this.document.body;

    return browserWindow?.scrollY || documentElement?.scrollTop || body?.scrollTop || 0;
  }

  private getScrollProgress(): number {
    const browserWindow = this.document.defaultView;
    const documentElement = this.document.documentElement;
    const body = this.document.body;

    if (!browserWindow || !documentElement || !body) {
      return 0;
    }

    const scrollTop = this.getScrollTop();
    const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
    const viewportHeight = browserWindow.innerHeight || documentElement.clientHeight;
    const scrollableDistance = Math.max(0, scrollHeight - viewportHeight);
    const progress = scrollableDistance > 0 ? Math.min(1, Math.max(0, scrollTop / scrollableDistance)) : 0;

    return Number(progress.toFixed(4));
  }
}
