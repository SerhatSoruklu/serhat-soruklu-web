import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const routeSeoCases = [
  pageSeoMetadata.home,
  pageSeoMetadata.work,
  pageSeoMetadata.systems,
  pageSeoMetadata.writing,
  pageSeoMetadata.github,
  pageSeoMetadata.contact
];
const ogImage = 'https://serhatsoruklu.com/assets/social/serhat-soruklu-og.svg';

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

test.describe('seo metadata', () => {
  test('OG SVG renders standalone with all visible text', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto('/assets/social/serhat-soruklu-og.svg');

    await expect(page.locator('svg')).toBeVisible();
    await expect(page.locator('text').filter({ hasText: 'Serhat Soruklu' })).toBeVisible();
    await expect(page.locator('text').filter({ hasText: 'Systems architecture, software engineering,' })).toBeVisible();
    await expect(page.locator('text').filter({ hasText: 'and product-focused technology.' })).toBeVisible();
    await expect(page.locator('text').filter({ hasText: 'serhatsoruklu.com' })).toBeVisible();
    assertNoConsoleErrors();
  });

  test('home page keeps social metadata without unused OG preload warning', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const consoleMessages: string[] = [];
    page.on('console', (message) => {
      consoleMessages.push(message.text());
    });

    await page.goto('/');
    await expect(page.locator('link[rel="preload"][href*="serhat-soruklu-og.svg"]')).toHaveCount(0);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', ogImage);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', ogImage);

    await page.waitForLoadState('networkidle');
    expect(consoleMessages.some((message) => message.includes('preloaded') && message.includes('serhat-soruklu-og.svg'))).toBe(false);
    assertNoConsoleErrors();
  });

  for (const metadata of routeSeoCases) {
    test(`direct route load has route-specific metadata for ${metadata.path}`, async ({ request }) => {
      const response = await request.get(metadata.path);
      const html = await response.text();
      const canonicalUrl = new URL(metadata.path, 'https://serhatsoruklu.com').toString();

      expect(response.ok()).toBe(true);
      expect(getTitle(html)).toBe(metadata.title);
      expect(getMetaContent(html, 'name', 'description')).toBe(metadata.description);
      expect(getCanonicalHref(html)).toBe(canonicalUrl);
      expect(getMetaContent(html, 'property', 'og:title')).toBe(metadata.title);
      expect(getMetaContent(html, 'property', 'og:description')).toBe(metadata.description);
      expect(getMetaContent(html, 'property', 'og:url')).toBe(canonicalUrl);
      expect(getMetaContent(html, 'property', 'og:image')).toBe(ogImage);
      expect(getMetaContent(html, 'name', 'twitter:title')).toBe(metadata.title);
      expect(getMetaContent(html, 'name', 'twitter:description')).toBe(metadata.description);
      expect(getMetaContent(html, 'name', 'twitter:image')).toBe(ogImage);
    });
  }
});
