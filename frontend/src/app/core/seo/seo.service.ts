import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { seoConfig } from './seo.config';

type RobotsDirective = 'index, follow' | 'noindex, nofollow' | 'noindex, follow';

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

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  setDefaults(): void {
    this.setMetadata({
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      canonicalUrl: seoConfig.canonicalBaseUrl,
      ogImage: seoConfig.defaultOgImage,
      robots: 'index, follow'
    });
  }

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
    const fullTitle = title === seoConfig.titleSuffix ? title : `${title} | ${seoConfig.titleSuffix}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
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

    const ogImage = metadata.ogImage || seoConfig.defaultOgImage;
    if (ogImage) {
      this.meta.updateTag({ property: 'og:image', content: this.toAbsoluteUrl(ogImage) });
    }
  }

  setTwitterCardTags(metadata: SeoMetadata): void {
    this.meta.updateTag({ name: 'twitter:card', content: metadata.ogImage || seoConfig.defaultOgImage ? 'summary_large_image' : 'summary' });

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

  private canUseDocumentHead(): boolean {
    const supportedPlatform = isPlatformBrowser(this.platformId) || isPlatformServer(this.platformId);
    return supportedPlatform && !!this.document?.head;
  }

  private toAbsoluteUrl(url: string): string {
    if (/^https?:\/\//.test(url)) {
      return url;
    }

    return new URL(url, seoConfig.canonicalBaseUrl).toString();
  }
}
