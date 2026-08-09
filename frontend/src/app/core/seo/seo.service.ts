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

export interface AboutRuntimeMetadata {
  description: string;
  inLanguage: 'en-GB' | 'tr-TR';
  locale: 'en_GB' | 'tr_TR';
  portraitAlt: string;
  title: string;
}

export type LocalizedIdentityProfile = 'soruklu-order' | 'soruklu-surname' | 'velari';

export interface LocalizedIdentityRuntimeMetadata {
  description: string;
  inLanguage: 'en-GB' | 'tr-TR';
  locale: 'en_GB' | 'tr_TR';
  title: string;
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
  locale?: string;
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

  applyAboutRuntimeMetadata(metadata: AboutRuntimeMetadata): void {
    const routeSeo: RouteSeoMetadata = {
      ...pageSeoMetadata.about,
      label: metadata.inLanguage === 'tr-TR' ? 'Hakkında' : pageSeoMetadata.about.label,
      title: metadata.title,
      description: metadata.description,
    };

    this.setMetadata({
      title: routeSeo.title,
      description: routeSeo.description,
      canonicalUrl: routeSeo.path,
      ogImage: routeSeo.ogImage,
      ogImageAlt: routeSeo.ogImageAlt,
      ogImageHeight: routeSeo.ogImageHeight,
      ogImageType: routeSeo.ogImageType,
      ogImageWidth: routeSeo.ogImageWidth,
      locale: metadata.locale,
      robots: routeSeo.robots,
    });
    this.setJsonLd(
      this.createAboutStructuredData(routeSeo, metadata.inLanguage, metadata.portraitAlt),
    );
  }

  applyLocalizedIdentityRuntimeMetadata(
    profile: LocalizedIdentityProfile,
    metadata: LocalizedIdentityRuntimeMetadata,
  ): void {
    const baseSeo =
      profile === 'soruklu-order'
        ? pageSeoMetadata.sorukluOrder
        : profile === 'soruklu-surname'
          ? pageSeoMetadata.sorukluSurname
          : pageSeoMetadata.velari;
    const routeSeo: RouteSeoMetadata = {
      ...baseSeo,
      label:
        profile === 'soruklu-surname' && metadata.inLanguage === 'tr-TR'
          ? 'Soruklu soyadı'
          : baseSeo.label,
      title: metadata.title,
      description: metadata.description,
    };

    this.setMetadata({
      title: routeSeo.title,
      description: routeSeo.description,
      canonicalUrl: routeSeo.path,
      ogImage: routeSeo.ogImage,
      ogImageAlt: routeSeo.ogImageAlt,
      ogImageHeight: routeSeo.ogImageHeight,
      ogImageType: routeSeo.ogImageType,
      ogImageWidth: routeSeo.ogImageWidth,
      locale: metadata.locale,
      robots: routeSeo.robots,
    });

    if (profile === 'soruklu-order') {
      this.setJsonLd(this.createSorukluOrderStructuredData(routeSeo, metadata.inLanguage));
      return;
    }

    if (profile === 'soruklu-surname') {
      this.setJsonLd(this.createSorukluSurnameStructuredData(routeSeo, metadata.inLanguage));
      return;
    }

    this.setJsonLd(this.createVelariStructuredData(routeSeo, metadata.inLanguage));
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
    this.meta.updateTag({
      property: 'og:locale',
      content: metadata.locale ?? seoConfig.defaultLocale,
    });

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
    this.meta.updateTag({
      name: 'googlebot',
      content: robots === 'index, follow' ? `${robots}, max-image-preview:large` : robots,
    });
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

    if (routeSeo.structuredData === 'about') {
      this.setJsonLd(
        this.createAboutStructuredData(
          routeSeo,
          'en-GB',
          'Portrait of Serhat Soruklu, founder and CEO of Coupyn.',
        ),
      );
      return;
    }

    if (routeSeo.structuredData === 'press') {
      this.setJsonLd(this.createPressStructuredData(routeSeo));
      return;
    }

    if (routeSeo.structuredData === 'soruklu-order') {
      this.setJsonLd(this.createSorukluOrderStructuredData(routeSeo));
      return;
    }

    if (routeSeo.structuredData === 'soruklu-surname') {
      this.setJsonLd(this.createSorukluSurnameStructuredData(routeSeo));
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

    const isHome = routeSeo.path === pageSeoMetadata.home.path;
    const graph = [
      ...(isHome ? [] : [breadcrumbNode]),
      this.createWebsiteStructuredData(),
      this.createPersonStructuredData(),
      ...(isHome ? [this.createCoupynOrganizationStructuredData()] : []),
    ];

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
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
    const aboutUrl = this.toAbsoluteUrl(pageSeoMetadata.about.path);

    return {
      '@type': 'Person',
      '@id': `${homeUrl}#person`,
      name: seoConfig.authorName,
      url: homeUrl,
      image: this.toAbsoluteUrl(seoConfig.defaultPersonImage),
      mainEntityOfPage: {
        '@id': `${aboutUrl}#webpage`,
      },
      birthDate: '1996-02-22',
      birthPlace: {
        '@type': 'Place',
        name: 'Osmancık, Çorum, Turkey',
      },
      homeLocation: {
        '@type': 'Place',
        name: 'London, United Kingdom',
      },
      jobTitle: ['Founder and CEO of Coupyn', 'Systems Architect', 'Full-Stack Developer'],
      description:
        'London-based founder and CEO of Coupyn, systems architect, full-stack developer and infrastructure operator.',
      worksFor: {
        '@id': 'https://coupyn.com/#organization',
      },
      knowsAbout: [
        'Systems architecture',
        'Full-stack web development',
        'Angular',
        'Node.js',
        'Express',
        'MongoDB',
        'Infrastructure operations',
        'Technical SEO',
        'Deterministic systems',
      ],
      sameAs: [
        'https://github.com/SerhatSoruklu',
        'https://www.linkedin.com/in/serhatsoruklu/',
        'https://orcid.org/0009-0006-8963-5986',
        'https://hashnode.com/@serhatsoruklu',
        'https://dev.to/coupyn',
        'https://medium.com/@coupyn',
      ],
    };
  }

  private createCoupynOrganizationStructuredData(): object {
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);

    return {
      '@type': 'Organization',
      '@id': 'https://coupyn.com/#organization',
      name: 'Coupyn',
      url: 'https://coupyn.com/',
      description:
        'A public coupon, referral and affiliate intelligence platform built and operated independently by Serhat Soruklu.',
      founder: {
        '@id': `${homeUrl}#person`,
      },
    };
  }

