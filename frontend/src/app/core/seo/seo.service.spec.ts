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
      providers: [provideRouter(routes), { provide: TitleStrategy, useClass: SeoTitleStrategy }],
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
      robots: 'noindex, follow',
    });

    expect(title.getTitle()).toBe('Example Title');
    expect(
      globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe('Example description.');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://serhatsoruklu.com/example',
    );
    expect(
      globalThis.document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
    ).toBe('Example Title');
    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe('https://serhatsoruklu.com/example.svg');
    expect(
      globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    ).toBe('https://serhatsoruklu.com/example.svg');
    expect(globalThis.document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
  });

  it('uses the default social image when metadata does not provide one', () => {
    const service = TestBed.inject(SeoService);

    service.setMetadata({
      title: 'Default Image Title',
      description: 'Default image description.',
      canonicalUrl: '/default-image',
    });

    const defaultOgImage = `https://serhatsoruklu.com${seoConfig.defaultOgImage}`;
    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe(defaultOgImage);
    expect(
      globalThis.document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
    ).toBe('summary_large_image');
    expect(
      globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    ).toBe(defaultOgImage);
  });

  it('keeps public SEO titles and descriptions within search result length targets', () => {
    for (const pageMetadata of Object.values(pageSeoMetadata)) {
      expect(pageMetadata.title.length).toBeLessThanOrEqual(55);
      expect(pageMetadata.description.length).toBeLessThanOrEqual(150);
    }
  });

  it('publishes complete raster social metadata for every indexable route', async () => {
    const router = TestBed.inject(Router);

    for (const metadata of Object.values(pageSeoMetadata).filter(
      (candidate) => candidate.path !== pageSeoMetadata.notFound.path,
    )) {
      await router.navigateByUrl(metadata.path);

      expect(metadata.ogImage.endsWith('.png')).toBe(true);
      expect(
        globalThis.document
          .querySelector('meta[property="og:image:type"]')
          ?.getAttribute('content'),
      ).toBe('image/png');
      expect(
        globalThis.document
          .querySelector('meta[property="og:image:width"]')
          ?.getAttribute('content'),
      ).toBe('1200');
      expect(
        globalThis.document
          .querySelector('meta[property="og:image:height"]')
          ?.getAttribute('content'),
      ).toBe('630');
      expect(
        globalThis.document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content'),
      ).toBe(metadata.ogImageAlt);
      expect(
        globalThis.document
          .querySelector('meta[name="twitter:image:alt"]')
          ?.getAttribute('content'),
      ).toBe(metadata.ogImageAlt);
    }
  });

  it('applies noindex metadata and removes structured data for not-found routes', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/does-not-exist');

    expect(title.getTitle()).toBe(pageSeoMetadata.notFound.title);
    expect(
      globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(pageSeoMetadata.notFound.description);
    expect(globalThis.document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, follow',
    );
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://serhatsoruklu.com/404',
    );
    expect(globalThis.document.getElementById('page-json-ld')).toBeNull();
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

    expect(title.getTitle()).toBe(pageSeoMetadata.work.title);
    expect(
      globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toContain('Production work');
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://serhatsoruklu.com/work',
    );
    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${pageSeoMetadata.work.ogImage}`);
    expect(
      globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${pageSeoMetadata.work.ogImage}`);
    const graph = JSON.parse(
      globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const breadcrumb = graph['@graph'].find((entity) => entity['@type'] === 'BreadcrumbList');

    expect(breadcrumb).toEqual({
      '@type': 'BreadcrumbList',
      '@id': 'https://serhatsoruklu.com/work#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://serhatsoruklu.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Work',
          item: 'https://serhatsoruklu.com/work',
        },
      ],
    });
    expect(graph['@graph'].some((entity) => entity['@type'] === 'WebSite')).toBe(true);
    expect(graph['@graph'].some((entity) => entity['@type'] === 'Person')).toBe(true);
  });

  it('applies page-specific SEO metadata for system detail routes', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);
    const systemDetailPages = [
      pageSeoMetadata.coupynSystem,
      pageSeoMetadata.chatpdmSystem,
      pageSeoMetadata.dbfSystem,
      pageSeoMetadata.cimSystem,
    ];
    const genericSystemsOgImage = `https://serhatsoruklu.com${pageSeoMetadata.systems.ogImage}`;

    for (const pageMetadata of systemDetailPages) {
      await router.navigateByUrl(pageMetadata.path);

      const canonicalUrl = `https://serhatsoruklu.com${pageMetadata.path}`;
      const pageOgImage = `https://serhatsoruklu.com${pageMetadata.ogImage}`;
      expect(pageMetadata.title.length).toBeLessThanOrEqual(55);
      expect(pageMetadata.description.length).toBeLessThanOrEqual(150);
      expect(pageMetadata.ogImage).not.toBe(pageSeoMetadata.systems.ogImage);
      expect(title.getTitle()).toBe(pageMetadata.title);
      expect(
        globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content'),
      ).toBe(pageMetadata.description);
      expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
        canonicalUrl,
      );
      expect(
        globalThis.document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ).toBe(pageMetadata.title);
      expect(
        globalThis.document
          .querySelector('meta[property="og:description"]')
          ?.getAttribute('content'),
      ).toBe(pageMetadata.description);
      expect(
        globalThis.document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
      ).toBe(canonicalUrl);
      expect(
        globalThis.document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
      ).toBe(pageMetadata.title);
      expect(
        globalThis.document
          .querySelector('meta[name="twitter:description"]')
          ?.getAttribute('content'),
      ).toBe(pageMetadata.description);
      expect(
        globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      ).toBe(pageOgImage);
      expect(
        globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
      ).not.toBe(genericSystemsOgImage);
      expect(
        globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
      ).toBe(pageOgImage);
      expect(
        globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
      ).not.toBe(genericSystemsOgImage);

      const graph = JSON.parse(
        globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}',
      ) as { '@graph': Array<Record<string, unknown>> };
      const breadcrumb = graph['@graph'].find((entity) => entity['@type'] === 'BreadcrumbList');
      const breadcrumbItems = breadcrumb?.['itemListElement'] as Array<Record<string, unknown>>;

      expect(breadcrumbItems.map((item) => item['name'])).toEqual([
        pageSeoMetadata.home.label,
        pageSeoMetadata.systems.label,
        pageMetadata.label,
      ]);
      expect(breadcrumbItems.map((item) => item['position'])).toEqual([1, 2, 3]);
    }
  });

  it('applies focused metadata and social artwork to the writing collection', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/writing');

    expect(title.getTitle()).toBe(pageSeoMetadata.writing.title);
    expect(
      globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(pageSeoMetadata.writing.description);
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://serhatsoruklu.com/writing',
    );
    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${pageSeoMetadata.writing.ogImage}`);
    expect(
      globalThis.document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
    ).toBe('summary_large_image');
  });

  it('applies restrained Soruklu Order metadata and an AboutPage graph', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/soruklu-order');

    const canonicalUrl = 'https://serhatsoruklu.com/soruklu-order';
    const graph = JSON.parse(
      globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}',
    ) as {
      '@graph': Array<Record<string, unknown>>;
    };
    const webpage = graph['@graph'].find((entity) => entity['@type'] === 'AboutPage');
    const serializedGraph = JSON.stringify(graph);

    expect(title.getTitle()).toBe('The Soruklu Order | Family Stewardship Initiative');
    expect(
      globalThis.document.querySelector('meta[name="description"]')?.getAttribute('content'),
    ).toBe(pageSeoMetadata.sorukluOrder.description);
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl,
    );
    expect(globalThis.document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index, follow',
    );
    expect(
      globalThis.document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
    ).toBe(canonicalUrl);
    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe('https://serhatsoruklu.com/assets/social/serhat-soruklu-soruklu-order-og.png');
    expect(graph['@graph'].map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'AboutPage',
      'WebSite',
      'Person',
    ]);
    expect(webpage).toEqual(
      expect.objectContaining({
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        inLanguage: 'en-GB',
        about: {
          '@type': 'Thing',
          name: 'The Soruklu Order',
          description: pageSeoMetadata.sorukluOrder.description,
        },
        author: { '@id': 'https://serhatsoruklu.com/#person' },
      }),
    );
    expect(graph['@graph'].some((entity) => entity['@type'] === 'Organization')).toBe(false);
    expect(serializedGraph).not.toContain('May the Light guide us.');
    expect(serializedGraph).not.toContain('sorukluorder.org');
  });

  it('publishes evidence-led Soruklu surname metadata and a DefinedTerm graph', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/soruklu-surname');

    const canonicalUrl = 'https://serhatsoruklu.com/soruklu-surname';
    const graph = JSON.parse(
      globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const webpage = graph['@graph'].find((entity) => entity['@type'] === 'AboutPage');
    const term = graph['@graph'].find((entity) => entity['@type'] === 'DefinedTerm');

    expect(title.getTitle()).toBe(pageSeoMetadata.sorukluSurname.title);
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl,
    );
    expect(graph['@graph'].map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'AboutPage',
      'DefinedTerm',
      'WebSite',
      'Person',
    ]);
    expect(webpage).toEqual(
      expect.objectContaining({
        '@id': `${canonicalUrl}#webpage`,
        mainEntity: { '@id': `${canonicalUrl}#soruklu` },
        inLanguage: 'en-GB',
        citation: expect.arrayContaining([
          'https://www.belleten.gov.tr/eng/full-text-pdf/2265/tur',
        ]),
      }),
    );
    expect(term).toEqual(
      expect.objectContaining({
        '@id': `${canonicalUrl}#soruklu`,
        name: 'Soruklu',
      }),
    );
    expect(graph['@graph'].some((entity) => entity['@type'] === 'Organization')).toBe(false);
    expect(JSON.stringify(graph)).not.toMatch(/nobility|coat of arms|direct descendant/i);
  });

  it('applies grounded Velari metadata and its authored creative-work graph', async () => {
    const router = TestBed.inject(Router);
    const title = TestBed.inject(Title);

    await router.navigateByUrl('/velari');

    const canonicalUrl = 'https://serhatsoruklu.com/velari';
    const graph = JSON.parse(
      globalThis.document.getElementById('page-json-ld')?.textContent ?? '{}',
    ) as { '@graph': Array<Record<string, unknown>> };
    const webpage = graph['@graph'].find((entity) => entity['@id'] === `${canonicalUrl}#webpage`);
    const velari = graph['@graph'].find((entity) => entity['@id'] === `${canonicalUrl}#velari`);

    expect(title.getTitle()).toBe(pageSeoMetadata.velari.title);
    expect(globalThis.document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      canonicalUrl,
    );
    expect(globalThis.document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index, follow',
    );
    expect(
      globalThis.document.querySelector('meta[property="og:image:type"]')?.getAttribute('content'),
    ).toBe('image/png');
    expect(
      globalThis.document.querySelector('meta[property="og:image:width"]')?.getAttribute('content'),
    ).toBe('1200');
    expect(
      globalThis.document
        .querySelector('meta[property="og:image:height"]')
        ?.getAttribute('content'),
    ).toBe('630');
    expect(
      globalThis.document.querySelector('meta[property="og:image:alt"]')?.getAttribute('content'),
    ).toBe(pageSeoMetadata.velari.ogImageAlt);
    expect(
      globalThis.document.querySelector('meta[name="twitter:image:alt"]')?.getAttribute('content'),
    ).toBe(pageSeoMetadata.velari.ogImageAlt);
    expect(webpage).toEqual(
      expect.objectContaining({
        '@type': 'AboutPage',
        '@id': `${canonicalUrl}#webpage`,
        mainEntity: { '@id': `${canonicalUrl}#velari` },
        creator: { '@id': 'https://serhatsoruklu.com/#person' },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
      }),
    );
    expect(velari).toEqual(
      expect.objectContaining({
        '@type': 'CreativeWork',
        name: 'Velari',
        creator: { '@id': 'https://serhatsoruklu.com/#person' },
        sameAs: ['https://www.instagram.com/velarifaith/'],
        genre: ['Personal belief framework', 'Philosophical writing'],
      }),
    );
    expect(graph['@graph'].filter((entity) => entity['@type'] === 'CreativeWork')).toHaveLength(4);
    expect(JSON.stringify(graph)).toContain('Helio-pantheism');
    expect(JSON.stringify(graph)).not.toContain('The Velarian Path');
    expect(JSON.stringify(graph)).not.toContain('May the Light guide us.');
    expect(JSON.stringify(graph)).not.toContain('Soruklu Order');
    expect(graph['@graph'].some((entity) => entity['@type'] === 'Organization')).toBe(false);
    expect(JSON.stringify(graph)).not.toMatch(/Prophet|Deity|Religious figure|Supernatural/i);
  });

  it('falls back to home metadata when a route has no SEO data', () => {
    const service = TestBed.inject(SeoService);
    const title = TestBed.inject(Title);

    service.applyRouteMetadata({
      data: {},
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot);

    expect(title.getTitle()).toBe(seoConfig.defaultTitle);
    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
    expect(
      globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
  });

  it('uses the default social image when route SEO omits an image', () => {
    const service = TestBed.inject(SeoService);

    service.applyRouteMetadata({
      data: {
        seo: {
          label: 'Example',
          title: 'Example Route',
          description: 'Example route description.',
          path: '/example',
        },
      },
      firstChild: null,
    } as unknown as ActivatedRouteSnapshot);

    expect(
      globalThis.document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
    expect(
      globalThis.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content'),
    ).toBe(`https://serhatsoruklu.com${seoConfig.defaultOgImage}`);
  });
});
