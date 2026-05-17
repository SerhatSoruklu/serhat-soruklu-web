import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

import { ThemeService } from './core/theme/theme.service';
import { SiteFooterComponent } from './layout/site-footer/site-footer.component';
import { SiteHeaderComponent } from './layout/site-header/site-header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooterComponent, SiteHeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly themeService = inject(ThemeService);
  readonly isHomeRoute = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.isHomeUrl(event.urlAfterRedirects)),
      startWith(this.isHomeUrl(this.currentLocationPath()))
    ),
    { initialValue: this.isHomeUrl(this.currentLocationPath()) }
  );
  readonly usesDetailAtmosphere = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.isDetailAtmosphereUrl(event.urlAfterRedirects)),
      startWith(this.isDetailAtmosphereUrl(this.currentLocationPath()))
    ),
    { initialValue: this.isDetailAtmosphereUrl(this.currentLocationPath()) }
  );
  readonly usesSystemsAtmosphere = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => this.isSystemsAtmosphereUrl(event.urlAfterRedirects)),
      startWith(this.isSystemsAtmosphereUrl(this.currentLocationPath()))
    ),
    { initialValue: this.isSystemsAtmosphereUrl(this.currentLocationPath()) }
  );

  constructor() {
    this.themeService.setting();
    this.disableNativeScrollRestoration();
  }

  private isHomeUrl(url: string): boolean {
    const path = url.split(/[?#]/)[0];
    return path === '' || path === '/';
  }

  private currentLocationPath(): string {
    return this.document.location?.pathname ?? this.router.url;
  }

  private isDetailAtmosphereUrl(url: string): boolean {
    const path = url.split(/[?#]/)[0];

    return path === '/work'
      || path === '/systems/deterministic-boundary-firewall'
      || path === '/systems/continuity-identity-model';
  }

  private isSystemsAtmosphereUrl(url: string): boolean {
    return url.split(/[?#]/)[0] === '/systems';
  }

  private disableNativeScrollRestoration(): void {
    const history = this.document.defaultView?.history;

    if (!this.isBrowser || !history || !('scrollRestoration' in history)) {
      return;
    }

    history.scrollRestoration = 'manual';
  }
}
