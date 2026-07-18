import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const canonicalBaseUrl = 'https://serhatsoruklu.com';
const velariPath = '/velari';
const instagramUrl = 'https://www.instagram.com/velarifaith/';
const emblemPath = '/assets/brand/velari/velari-faith-emblem.jpg';
const socialSourcePath = '/assets/social/serhat-soruklu-velari-og.svg';
const bookInstagramUrls = [
  'https://www.instagram.com/p/DZ47ZQ6oE2V',
  'https://www.instagram.com/p/DZ47fd0oBkf/',
  'https://www.instagram.com/p/DZ47lu4o3AF/',
] as const;
const viewports = [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
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

test.describe('Velari identity page', () => {
  test('renders the approved framework, authority boundaries, and exact official presence', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(velariPath);

    await expect(page.getByRole('heading', { level: 1, name: 'Velari' })).toBeVisible();
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'What Is Velari?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Become. Refine. Awaken.' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Principles That Must Be Practised' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Founded by Serhat Soruklu' })).toBeVisible();
    await expect(
      page.getByText(/not as a prophet, deity, divine messenger or infallible authority/),
    ).toBeVisible();
    await expect(
      page.getByText(/does not define or represent the beliefs of the wider Soruklu family/),
    ).toBeVisible();
    await expect(page.getByText(/victims deserve harm because of karma/)).toBeVisible();
    await expect(page.getByText('Public material is being prepared.')).toHaveCount(0);

    const bookSection = page.locator('.velari-section--texts');
    await expect(bookSection.locator('.velari-book-entry')).toHaveCount(3);
    await expect(bookSection.locator('.velari-book')).toHaveCount(3);
    await expect(bookSection.locator('svg.velari-book-art')).toHaveCount(3);
    await expect(bookSection.locator('img')).toHaveCount(0);
    await expect(page.getByText('The Book of Light', { exact: true })).toBeVisible();
    await expect(page.getByText('The Book of Shadow', { exact: true })).toBeVisible();
    await expect(page.getByText('The Book of the Path', { exact: true })).toBeVisible();
    await expect(page.getByText('Developing work', { exact: true })).toHaveCount(3);
    await expect(page.getByText('Awakening · Sun · Virtue · Clarity')).toBeVisible();
    await expect(page.getByText('Darkness · Fear · Ego · Illusion · Suffering')).toBeVisible();
    await expect(page.getByText('Guidance Through Darkness · Carried by Light')).toBeVisible();
    const bookLinks = bookSection.locator('.velari-book-meta__link');
    await expect(bookLinks).toHaveCount(3);
    for (let index = 0; index < bookInstagramUrls.length; index += 1) {
      await expect(bookLinks.nth(index)).toHaveAttribute('href', bookInstagramUrls[index]);
      await expect(bookLinks.nth(index)).toHaveAttribute('target', '_blank');
      await expect(bookLinks.nth(index)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(bookLinks.nth(index)).toHaveAttribute(
        'aria-label',
        `View ${['The Book of Light', 'The Book of Shadow', 'The Book of the Path'][index]} on Instagram`,
      );
    }
    await expect(
      page.locator('app-site-footer').getByRole('link', { name: 'Velari', exact: true }),
    ).toHaveAttribute('aria-current', 'page');

    const officialLinks = page.locator(`a[href="${instagramUrl}"]`);
    await expect(officialLinks).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(officialLinks.nth(index)).toHaveAttribute('target', '_blank');
      await expect(officialLinks.nth(index)).toHaveAttribute('rel', 'me noopener noreferrer');
      await expect(officialLinks.nth(index)).toHaveAttribute(
        'aria-label',
        'Open the official Velari Faith account on Instagram',
      );
    }

    const emblem = page.locator(`img[src="${emblemPath}"]`);
    await expect(emblem).toHaveCount(1);
    await expect(emblem).toHaveAttribute('alt', 'Velari faith emblem');
    await expect(emblem).toHaveAttribute('width', '1080');
    await expect(emblem).toHaveAttribute('height', '1080');
    expect((await request.get(emblemPath)).ok()).toBe(true);

    const localOrigin = new URL(page.url()).origin;
    const imageOrigins = await page
      .locator('img')
      .evaluateAll((images) =>
        images.map((image) => new URL((image as HTMLImageElement).src).origin),
      );
    expect(imageOrigins.every((origin) => origin === localOrigin)).toBe(true);

    const lowerText = (await page.locator('.velari-page').innerText()).toLowerCase();
    for (const phrase of [
      'last religion',
      'largest religion',
      'replace all religions',
      'millions of followers',
      'everyone will follow',
      'divinely guaranteed',
    ]) {
      expect(lowerText).not.toContain(phrase);
    }
    assertNoConsoleErrors();
  });

  test('Explore the Velarian Path scrolls in place and internal actions retain router semantics', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(velariPath);
    const framework = page.locator('#velari-framework');
    await page.getByRole('button', { name: 'Explore the Velarian Path' }).click();

    await expect(page).toHaveURL(new RegExp(`${velariPath}$`));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await expect(framework).toBeInViewport();
    await expect(
      page.getByRole('link', { name: 'Explore the Soruklu Order' }).first(),
    ).toHaveAttribute('href', '/soruklu-order');
    await expect(page.getByRole('link', { name: 'Return to Serhat Soruklu' })).toHaveAttribute(
      'href',
      '/',
    );
    assertNoConsoleErrors();
  });

  test('the hero compass reveals four principle definitions on hover and keyboard focus', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto(velariPath);
    const compass = page.locator('.velari-emblem-principles');
    const principles = compass.locator('.velari-emblem-principle');
    await expect(principles).toHaveCount(4);
    await expect(principles).toHaveText(['Discipline', 'Indomitable', 'Resilience', 'Equanimity']);

    const discipline = principles.filter({ hasText: 'Discipline' });
    await discipline.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText(
      'The practice of choosing what is right, repeatedly, even when it is difficult.',
    );
    await expect(tooltip).toBeVisible();
    await expect(discipline).toHaveCSS('color', 'rgb(240, 213, 140)');
    await expect(discipline).toHaveAttribute('aria-describedby', /app-tooltip-/);

    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
    const equanimity = principles.filter({ hasText: 'Equanimity' });
    await equanimity.focus();
    await expect(page.getByRole('tooltip')).toHaveText(
      'Calm judgement maintained through gain, loss and uncertainty.',
    );
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.reload();
      const bounds = await page.locator('.velari-emblem-principle').evaluateAll((elements) =>
        elements.map((element) => {
          const box = element.getBoundingClientRect();
          return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
        }),
      );
      const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

      expect(bounds).toHaveLength(4);
      expect(
        bounds.every(
          (bound) =>
            bound.left >= 0 &&
            bound.right <= viewport.width &&
            bound.top >= 0 &&
            bound.bottom <= documentHeight,
        ),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width + 1,
      );
    }

    assertNoConsoleErrors();
  });

  test('remains bounded, touch-safe, and footer-aligned at every required viewport', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(velariPath);

      const initialLayout = await page.evaluate(() => {
        const frame = document.querySelector('.velari-frame')?.getBoundingClientRect();
        const copy = document.querySelector('.velari-hero__copy')?.getBoundingClientRect();
        const emblem = document.querySelector('.velari-emblem')?.getBoundingClientRect();
        const framework = document.querySelector('#velari-framework')?.getBoundingClientRect();
        const actions = Array.from(document.querySelectorAll<HTMLElement>('.velari-action')).map(
          (action) => action.getBoundingClientRect().height,
        );

        return {
          frameLeft: frame?.left ?? -1,
          frameRight: frame?.right ?? -1,
          copyTop: copy?.top ?? -1,
          emblemLeft: emblem?.left ?? -1,
          emblemRight: emblem?.right ?? -1,
          emblemTop: emblem?.top ?? -1,
          emblemBottom: emblem?.bottom ?? -1,
          frameworkTop: framework?.top ?? -1,
          minActionHeight: Math.min(...actions),
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      expect(initialLayout.scrollWidth).toBeLessThanOrEqual(initialLayout.viewportWidth + 1);
      expect(initialLayout.frameLeft).toBeGreaterThanOrEqual(19);
      expect(initialLayout.frameRight).toBeLessThanOrEqual(initialLayout.viewportWidth - 19);
      expect(initialLayout.copyTop).toBeGreaterThanOrEqual(96);
      expect(initialLayout.emblemLeft).toBeGreaterThanOrEqual(0);
      expect(initialLayout.emblemRight).toBeLessThanOrEqual(initialLayout.viewportWidth);
      expect(initialLayout.emblemBottom).toBeGreaterThan(initialLayout.emblemTop);
      expect(initialLayout.minActionHeight).toBeGreaterThanOrEqual(44);

      if (viewport.width >= 1024) {
        expect(initialLayout.frameworkTop).toBeLessThanOrEqual(viewport.height + 200);
      }

      await page.locator('.velari-section--texts').scrollIntoViewIfNeeded();
      const bookLayout = await page.evaluate(() => {
        const entries = Array.from(document.querySelectorAll<HTMLElement>('.velari-book-entry'));
        const books = Array.from(document.querySelectorAll<HTMLElement>('.velari-book'));
        const links = Array.from(document.querySelectorAll<HTMLElement>('.velari-book-meta__link'));

        return {
          rowCount: new Set(entries.map((entry) => Math.round(entry.getBoundingClientRect().top)))
            .size,
          books: books.map((book) => {
            const box = book.getBoundingClientRect();
            const art = book.querySelector('svg.velari-book-art');

            return {
              left: box.left,
              right: box.right,
              width: box.width,
              transform: getComputedStyle(book).transform,
              artVisible: Boolean(art && art.getBoundingClientRect().width > 0),
            };
          }),
          minLinkHeight: Math.min(...links.map((link) => link.getBoundingClientRect().height)),
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      expect(bookLayout.scrollWidth).toBeLessThanOrEqual(bookLayout.viewportWidth + 1);
      expect(bookLayout.rowCount).toBe(viewport.width < 768 ? 3 : viewport.width < 1180 ? 2 : 1);
      expect(bookLayout.minLinkHeight).toBeGreaterThanOrEqual(44);
      expect(bookLayout.books).toHaveLength(3);
      expect(
        bookLayout.books.every(
          (book) =>
            book.left >= 0 &&
            book.right <= bookLayout.viewportWidth &&
            book.width > 200 &&
            book.transform !== 'none' &&
            book.artVisible,
        ),
      ).toBe(true);

      const firstBookLink = page.locator('.velari-book-meta__link').first();
      await firstBookLink.focus();
      expect(
        await firstBookLink.evaluate((element) => ({
          style: getComputedStyle(element).outlineStyle,
          width: getComputedStyle(element).outlineWidth,
        })),
      ).toEqual({ style: 'solid', width: '2px' });

      await page.locator('app-site-footer').scrollIntoViewIfNeeded();
      const footerLayout = await page.evaluate(() => {
        const closing = document.querySelector('.velari-closing')?.getBoundingClientRect();
        const footer = document.querySelector('app-site-footer')?.getBoundingClientRect();
        const groups = Array.from(document.querySelectorAll('.site-footer__group')).map((group) => {
          const box = group.getBoundingClientRect();
          return { top: Math.round(box.top), left: box.left, right: box.right };
        });

        return {
          closingBottom: closing?.bottom ?? -1,
          footerTop: footer?.top ?? -1,
          groupRows: new Set(groups.map((group) => group.top)).size,
          groups,
        };
      });

      expect(Math.abs(footerLayout.footerTop - footerLayout.closingBottom)).toBeLessThanOrEqual(1);
      expect(footerLayout.groups).toHaveLength(4);
      expect(footerLayout.groups.every((group) => group.left >= 0)).toBe(true);
      expect(footerLayout.groups.every((group) => group.right <= initialLayout.viewportWidth)).toBe(
        true,
      );
      expect(footerLayout.groupRows).toBe(viewport.width >= 1024 ? 1 : 2);
    }

    assertNoConsoleErrors();
  });

  test('supports dark, light, and both system-theme resolutions without reduced-motion effects', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(velariPath);
    const dark = await page.locator('.velari-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(dark.heading).toBe('rgb(248, 241, 228)');

    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'light'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    const light = await page.locator('.velari-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
      eyebrow: getComputedStyle(element.querySelector('.velari-eyebrow') as HTMLElement).color,
    }));
    expect(light.heading).toBe('rgb(32, 39, 55)');
    expect(light.eyebrow).toBe('rgb(148, 105, 30)');
    expect(light.background).not.toBe(dark.background);

    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'system'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    expect(
      await page
        .locator('.velari-action')
        .first()
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');
    expect(
      await page
        .locator('.velari-book')
        .first()
        .evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');

    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    expect(
      await page.locator('.velari-page h1').evaluate((element) => getComputedStyle(element).color),
    ).toBe('rgb(32, 39, 55)');
    assertNoConsoleErrors();
  });

  test('serves exact public metadata, structured data, sitemap entry, and self-contained artwork', async ({
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
        entity['@type'] === 'CreativeWork' && entity['creativeWorkStatus'] === 'Developing work',
    );
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const socialSource = await (await request.get(socialSourcePath)).text();
    const socialResponse = await request.get(pageSeoMetadata.velari.ogImage);

    expect(response.ok()).toBe(true);
    expect(html.match(/<title>(.*?)<\/title>/)?.[1]).toBe(pageSeoMetadata.velari.title);
    expect(getMetaContent(html, 'name', 'description')).toBe(pageSeoMetadata.velari.description);
    expect(getCanonicalHref(html)).toBe(canonicalUrl);
    expect(getMetaContent(html, 'name', 'robots')).toBe('index, follow');
    expect(getMetaContent(html, 'property', 'og:url')).toBe(canonicalUrl);
    expect(getMetaContent(html, 'property', 'og:site_name')).toBe('Serhat Soruklu');
    expect(getMetaContent(html, 'property', 'og:type')).toBe('website');
    expect(getMetaContent(html, 'property', 'og:image')).toBe(
      `${canonicalBaseUrl}${pageSeoMetadata.velari.ogImage}`,
    );
    expect(getMetaContent(html, 'property', 'og:image:type')).toBe('image/png');
    expect(getMetaContent(html, 'property', 'og:image:width')).toBe('1200');
    expect(getMetaContent(html, 'property', 'og:image:height')).toBe('630');
    expect(getMetaContent(html, 'property', 'og:image:alt')).toBe(
      pageSeoMetadata.velari.ogImageAlt,
    );
    expect(getMetaContent(html, 'name', 'twitter:card')).toBe('summary_large_image');
    expect(getMetaContent(html, 'name', 'twitter:image:alt')).toBe(
      pageSeoMetadata.velari.ogImageAlt,
    );

    expect(webpage).toEqual(
      expect.objectContaining({
        '@type': 'WebPage',
        mainEntity: { '@id': `${canonicalUrl}#velari` },
        creator: { '@id': `${canonicalBaseUrl}/#person` },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
      }),
    );
    expect(velari).toEqual(
      expect.objectContaining({
        '@type': 'CreativeWork',
        alternateName: ['Velari Faith', 'The Velarian Path'],
        sameAs: [instagramUrl],
        creator: { '@id': `${canonicalBaseUrl}/#person` },
      }),
    );
    expect(developingWorks).toHaveLength(3);
    expect(graph.filter((entity) => entity['@type'] === 'Person')).toHaveLength(1);
    expect(graph.filter((entity) => entity['@type'] === 'WebSite')).toHaveLength(1);
    expect(JSON.stringify(graph)).not.toMatch(/Prophet|Deity|Supernatural|followerCount/i);
    expect(sitemap.match(/<loc>https:\/\/serhatsoruklu\.com\/velari<\/loc>/g)).toHaveLength(1);

    expect(socialResponse.ok()).toBe(true);
    expect(socialResponse.headers()['content-type']).toContain('image/png');
    expect(socialSource).toContain('href="data:image/jpeg;base64,');
    expect(socialSource).not.toContain('href="/assets/');
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
