import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { SITEMAP_ROUTES } from '../../src/app/core/seo/sitemap.config';
import { installConsoleErrorGuard } from './support/console-errors';

const routeSeoCases = [
  pageSeoMetadata.home,
  pageSeoMetadata.work,
  pageSeoMetadata.systems,
  pageSeoMetadata.writing,
  pageSeoMetadata.github,
  pageSeoMetadata.contact
];
const siteName = 'Serhat Soruklu';
const canonicalBaseUrl = 'https://serhatsoruklu.com';
const sitelinkRoutes = [
  pageSeoMetadata.work,
  pageSeoMetadata.systems,
  pageSeoMetadata.writing,
  pageSeoMetadata.github,
  pageSeoMetadata.contact
];
const ogImageCases = [
  {
    path: pageSeoMetadata.home.ogImage,
    title: 'Serhat Soruklu',
    subtitle: 'Systems architecture, software engineering,',
    urlLabel: 'serhatsoruklu.com',
    logoHref: /^data:image\/png;base64,/
  },
  {
    path: pageSeoMetadata.work.ogImage,
    title: 'Work',
    subtitle: 'Projects, platforms, and systems built with',
    urlLabel: 'serhatsoruklu.com/work',
    logoHref: /^data:image\/png;base64,/
  },
  {
    path: pageSeoMetadata.systems.ogImage,
    title: 'Systems',
    subtitle: 'Architecture, infrastructure, constraints,',
    urlLabel: 'serhatsoruklu.com/systems',
    logoHref: /^data:image\/png;base64,/
  },
  {
    path: pageSeoMetadata.writing.ogImage,
    title: 'Writing',
    subtitle: 'Notes on software, systems, architecture,',
    urlLabel: 'serhatsoruklu.com/writing',
    logoHref: /^data:image\/png;base64,/
  },
  {
    path: pageSeoMetadata.github.ogImage,
    title: 'GitHub',
    subtitle: 'Open-source work, repositories,',
    urlLabel: 'serhatsoruklu.com/github',
    logoHref: /^data:image\/png;base64,/
  },
  {
    path: pageSeoMetadata.contact.ogImage,
    title: 'Contact',
    subtitle: 'Collaborations, engineering discussions,',
    urlLabel: 'serhatsoruklu.com/contact',
    logoHref: /^data:image\/png;base64,/
  }
];

type JsonLdEntity = Record<string, unknown>;

interface SitemapEntry {
  loc: string | null;
  lastmod: string | null;
  changefreq: string | null;
  priority: string | null;
}

function getTitle(html: string): string | null {
  return html.match(/<title>(.*?)<\/title>/)?.[1] ?? null;
}

function getMetaContent(html: string, attribute: 'name' | 'property', key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  const target = `${attribute}="${key}"`;
  const tag = tags.find((candidate) => candidate.includes(target));

  return tag?.match(/\bcontent="([^"]*)"/)?.[1] ?? null;
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
  const scripts = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];

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

  return items.map((item) => (item as JsonLdEntity)['name']).filter((name): name is string => typeof name === 'string');
}

function escapeRegExp(value: string): string {
  return value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

function hasCrawlableAnchor(html: string, href: string, label: string): boolean {
  const anchorPattern = new RegExp(`<a\\b[^>]*href="${escapeRegExp(href)}"[^>]*>[\\s\\S]*?${escapeRegExp(label)}[\\s\\S]*?<\\/a>`);

  return anchorPattern.test(html);
}

function exactText(value: string): RegExp {
  return new RegExp(`^${escapeRegExp(value)}$`);
}

function getXmlElementValue(xml: string, tagName: string): string | null {
  return xml.match(new RegExp(`<${tagName}>(.*?)<\\/${tagName}>`))?.[1] ?? null;
}

function getSitemapEntries(sitemap: string): SitemapEntry[] {
  return [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => ({
    loc: getXmlElementValue(match[1], 'loc'),
    lastmod: getXmlElementValue(match[1], 'lastmod'),
    changefreq: getXmlElementValue(match[1], 'changefreq'),
    priority: getXmlElementValue(match[1], 'priority')
  }));
}

function formatSitemapPriority(priority: number): string {
  return priority.toFixed(1);
}

async function expectSvgTextInsideViewport(pageTextSelector: string, page: Page): Promise<void> {
  const boxes = await page.locator(pageTextSelector).evaluateAll((elements) => elements.map((element) => {
    const box = element.getBoundingClientRect();

    return {
      left: box.left,
      top: box.top,
      right: box.right,
      bottom: box.bottom
    };
  }));

  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(0);
    expect(box.top).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(1200);
    expect(box.bottom).toBeLessThanOrEqual(630);
  }
}

