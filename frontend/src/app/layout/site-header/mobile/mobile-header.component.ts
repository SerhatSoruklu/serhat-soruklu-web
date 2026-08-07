import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { mdiArrowRight, mdiChevronDown, mdiHomeVariantOutline } from '@mdi/js';

import { TopNavigationService } from '../../../core/navigation/top-navigation.service';
import { ThemeService, ThemeSetting } from '../../../core/theme/theme.service';
import { LanguageDialogService } from '../../../shared/dialogs/language-dialog/language-dialog.service';
import { TooltipDirective } from '../../../shared/tooltip/tooltip.directive';
import {
  HEADER_IDENTITY_ICON_PATH,
  HEADER_IDENTITY_ITEMS,
  HEADER_LANGUAGE_ICON_PATH,
  HEADER_MENU_ICON_PATHS,
  HEADER_NAV_ITEMS,
  HEADER_THEME_OPTIONS,
  HEADER_THEME_TRIGGER_ICON_PATHS,
} from '../header-icons';

const SCROLLED_ENABLE_THRESHOLD = 20;
const SCROLLED_DISABLE_THRESHOLD = 2;

@Component({
  selector: 'app-mobile-header',
  imports: [NgClass, RouterLink, RouterLinkActive, TooltipDirective],
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.css', './mobile-header.theme.css'],
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
  readonly topNavigation = inject(TopNavigationService);
  private readonly router = inject(Router);
  readonly closeIconPath = HEADER_MENU_ICON_PATHS.close;
  readonly isScrolled = signal(this.getScrollTop() >= SCROLLED_ENABLE_THRESHOLD);
  readonly languageDialog = inject(LanguageDialogService);
  readonly languageIconPath = HEADER_LANGUAGE_ICON_PATH;
  readonly menuIconPath = HEADER_MENU_ICON_PATHS.menu;
  readonly navItems = HEADER_NAV_ITEMS;
  readonly menuOpen = signal(false);
  readonly scrollProgress = signal(this.getScrollProgress());
  readonly themeMenuOpen = signal(false);
  readonly themeOptions = HEADER_THEME_OPTIONS;
  readonly themeTriggerIconPaths = HEADER_THEME_TRIGGER_ICON_PATHS;
  readonly currentYear = new Date().getFullYear();
  readonly homeIconPath = mdiHomeVariantOutline;
  readonly identityChevronPath = mdiChevronDown;
  readonly identityIconPath = HEADER_IDENTITY_ICON_PATH;
  readonly identityItems = HEADER_IDENTITY_ITEMS;
  readonly identityMenuOpen = signal(false);
  readonly quickLinkArrowPath = mdiArrowRight;
  readonly quickLinks = [
    {
      brand: 'coupyn',
      label: 'Coupyn',
      path: '/systems/coupyn',
      externalUrl: 'https://coupyn.com',
      ariaLabel: 'View Coupyn system page',
      externalAriaLabel: 'Open Coupyn.com in a new tab',
    },
    {
      brand: 'chatpdm',
      label: 'ChatPDM',
      path: '/systems/chatpdm',
      externalUrl: 'https://chatpdm.com',
      ariaLabel: 'View ChatPDM system page',
      externalAriaLabel: 'Open ChatPDM.com in a new tab',
    },
  ];
  readonly systemChildLinks = [
    { label: 'Coupyn', path: '/systems/coupyn' },
    { label: 'ChatPDM', path: '/systems/chatpdm' },
    { label: 'DBF', path: '/systems/deterministic-boundary-firewall' },
    { label: 'CIM', path: '/systems/continuity-identity-model' },
  ];

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
    const nextOpen = !this.menuOpen();

    this.menuOpen.set(nextOpen);

    if (!nextOpen) {
      this.identityMenuOpen.set(false);
    }
  }

  closeMenu(): void {
    this.blurActiveElement();
    this.identityMenuOpen.set(false);
    this.menuOpen.set(false);
  }

  toggleIdentityMenu(): void {
    this.identityMenuOpen.update((open) => !open);
  }

  followIdentityLink(path: string): void {
    this.topNavigation.handleLinkClick(path);
    this.closeMenu();
  }

  toggleThemeMenu(): void {
    this.identityMenuOpen.set(false);
    this.menuOpen.set(false);
    this.themeMenuOpen.update((open) => !open);
  }

  setTheme(setting: ThemeSetting): void {
    this.blurActiveElement();
    this.themeService.setTheme(setting);
    this.themeMenuOpen.set(false);
  }

  openLanguageDialog(): void {
    this.identityMenuOpen.set(false);
    this.menuOpen.set(false);
    this.themeMenuOpen.set(false);
    void this.languageDialog.open();
  }

  isExactRoute(path: string): boolean {
    return this.router.url.split(/[?#]/, 1)[0] === path;
  }

  isSystemsRoute(): boolean {
    const currentPath = this.router.url.split(/[?#]/, 1)[0];

    return (
      currentPath === '/systems' || this.systemChildLinks.some((link) => link.path === currentPath)
    );
  }

  isIdentityRoute(): boolean {
    const currentPath = this.router.url.split(/[?#]/, 1)[0];

    return this.identityItems.some((link) => link.path === currentPath);
  }

  @HostListener('document:click', ['$event'])
  closeOpenPanelsOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.blurActiveElement();
      this.identityMenuOpen.set(false);
      this.menuOpen.set(false);
      this.themeMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeOpenPanelsOnEscape(): void {
    this.blurActiveElement();
    this.identityMenuOpen.set(false);
    this.menuOpen.set(false);
    this.themeMenuOpen.set(false);
  }

  private blurActiveElement(): void {
    const activeElement = this.elementRef.nativeElement.ownerDocument.activeElement;

    if (
      activeElement instanceof HTMLElement &&
      this.elementRef.nativeElement.contains(activeElement)
    ) {
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
    const progress =
      scrollableDistance > 0 ? Math.min(1, Math.max(0, scrollTop / scrollableDistance)) : 0;

    return Number(progress.toFixed(4));
  }
}
