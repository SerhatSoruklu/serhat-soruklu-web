import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { TopNavigationService } from '../../core/navigation/top-navigation.service';
import { type ResolvedTheme, ThemeService } from '../../core/theme/theme.service';
import { PortraitDialogService } from '../../shared/dialogs/portrait-dialog/portrait-dialog.service';
import {
  FOUNDER_PORTRAIT_HEIGHT,
  FOUNDER_PORTRAITS,
  FOUNDER_PORTRAIT_WIDTH,
  founderPortraitThemeForSource,
} from '../../shared/portraits/founder-portrait.config';
import { TooltipDirective } from '../../shared/tooltip/tooltip.directive';

import { StervoxArchitectureComponent } from '../../shared/stervox-architecture/stervox-architecture.component';
import { StervoxBrandComponent } from '../../shared/stervox-brand/stervox-brand.component';
import { StervoxLaunchComponent } from './stervox-launch/stervox-launch.component';

@Component({
  selector: 'app-home',
  imports: [StervoxArchitectureComponent, StervoxBrandComponent, StervoxLaunchComponent, RouterLink, TooltipDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly portraitDialog = inject(PortraitDialogService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly browserWindow = this.isBrowser ? this.document.defaultView : null;
  private readonly initiallyRenderedPortraitTheme = this.readInitiallyRenderedPortraitTheme();
  private readonly loadedPortraitSources = new Set<string>();
  private pendingPortraitPreload: HTMLImageElement | null = null;
  private portraitPreloadHandle: number | null = null;
  private portraitPreloadUsesIdleCallback = false;

  readonly portrait = computed(() => FOUNDER_PORTRAITS[this.themeService.resolvedTheme()]);
  readonly portraitSourceMedia = computed(() => {
    if (this.themeService.setting() === 'system') {
      return {
        dark: '(prefers-color-scheme: dark)',
        light: '(prefers-color-scheme: light)',
      } as const;
    }

    const resolvedTheme = this.themeService.resolvedTheme();

    return {
      dark: resolvedTheme === 'dark' ? 'all' : 'not all',
      light: resolvedTheme === 'light' ? 'all' : 'not all',
    } as const;
  });
  readonly portraitSources = FOUNDER_PORTRAITS;
  readonly portraitSizes = '(min-width: 1728px) 740px, (min-width: 1440px) 620px, (min-width: 1024px) 48vw, calc(100vw - 40px)';
  readonly portraitReadyTheme = signal<ResolvedTheme | null>(this.initiallyRenderedPortraitTheme);
  readonly resolvedTheme = this.themeService.resolvedTheme;
  readonly portraitHeight = FOUNDER_PORTRAIT_HEIGHT;
  readonly portraitWidth = FOUNDER_PORTRAIT_WIDTH;
  readonly projectTitleTooltipPlacement = signal<'top' | 'right'>(
    this.getProjectTitleTooltipPlacement(),
  );
  readonly topNavigation = inject(TopNavigationService);

  constructor() {
    if (!this.browserWindow) {
      return;
    }

    afterNextRender(() => {
      const image = this.document.querySelector<HTMLImageElement>(
        '[data-testid="home-hero-portrait-image"]',
      );

      if (image?.complete && image.naturalWidth > 0) {
        this.handleLoadedPortrait(image);
      }
    });

    this.destroyRef.onDestroy(() => this.cancelScheduledPortraitPreload());
  }

  @HostListener('window:resize')
  updateProjectTitleTooltipPlacement(): void {
    this.projectTitleTooltipPlacement.set(this.getProjectTitleTooltipPlacement());
  }

  openPortraitDialog(): void {
    if (!this.isBrowser) {
      return;
    }

    void this.portraitDialog.open();
  }

  handlePortraitLoad(event: Event): void {
    const image = event.currentTarget;

    if (image instanceof HTMLImageElement) {
      this.handleLoadedPortrait(image);
    }
  }

  private handleLoadedPortrait(image: HTMLImageElement): void {
    const loadedUrl = image.currentSrc || image.getAttribute('src');
    const activeSource = loadedUrl ? new URL(loadedUrl, this.document.baseURI).pathname : null;
    const loadedTheme = activeSource ? founderPortraitThemeForSource(activeSource) : null;

    if (!activeSource || !loadedTheme) {
      return;
    }

    this.loadedPortraitSources.add(loadedTheme);
    this.portraitReadyTheme.set(loadedTheme);
    this.scheduleAlternatePortraitPreload(activeSource);
  }

  private readInitiallyRenderedPortraitTheme(): ResolvedTheme | null {
    if (!this.isBrowser) {
      return this.themeService.resolvedTheme();
    }

    const renderedTheme = this.document
      .querySelector<HTMLImageElement>('[data-testid="home-hero-portrait-image"]')
      ?.getAttribute('data-portrait-theme');

    return renderedTheme === 'dark' || renderedTheme === 'light' ? renderedTheme : null;
  }

  private scheduleAlternatePortraitPreload(activeSource: string): void {
    if (!this.browserWindow || this.portraitPreloadHandle !== null) {
      return;
    }

    const activeTheme = founderPortraitThemeForSource(activeSource);
    const alternateTheme = activeTheme === 'dark' ? 'light' : 'dark';
    const alternatePortrait = FOUNDER_PORTRAITS[alternateTheme];
    const alternateSource = alternatePortrait.src;

    if (
      !alternateSource ||
      this.loadedPortraitSources.has(alternateTheme) ||
      this.pendingPortraitPreload?.getAttribute('src') === alternateSource
    ) {
      return;
    }

    const warmAlternatePortrait = () => {
      this.portraitPreloadHandle = null;
      this.portraitPreloadUsesIdleCallback = false;

      const preloader = this.document.createElement('img');

      preloader.decoding = 'async';
      preloader.fetchPriority = 'low';
      preloader.addEventListener(
        'load',
        () => {
          this.loadedPortraitSources.add(alternateTheme);
          this.pendingPortraitPreload = null;
        },
        { once: true },
      );
      preloader.addEventListener(
        'error',
        () => {
          this.pendingPortraitPreload = null;
        },
        { once: true },
      );
      this.pendingPortraitPreload = preloader;
      preloader.sizes = this.portraitSizes;
      preloader.srcset = alternatePortrait.avifSrcSet;
      preloader.src = alternateSource;
    };

    if (typeof this.browserWindow.requestIdleCallback === 'function') {
      this.portraitPreloadUsesIdleCallback = true;
      this.portraitPreloadHandle = this.browserWindow.requestIdleCallback(warmAlternatePortrait, {
        timeout: 1_500,
      });
      return;
    }

    this.portraitPreloadHandle = this.browserWindow.setTimeout(warmAlternatePortrait, 1_200);
  }

  private cancelScheduledPortraitPreload(): void {
    if (!this.browserWindow || this.portraitPreloadHandle === null) {
      return;
    }

    if (
      this.portraitPreloadUsesIdleCallback &&
      typeof this.browserWindow.cancelIdleCallback === 'function'
    ) {
      this.browserWindow.cancelIdleCallback(this.portraitPreloadHandle);
    } else {
      this.browserWindow.clearTimeout(this.portraitPreloadHandle);
    }

    this.portraitPreloadHandle = null;
    this.portraitPreloadUsesIdleCallback = false;
  }

  private getProjectTitleTooltipPlacement(): 'top' | 'right' {
    return (this.browserWindow?.innerWidth ?? 0) >= 1024 ? 'right' : 'top';
  }
}