test.describe('seo metadata', () => {
  for (const ogCase of ogImageCases) {
    test(`${ogCase.path} renders standalone with route text and logo`, async ({ page, request }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
      const response = await request.get(ogCase.path);

      expect(response.ok()).toBe(true);

      await page.setViewportSize({ width: 1200, height: 630 });
      await page.goto(ogCase.path);

      const svg = page.locator('svg');
      await expect(svg).toBeVisible();
      await expect(svg).toHaveAttribute('width', '1200');
      await expect(svg).toHaveAttribute('height', '630');
      await expect(svg).toHaveAttribute('viewBox', '0 0 1200 630');
      await expect(page.locator('text').filter({ hasText: exactText(ogCase.title) })).toBeVisible();
      await expect(page.locator('text').filter({ hasText: ogCase.subtitle })).toBeVisible();
      await expect(page.locator('text').filter({ hasText: exactText(ogCase.urlLabel) })).toBeVisible();

      const logo = page.locator('image').first();
      await expect(logo).toBeVisible();
      const logoHref = await logo.getAttribute('href');

      if (typeof ogCase.logoHref === 'string') {
        expect(logoHref).toBe(ogCase.logoHref);
        expect((await request.get(ogCase.logoHref)).ok()).toBe(true);
      } else {
        expect(logoHref).toMatch(ogCase.logoHref);
      }

      const logoCard = page.locator('#brand-logo-card');
      await expect(logoCard).toHaveAttribute('transform', 'translate(856 206)');
      await expect(logoCard.locator('rect').nth(0)).toHaveAttribute('width', '220');
      await expect(logoCard.locator('rect').nth(0)).toHaveAttribute('height', '220');
      await expect(logoCard.locator('rect').nth(0)).toHaveAttribute('rx', '32');
      await expect(logoCard.locator('rect').nth(0)).toHaveAttribute('stroke-width', '3');
      await expect(logoCard.locator('rect').nth(1)).toHaveAttribute('x', '18');
      await expect(logoCard.locator('rect').nth(1)).toHaveAttribute('y', '18');
      await expect(logoCard.locator('rect').nth(1)).toHaveAttribute('width', '184');
      await expect(logoCard.locator('rect').nth(1)).toHaveAttribute('height', '184');
      await expect(logo).toHaveAttribute('x', '38');
      await expect(logo).toHaveAttribute('y', '38');
      await expect(logo).toHaveAttribute('width', '144');
      await expect(logo).toHaveAttribute('height', '144');

      await expectSvgTextInsideViewport('text', page);
      assertNoConsoleErrors();
    });
  }

  test('home page keeps social metadata without unused OG preload warning', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const consoleMessages: string[] = [];
    page.on('console', (message) => {
      consoleMessages.push(message.text());
    });

    await page.goto('/');
    await expect(page.locator('link[rel="preload"][href*="serhat-soruklu-og.svg"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new URL(pageSeoMetadata.home.ogImage, canonicalBaseUrl).toString());
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', new URL(pageSeoMetadata.home.ogImage, canonicalBaseUrl).toString());

    await page.waitForLoadState('networkidle');
    expect(consoleMessages.some((message) => message.includes('preloaded') && message.includes('serhat-soruklu-og.svg'))).toBe(false);
    assertNoConsoleErrors();
  });

  for (const metadata of routeSeoCases) {
    test(`direct route load has route-specific metadata for ${metadata.path}`, async ({ request }) => {
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
      expect(getMetaContent(html, 'property', 'og:image')).toBe(new URL(metadata.ogImage, canonicalBaseUrl).toString());
      expect(getMetaContent(html, 'name', 'twitter:card')).toBe('summary_large_image');
      expect(getMetaContent(html, 'name', 'twitter:title')).toBe(metadata.title);
      expect(getMetaContent(html, 'name', 'twitter:description')).toBe(metadata.description);
      expect(getMetaContent(html, 'name', 'twitter:image')).toBe(new URL(metadata.ogImage, canonicalBaseUrl).toString());
      expect(website?.['name']).toBe(siteName);
      expect(website?.['alternateName']).toEqual(expect.arrayContaining(['SerhatSoruklu.com', 'Serhat Soruklu Systems Architect']));
      expect(website?.['url']).toBe(`${canonicalBaseUrl}/`);
      expect(website?.['inLanguage']).toBe('en-GB');
      expect(person?.['name']).toBe(siteName);
      expect(person?.['url']).toBe(`${canonicalBaseUrl}/`);
      expect(person?.['jobTitle']).toBe('Founder, Systems Architect, Full-Stack Engineer');
      expect(person?.['sameAs']).toEqual(expect.arrayContaining(['https://github.com/SerhatSoruklu']));

      const expectedBreadcrumbs = metadata.path === '/'
        ? [pageSeoMetadata.home.label]
        : [pageSeoMetadata.home.label, metadata.label];
      expect(getBreadcrumbNames(jsonLdEntities)).toEqual(expectedBreadcrumbs);
      expect(getBreadcrumbNames(jsonLdEntities).some((name) => name.includes('Serhat Soruklu |'))).toBe(false);
    });
  }

  test('home SSR contains crawlable short navigation labels', async ({ request }) => {
    const response = await request.get('/');
    const html = await response.text();

    expect(response.ok()).toBe(true);

    for (const metadata of sitelinkRoutes) {
      expect(hasCrawlableAnchor(html, metadata.path, metadata.label)).toBe(true);
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

    for (const route of SITEMAP_ROUTES) {
      const entry = entries.find((candidate) => candidate.loc === new URL(route.path, canonicalBaseUrl).toString());

      expect(entry).toEqual({
        loc: new URL(route.path, canonicalBaseUrl).toString(),
        lastmod: route.lastModified,
        changefreq: route.changeFrequency,
        priority: formatSitemapPriority(route.priority)
      });
    }
  });

  test('robots.txt keeps public routes crawlable and references the sitemap', async ({ request }) => {
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
