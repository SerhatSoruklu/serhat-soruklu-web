import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const orderPath = '/soruklu-order';
const officialXUrl = 'https://x.com/sorukluorder';
const emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.png';
const socialSourcePath = '/assets/social/serhat-soruklu-soruklu-order-og.svg';
const viewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 1280, height: 640 },
];

type JsonLdEntity = Record<string, unknown>;

function getMetaContent(html: string, attribute: 'name' | 'property', key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/g) ?? [];
  const tag = tags.find((candidate) => candidate.includes(`${attribute}="${key}"`));

  return tag?.match(/\bcontent="([^"]*)"/)?.[1] ?? null;
}

function getCanonicalHref(html: string): string | null {
  const tags = html.match(/<link\b[^>]*>/g) ?? [];
  const tag = tags.find((candidate) => candidate.includes('rel="canonical"'));

  return tag?.match(/\bhref="([^"]*)"/)?.[1] ?? null;
}

function getRouteGraph(html: string): JsonLdEntity[] {
  const match = html.match(/<script\b[^>]*id="page-json-ld"[^>]*>([\s\S]*?)<\/script>/);

  if (!match) {
    return [];
  }

  const data = JSON.parse(match[1]) as JsonLdEntity;

  return Array.isArray(data['@graph']) ? (data['@graph'] as JsonLdEntity[]) : [data];
}

