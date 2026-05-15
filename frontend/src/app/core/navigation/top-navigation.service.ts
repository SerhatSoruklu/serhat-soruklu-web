import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TopNavigationService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly router = inject(Router);

  handleLinkClick(path: string): void {
    if (this.isSameRoute(path)) {
      this.scrollToTop('smooth');
    }
  }

  handleBrandClick(): void {
    this.handleLinkClick('/');
  }

  private scrollToTop(preferredBehavior: ScrollBehavior): void {
    const browserWindow = this.document.defaultView;

    if (!this.isBrowser || !browserWindow) {
      return;
    }

    const behavior = this.prefersReducedMotion() ? 'auto' : preferredBehavior;

    browserWindow.requestAnimationFrame(() => {
      browserWindow.scrollTo({ top: 0, left: 0, behavior });
    });
  }

  private isSameRoute(path: string): boolean {
    return this.normalizePath(this.router.url) === this.normalizePath(path);
  }

  private normalizePath(path: string): string {
    const queryIndex = path.indexOf('?');
    const hashIndex = path.indexOf('#');
    const boundaryCandidates = [queryIndex, hashIndex].filter((index) => index >= 0);
    const pathEnd = boundaryCandidates.length > 0 ? Math.min(...boundaryCandidates) : path.length;
    const pathWithoutQuery = path.slice(0, pathEnd) || '/';

    let trimEnd = pathWithoutQuery.length;

    while (trimEnd > 1 && pathWithoutQuery.charAt(trimEnd - 1) === '/') {
      trimEnd -= 1;
    }

    const trimmedPath = pathWithoutQuery.slice(0, trimEnd);

    return trimmedPath || '/';
  }

  private prefersReducedMotion(): boolean {
    return this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
  }
}
