import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import type { ActivatedRouteSnapshot } from '@angular/router';
import { provideRouter, Router, TitleStrategy } from '@angular/router';

import { routes } from '../../app.routes';
import { pageSeoMetadata, seoConfig } from './seo.config';
import { SeoTitleStrategy } from './seo-title.strategy';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  beforeEach(async () => {
    globalThis.document.head.innerHTML = '<link rel="canonical" href="https://serhatsoruklu.com/">';
    await TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: TitleStrategy, useClass: SeoTitleStrategy }
      ]
    }).compileComponents();
  });

  it('sets title, description, canonical, and social metadata', () => {
    const service = TestBed.inject(SeoService);
    const title = TestBed.inject(Title);

    service.setMetadata({
      title: 'Example Title',
      description: 'Example description.',
      canonicalUrl: '/example',
      ogImage: '/example.svg',
      robots: 'noindex, follow'
    });

    expect(title.getTitle()).toBe('Example Title');
    expect(globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Example description.');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://serhatsoruklu.com/example');
    expect(globalThis.document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe('Example Title');
    expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://serhatsoruklu.com/example.svg');
    expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('https://serhatsoruklu.com/example.svg');
    expect(globalThis.document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
  });

  it('uses the default social image when metadata does not provide one', () => {
    const service = TestBed.inject(SeoService);

    service.setMetadata({
      title: 'Default Image Title',
      description: 'Default image description.',
      canonicalUrl: '/default-image'
    });

    const defaultOgImage = `https://serhatsoruklu.com${seoConfig.defaultOgImage}`;
    expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(defaultOgImage);
    expect(globalThis.document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe('summary_large_image');
    expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(defaultOgImage);
  });

  it('manages page JSON-LD script', () => {
    const service = TestBed.inject(SeoService);

    service.setJsonLd({ '@type': 'Person', name: 'Serhat Soruklu' });
    const script = globalThis.document.getElementById('page-json-ld');

    expect(script?.getAttribute('type')).toBe('application/ld+json');
    expect(script?.textContent).toBe('{"@type":"Person","name":"Serhat Soruklu"}');

    service.removeJsonLd();
    expect(globalThis.document.getElementById('page-json-ld')).toBeNull();
  });

  it('applies route metadata from the router title strategy', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/work');

    expect(title.getTitle()).toBe('Serhat Soruklu | Work');
    expect(globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain('Production work');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('https://serhatsoruklu.com/work');
    expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe('https://serhatsoruklu.com/assets/social/serhat-soruklu-work-og.svg');
    expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe('https://serhatsoruklu.com/assets/social/serhat-soruklu-work-og.svg');
    expect(JSON.parse(globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': 'https://serhatsoruklu.com/work#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://serhatsoruklu.com/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Work',
          item: 'https://serhatsoruklu.com/work'
        }
      ]
    });
  });

  it('applies page-specific SEO metadata for system detail routes', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);
    const systemDetailPages = [
      pageSeoMetadata.coupynSystem,
      pageSeoMetadata.chatpdmSystem,
      pageSeoMetadata.dbfSystem,
      pageSeoMetadata.cimSystem
    ];
    const genericSystemsOgImage = `https://serhatsoruklu.com${pageSeoMetadata.systems.ogImage}`;

    for (const pageMetadata of systemDetailPages) {
      await router.navigateByUrl(pageMetadata.path);

      const canonicalUrl = `https://serhatsoruklu.com${pageMetadata.path}`;
      const pageOgImage = `https://serhatsoruklu.com${pageMetadata.ogImage}`;
      expect(pageMetadata.title.length).toBeLessThanOrEqual(50);
      expect(pageMetadata.description.length).toBeLessThanOrEqual(170);
      expect(pageMetadata.ogImage).not.toBe(pageSeoMetadata.systems.ogImage);
      expect(title.getTitle()).toBe(pageMetadata.title);
      expect(globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(pageMetadata.description);
      expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(canonicalUrl);
      expect(globalThis.document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(pageMetadata.title);
      expect(globalThis.document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(pageMetadata.description);
      expect(globalThis.document.querySelector('meta[property="og:url"]')?.getAttribute('content')).toBe(canonicalUrl);
      expect(globalThis.document.querySelector('meta[name="twitter:title"]')?.getAttribute('content')).toBe(pageMetadata.title);
      expect(globalThis.document.querySelector('meta[name="twitter:description"]')?.getAttribute('content')).toBe(pageMetadata.description);
      expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(pageOgImage);
      expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).not.toBe(genericSystemsOgImage);
      expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(pageOgImage);
      expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).not.toBe(genericSystemsOgImage);
    }
  });

  it('falls back to home metadata when a route has no SEO data', () => {
    const service = TestBed.inject(SeoService);
    const title = TestBed.inject(Title);

    service.applyRouteMetadata({
      data: {},
      firstChild: null
    } as unknown as ActivatedRouteSnapshot);

    expect(title.getTitle()).toBe(seoConfig.defaultTitle);
    expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
    expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
  });

  it('uses the default social image when route SEO omits an image', () => {
    const service = TestBed.inject(SeoService);

    service.applyRouteMetadata({
      data: {
        seo: {
          label: 'Example',
          title: 'Example Route',
          description: 'Example route description.',
          path: '/example'
        }
      },
      firstChild: null
    } as unknown as ActivatedRouteSnapshot);

    expect(globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content')).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
    expect(globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
  });
});