test.describe('identity routes', () => {
  test('Soruklu Order renders the approved facts, boundaries, assets, and official channel', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(orderPath);

    await expect(page.getByRole('heading', { level: 1, name: 'The Soruklu Order' })).toBeVisible();
    await expect(page.getByText('Serhat Soruklu', { exact: true }).first()).toBeVisible();
    await expect(
      page.getByText('Approximately 5–10 selected members', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('May the Light guide us.', { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'The Order Is Not the Entire Family' }),
    ).toBeVisible();
    await expect(page.getByText(/potentially thousands of individuals/)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Safeguarding, Evidence and Due Process' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Official Identity Clarification' }),
    ).toBeVisible();

    const officialLinks = page.locator(`a[href="${officialXUrl}"]`);
    await expect(officialLinks).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(officialLinks.nth(index)).toHaveAttribute('target', '_blank');
      await expect(officialLinks.nth(index)).toHaveAttribute('rel', 'me noopener noreferrer');
      await expect(officialLinks.nth(index)).toHaveAttribute(
        'aria-label',
        'Open the official Soruklu Order account on X',
      );
    }

    await expect(page.locator(`img[src="${emblemPath}"]`)).toHaveCount(2);
    const emblemResponse = await request.get(emblemPath);
    expect(emblemResponse.ok()).toBe(true);
    expect(emblemResponse.headers()['content-type']).toMatch(/^image\//);

    await expect(page.getByText('sorukluorder.org', { exact: true })).toBeVisible();
    await expect(page.locator('a[href*="sorukluorder.org"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    assertNoConsoleErrors();
  });

  test('Explore the Order scrolls in place without changing the route', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(orderPath);
    const target = page.locator('#the-order');
    await page.getByRole('button', { name: 'Explore the Order' }).click();

    await expect(page).toHaveURL(new RegExp(`${orderPath}$`));
    await expect(target).toBeInViewport();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    assertNoConsoleErrors();
  });

  test('footer exposes Identity after Systems while both primary headers stay unchanged', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(orderPath);

    const footer = page.locator('app-site-footer');
    const groupTitles = footer.locator('.site-footer__group-title');
    await expect(groupTitles).toHaveText(['Navigate', 'Systems', 'Identity', 'Reach Us']);
    await expect(footer.getByRole('link', { name: 'Soruklu Order', exact: true })).toHaveAttribute(
      'href',
      orderPath,
    );
    await expect(footer.getByRole('link', { name: 'Velari', exact: true })).toHaveAttribute(
      'href',
      '/velari',
    );
    await expect(
      page.locator('.site-nav').getByRole('link', { name: 'Soruklu Order' }),
    ).toHaveCount(0);
    await expect(page.locator('.site-nav').getByRole('link', { name: 'Velari' })).toHaveCount(0);
    await expect(
      page.locator('.mobile-nav').getByRole('link', { name: 'Soruklu Order' }),
    ).toHaveCount(0);
    await expect(page.locator('.mobile-nav').getByRole('link', { name: 'Velari' })).toHaveCount(0);
    assertNoConsoleErrors();
  });

  test('Soruklu Order and the four-group footer remain bounded at every required viewport', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(orderPath);
      await page.locator('app-site-footer').scrollIntoViewIfNeeded();

      const layout = await page.evaluate(() => {
        const frame = document.querySelector('.order-frame')?.getBoundingClientRect();
        const emblem = document.querySelector('.order-emblem-frame')?.getBoundingClientRect();
        const footerGroups = Array.from(document.querySelectorAll('.site-footer__group')).map(
          (group) => {
            const box = group.getBoundingClientRect();
            return {
              top: Math.round(box.top),
              left: box.left,
              right: box.right,
              bottom: box.bottom,
            };
          },
        );
        const uniqueRows = new Set(footerGroups.map((group) => group.top)).size;
        const closing = document.querySelector('.order-closing')?.getBoundingClientRect();
        const footer = document.querySelector('app-site-footer')?.getBoundingClientRect();

        return {
          frameLeft: frame?.left ?? -1,
          frameRight: frame?.right ?? -1,
          emblemLeft: emblem?.left ?? -1,
          emblemRight: emblem?.right ?? -1,
          footerGroups,
          uniqueRows,
          closingBottom: closing?.bottom ?? -1,
          footerTop: footer?.top ?? -1,
          viewportWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      expect(
        layout.scrollWidth,
        `${viewport.width}x${viewport.height} horizontal overflow`,
      ).toBeLessThanOrEqual(layout.viewportWidth + 1);
      expect(layout.frameLeft).toBeGreaterThanOrEqual(19);
      expect(layout.frameRight).toBeLessThanOrEqual(layout.viewportWidth - 19);
      expect(layout.emblemLeft).toBeGreaterThanOrEqual(0);
      expect(layout.emblemRight).toBeLessThanOrEqual(layout.viewportWidth);
      expect(Math.abs(layout.footerTop - layout.closingBottom)).toBeLessThanOrEqual(1);
      expect(layout.footerGroups).toHaveLength(4);

      for (const group of layout.footerGroups) {
        expect(group.left).toBeGreaterThanOrEqual(0);
        expect(group.right).toBeLessThanOrEqual(layout.viewportWidth);
        expect(group.bottom).toBeGreaterThan(group.top);
      }

      if (viewport.width >= 1024) {
        expect(layout.uniqueRows).toBe(1);
      } else {
        expect(layout.uniqueRows).toBe(2);
      }
    }

    assertNoConsoleErrors();
  });

  test('dark, light, and system themes keep the identity page legible', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(orderPath);

    const darkColors = await page.locator('.order-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(darkColors.heading).toBe('rgb(248, 243, 233)');

    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'light'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    const lightColors = await page.locator('.order-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(lightColors.heading).toBe('rgb(17, 24, 39)');
    expect(lightColors.background).not.toBe(darkColors.background);

    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'system'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    expect(
      await page
        .locator('.order-action')
        .first()
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');

    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    expect(
      await page.locator('.order-page h1').evaluate((element) => getComputedStyle(element).color),
    ).toBe('rgb(17, 24, 39)');
    assertNoConsoleErrors();
  });

  test('Soruklu Order SSR metadata and entity graph are exact and exclude the unaffiliated domain', async ({
    request,
  }) => {
    const response = await request.get(orderPath);
    const html = await response.text();
    const canonicalUrl = `${canonicalBaseUrl}${orderPath}`;
    const graph = getRouteGraph(html);
    const webpage = graph.find((entity) => entity['@type'] === 'WebPage');
    const order = graph.find((entity) => entity['@type'] === 'Organization');

    expect(response.ok()).toBe(true);
    expect(html.match(/<title>(.*?)<\/title>/)?.[1]).toBe(pageSeoMetadata.sorukluOrder.title);
    expect(getMetaContent(html, 'name', 'description')).toBe(
      pageSeoMetadata.sorukluOrder.description,
    );
    expect(getMetaContent(html, 'name', 'robots')).toBe('index, follow');
    expect(getCanonicalHref(html)).toBe(canonicalUrl);
    expect(getMetaContent(html, 'property', 'og:title')).toBe(pageSeoMetadata.sorukluOrder.title);
    expect(getMetaContent(html, 'property', 'og:description')).toBe(
      pageSeoMetadata.sorukluOrder.description,
    );
    expect(getMetaContent(html, 'property', 'og:url')).toBe(canonicalUrl);
    expect(getMetaContent(html, 'property', 'og:image')).toBe(
      `${canonicalBaseUrl}/assets/social/serhat-soruklu-soruklu-order-og.png`,
    );
    expect(getMetaContent(html, 'name', 'twitter:card')).toBe('summary_large_image');
    expect(graph.map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'WebPage',
      'Organization',
      'WebSite',
      'Person',
    ]);
    expect(webpage).toEqual(
      expect.objectContaining({
        '@id': `${canonicalUrl}#webpage`,
        mainEntity: { '@id': `${canonicalUrl}#order` },
        isPartOf: { '@id': `${canonicalBaseUrl}/#website` },
        author: { '@id': `${canonicalBaseUrl}/#person` },
        inLanguage: 'en-GB',
      }),
    );
    expect(order).toEqual(
      expect.objectContaining({
        '@id': `${canonicalUrl}#order`,
        founder: { '@id': `${canonicalBaseUrl}/#person` },
        sameAs: [officialXUrl],
      }),
    );
    expect(JSON.stringify(graph)).not.toContain('sorukluorder.org');
  });

  test('Velari is public, self-canonical, and represented once in the sitemap', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/velari');
    await expect(page.getByRole('heading', { level: 1, name: 'Velari' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What Is Velari?' })).toBeVisible();
    await expect(page.getByText('Public material is being prepared.')).toHaveCount(0);

    const response = await request.get('/velari');
    const html = await response.text();
    const sitemap = await (await request.get('/sitemap.xml')).text();

    expect(response.ok()).toBe(true);
    expect(getMetaContent(html, 'name', 'robots')).toBe('index, follow');
    expect(getCanonicalHref(html)).toBe(`${canonicalBaseUrl}/velari`);
    expect(
      getRouteGraph(html).some((entity) => entity['@id'] === `${canonicalBaseUrl}/velari#velari`),
    ).toBe(true);
    expect(sitemap.match(/<loc>https:\/\/serhatsoruklu\.com\/velari<\/loc>/g)).toHaveLength(1);
    assertNoConsoleErrors();
  });

  test('Soruklu Order social image and official emblem are available at their declared dimensions', async ({
    page,
    request,
  }) => {
    const socialPath = pageSeoMetadata.sorukluOrder.ogImage;
    const socialResponse = await request.get(socialPath);
    const socialSourceResponse = await request.get(socialSourcePath);
    const socialSource = await socialSourceResponse.text();

    expect(socialResponse.ok()).toBe(true);
    expect(socialResponse.headers()['content-type']).toContain('image/png');
    expect(socialSourceResponse.ok()).toBe(true);
    expect(socialSource).toContain('href="data:image/jpeg;base64,');
    expect(socialSource).not.toContain('href="/assets/brand/');

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(socialPath);
    const image = page.locator('img');
    await expect(image).toBeVisible();
    expect(
      await image.evaluate((element: HTMLImageElement) => ({
        width: element.naturalWidth,
        height: element.naturalHeight,
      })),
    ).toEqual({ width: 1200, height: 630 });
  });
});
