import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const velariPath = '/velari';
const instagramUrl = 'https://www.instagram.com/velarifaith/';
const emblemPath = '/assets/brand/velari/velari-faith-emblem.jpg';
const socialSourcePath = '/assets/social/serhat-soruklu-velari-og.svg';
const manuscriptInstagramUrls = [
  'https://www.instagram.com/p/DZ47ZQ6oE2V',
  'https://www.instagram.com/p/DZ47fd0oBkf/',
  'https://www.instagram.com/p/DZ47lu4o3AF/',
] as const;

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

test.describe('Velari identity page', () => {
  test('renders the complete authored project with secure links and logical semantics', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(velariPath);

    await expect(page.getByRole('heading', { level: 1, name: 'Velari' })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByText('A modern belief framework', { exact: true })).toBeVisible();
    await expect(page.getByText(/explores an approach called Helio-pantheism/)).toBeVisible();
    await expect(
      page.getByText(/not currently an organised religion or membership body/),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What Velari is' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Light as a symbol' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Three movements of reflection' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Ideas explored through practice' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Three works in progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Written by Serhat Soruklu' })).toBeVisible();

    await expect(page.locator('.velari-movements h3')).toHaveText([
      'Become',
      'Refine',
      'Understand',
    ]);
    await expect(page.locator('.velari-principles article')).toHaveCount(12);
    await expect(page.locator('.velari-reflections article')).toHaveCount(3);
    await expect(page.locator('.velari-manuscripts article')).toHaveCount(3);
    await expect(page.locator('.velari-manuscripts h3')).toHaveText([
      'The Book of Light',
      'The Book of Shadow',
      'The Book of the Path',
    ]);
    await expect(page.getByText('Developing manuscript', { exact: true })).toHaveCount(3);
    await expect(page.getByText('Not yet published', { exact: true })).toHaveCount(3);

    const manuscriptLinks = page.locator('.velari-manuscripts article > a');
    await expect(manuscriptLinks).toHaveCount(3);
    for (let index = 0; index < manuscriptInstagramUrls.length; index += 1) {
      await expect(manuscriptLinks.nth(index)).toHaveAttribute(
        'href',
        manuscriptInstagramUrls[index],
      );
      await expect(manuscriptLinks.nth(index)).toHaveAttribute('target', '_blank');
      await expect(manuscriptLinks.nth(index)).toHaveAttribute('rel', 'noopener noreferrer');
    }

    await expect(
      page.locator('app-site-footer').getByRole('link', { name: 'Velari', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('link', { name: 'Return to Serhat Soruklu' })).toHaveAttribute(
      'href',
      '/',
    );

    const readLink = page.getByRole('link', { name: 'Read the ideas' });
    await expect(readLink).toHaveAttribute('href', '/velari#velari-overview');
    await readLink.click();
    await expect(page).toHaveURL(new RegExp(`${velariPath}#velari-overview$`));
    await expect(page.locator('#velari-overview')).toBeInViewport();

    const profileLinks = page.locator(`a[href="${instagramUrl}"]`);
    await expect(profileLinks).toHaveCount(4);
    for (let index = 0; index < (await profileLinks.count()); index += 1) {
      await expect(profileLinks.nth(index)).toHaveAttribute('target', '_blank');
      await expect(profileLinks.nth(index)).toHaveAttribute('rel', 'me noopener noreferrer');
      await expect(profileLinks.nth(index)).toHaveAttribute(
        'aria-label',
        'Open Velari on Instagram',
      );
    }

    const symbols = page.locator(`img[src="${emblemPath}"]`);
    await expect(symbols).toHaveCount(2);
    await expect(symbols.first()).toHaveAttribute('alt', 'Velari symbol');
    await expect(symbols.last()).toHaveAttribute('alt', '');
    await expect(symbols.last().locator('xpath=..')).toHaveAttribute('aria-hidden', 'true');
    expect((await request.get(emblemPath)).ok()).toBe(true);

    const localOrigin = new URL(page.url()).origin;
    const imageOrigins = await page
      .locator('img')
      .evaluateAll((images) =>
        images.map((image) => new URL((image as HTMLImageElement).src).origin),
      );
    expect(imageOrigins.every((origin) => origin === localOrigin)).toBe(true);

    const headingLevels = await page
      .locator('.velari-page h1, .velari-page h2, .velari-page h3')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(headingLevels[0]).toBe(1);
    expect(
      headingLevels.every((level, index) => index === 0 || level <= headingLevels[index - 1] + 1),
    ).toBe(true);

    const pageText = await page.locator('.velari-page').innerText();
    for (const phrase of [
      'Soruklu Order',
      'Founder and current steward',
      'The Velarian Path',
      'The Velarian Code',
      'Official emblem',
      'Official channel',
    ]) {
      expect(pageText).not.toContain(phrase);
    }
    expect(pageText).not.toMatch(/prophet|deity|divine messenger|infallible authority/i);
    expect(pageText.match(/May the Light guide us\./g)).toHaveLength(1);
    assertNoConsoleErrors();
  });

  test('keeps the four-word symbol compass readable and keyboard accessible', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(velariPath);
    const words = page.locator('.velari-symbol__word');
    await expect(words).toHaveText(['Discipline', 'Indomitable', 'Resilience', 'Equanimity']);

    const discipline = words.filter({ hasText: 'Discipline' });
    await discipline.hover();
    await expect(page.getByRole('tooltip')).toHaveText(
      'The practice of choosing what is right, repeatedly, even when it is difficult.',
    );
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(discipline).toHaveAttribute('aria-describedby', /app-tooltip-/);

    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    const equanimity = words.filter({ hasText: 'Equanimity' });
    await equanimity.focus();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Calm judgement maintained through gain, loss and uncertainty.',
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    for (const viewport of [
      { width: 320, height: 720 },
      { width: 520, height: 900 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.reload();
      const bounds = await page.evaluate(() => {
        const compass = document.querySelector('.velari-symbol__compass')?.getBoundingClientRect();
        const symbol = document.querySelector('.velari-symbol__image')?.getBoundingClientRect();
        const wordBounds = Array.from(document.querySelectorAll('.velari-symbol__word')).map(
          (word) => {
            const box = word.getBoundingClientRect();

            return { top: box.top, right: box.right, bottom: box.bottom, left: box.left };
          },
        );

        return {
          compass: compass
            ? { top: compass.top, right: compass.right, bottom: compass.bottom, left: compass.left }
            : null,
          symbol: symbol
            ? { top: symbol.top, right: symbol.right, bottom: symbol.bottom, left: symbol.left }
            : null,
          wordBounds,
        };
      });

      expect(bounds.compass).not.toBeNull();
      expect(bounds.symbol).not.toBeNull();
      expect(bounds.wordBounds).toHaveLength(4);
      for (const word of bounds.wordBounds) {
        expect(word.left).toBeGreaterThanOrEqual(bounds.compass?.left ?? 0);
        expect(word.right).toBeLessThanOrEqual(bounds.compass?.right ?? viewport.width);
        expect(word.top).toBeGreaterThanOrEqual(bounds.compass?.top ?? 0);
        expect(word.bottom).toBeLessThanOrEqual(bounds.compass?.bottom ?? Number.MAX_VALUE);

        const overlapsSymbol = !(
          word.right <= (bounds.symbol?.left ?? 0) ||
          word.left >= (bounds.symbol?.right ?? 0) ||
          word.bottom <= (bounds.symbol?.top ?? 0) ||
          word.top >= (bounds.symbol?.bottom ?? 0)
        );
        expect(overlapsSymbol).toBe(false);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width + 1,
      );
    }
    assertNoConsoleErrors();
  });

  test('supports dark, light, and system themes with reduced motion', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(velariPath);
    const dark = await page.locator('.velari-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      closing: getComputedStyle(document.querySelector('.velari-closing') as HTMLElement)
        .backgroundColor,
      footer: getComputedStyle(document.querySelector('app-site-footer') as HTMLElement)
        .backgroundColor,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(dark.heading).toBe('rgb(245, 247, 250)');
    expect(dark.closing).toBe(dark.footer);

    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'light'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    const light = await page.locator('.velari-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      closing: getComputedStyle(document.querySelector('.velari-closing') as HTMLElement)
        .backgroundColor,
      eyebrow: getComputedStyle(element.querySelector('.velari-eyebrow') as HTMLElement).color,
      footer: getComputedStyle(document.querySelector('app-site-footer') as HTMLElement)
        .backgroundColor,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(light.heading).toBe('rgb(17, 24, 39)');
    expect(light.eyebrow).toBe('rgb(154, 106, 30)');
    expect(light.background).not.toBe(dark.background);
    expect(light.closing).toBe(light.footer);

    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'system'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    expect(
      await page
        .locator('.velari-action')
        .first()
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');

    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    expect(
      await page.locator('.velari-page h1').evaluate((element) => getComputedStyle(element).color),
    ).toBe('rgb(17, 24, 39)');
    assertNoConsoleErrors();
  });

  test('serves restrained metadata, authored structured data, and self-contained artwork', async ({
    page,
    request,
  }) => {
    const canonicalUrl = `${canonicalBaseUrl}${velariPath}`;
    const response = await request.get(velariPath);
    const html = await response.text();
    const graph = getRouteGraph(html);
    const webpage = graph.find((entity) => entity['@id'] === `${canonicalUrl}#webpage`);
    const velari = graph.find((entity) => entity['@id'] === `${canonicalUrl}#velari`);
    const developingWorks = graph.filter(
      (entity) =>
        entity['@type'] === 'CreativeWork' &&
        entity['creativeWorkStatus'] === 'Developing manuscript',
    );
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const socialSource = await (await request.get(socialSourcePath)).text();
    const socialResponse = await request.get(pageSeoMetadata.velari.ogImage);
    const emblemResponse = await request.get(emblemPath);

    expect(response.ok()).toBe(true);
    expect(html.match(/<title>(.*?)<\/title>/)?.[1]).toBe(pageSeoMetadata.velari.title);
    expect(getMetaContent(html, 'name', 'description')).toBe(pageSeoMetadata.velari.description);
    expect(getCanonicalHref(html)).toBe(canonicalUrl);
    expect(getMetaContent(html, 'name', 'robots')).toBe('index, follow');
    expect(getMetaContent(html, 'property', 'og:url')).toBe(canonicalUrl);
    expect(getMetaContent(html, 'property', 'og:image')).toBe(
      `${canonicalBaseUrl}${pageSeoMetadata.velari.ogImage}`,
    );
    expect(getMetaContent(html, 'property', 'og:image:alt')).toBe(
      pageSeoMetadata.velari.ogImageAlt,
    );
    expect(getMetaContent(html, 'name', 'twitter:image:alt')).toBe(
      pageSeoMetadata.velari.ogImageAlt,
    );

    expect(webpage).toEqual(
      expect.objectContaining({
        '@type': 'AboutPage',
        mainEntity: { '@id': `${canonicalUrl}#velari` },
        creator: { '@id': `${canonicalBaseUrl}/#person` },
      }),
    );
    expect(velari).toEqual(
      expect.objectContaining({
        '@type': 'CreativeWork',
        name: 'Velari',
        sameAs: [instagramUrl],
        genre: ['Personal belief framework', 'Philosophical writing'],
        creator: { '@id': `${canonicalBaseUrl}/#person` },
      }),
    );
    expect(developingWorks).toHaveLength(3);
    expect(graph.filter((entity) => entity['@type'] === 'Organization')).toHaveLength(0);
    expect(graph.filter((entity) => entity['@type'] === 'Person')).toHaveLength(1);
    expect(graph.filter((entity) => entity['@type'] === 'WebSite')).toHaveLength(1);
    expect(JSON.stringify(graph)).toContain('Helio-pantheism');
    expect(JSON.stringify(graph)).not.toMatch(/Soruklu Order|The Velarian Path|Prophet|Deity/i);
    expect(sitemap.match(/<loc>https:\/\/serhatsoruklu\.com\/velari<\/loc>/g)).toHaveLength(1);

    expect(socialResponse.ok()).toBe(true);
    expect(socialResponse.headers()['content-type']).toContain('image/png');
    expect(socialSource).toContain('href="data:image/jpeg;base64,');
    expect(socialSource).not.toContain('href="/assets/');
    expect(socialSource).toContain('A MODERN BELIEF FRAMEWORK');
    expect(socialSource).toContain('HELIO-PANTHEISM');
    const embeddedEmblem = socialSource.match(/href="data:image\/jpeg;base64,([^"]+)"/);
    expect(embeddedEmblem).not.toBeNull();
    expect(Buffer.from(embeddedEmblem?.[1] ?? '', 'base64')).toEqual(await emblemResponse.body());

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(pageSeoMetadata.velari.ogImage);
    expect(
      await page.locator('img').evaluate((image: HTMLImageElement) => ({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })),
    ).toEqual({ width: 1200, height: 630 });
  });
});
