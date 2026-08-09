import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { SITEMAP_ROUTES } from '../../src/app/core/seo/sitemap.config';
import { installConsoleErrorGuard } from './support/console-errors';

const indexableSeoMetadata = Object.values(pageSeoMetadata).filter(
  (metadata) => !('robots' in metadata) || metadata.robots !== 'noindex, follow',
);
const routeSeoCases = SITEMAP_ROUTES.map((route) => {
  const metadata = indexableSeoMetadata.find((candidate) => candidate.path === route.path);

  if (!metadata) {
    throw new Error(`Missing SEO metadata for sitemap route: ${route.path}`);
  }

  return metadata;
});
const siteName = 'Serhat Soruklu';
const canonicalBaseUrl = 'https://serhatsoruklu.com';
const sitelinkRoutes = [
  pageSeoMetadata.about,
  pageSeoMetadata.press,
  pageSeoMetadata.work,
  pageSeoMetadata.systems,
  pageSeoMetadata.writing,
  pageSeoMetadata.github,
  pageSeoMetadata.sorukluSurname,
  pageSeoMetadata.sorukluOrder,
  pageSeoMetadata.velari,
  pageSeoMetadata.contact,
];

type JsonLdEntity = Record<string, unknown>;

interface SitemapEntry {
  loc: string | null;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

function getTitle(html: string): string | null {
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];

  return title ? decodeHtmlEntities(title) : null;
}

function getMetaContent(html: string, attribute: 'name' | 'property', key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  const target = `${attribute}="${key}"`;
  const tag = tags.find((candidate) => candidate.includes(target));

  const content = tag?.match(/\bcontent="([^"]*)"/)?.[1];

  return content ? decodeHtmlEntities(content) : null;
}

function decodeHtmlEntities(value: string): string {
  const decodedEntities: Readonly<Record<string, string>> = {
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&lt;': '<',
    '&gt;': '>',
  };

  return value.replace(/&(amp|quot|#39|lt|gt);/g, (entity) => decodedEntities[entity] ?? entity);
}

function getCanonicalHref(html: string): string | null {
  const tags = html.match(/<link\b[^>]*>/g) ?? [];
  const tag = tags.find((candidate) => candidate.includes('rel="canonical"'));

  return tag?.match(/\bhref="([^"]*)"/)?.[1] ?? null;
}

function getCanonicalCount(html: string): number {
  return (html.match(/<link\b[^>]*rel="canonical"[^>]*>/g) ?? []).length;
}

function getJsonLdEntities(html: string): JsonLdEntity[] {
  const scripts = [
    ...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g),
  ];

  return scripts.flatMap((script) => {
    const parsed = JSON.parse(script[1].trim()) as JsonLdEntity;
    const graph = parsed['@graph'];

    if (Array.isArray(graph)) {
      return graph as JsonLdEntity[];
    }

    return [parsed];
  });
}

function findJsonLdEntity(entities: JsonLdEntity[], type: string): JsonLdEntity | undefined {
  return entities.find((entity) => {
    const entityType = entity['@type'];
    return entityType === type || (Array.isArray(entityType) && entityType.includes(type));
  });
}

function getBreadcrumbNames(entities: JsonLdEntity[]): string[] {
  const breadcrumb = findJsonLdEntity(entities, 'BreadcrumbList');
  const items = breadcrumb?.['itemListElement'];

  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => (item as JsonLdEntity)['name'])
    .filter((name): name is string => typeof name === 'string');
}

