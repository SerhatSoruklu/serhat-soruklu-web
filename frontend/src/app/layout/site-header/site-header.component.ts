import { DOCUMENT, isPlatformBrowser, NgClass } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { IdentityLanguageService } from '../../core/identity/identity-language.service';
import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { ThemeService, ThemeSetting } from '../../core/theme/theme.service';
import { LanguageDialogService } from '../../shared/dialogs/language-dialog/language-dialog.service';
import { IdentityLanguageSelectorComponent } from '../../shared/identity-language-selector/identity-language-selector.component';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';
import {
  HEADER_IDENTITY_ICON_PATH,
  HEADER_IDENTITY_NAVIGATION,
  HEADER_LANGUAGE_ICON_PATH,
  HEADER_NAV_ITEMS,
  HEADER_THEME_OPTIONS,
  HEADER_THEME_TRIGGER_ICON_PATHS,
} from './header-icons';
import { MobileHeaderComponent } from './mobile/mobile-header.component';

const SCROLLED_ENABLE_THRESHOLD = 20;
const SCROLLED_DISABLE_THRESHOLD = 2;

@Component({
  selector: 'app-site-header',
  imports: [
    IdentityLanguageSelectorComponent,
    MobileHeaderComponent,
    NgClass,
    RouterLink,
    RouterLinkActive,
    TooltipDirective,
  ],
  templateUrl: './site-header.component.html',
  styleUrls: [
    './site-header.component.css',
    './site-header.theme.css',
    './site-header.responsive.css',
  ],
})
export class SiteHeaderComponent implements AfterViewInit, OnDestroy {
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
  readonly isScrolled = signal(this.getScrollTop() >= SCROLLED_ENABLE_THRESHOLD);
  readonly identityIconPath = HEADER_IDENTITY_ICON_PATH;
  readonly identityLanguage = inject(IdentityLanguageService);
  readonly identityNavigation = computed(
    () => HEADER_IDENTITY_NAVIGATION[this.identityLanguage.language()],
  );
  readonly identityMenuOpen = signal(false);
  readonly languageDialog = inject(LanguageDialogService);
  readonly languageIconPath = HEADER_LANGUAGE_ICON_PATH;
  readonly navItems = HEADER_NAV_ITEMS;
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

  toggleThemeMenu(): void {
    this.identityMenuOpen.set(false);
    this.themeMenuOpen.update((open) => !open);
  }

  toggleIdentityMenu(): void {
    this.themeMenuOpen.set(false);
    this.identityMenuOpen.update((open) => !open);
  }

  openIdentityMenu(): void {
    this.themeMenuOpen.set(false);
    this.identityMenuOpen.set(true);
  }

  closeIdentityMenu(): void {
    this.identityMenuOpen.set(false);
  }

  closeIdentityMenuAfterFocus(event: FocusEvent): void {
    const nextTarget = event.relatedTarget as Node | null;
    const currentTarget = event.currentTarget as HTMLElement;

    if (!nextTarget || !currentTarget.contains(nextTarget)) {
      this.closeIdentityMenu();
    }
  }

  followIdentityLink(path: string): void {
    this.closeIdentityMenu();
    this.topNavigation.handleLinkClick(path);
  }

  setTheme(setting: ThemeSetting): void {
    this.themeService.setTheme(setting);
    this.themeMenuOpen.set(false);
  }

  openLanguageDialog(): void {
    this.identityMenuOpen.set(false);
    this.themeMenuOpen.set(false);
    void this.languageDialog.open();
  }

  @HostListener('document:click', ['$event'])
  closeThemeMenuOnOutsideClick(event: MouseEvent): void {
    const target = event.target as Element | null;

    if (!target?.closest('.identity-selector')) {
      this.identityMenuOpen.set(false);
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.themeMenuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  closeThemeMenuOnEscape(): void {
    this.blurActiveElement();
    this.identityMenuOpen.set(false);
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