  private createAboutStructuredData(
    routeSeo: RouteSeoMetadata,
    inLanguage: 'en-GB' | 'tr-TR',
    portraitAlt: string,
  ): object {
    const routeUrl = this.toAbsoluteUrl(routeSeo.path);
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);
    const personId = `${homeUrl}#person`;
    const websiteId = `${homeUrl}#website`;
    const webpageId = `${routeUrl}#webpage`;
    const breadcrumbId = `${routeUrl}#breadcrumb`;
    const portraitUrl = this.toAbsoluteUrl(seoConfig.defaultPersonImage);

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
          '@type': 'ProfilePage',
          '@id': webpageId,
          name: routeSeo.title,
          description: routeSeo.description,
          url: routeUrl,
          isPartOf: {
            '@id': websiteId,
          },
          mainEntity: {
            '@id': personId,
          },
          about: {
            '@id': personId,
          },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: portraitUrl,
            width: 1173,
            height: 1341,
            caption: portraitAlt,
          },
          breadcrumb: {
            '@id': breadcrumbId,
          },
          inLanguage,
        },
        this.createPersonStructuredData(),
        this.createWebsiteStructuredData(),
        this.createCoupynOrganizationStructuredData(),
      ],
    };
  }

  private createPressStructuredData(routeSeo: RouteSeoMetadata): object {
    const routeUrl = this.toAbsoluteUrl(routeSeo.path);
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);
    const personId = `${homeUrl}#person`;
    const websiteId = `${homeUrl}#website`;
    const organizationId = 'https://coupyn.com/#organization';
    const webpageId = `${routeUrl}#webpage`;
    const breadcrumbId = `${routeUrl}#breadcrumb`;
    const socialImageUrl = this.toAbsoluteUrl(routeSeo.ogImage ?? seoConfig.defaultOgImage);

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
          '@type': 'WebPage',
          '@id': webpageId,
          name: routeSeo.title,
          description: routeSeo.description,
          url: routeUrl,
          isPartOf: {
            '@id': websiteId,
          },
          about: [{ '@id': personId }, { '@id': organizationId }],
          author: {
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
        this.createPersonStructuredData(),
        this.createWebsiteStructuredData(),
        this.createCoupynOrganizationStructuredData(),
      ],
    };
  }

  private createSorukluOrderStructuredData(
    routeSeo: RouteSeoMetadata,
    inLanguage: 'en-GB' | 'tr-TR' = 'en-GB',
  ): object {
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
            inLanguage,
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
          inLanguage,
        },
        this.createWebsiteStructuredData(),
        this.createPersonStructuredData(),
      ],
    };
  }

  private createSorukluSurnameStructuredData(
    routeSeo: RouteSeoMetadata,
    inLanguage: 'en-GB' | 'tr-TR' = 'en-GB',
  ): object {
    const routeUrl = this.toAbsoluteUrl(routeSeo.path);
    const homeUrl = this.toAbsoluteUrl(pageSeoMetadata.home.path);
    const personId = `${homeUrl}#person`;
    const websiteId = `${homeUrl}#website`;
    const webpageId = `${routeUrl}#webpage`;
    const termId = `${routeUrl}#soruklu`;
    const breadcrumbId = `${routeUrl}#breadcrumb`;
    const socialImageUrl = this.toAbsoluteUrl(routeSeo.ogImage ?? seoConfig.defaultOgImage);

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
          isPartOf: { '@id': websiteId },
          about: { '@id': termId },
          mainEntity: { '@id': termId },
          author: { '@id': personId },
          primaryImageOfPage: {
            '@type': 'ImageObject',
            url: socialImageUrl,
            width: 1200,
            height: 630,
            caption: routeSeo.ogImageAlt,
          },
          breadcrumb: { '@id': breadcrumbId },
          inLanguage,
          citation: [
            'https://tdk.gov.tr/wp-content/uploads/2011/12/Terim-Sorunlari-ve-Terim-Yapma-Yollari-_2025_-WEB.pdf',
            'https://www.belleten.gov.tr/eng/full-text-pdf/2265/tur',
            'https://dergipark.org.tr/en/download/article-file/1849989',
            'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page170.html',
            'https://amasya.bel.tr/uploads/e-kitap/kitap/1-4/files/basic-html/page200.html',
            'https://arastirma.tarimorman.gov.tr/tepge/Belgeler/Yay%C4%B1n%20Ar%C5%9Fivi/2012-2016%20Yay%C4%B1n%20Ar%C5%9Fivi/Yay%C4%B1nNo270.pdf',
            'https://cdn.tbmm.gov.tr/TbmmWeb/Yayinlar/Dosya/f8a3911b-cad6-4515-b920-a283a2654f9e.pdf',
            'https://www.corum.bel.tr/public/uploads/2023/05/orum-belgeleri-cumhuriyet-arsivleri.pdf',
            'https://www.vezirkopruvatandas.com.tr/saridibek-koyunde-3000-donum-arazi-col-haline-geldi.html',
            'https://www.sp.gov.tr/upload/xSPRapor/files/r3S9g%2BCIOI24fr.pdf',
            'https://www.vezirkoprutso.org.tr/vezirkopru/genel-bakis/',
            'https://www.corumhaber.net/sukru-soruklu-hayatini-kaybetti',
            'https://www.bafra.bel.tr/Uploads/Resimler/Sayfalar/2025/5/-2024-Yili-Faaliyet-Roporu-/Orj-30756829c6cbfdcac12668ad5291.pdf',
          ],
        },
        {
          '@type': 'DefinedTerm',
          '@id': termId,
          name: 'Soruklu',
          description:
            inLanguage === 'tr-TR'
              ? routeSeo.description
              : 'A Turkish surname most strongly read as Soruk plus -lu, expressing association with, belonging to, or origin from a place called Soruk.',
          url: routeUrl,
          inLanguage,
          inDefinedTermSet: {
            '@type': 'DefinedTermSet',
            name: 'Turkish surnames',
          },
        },
        this.createWebsiteStructuredData(),
        this.createPersonStructuredData(),
      ],
    };
  }

  private createVelariStructuredData(
    routeSeo: RouteSeoMetadata,
    inLanguage: 'en-GB' | 'tr-TR' = 'en-GB',
  ): object {
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
          inLanguage,
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
          inLanguage,
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