function escapeRegExp(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function hasCrawlableAnchor(html: string, href: string, label: string): boolean {
  const anchorPattern = new RegExp(
    `<a\\b[^>]*href="${escapeRegExp(href)}"[^>]*>[\\s\\S]*?${escapeRegExp(label)}[\\s\\S]*?<\\/a>`,
  );

  return anchorPattern.test(html);
}

function getXmlElementValue(xml: string, tagName: string): string | null {
  return xml.match(new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`))?.[1] ?? null;
}

function getSitemapEntries(sitemap: string): SitemapEntry[] {
  return [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: getXmlElementValue(match[1], 'loc'),
    lastmod: getXmlElementValue(match[1], 'lastmod'),
    changefreq: getXmlElementValue(match[1], 'changefreq'),
    priority: getXmlElementValue(match[1], 'priority'),
  }));
}

function formatSitemapPriority(priority: number): string {
  return priority.toFixed(1);
}

test.describe('seo metadata', () => {
  for (const metadata of routeSeoCases) {
    test(`${metadata.ogImage} is a standalone 1200 by 630 PNG`, async ({ page, request }) => {
      const response = await request.get(metadata.ogImage);

      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toContain('image/png');

      await page.goto(metadata.ogImage);
      const image = page.locator('img');
      await expect(image).toBeVisible();
      expect(
        await image.evaluate((element) => ({
          width: (element as HTMLImageElement).naturalWidth,
          height: (element as HTMLImageElement).naturalHeight,
        })),
      ).toEqual({ width: 1200, height: 630 });
    });
  }

  test('home page keeps social metadata without unused OG preload warning', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const consoleMessages: string[] = [];
    page.on('console', (message) => {
      consoleMessages.push(message.text());
    });

    await page.goto('/');
    await expect(page.locator('link[rel="preload"][href*="serhat-soruklu-og.png"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      new URL(pageSeoMetadata.home.ogImage, canonicalBaseUrl).toString(),
    );
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
      'content',
      new URL(pageSeoMetadata.home.ogImage, canonicalBaseUrl).toString(),
    );

    await page.waitForLoadState('networkidle');
    expect(
      consoleMessages.some(
        (message) => message.includes('preloaded') && message.includes('serhat-soruklu-og.png'),
      ),
    ).toBe(false);
    assertNoConsoleErrors();
  });

  test('home SSR links one canonical Person entity to Coupyn without becoming a ProfilePage', async ({
    request,
  }) => {
    const response = await request.get('/');
    const html = await response.text();
    const entities = getJsonLdEntities(html);
    const website = findJsonLdEntity(entities, 'WebSite');
    const person = findJsonLdEntity(entities, 'Person');
    const organization = findJsonLdEntity(entities, 'Organization');
    const ids = entities
      .map((entity) => entity['@id'])
      .filter((id): id is string => typeof id === 'string');

    expect(response.ok()).toBe(true);
    expect(entities.map((entity) => entity['@type'])).toEqual([
      'WebSite',
      'Person',
      'Organization',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(website?.['@id']).toBe(`${canonicalBaseUrl}/#website`);
    expect(website?.['publisher']).toEqual({ '@id': `${canonicalBaseUrl}/#person` });
    expect(person?.['@id']).toBe(`${canonicalBaseUrl}/#person`);
    expect(person?.['mainEntityOfPage']).toEqual({
      '@id': `${canonicalBaseUrl}/about#webpage`,
    });
    expect(person?.['worksFor']).toEqual({ '@id': 'https://coupyn.com/#organization' });
    expect(organization?.['@id']).toBe('https://coupyn.com/#organization');
    expect(organization?.['founder']).toEqual({ '@id': `${canonicalBaseUrl}/#person` });
    expect(findJsonLdEntity(entities, 'ProfilePage')).toBeUndefined();
    expect(html).not.toContain(`${canonicalBaseUrl}/about#person`);
  });

  for (const metadata of routeSeoCases) {
    test(`direct route load has route-specific metadata for ${metadata.path}`, async ({
      request,
    }) => {
      const response = await request.get(metadata.path);
      const html = await response.text();
      const canonicalUrl = new URL(metadata.path, canonicalBaseUrl).toString();
      const jsonLdEntities = getJsonLdEntities(html);
      const website = findJsonLdEntity(jsonLdEntities, 'WebSite');
      const person = findJsonLdEntity(jsonLdEntities, 'Person');

      expect(response.ok()).toBe(true);
      expect(getTitle(html)).toBe(metadata.title);
      expect(getMetaContent(html, 'name', 'description')).toBe(metadata.description);
      expect(getCanonicalHref(html)).toBe(canonicalUrl);
      expect(getCanonicalCount(html)).toBe(1);
      expect(html).not.toContain('noindex');
      expect(getMetaContent(html, 'property', 'og:title')).toBe(metadata.title);
      expect(getMetaContent(html, 'property', 'og:description')).toBe(metadata.description);
      expect(getMetaContent(html, 'property', 'og:url')).toBe(canonicalUrl);
      expect(getMetaContent(html, 'property', 'og:site_name')).toBe(siteName);
      expect(getMetaContent(html, 'property', 'og:image')).toBe(
        new URL(metadata.ogImage, canonicalBaseUrl).toString(),
      );
      expect(getMetaContent(html, 'property', 'og:image:type')).toBe('image/png');
      expect(getMetaContent(html, 'property', 'og:image:width')).toBe('1200');
      expect(getMetaContent(html, 'property', 'og:image:height')).toBe('630');
      expect(getMetaContent(html, 'property', 'og:image:alt')).toBe(metadata.ogImageAlt);
      expect(getMetaContent(html, 'name', 'twitter:card')).toBe('summary_large_image');
      expect(getMetaContent(html, 'name', 'twitter:title')).toBe(metadata.title);
      expect(getMetaContent(html, 'name', 'twitter:description')).toBe(metadata.description);
      expect(getMetaContent(html, 'name', 'twitter:image')).toBe(
        new URL(metadata.ogImage, canonicalBaseUrl).toString(),
      );
      expect(getMetaContent(html, 'name', 'twitter:image:alt')).toBe(metadata.ogImageAlt);
      expect((html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>/g) ?? []).length).toBe(
        1,
      );
      expect(website?.['name']).toBe(siteName);
      expect(website?.['alternateName']).toEqual(
        expect.arrayContaining(['SerhatSoruklu.com', 'Serhat Soruklu Systems Architect']),
      );
      expect(website?.['url']).toBe(`${canonicalBaseUrl}/`);
      expect(website?.['inLanguage']).toBe('en-GB');
      expect(person?.['name']).toBe(siteName);
      expect(person?.['url']).toBe(`${canonicalBaseUrl}/`);
      expect(person?.['@id']).toBe(`${canonicalBaseUrl}/#person`);
      expect(person?.['jobTitle']).toEqual([
        'Founder and CEO of Coupyn',
        'Systems Architect',
        'Full-Stack Developer',
      ]);
      expect(person?.['sameAs']).toEqual(
        expect.arrayContaining(['https://github.com/SerhatSoruklu']),
      );

      const expectedBreadcrumbs = metadata.path.startsWith('/systems/')
        ? [pageSeoMetadata.home.label, pageSeoMetadata.systems.label, metadata.label]
        : metadata.path === '/'
          ? []
          : [pageSeoMetadata.home.label, metadata.label];
      expect(getBreadcrumbNames(jsonLdEntities)).toEqual(expectedBreadcrumbs);
      expect(
        getBreadcrumbNames(jsonLdEntities).some((name) => name.includes('Serhat Soruklu |')),
      ).toBe(false);
    });
  }

  test('About SSR emits one coherent ProfilePage graph with a stable Person identity', async ({
    request,
  }) => {
    const response = await request.get(pageSeoMetadata.about.path);
    const html = await response.text();
    const entities = getJsonLdEntities(html);
    const profilePage = findJsonLdEntity(entities, 'ProfilePage');
    const person = findJsonLdEntity(entities, 'Person');
    const organization = findJsonLdEntity(entities, 'Organization');
    const ids = entities
      .map((entity) => entity['@id'])
      .filter((id): id is string => typeof id === 'string');

    expect(response.status()).toBe(200);
    expect(entities.map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'ProfilePage',
      'Person',
      'WebSite',
      'Organization',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(profilePage?.['@id']).toBe(`${canonicalBaseUrl}/about#webpage`);
    expect(profilePage?.['mainEntity']).toEqual({ '@id': `${canonicalBaseUrl}/#person` });
    expect(profilePage?.['about']).toEqual({ '@id': `${canonicalBaseUrl}/#person` });
    expect(profilePage?.['isPartOf']).toEqual({ '@id': `${canonicalBaseUrl}/#website` });
    expect(profilePage?.['inLanguage']).toBe('en-GB');
    expect(profilePage?.['primaryImageOfPage']).toEqual({
      '@type': 'ImageObject',
      url: `${canonicalBaseUrl}/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png`,
      width: 1173,
      height: 1341,
      caption: 'Portrait of Serhat Soruklu, founder and CEO of Coupyn.',
    });
    expect(person?.['@id']).toBe(`${canonicalBaseUrl}/#person`);
    expect(person?.['mainEntityOfPage']).toEqual({
      '@id': `${canonicalBaseUrl}/about#webpage`,
    });
    expect(person?.['birthDate']).toBe('1996-02-22');
    expect(person?.['worksFor']).toEqual({ '@id': 'https://coupyn.com/#organization' });
    expect(person?.['sameAs']).toEqual(
      expect.arrayContaining([
        'https://github.com/SerhatSoruklu',
        'https://www.linkedin.com/in/serhatsoruklu/',
        'https://orcid.org/0009-0006-8963-5986',
      ]),
    );
    expect(organization?.['@id']).toBe('https://coupyn.com/#organization');
    expect(organization?.['founder']).toEqual({ '@id': `${canonicalBaseUrl}/#person` });
    expect(html).not.toContain(`${canonicalBaseUrl}/about#person`);
  });

  test('About SSR honours the shared Turkish Identity cookie without changing canonical URL', async ({
    request,
  }) => {
    const response = await request.get(pageSeoMetadata.about.path, {
      headers: { Cookie: 'serhatsoruklu-identity-language=tr' },
    });
    const html = await response.text();
    const profilePage = findJsonLdEntity(getJsonLdEntities(html), 'ProfilePage');

    expect(response.status()).toBe(200);
    expect(html).toMatch(/<html[^>]*lang="tr-TR"/);
    expect(getTitle(html)).toBe("Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su");
    expect(getMetaContent(html, 'name', 'description')).toBe(
      "Osmancık'ta doğup Tottenham'da büyüyen Serhat Soruklu'nun kendi kendine öğrendiği yazılım yolculuğunu ve Coupyn'i nasıl kurduğunu okuyun.",
    );
    expect(getMetaContent(html, 'property', 'og:locale')).toBe('tr_TR');
    expect(getCanonicalHref(html)).toBe(`${canonicalBaseUrl}/about`);
    expect(profilePage?.['inLanguage']).toBe('tr-TR');
    expect(profilePage?.['name']).toBe("Serhat Soruklu Hakkında | Coupyn Kurucusu ve CEO'su");
  });

  test('Press SSR stays English and reuses the canonical Person and Coupyn entities in a WebPage graph', async ({
    request,
  }) => {
    const response = await request.get(pageSeoMetadata.press.path, {
      headers: { Cookie: 'serhatsoruklu-identity-language=tr' },
    });
    const html = await response.text();
    const entities = getJsonLdEntities(html);
    const webpage = findJsonLdEntity(entities, 'WebPage');
    const person = findJsonLdEntity(entities, 'Person');
    const website = findJsonLdEntity(entities, 'WebSite');
    const organization = findJsonLdEntity(entities, 'Organization');
    const canonicalUrl = `${canonicalBaseUrl}/press`;
    const personId = `${canonicalBaseUrl}/#person`;
    const websiteId = `${canonicalBaseUrl}/#website`;
    const organizationId = 'https://coupyn.com/#organization';
    const ids = entities
      .map((entity) => entity['@id'])
      .filter((id): id is string => typeof id === 'string');

    expect(response.status()).toBe(200);
    expect(html).toMatch(/<html[^>]*lang="en-GB"/);
    expect(getTitle(html)).toBe(pageSeoMetadata.press.title);
    expect(getMetaContent(html, 'name', 'description')).toBe(pageSeoMetadata.press.description);
    expect(getMetaContent(html, 'property', 'og:locale')).toBe('en_GB');
    expect(getCanonicalHref(html)).toBe(canonicalUrl);
    expect(entities.map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'WebPage',
      'Person',
      'WebSite',
      'Organization',
    ]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(webpage).toEqual({
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      name: pageSeoMetadata.press.title,
      description: pageSeoMetadata.press.description,
      url: canonicalUrl,
      isPartOf: { '@id': websiteId },
      about: [{ '@id': personId }, { '@id': organizationId }],
      author: { '@id': personId },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: `${canonicalBaseUrl}${pageSeoMetadata.press.ogImage}`,
        width: 1200,
        height: 630,
        caption: pageSeoMetadata.press.ogImageAlt,
      },
      breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
      inLanguage: 'en-GB',
    });
    expect(person).toEqual(
      expect.objectContaining({
        '@id': personId,
        mainEntityOfPage: { '@id': `${canonicalBaseUrl}/about#webpage` },
        worksFor: { '@id': organizationId },
      }),
    );
    expect(website?.['@id']).toBe(websiteId);
    expect(organization).toEqual(
      expect.objectContaining({
        '@id': organizationId,
        founder: { '@id': personId },
      }),
    );
    expect(findJsonLdEntity(entities, 'ProfilePage')).toBeUndefined();
    expect(html).not.toMatch(/about#person|\bSly\b|DevBest/i);
  });

  test('home SSR contains crawlable short navigation labels', async ({ request }) => {
    const response = await request.get('/');
    const html = await response.text();

    expect(response.ok()).toBe(true);

    for (const metadata of sitelinkRoutes) {
      expect(hasCrawlableAnchor(html, metadata.path, metadata.label)).toBe(true);
    }
  });

  test('not-found SSR is excluded from indexing and structured data', async ({ request }) => {
    const response = await request.get('/does-not-exist');
    const html = await response.text();

    expect(response.status()).toBe(404);
    expect(getTitle(html)).toBe(pageSeoMetadata.notFound.title);
    expect(getMetaContent(html, 'name', 'description')).toBe(pageSeoMetadata.notFound.description);
    expect(getMetaContent(html, 'name', 'robots')).toBe('noindex, follow');
    expect(getCanonicalHref(html)).toBe(`${canonicalBaseUrl}/404`);
    expect(html).toContain('Page not found');
    expect(html).not.toContain('type="application/ld+json"');
  });

  test('every route renders exactly one primary main landmark', async ({ page }) => {
    for (const metadata of [...routeSeoCases, pageSeoMetadata.notFound]) {
      await page.goto(metadata.path);
      await expect(page.locator('main')).toHaveCount(1);
    }
  });

  test('sitemap lists every public route with stable metadata', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    const sitemap = await response.text();
    const entries = getSitemapEntries(sitemap);
    const urls = entries.map((entry) => entry.loc);

    expect(response.ok()).toBe(true);
    expect(sitemap).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(sitemap.trim()).toMatch(/<\/urlset>$/);
    expect(sitemap).not.toContain('localhost');
    expect(new Set(urls).size).toBe(urls.length);
    expect(entries).toHaveLength(SITEMAP_ROUTES.length);
    expect([...urls].sort()).toEqual(
      routeSeoCases.map((metadata) => new URL(metadata.path, canonicalBaseUrl).toString()).sort(),
    );
    expect(urls).not.toContain(new URL(pageSeoMetadata.notFound.path, canonicalBaseUrl).toString());
    expect(urls.every((url) => url?.startsWith(`${canonicalBaseUrl}/`))).toBe(true);

    for (const route of SITEMAP_ROUTES) {
      const entry = entries.find(
        (candidate) => candidate.loc === new URL(route.path, canonicalBaseUrl).toString(),
      );

      expect(entry).toEqual({
        loc: new URL(route.path, canonicalBaseUrl).toString(),
        lastmod: route.lastModified,
        changefreq: route.changeFrequency,
        priority: formatSitemapPriority(route.priority),
      });
    }
  });

  test('robots.txt keeps public routes crawlable and references the sitemap', async ({
    request,
  }) => {
    const response = await request.get('/robots.txt');
    const robots = await response.text();

    expect(response.ok()).toBe(true);
    expect(robots).toContain('User-agent: *');
    expect(robots).toContain('Allow: /');
    expect(robots).toContain('Sitemap: https://serhatsoruklu.com/sitemap.xml');

    for (const metadata of sitelinkRoutes) {
      expect(robots).not.toContain(`Disallow: ${metadata.path}`);
    }
  });
});
