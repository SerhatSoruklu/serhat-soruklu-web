import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

import { pageSeoMetadata, seoConfig } from './seo.config';

type RobotsDirective = 'index, follow' | 'noindex, nofollow' | 'noindex, follow';

export interface RouteSeoMetadata {
  label: string;
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

interface SeoMetadata {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  robots?: RobotsDirective;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly jsonLdScriptId = 'page-json-ld';
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  setMetadata(metadata: SeoMetadata): void {
    if (metadata.title) {
      this.setTitle(metadata.title);
    }

    if (metadata.description) {
      this.setDescription(metadata.description);
    }

    if (metadata.canonicalUrl) {
      this.setCanonicalUrl(metadata.canonicalUrl);
    }

    this.setOpenGraphTags(metadata);
    this.setTwitterCardTags(metadata);
    this.setRobots(metadata.robots ?? 'index, follow');
  }

  setTitle(title: string): void {
    this.title.setTitle(title);
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ name: 'twitter:title', content: title });
  }

  setDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  setCanonicalUrl(url: string): void {
    if (!this.canUseDocumentHead()) {
      return;
    }

    const canonicalUrl = this.toAbsoluteUrl(url);
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', canonicalUrl);
  }

  setOpenGraphTags(metadata: SeoMetadata): void {
    this.meta.updateTag({ property: 'og:site_name', content: seoConfig.siteName });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: seoConfig.defaultLocale });

    if (metadata.canonicalUrl) {
      this.meta.updateTag({ property: 'og:url', content: this.toAbsoluteUrl(metadata.canonicalUrl) });
    }

    const ogImage = metadata.ogImage ?? seoConfig.defaultOgImage;
    this.meta.updateTag({ property: 'og:image', content: this.toAbsoluteUrl(ogImage) });
  }

  setTwitterCardTags(metadata: SeoMetadata): void {
    const twitterImage = metadata.ogImage ?? seoConfig.defaultOgImage;
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:image', content: this.toAbsoluteUrl(twitterImage) });

    if (seoConfig.twitterHandle) {
      this.meta.updateTag({ name: 'twitter:site', content: seoConfig.twitterHandle });
      this.meta.updateTag({ name: 'twitter:creator', content: seoConfig.twitterHandle });
    }
  }

  setRobots(robots: RobotsDirective): void {
    this.meta.updateTag({ name: 'robots', content: robots });
  }

  setJsonLd(data: object): void {
    if (!this.canUseDocumentHead()) {
      return;
    }

    this.removeJsonLd();

    const script = this.document.createElement('script');
    script.id = this.jsonLdScriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  removeJsonLd(): void {
    if (!this.canUseDocumentHead()) {
      return;
    }

    this.document.getElementById(this.jsonLdScriptId)?.remove();
  }

  applyRouteMetadata(snapshot: ActivatedRouteSnapshot): void {
    const routeSeo = this.findDeepestSeoData(snapshot) ?? {
      label: pageSeoMetadata.home.label,
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      path: '/',
      ogImage: seoConfig.defaultOgImage
    };

    this.setMetadata({
      title: routeSeo.title,
      description: routeSeo.description,
      canonicalUrl: routeSeo.path,
      ogImage: routeSeo.ogImage ?? seoConfig.defaultOgImage,
      robots: 'index, follow'
    });
    this.setJsonLd(this.createBreadcrumbStructuredData(routeSeo));
  }

  private canUseDocumentHead(): boolean {
    const supportedPlatform = isPlatformBrowser(this.platformId) || isPlatformServer(this.platformId);
    return supportedPlatform && !!this.document?.head;
  }

  private findDeepestSeoData(snapshot: ActivatedRouteSnapshot): RouteSeoMetadata | null {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let seo: RouteSeoMetadata | null = null;

    while (current) {
      if (this.isRouteSeoMetadata(current.data['seo'])) {
        seo = current.data['seo'];
      }

      current = current.firstChild;
    }

    return seo;
  }

  private isRouteSeoMetadata(value: unknown): value is RouteSeoMetadata {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const metadata = value as RouteSeoMetadata;
    return typeof metadata.label === 'string'
      && typeof metadata.title === 'string'
      && typeof metadata.description === 'string'
      && typeof metadata.path === 'string';
  }

  private createBreadcrumbStructuredData(routeSeo: RouteSeoMetadata): object {
    const items: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item: string;
    }> = [
      {
        '@type': 'ListItem',
        position: 1,
        name: pageSeoMetadata.home.label,
        item: this.toAbsoluteUrl(pageSeoMetadata.home.path)
      }
    ];

    if (routeSeo.path !== pageSeoMetadata.home.path) {
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: routeSeo.label,
        item: this.toAbsoluteUrl(routeSeo.path)
      });
    }

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${this.toAbsoluteUrl(routeSeo.path)}#breadcrumb`,
      itemListElement: items
    };
  }

  private toAbsoluteUrl(url: string): string {
    if (/^https?:\/\//.test(url)) {
      return url;
    }

    return new URL(url, seoConfig.canonicalBaseUrl).toString();
  }
}
