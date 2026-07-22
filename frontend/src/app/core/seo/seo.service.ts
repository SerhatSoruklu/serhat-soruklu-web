import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot } from '@angular/router';

import { pageSeoMetadata, RobotsDirective, seoConfig, StructuredDataProfile } from './seo.config';

export interface RouteSeoMetadata {
  label: string;
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageHeight?: number;
  ogImageType?: string;
  ogImageWidth?: number;
  robots?: RobotsDirective;
  structuredData?: StructuredDataProfile;
}

interface SeoMetadata {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogImageHeight?: number;
  ogImageType?: string;
  ogImageWidth?: number;
  robots?: RobotsDirective;
}

@Injectable({
  providedIn: 'root',
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
      this.meta.updateTag({
        property: 'og:url',
        content: this.toAbsoluteUrl(metadata.canonicalUrl),
      });
    }

    const ogImage = metadata.ogImage ?? seoConfig.defaultOgImage;
    this.meta.updateTag({ property: 'og:image', content: this.toAbsoluteUrl(ogImage) });
    this.setOptionalMetaTag('property', 'og:image:type', metadata.ogImageType);
    this.setOptionalMetaTag('property', 'og:image:width', metadata.ogImageWidth);
    this.setOptionalMetaTag('property', 'og:image:height', metadata.ogImageHeight);
    this.setOptionalMetaTag('property', 'og:image:alt', metadata.ogImageAlt);
  }

  setTwitterCardTags(metadata: SeoMetadata): void {
    const twitterImage = metadata.ogImage ?? seoConfig.defaultOgImage;
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:image', content: this.toAbsoluteUrl(twitterImage) });
    this.setOptionalMetaTag('name', 'twitter:image:alt', metadata.ogImageAlt);

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
      ogImage: seoConfig.defaultOgImage,
    };

    this.setMetadata({
      title: routeSeo.title,
      description: routeSeo.description,
      canonicalUrl: routeSeo.path,
      ogImage: routeSeo.ogImage ?? seoConfig.defaultOgImage,
      ogImageAlt: routeSeo.ogImageAlt,
      ogImageHeight: routeSeo.ogImageHeight,
      ogImageType: routeSeo.ogImageType,
      ogImageWidth: routeSeo.ogImageWidth,
      robots: routeSeo.robots ?? 'index, follow',
    });

    if (routeSeo.structuredData === 'none') {
      this.removeJsonLd();
      return;
    }

    if (routeSeo.structuredData === 'soruklu-order') {
      this.setJsonLd(this.createSorukluOrderStructuredData(routeSeo));
      return;
    }

    if (routeSeo.structuredData === 'velari') {
      this.setJsonLd(this.createVelariStructuredData(routeSeo));
      return;
    }

    this.setJsonLd(this.createBreadcrumbStructuredData(routeSeo));
  }

  private canUseDocumentHead(): boolean {
    const supportedPlatform =
      isPlatformBrowser(this.platformId) || isPlatformServer(this.platformId);
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
    return (
      typeof metadata.label === 'string' &&
      typeof metadata.title === 'string' &&
      typeof metadata.description === 'string' &&
      typeof metadata.path === 'string'
    );
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
        item: this.toAbsoluteUrl(pageSeoMetadata.home.path),
      },
    ];

    if (routeSeo.path.startsWith(`${pageSeoMetadata.systems.path}/`)) {
      items.push({
        '@type': 'ListItem',
        position: 2,
        name: pageSeoMetadata.systems.label,
        item: this.toAbsoluteUrl(pageSeoMetadata.systems.path),
      });
    }

    if (routeSeo.path !== pageSeoMetadata.home.path) {
      items.push({
        '@type': 'ListItem',
        position: items.length + 1,
        name: routeSeo.label,
        item: this.toAbsoluteUrl(routeSeo.path),
      });
    }

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${this.toAbsoluteUrl(routeSeo.path)}#breadcrumb`,
      itemListElement: items,
    };

    const breadcrumbNode = {
      '@type': breadcrumb['@type'],
      '@id': breadcrumb['@id'],
      itemListElement: breadcrumb.itemListElement,
    };

    return {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumbNode,
        this.createWebsiteStructuredData(),
        this.createPersonStructuredData(),
      ],
    };
  }

  private createWebsiteStructuredData(): object {
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);

    return {
      '@type': 'WebSite',
      '@id': `${homeUrl}#website`,
      name: seoConfig.siteName,
      alternateName: ['SerhatSoruklu.com', 'Serhat Soruklu Systems Architect'],
      url: homeUrl,
      description: pageSeoMetadata.home.description,
      inLanguage: 'en-GB',
      publisher: {
        '@id': `${homeUrl}#person`,
      },
    };
  }

  private createPersonStructuredData(): object {
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);

    return {
      '@type': 'Person',
      '@id': `${homeUrl}#person`,
      name: seoConfig.authorName,
      url: homeUrl,
      image: this.toAbsoluteUrl(seoConfig.defaultPersonImage),
      jobTitle: 'Founder, Systems Architect, Full-Stack Engineer',
      description:
        'Founder and systems architect focused on software engineering, digital infrastructure, scalable platforms, and long-term systems.',
      knowsAbout: [
        'Systems architecture',
        'Software engineering',
        'Full-stack development',
        'Angular',
        'Node.js',
        'MongoDB',
        'Digital infrastructure',
        'Scalable platforms',
        'SEO architecture',
        'Trust systems',
      ],
      sameAs: ['https://github.com/SerhatSoruklu'],
    };
  }

  private createSorukluOrderStructuredData(routeSeo: RouteSeoMetadata): object {
    const routeUrl = this.toAbsoluteUrl(routeSeo.path);
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);
    const personId = `${homeUrl}#person`;
    const websiteId = `${homeUrl}#website`;
    const webpageId = `${routeUrl}#webpage`;
    const socialImageUrl = this.toAbsoluteUrl(routeSeo.ogImage ?? seoConfig.defaultOgImage);

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          '@id': `${routeUrl}#breadcrumb`,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: pageSeoMetadata.home.label,
              item: homeUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: routeSeo.label,
              item: routeUrl,
            },
          ],
        },
        {
          '@type': 'AboutPage',
          '@id': webpageId,
          name: routeSeo.title,
          description: routeSeo.description,
          url: routeUrl,
          isPartOf: {
            '@id': websiteId,
          },
          about: {
            '@type': 'Thing',
            name: 'The Soruklu Order',
            description: routeSeo.description,
          },
          author: {
            '@id': personId,
          },
          creator: {
            '@id': personId,
          },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: socialImageUrl,
            width: 1200,
            height: 630,
          },
          inLanguage: 'en-GB',
        },
        this.createWebsiteStructuredData(),
        this.createPersonStructuredData(),
      ],
    };
  }

  private createVelariStructuredData(routeSeo: RouteSeoMetadata): object {
    const routeUrl = this.toAbsoluteUrl(routeSeo.path);
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);
    const personId = `${homeUrl}#person`;
    const websiteId = `${homeUrl}#website`;
    const webpageId = `${routeUrl}#webpage`;
    const velariId = `${routeUrl}#velari`;
    const breadcrumbId = `${routeUrl}#breadcrumb`;
    const socialImageUrl = this.toAbsoluteUrl(routeSeo.ogImage ?? seoConfig.defaultOgImage);
    const emblemUrl = this.toAbsoluteUrl('/assets/brand/velari/velari-faith-emblem.jpg');
    const manuscriptNodes = [
      {
        '@type': 'CreativeWork',
        '@id': `${routeUrl}#book-of-light`,
        name: 'The Book of Light',
        description:
          'Developing manuscript on awareness, wisdom, discipline and the symbolism of Light.',
        creativeWorkStatus: 'Developing manuscript',
        isPartOf: {
          '@id': velariId,
        },
        inLanguage: 'en-GB',
      },
      {
        '@type': 'CreativeWork',
        '@id': `${routeUrl}#book-of-shadow`,
        name: 'The Book of Shadow',
        description:
          'Developing manuscript on confusion, fear, error and the parts of the self that need to be understood rather than denied.',
        creativeWorkStatus: 'Developing manuscript',
        isPartOf: {
          '@id': velariId,
        },
        inLanguage: 'en-GB',
      },
      {
        '@type': 'CreativeWork',
        '@id': `${routeUrl}#book-of-the-path`,
        name: 'The Book of the Path',
        description:
          'Developing manuscript about choosing, repairing, learning and continuing with greater clarity.',
        creativeWorkStatus: 'Developing manuscript',
        isPartOf: {
          '@id': velariId,
        },
        inLanguage: 'en-GB',
      },
    ];

    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          '@id': breadcrumbId,
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: pageSeoMetadata.home.label,
              item: homeUrl,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: routeSeo.label,
              item: routeUrl,
            },
          ],
        },
        {
          '@type': 'AboutPage',
          '@id': webpageId,
          name: routeSeo.title,
          description: routeSeo.description,
          url: routeUrl,
          isPartOf: {
            '@id': websiteId,
          },
          mainEntity: {
            '@id': velariId,
          },
          about: {
            '@id': velariId,
          },
          creator: {
            '@id': personId,
          },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: socialImageUrl,
            width: 1200,
            height: 630,
            caption: routeSeo.ogImageAlt,
          },
          breadcrumb: {
            '@id': breadcrumbId,
          },
          inLanguage: 'en-GB',
        },
        {
          '@type': 'CreativeWork',
          '@id': velariId,
          name: 'Velari',
          description: routeSeo.description,
          url: routeUrl,
          creator: {
            '@id': personId,
          },
          image: emblemUrl,
          sameAs: ['https://www.instagram.com/velarifaith/'],
          genre: ['Personal belief framework', 'Philosophical writing'],
          keywords: [
            'Helio-pantheism',
            'Light',
            'discipline',
            'compassion',
            'resilience',
            'responsibility',
          ],
          inLanguage: 'en-GB',
          mainEntityOfPage: {
            '@id': webpageId,
          },
          hasPart: manuscriptNodes.map((node) => ({ '@id': node['@id'] })),
        },
        ...manuscriptNodes,
        this.createWebsiteStructuredData(),
        this.createPersonStructuredData(),
      ],
    };
  }

  private setOptionalMetaTag(
    attribute: 'name' | 'property',
    key: string,
    value: number | string | undefined,
  ): void {
    if (value === undefined) {
      this.meta.removeTag(`${attribute}='${key}'`);
      return;
    }

    const content = String(value);

    if (attribute === 'name') {
      this.meta.updateTag({ name: key, content });
      return;
    }

    this.meta.updateTag({ property: key, content });
  }

  private toAbsoluteUrl(url: string): string {
    if (/^https?:\/\//.test(url)) {
      return url;
    }

    return new URL(url, seoConfig.canonicalBaseUrl).toString();
  }
}
