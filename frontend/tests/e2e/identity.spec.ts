import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const orderPath = '/soruklu-order';
const officialXUrl = 'https://x.com/sorukluorder';
const emblemPath = '/assets/brand/soruklu-order/the-soruklu-order-emblem.jpg';
const socialSourcePath = '/assets/social/serhat-soruklu-soruklu-order-og.svg';
const velariPath = '/velari';
const velariInstagramUrl = 'https://www.instagram.com/velarifaith/';
const velariEmblemPath = '/assets/brand/velari/velari-faith-emblem.jpg';
const velariSocialSourcePath = '/assets/social/serhat-soruklu-velari-og.svg';
const viewports = [
  { width: 320, height: 720 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 640, height: 900 },
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
  test('Soruklu Order renders the approved stewardship framing, boundaries, and assets', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(orderPath);

    await expect(page.getByRole('heading', { level: 1, name: 'The Soruklu Order' })).toBeVisible();
    await expect(
      page.getByText('A small, voluntary family stewardship initiative.', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText(/Participation is voluntary and based on informed consent/),
    ).toBeVisible();
    await expect(
      page.getByText(/does not represent the entire Soruklu family and holds no authority/),
    ).toBeVisible();
    await expect(page.getByText(/Discipline · Responsibility · Continuity/).first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A small family initiative, clearly bounded.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Practical stewardship, not ceremony.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Consent comes before participation.' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A small set of administrative tasks.' }),
    ).toBeVisible();
    await expect(page.locator('.order-responsibilities h3')).toHaveText([
      'Project coordinator',
      'Family adviser',
      'Safeguarding contact',
      'Records custodian',
    ]);
    await expect(
      page.getByText(/does not investigate offences, determine guilt, adjudicate disputes/),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The family mark.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Authorised public identity.' })).toBeVisible();

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

    const emblems = page.locator(`img[src="${emblemPath}"]`);
    await expect(emblems).toHaveCount(2);
    await expect(emblems.first()).toHaveAttribute('alt', 'Soruklu Order interwoven family emblem');
    await expect(emblems.last()).toHaveAttribute('alt', '');
    await expect(emblems.last().locator('xpath=..')).toHaveAttribute('aria-hidden', 'true');
    const emblemResponse = await request.get(emblemPath);
    expect(emblemResponse.ok()).toBe(true);
    expect(emblemResponse.headers()['content-type']).toMatch(/^image\//);

    await expect(page.getByText('sorukluorder.org', { exact: true })).toHaveCount(1);
    await expect(page.locator('a[href*="sorukluorder.org"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByText('May the Light guide us.', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Founder and Steward', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/sexual abuse/i)).toHaveCount(0);

    const headingLevels = await page
      .locator('.order-page h1, .order-page h2, .order-page h3')
      .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
    expect(headingLevels[0]).toBe(1);
    expect(
      headingLevels.every((level, index) => index === 0 || level <= headingLevels[index - 1] + 1),
    ).toBe(true);
    expect(
      await page
        .locator('.order-page a')
        .evaluateAll((links) =>
          links.every((link) =>
            Boolean(link.textContent?.trim() || link.getAttribute('aria-label')),
          ),
        ),
    ).toBe(true);

    const actions = page.locator('.order-action');
    for (let index = 0; index < (await actions.count()); index += 1) {
      expect((await actions.nth(index).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    }
    await actions.first().focus();
    expect(
      await actions.first().evaluate((element) => {
        const styles = getComputedStyle(element);

        return { outlineStyle: styles.outlineStyle, outlineWidth: styles.outlineWidth };
      }),
    ).toEqual({ outlineStyle: 'solid', outlineWidth: '2px' });
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
    await expect(footer.getByRole('link', { name: 'About', exact: true })).toHaveAttribute(
      'href',
      '/about',
    );
    await expect(footer.getByRole('link', { name: 'Soruklu Order', exact: true })).toHaveAttribute(
      'href',
      orderPath,
    );
    await expect(footer.getByRole('link', { name: 'Velari', exact: true })).toHaveAttribute(
      'href',
      '/velari',
    );
    await expect(
      page.locator('.site-nav').getByRole('link', { name: 'About', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.locator('.site-nav').getByRole('link', { name: 'Soruklu Order' }),
    ).toHaveCount(0);
    await expect(page.locator('.site-nav').getByRole('link', { name: 'Velari' })).toHaveCount(0);
    await expect(
      page.locator('.mobile-nav').getByRole('link', { name: 'About', exact: true }),
    ).toHaveCount(0);
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
        const emblem = document.querySelector('.order-hero-mark')?.getBoundingClientRect();
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

    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(orderPath);
    await page.addStyleTag({ content: 'html { font-size: 125%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      321,
    );
    await expect(page.getByRole('heading', { level: 1, name: 'The Soruklu Order' })).toBeVisible();

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
      closing: getComputedStyle(document.querySelector('.order-closing') as HTMLElement)
        .backgroundColor,
      footer: getComputedStyle(document.querySelector('app-site-footer') as HTMLElement)
        .backgroundColor,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(darkColors.heading).toBe('rgb(245, 247, 250)');
    expect(darkColors.closing).toBe(darkColors.footer);

    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'light'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    const lightColors = await page.locator('.order-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      closing: getComputedStyle(document.querySelector('.order-closing') as HTMLElement)
        .backgroundColor,
      footer: getComputedStyle(document.querySelector('app-site-footer') as HTMLElement)
        .backgroundColor,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(lightColors.heading).toBe('rgb(17, 24, 39)');
    expect(lightColors.background).not.toBe(darkColors.background);
    expect(lightColors.closing).toBe(lightColors.footer);

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
    const webpage = graph.find((entity) => entity['@type'] === 'AboutPage');

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
    expect(getMetaContent(html, 'name', 'twitter:title')).toBe(pageSeoMetadata.sorukluOrder.title);
    expect(getMetaContent(html, 'name', 'twitter:description')).toBe(
      pageSeoMetadata.sorukluOrder.description,
    );
    expect(graph.map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'AboutPage',
      'WebSite',
      'Person',
    ]);
    expect(webpage).toEqual(
      expect.objectContaining({
        '@id': `${canonicalUrl}#webpage`,
        about: {
          '@type': 'Thing',
          name: 'The Soruklu Order',
          description: pageSeoMetadata.sorukluOrder.description,
          inLanguage: 'en-GB',
        },
        isPartOf: { '@id': `${canonicalBaseUrl}/#website` },
        author: { '@id': `${canonicalBaseUrl}/#person` },
        inLanguage: 'en-GB',
      }),
    );
    expect(graph.some((entity) => entity['@type'] === 'Organization')).toBe(false);
    expect(JSON.stringify(graph)).not.toContain('May the Light guide us.');
    expect(JSON.stringify(graph)).not.toContain('sorukluorder.org');
    expect(JSON.stringify(graph)).not.toMatch(
      /GovernmentOrganization|PoliceStation|Courthouse|LegalService|MilitaryOrganization/,
    );
  });

  test('Velari renders the authored belief framework without institutional associations', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(velariPath);
    await expect(page.getByRole('heading', { level: 1, name: 'Velari' })).toBeVisible();
    await expect(page.getByText('A modern belief framework', { exact: true })).toBeVisible();
    await expect(
      page.getByText(/An evolving personal belief framework and writing project/),
    ).toBeVisible();
    await expect(page.getByText(/explores an approach called Helio-pantheism/)).toBeVisible();
    await expect(
      page.getByText(/not currently an organised religion or membership body/),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What Velari is' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Light as a symbol' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Ideas explored through practice' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Three works in progress' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Written by Serhat Soruklu' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Velari on Instagram' })).toBeVisible();

    await expect(page.locator('.velari-symbol__word')).toHaveText([
      'Discipline',
      'Indomitable',
      'Resilience',
      'Equanimity',
    ]);
    await expect(page.locator(`img[src="${velariEmblemPath}"]`)).toHaveCount(2);
    await expect(page.locator('.velari-manuscripts h3')).toHaveText([
      'The Book of Light',
      'The Book of Shadow',
      'The Book of the Path',
    ]);

    const pageText = await page.locator('.velari-page').innerText();
    expect(pageText).not.toContain('Soruklu Order');
    expect(pageText).not.toContain('Founder and current steward');
    expect(pageText).not.toContain('The Velarian Path');
    expect(pageText).not.toContain('The Velarian Code');
    expect(pageText).not.toMatch(/prophet|deity|divine messenger|infallible authority/i);
    expect(pageText.match(/May the Light guide us\./g)).toHaveLength(1);
    await expect(page.locator('.velari-page a[href="/soruklu-order"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);

    const profileLinks = page.locator(`a[href="${velariInstagramUrl}"]`);
    await expect(profileLinks).toHaveCount(4);
    for (let index = 0; index < (await profileLinks.count()); index += 1) {
      await expect(profileLinks.nth(index)).toHaveAttribute('target', '_blank');
      await expect(profileLinks.nth(index)).toHaveAttribute('rel', 'me noopener noreferrer');
      await expect(profileLinks.nth(index)).toHaveAttribute(
        'aria-label',
        'Open Velari on Instagram',
      );
    }

    const emblemResponse = await request.get(velariEmblemPath);
    expect(emblemResponse.ok()).toBe(true);
    expect(emblemResponse.headers()['content-type']).toMatch(/^image\//);
    await expect(page.getByText('Public material is being prepared.')).toHaveCount(0);

    const response = await request.get(velariPath);
    const html = await response.text();
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const graph = getRouteGraph(html);
    const webpage = graph.find((entity) => entity['@id'] === `${canonicalBaseUrl}/velari#webpage`);
    const velari = graph.find((entity) => entity['@id'] === `${canonicalBaseUrl}/velari#velari`);

    expect(response.ok()).toBe(true);
    expect(getMetaContent(html, 'name', 'robots')).toBe('index, follow');
    expect(getMetaContent(html, 'name', 'description')).toBe(pageSeoMetadata.velari.description);
    expect(getCanonicalHref(html)).toBe(`${canonicalBaseUrl}/velari`);
    expect(webpage).toEqual(
      expect.objectContaining({
        '@type': 'AboutPage',
        mainEntity: { '@id': `${canonicalBaseUrl}/velari#velari` },
        creator: { '@id': `${canonicalBaseUrl}/#person` },
      }),
    );
    expect(velari).toEqual(
      expect.objectContaining({
        '@type': 'CreativeWork',
        name: 'Velari',
        genre: ['Personal belief framework', 'Philosophical writing'],
        sameAs: [velariInstagramUrl],
      }),
    );
    expect(graph.filter((entity) => entity['@type'] === 'CreativeWork')).toHaveLength(4);
    expect(graph.some((entity) => entity['@type'] === 'Organization')).toBe(false);
    expect(JSON.stringify(graph)).toContain('Helio-pantheism');
    expect(JSON.stringify(graph)).not.toContain('Soruklu Order');
    expect(JSON.stringify(graph)).not.toContain('May the Light guide us.');
    expect(sitemap.match(/<loc>https:\/\/serhatsoruklu\.com\/velari<\/loc>/g)).toHaveLength(1);
    assertNoConsoleErrors();
  });

  test('Velari remains bounded and readable at every required viewport', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(velariPath);

      const layout = await page.evaluate(() => {
        const frame = document.querySelector('.velari-frame')?.getBoundingClientRect();
        const compass = document.querySelector('.velari-symbol__compass')?.getBoundingClientRect();
        const symbol = document.querySelector('.velari-symbol__image')?.getBoundingClientRect();
        const words = Array.from(document.querySelectorAll('.velari-symbol__word')).map((word) => {
          const box = word.getBoundingClientRect();

          return { top: box.top, right: box.right, bottom: box.bottom, left: box.left };
        });
        const manuscriptCards = Array.from(
          document.querySelectorAll('.velari-manuscripts article'),
        ).map((card) => {
          const box = card.getBoundingClientRect();

          return { left: box.left, right: box.right, height: box.height };
        });

        return {
          frameLeft: frame?.left ?? -1,
          frameRight: frame?.right ?? -1,
          compassLeft: compass?.left ?? -1,
          compassRight: compass?.right ?? -1,
          compassTop: compass?.top ?? -1,
          compassBottom: compass?.bottom ?? -1,
          symbol: symbol
            ? { top: symbol.top, right: symbol.right, bottom: symbol.bottom, left: symbol.left }
            : null,
          words,
          manuscriptCards,
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
      expect(layout.compassLeft).toBeGreaterThanOrEqual(19);
      expect(layout.compassRight).toBeLessThanOrEqual(layout.viewportWidth - 19);
      expect(layout.words).toHaveLength(4);
      expect(layout.manuscriptCards).toHaveLength(3);

      for (const word of layout.words) {
        expect(word.left).toBeGreaterThanOrEqual(layout.compassLeft);
        expect(word.right).toBeLessThanOrEqual(layout.compassRight);
        expect(word.top).toBeGreaterThanOrEqual(layout.compassTop);
        expect(word.bottom).toBeLessThanOrEqual(layout.compassBottom);

        if (layout.symbol) {
          const overlapsSymbol = !(
            word.right <= layout.symbol.left ||
            word.left >= layout.symbol.right ||
            word.bottom <= layout.symbol.top ||
            word.top >= layout.symbol.bottom
          );
          expect(overlapsSymbol, `${viewport.width}px word overlaps symbol`).toBe(false);
        }
      }

      for (const card of layout.manuscriptCards) {
        expect(card.left).toBeGreaterThanOrEqual(19);
        expect(card.right).toBeLessThanOrEqual(layout.viewportWidth - 19);
        expect(card.height).toBeGreaterThan(0);
      }
    }

    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(velariPath);
    await page.addStyleTag({ content: 'html { font-size: 125%; }' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      321,
    );
    await expect(page.getByRole('heading', { level: 1, name: 'Velari' })).toBeVisible();

    const actions = page.locator('.velari-action');
    for (let index = 0; index < (await actions.count()); index += 1) {
      expect((await actions.nth(index).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(48);
    }
    const symbolWords = page.locator('.velari-symbol__word');
    for (let index = 0; index < (await symbolWords.count()); index += 1) {
      expect((await symbolWords.nth(index).boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    await actions.first().focus();
    expect(
      await actions.first().evaluate((element) => {
        const styles = getComputedStyle(element);

        return { outlineStyle: styles.outlineStyle, outlineWidth: styles.outlineWidth };
      }),
    ).toEqual({ outlineStyle: 'solid', outlineWidth: '2px' });

    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
      await actions.first().evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');
    assertNoConsoleErrors();
  });

  test('Velari social artwork embeds the unchanged symbol and grounded positioning', async ({
    page,
    request,
  }) => {
    const socialPath = pageSeoMetadata.velari.ogImage;
    const [socialResponse, socialSourceResponse] = await Promise.all([
      request.get(socialPath),
      request.get(velariSocialSourcePath),
    ]);
    const socialSource = await socialSourceResponse.text();

    expect(socialResponse.ok()).toBe(true);
    expect(socialResponse.headers()['content-type']).toContain('image/png');
    expect(socialSourceResponse.ok()).toBe(true);
    expect(socialSource).toContain('href="data:image/jpeg;base64,');
    expect(socialSource).not.toContain('href="/assets/brand/');
    expect(socialSource).toContain('A MODERN BELIEF FRAMEWORK');
    expect(socialSource).toContain('HELIO-PANTHEISM');
    expect(socialSource).toContain('VELARI SYMBOL');
    expect(socialSource).not.toContain('MAY THE LIGHT GUIDE US.');

    await page.setViewportSize({ width: 1200, height: 630 });
    await page.goto(socialPath);
    const image = page.locator('img');
    await expect(image).toBeVisible();
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(1200);
    expect(await image.evaluate((element: HTMLImageElement) => element.naturalHeight)).toBe(630);
  });

  test('Soruklu Order social image and family mark are available at their declared dimensions', async ({
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
    expect(socialSource).toContain('FAMILY STEWARDSHIP · ESTABLISHED 2025');
    expect(socialSource).toContain('FAMILY MARK');
    expect(socialSource).not.toContain('OFFICIAL EMBLEM');

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
