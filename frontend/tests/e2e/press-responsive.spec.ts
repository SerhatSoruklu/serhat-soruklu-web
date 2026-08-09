import { expect, test } from '@playwright/test';
import type { Locator, Page, Request, Response, TestInfo } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

import { installConsoleErrorGuard } from './support/console-errors';

const pressPath = '/press';
const themeStorageKey = 'serhatsoruklu-theme';
const identityLanguageStorageKey = 'serhatsoruklu-identity-language';
const screenshotDirectory = 'test-results/press-review';

const viewports = [
  { name: 'minimum-mobile', width: 320, height: 700 },
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mini-laptop', width: 1024, height: 768 },
  { name: 'medium-laptop', width: 1280, height: 800 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1728, height: 1117 },
  { name: 'wide-desktop', width: 1920, height: 1080 },
] as const;

const seamViewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mini-laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide-desktop', width: 1920, height: 1080 },
] as const;

const pressAssets = [
  {
    height: 1341,
    path: '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
    type: /^image\/png/,
    width: 1173,
  },
  {
    height: 1086,
    path: '/assets/home/serhat-soruklu-founder-light.png',
    type: /^image\/png/,
    width: 1448,
  },
  {
    height: 1086,
    path: '/assets/home/serhat-soruklu-founder-dark.png',
    type: /^image\/png/,
    width: 1448,
  },
  {
    height: 630,
    path: '/assets/social/serhat-soruklu-systems-coupyn-og.png',
    type: /^image\/png/,
    width: 1200,
  },
] as const;

const downloadableAssets = [
  {
    fileName: 'serhat-soruklu-ceo-founder-of-coupyn.png',
    path: '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
  },
  {
    fileName: 'serhat-soruklu-founder-light.png',
    path: '/assets/home/serhat-soruklu-founder-light.png',
  },
  {
    fileName: 'serhat-soruklu-founder-dark.png',
    path: '/assets/home/serhat-soruklu-founder-dark.png',
  },
  {
    fileName: 'serhat-soruklu-systems-coupyn-og.png',
    path: '/assets/social/serhat-soruklu-systems-coupyn-og.png',
  },
  {
    fileName: 'serhat-soruklu-systems-coupyn-og.svg',
    path: '/assets/social/serhat-soruklu-systems-coupyn-og.svg',
  },
] as const;

const internalRoutes = [
  '/about',
  '/contact',
  '/systems/coupyn',
  '/systems/chatpdm',
  '/systems/deterministic-boundary-firewall',
  '/systems/continuity-identity-model',
] as const;

const verificationLinks = [
  {
    href: 'https://find-and-update.company-information.service.gov.uk/company/16939840',
    name: 'Companies House',
    rel: 'noopener noreferrer',
  },
  {
    href: 'https://github.com/SerhatSoruklu',
    name: 'GitHub',
    rel: 'me noopener noreferrer',
  },
  {
    href: 'https://orcid.org/0009-0006-8963-5986',
    name: 'ORCID',
    rel: 'me noopener noreferrer',
  },
  {
    href: 'https://www.linkedin.com/in/serhatsoruklu/',
    name: 'LinkedIn',
    rel: 'me noopener noreferrer',
  },
  {
    href: 'https://coupyn.com/',
    name: 'Coupyn',
    rel: 'noopener noreferrer',
  },
  {
    href: 'https://serhatsoruklu.com/',
    name: 'SerhatSoruklu.com',
    rel: 'me noopener noreferrer',
  },
] as const;

function installLocalResourceFailureGuard(page: Page, testInfo: TestInfo): () => void {
  const baseUrl = testInfo.project.use.baseURL;
  const failures: string[] = [];

  if (typeof baseUrl !== 'string') {
    throw new TypeError('The Playwright project must define a baseURL for local-resource checks.');
  }

  const localOrigin = new URL(baseUrl).origin;
  const isLocal = (url: string): boolean => {
    try {
      return new URL(url).origin === localOrigin;
    } catch {
      return false;
    }
  };

  const requestFailedListener = (request: Request): void => {
    if (!isLocal(request.url())) {
      return;
    }

    failures.push(
      `request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown error'})`,
    );
  };
  const responseListener = (response: Response): void => {
    if (isLocal(response.url()) && response.status() >= 400) {
      failures.push(`HTTP ${response.status()}: ${response.request().method()} ${response.url()}`);
    }
  };

  page.on('requestfailed', requestFailedListener);
  page.on('response', responseListener);

  return () => {
    page.off('requestfailed', requestFailedListener);
    page.off('response', responseListener);
    expect(failures, failures.join('\n')).toEqual([]);
  };
}

async function setStoredTheme(page: Page, theme: 'dark' | 'light' | 'system'): Promise<void> {
  await page.evaluate(({ key, value }) => globalThis.localStorage.setItem(key, value), {
    key: themeStorageKey,
    value: theme,
  });
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveClass(
    theme === 'system' ? /theme-system/ : new RegExp(`theme-${theme}`),
  );
}

async function waitForFonts(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });
}

async function waitForPressImages(page: Page): Promise<void> {
  const images = page.locator('.press-page img');

  await expect(images).toHaveCount(pressAssets.length);
  for (let index = 0; index < pressAssets.length; index += 1) {
    const image = images.nth(index);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
}

async function visibleHeaderGeometry(page: Page): Promise<{ bottom: number; top: number }> {
  return page.evaluate(() => {
    const header = Array.from(
      globalThis.document.querySelectorAll<HTMLElement>(
        '[data-testid="desktop-header"], [data-testid="mobile-header"]',
      ),
    ).find((element) => {
      const box = element.getBoundingClientRect();
      const styles = getComputedStyle(element);

      return (
        box.width > 0 &&
        box.height > 0 &&
        styles.display !== 'none' &&
        styles.visibility !== 'hidden'
      );
    });
    const box = header?.getBoundingClientRect();

    return { bottom: box?.bottom ?? -1, top: box?.top ?? -1 };
  });
}

async function expectVisibleKeyboardFocus(locator: Locator, label: string): Promise<void> {
  await expect(locator, label).toBeFocused();
  const focusIndicator = await locator.evaluate((element) => {
    const styles = getComputedStyle(element);

    return {
      boxShadow: styles.boxShadow,
      outlineStyle: styles.outlineStyle,
      outlineWidth: Number.parseFloat(styles.outlineWidth),
    };
  });

  expect(
    (focusIndicator.outlineStyle !== 'none' && focusIndicator.outlineWidth >= 1) ||
      focusIndicator.boxShadow !== 'none',
    `${label}: keyboard focus must remain visibly indicated`,
  ).toBe(true);
}

test.describe('Press and media page', () => {
  test('renders factual semantic content, safe media actions, verification links, and footer discovery', async ({
    page,
    request,
  }, testInfo) => {
    test.setTimeout(90_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pressPath, { waitUntil: 'networkidle' });

    const pressPage = page.locator('.press-page');
    await expect(pressPage).toHaveAttribute('lang', 'en-GB');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('main main')).toHaveCount(0);
    await expect(pressPage.locator('h1')).toHaveCount(1);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Serhat Soruklu & Coupyn' }),
    ).toBeVisible();
    await expect(pressPage).toContainText(
      'Verified facts, biographies, images and background material for journalists, researchers and media enquiries.',
    );
    await expect(pressPage).toContainText('first-party reference material');

    await expect(page.getByRole('heading', { level: 2, name: 'Quick facts' })).toBeVisible();
    await expect(page.locator('.press-fact-sheet')).toHaveCount(2);
    const factDefinitions = page.locator('.press-fact-sheet__facts > dl');
    await expect(factDefinitions).toHaveCount(17);
    await expect(factDefinitions.locator(':scope > dt')).toHaveCount(17);
    await expect(factDefinitions.locator(':scope > dd')).toHaveCount(17);
    await expect(page.locator('.press-fact-sheet').first()).toContainText(
      'Osmancık, Çorum, Turkey',
    );
    await expect(page.locator('.press-fact-sheet').nth(1)).toContainText('Coupyn Ltd');
    await expect(page.locator('.press-fact-sheet').nth(1)).toContainText(
      'Roughly 1 million company pages',
    );

    await expect(
      page.getByRole('heading', { level: 2, name: 'Approved biographies' }),
    ).toBeVisible();
    await expect(page.locator('.press-bio-card')).toHaveCount(2);
    await expect(page.locator('.press-bio-card').first()).toContainText('50-WORD BIO');
    await expect(page.locator('.press-bio-card').first()).toContainText(
      'Serhat Soruklu is a London-based software developer, systems architect and entrepreneur.',
    );
    await expect(page.locator('.press-bio-card').nth(1)).toContainText('100-WORD BIO');
    await expect(page.locator('.press-bios a[href="/about"]')).toHaveText(/Read full biography/);

    await expect(
      page.getByRole('heading', { level: 2, name: 'Founder photography' }),
    ).toBeVisible();
    await expect(page.locator('.press-asset-card')).toHaveCount(3);
    await expect(page.locator('.press-asset-card h3')).toHaveText([
      'Portrait',
      'Founder workstation visual — light',
      'Founder workstation visual — dark',
    ]);
    await expect(page.locator('.press-asset-card__preview > span')).toHaveText([
      'PORTRAIT',
      'AI-ASSISTED PHOTOGRAPH',
      'AI-ASSISTED PHOTOGRAPH',
    ]);
    await expect(page.locator('.press-asset-card__provenance')).toHaveText([
      'AI-assisted edited photograph. The person shown is Serhat Soruklu. Only his face was regenerated from his supplied portrait reference; the underlying body, workstation and background are real. Embedded Content Credentials identify trained algorithmic media created with gpt-image 2.0.',
      'AI-assisted edited photograph. The person shown is Serhat Soruklu. Only his face was regenerated from his supplied portrait reference; the underlying body, workstation and background are real. Embedded Content Credentials identify trained algorithmic media created with gpt-image 2.0.',
    ]);
    await expect(page.locator('.press-asset-card img').nth(1)).toHaveAttribute(
      'alt',
      'AI-assisted edited photograph of Serhat Soruklu at his bright workstation.',
    );
    await expect(page.locator('.press-asset-card img').nth(2)).toHaveAttribute(
      'alt',
      'AI-assisted edited photograph of Serhat Soruklu at his dark workstation.',
    );
    await expect(page.locator('.press-permission-note')).toContainText(
      'The workstation images are AI-assisted edited photographs of Serhat Soruklu. Only his face was regenerated from his supplied portrait reference; the underlying body, workstation and background are real.',
    );
    await expect(
      page.getByRole('heading', { level: 2, name: 'Coupyn media assets' }),
    ).toBeVisible();
    await expect(page.locator('.press-coupyn-asset')).toHaveCount(1);
    await expect(page.locator('.press-format-list > li')).toHaveCount(2);
    await waitForPressImages(page);

    const renderedImages = await page.locator('.press-page img').evaluateAll((images) =>
      images.map((image) => {
        const element = image as HTMLImageElement;
        const box = element.getBoundingClientRect();

        return {
          decoding: element.getAttribute('decoding'),
          fetchPriority: element.getAttribute('fetchpriority'),
          height: element.getAttribute('height'),
          loading: element.getAttribute('loading'),
          naturalHeight: element.naturalHeight,
          naturalWidth: element.naturalWidth,
          objectFit: getComputedStyle(element).objectFit,
          path: element.getAttribute('src'),
          renderedHeight: box.height,
          renderedWidth: box.width,
          width: element.getAttribute('width'),
        };
      }),
    );

    for (const asset of pressAssets) {
      const image = renderedImages.find(({ path }) => path === asset.path);

      expect(image, asset.path).toBeDefined();
      expect(image?.naturalWidth).toBe(asset.width);
      expect(image?.naturalHeight).toBe(asset.height);
      expect(image?.width).toBe(String(asset.width));
      expect(image?.height).toBe(String(asset.height));
      expect(image?.loading).toBe('lazy');
      expect(image?.decoding).toBe('async');
      expect(image?.fetchPriority).toBe('low');
      expect(image?.renderedWidth).toBeGreaterThan(0);
      expect(image?.renderedHeight).toBeGreaterThan(0);
      expect(
        ['contain', 'cover', 'scale-down'].includes(image?.objectFit ?? '') ||
          Math.abs(
            (image?.renderedWidth ?? 0) / (image?.renderedHeight ?? 1) - asset.width / asset.height,
          ) <= 0.02,
        `${asset.path}: the rendered image preserves its intrinsic aspect ratio`,
      ).toBe(true);
    }

    for (const asset of downloadableAssets) {
      const download = page.locator(
        `.press-page a[href="${asset.path}"][download="${asset.fileName}"]`,
      );
      const response = await request.get(asset.path);

      await expect(download).toHaveCount(1);
      expect(response.ok(), asset.path).toBe(true);
      expect(response.headers()['content-type'], asset.path).toMatch(
        asset.path.endsWith('.svg') ? /^image\/svg\+xml/ : /^image\/png/,
      );
    }

    for (const asset of pressAssets) {
      const openAction = page.locator(`.press-page a[href="${asset.path}"][target="_blank"]`);

      await expect(openAction).toHaveCount(1);
      await expect(openAction).toHaveAttribute('rel', 'noopener noreferrer');
    }

    await expect(page.getByRole('heading', { level: 2, name: 'What Coupyn is' })).toBeVisible();
    await expect(page.locator('.press-coupyn-overview')).toContainText(
      'Coupyn is a coupon, referral and affiliate intelligence platform',
    );
    await expect(page.locator('.press-technology-list > li')).toHaveText([
      'Angular',
      'Node.js',
      'Express',
      'MongoDB',
      'Technical SEO',
      'Self-managed infrastructure',
    ]);

    await expect(
      page.getByRole('heading', { level: 2, name: 'Selected technical work' }),
    ).toBeVisible();
    await expect(page.locator('.press-system-card')).toHaveCount(4);
    await expect(page.locator('.press-system-card h3')).toHaveText([
      'Coupyn',
      'ChatPDM',
      'Deterministic Boundary Firewall',
      'Continuity Identity Model',
    ]);

    await expect(
      page.getByRole('heading', { level: 2, name: 'Public reference links' }),
    ).toBeVisible();
    const verification = page.locator('.press-verification-list');
    await expect(verification.locator(':scope > li')).toHaveCount(verificationLinks.length);
    for (const expectedLink of verificationLinks) {
      const link = verification.locator(`a[href="${expectedLink.href}"]`);

      await expect(link).toHaveCount(1);
      await expect(link).toContainText(expectedLink.name);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', expectedLink.rel);
    }

    const invalidExternalLinkPolicies = await pressPage
      .locator('a[href^="http"]')
      .evaluateAll((links) =>
        links
          .filter((link) => {
            const rel = new Set((link.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));

            return (
              link.getAttribute('target') !== '_blank' ||
              !rel.has('noopener') ||
              !rel.has('noreferrer')
            );
          })
          .map((link) => link.getAttribute('href')),
      );
    expect(invalidExternalLinkPolicies).toEqual([]);

    for (const route of internalRoutes) {
      const response = await request.get(route);

      expect(response.ok(), route).toBe(true);
    }
    await expect(page.locator('.press-hero a[href="/contact"]')).toHaveCount(1);
    await expect(page.locator('.press-hero a[href="/about"]')).toHaveCount(1);
    expect(
      await page
        .locator('.press-systems a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual([
      '/systems/coupyn',
      '/systems/chatpdm',
      '/systems/deterministic-boundary-firewall',
      '/systems/continuity-identity-model',
    ]);

    const pressText = (await pressPage.textContent()) ?? '';
    expect(pressText).not.toMatch(/\bSly\b/i);
    expect(pressText).not.toMatch(/\bPress Coverage\b|\bAs seen in\b|\bMedia mentions\b/i);
    await expect(pressPage.locator('[data-testid*="language"]')).toHaveCount(0);
    await expect(pressPage.getByText(/Türkçe oku|Read in English/i)).toHaveCount(0);

    const reachUs = page.locator('[aria-labelledby="site-footer-reach-title"]');
    await expect(reachUs.getByRole('link', { name: 'Press / Media', exact: true })).toHaveAttribute(
      'href',
      '/press',
    );
    for (const groupId of [
      'site-footer-navigation-title',
      'site-footer-systems-title',
      'site-footer-identity-title',
    ]) {
      await expect(
        page
          .locator(`[aria-labelledby="${groupId}"]`)
          .getByRole('link', { name: 'Press / Media', exact: true }),
      ).toHaveCount(0);
    }

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('all ten required viewports preserve editorial bounds, media integrity, actions, and footer reachability', async ({
    page,
  }, testInfo) => {
    test.setTimeout(180_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pressPath, { waitUntil: 'networkidle' });
      await page.evaluate(() => globalThis.scrollTo({ left: 0, top: 0 }));
      await expect(
        page.getByRole('heading', { level: 1, name: 'Serhat Soruklu & Coupyn' }),
      ).toBeVisible();
      await expect(
        page.getByTestId(viewport.width >= 1024 ? 'desktop-header' : 'mobile-header'),
      ).toBeVisible();

      const layout = await page.evaluate(() => {
        const viewportWidth = globalThis.document.documentElement.clientWidth;
        const hero = globalThis.document.querySelector('.press-hero')?.getBoundingClientRect();
        const heading = globalThis.document
          .querySelector('.press-hero h1')
          ?.getBoundingClientRect();
        const header = Array.from(
          globalThis.document.querySelectorAll<HTMLElement>(
            '[data-testid="desktop-header"], [data-testid="mobile-header"]',
          ),
        ).find((element) => {
          const box = element.getBoundingClientRect();
          const styles = getComputedStyle(element);

          return (
            box.width > 0 &&
            box.height > 0 &&
            styles.display !== 'none' &&
            styles.visibility !== 'hidden'
          );
        });
        const headerBox = header?.getBoundingClientRect();
        const frames = Array.from(globalThis.document.querySelectorAll('.press-frame')).map(
          (element) => {
            const box = element.getBoundingClientRect();

            return { left: box.left, right: box.right };
          },
        );
        const boundedSelectors = [
          '.press-hero h1',
          '.press-fact-sheet dt',
          '.press-fact-sheet dd',
          '.press-bio-card',
          '.press-asset-card',
          '.press-coupyn-asset',
          '.press-system-card',
          '.press-verification-list a',
          '.press-action',
        ].join(',');
        const outOfBounds = Array.from(
          globalThis.document.querySelectorAll<HTMLElement>(boundedSelectors),
        )
          .filter((element) => {
            const box = element.getBoundingClientRect();

            return box.width > 0 && (box.left < -1 || box.right > viewportWidth + 1);
          })
          .map((element) => `${element.tagName}.${element.className}`);
        const duplicateIds = Array.from(globalThis.document.querySelectorAll<HTMLElement>('[id]'))
          .map((element) => element.id)
          .filter((id, index, ids) => ids.indexOf(id) !== index);
        const mobileActionHeights = Array.from(
          globalThis.document.querySelectorAll<HTMLElement>(
            '.press-action, .press-hero__anchor, .press-inline-link, .press-asset-card__actions a, .press-format-list a, .press-system-card a, .press-verification-list a',
          ),
        ).map((element) => ({
          height: element.getBoundingClientRect().height,
          label: element.textContent?.trim().replace(/\s+/g, ' ') ?? element.tagName,
        }));
        const assetCards = Array.from(
          globalThis.document.querySelectorAll<HTMLElement>('.press-asset-card'),
        ).map((card) => {
          const cardBox = card.getBoundingClientRect();
          const actions = Array.from(
            card.querySelectorAll<HTMLElement>('.press-asset-card__actions a'),
          ).map((action) => {
            const box = action.getBoundingClientRect();

            return { bottom: box.bottom, height: box.height, top: box.top };
          });

          return {
            actions,
            bottom: cardBox.bottom,
            clientHeight: card.clientHeight,
            scrollHeight: card.scrollHeight,
            top: cardBox.top,
          };
        });

        return {
          assetCards,
          duplicateIds,
          frameBounds: frames,
          headingLeft: heading?.left ?? -1,
          headingRight: heading?.right ?? -1,
          headingTop: heading?.top ?? -1,
          headerBottom: headerBox?.bottom ?? -1,
          heroTop: hero?.top ?? -1,
          mobileActionHeights,
          outOfBounds,
          scrollWidth: globalThis.document.documentElement.scrollWidth,
          viewportWidth,
        };
      });

      expect(layout.scrollWidth, `${viewport.name}: horizontal overflow`).toBeLessThanOrEqual(
        layout.viewportWidth + 1,
      );
      expect(layout.heroTop, `${viewport.name}: hero extends under header`).toBeLessThanOrEqual(
        layout.headerBottom,
      );
      expect(layout.headingTop, `${viewport.name}: H1 clears fixed header`).toBeGreaterThan(
        layout.headerBottom,
      );
      expect(layout.headingLeft, `${viewport.name}: H1 left edge`).toBeGreaterThanOrEqual(19);
      expect(layout.headingRight, `${viewport.name}: H1 right edge`).toBeLessThanOrEqual(
        layout.viewportWidth - 19,
      );
      expect(layout.outOfBounds, `${viewport.name}: clipped Press content`).toEqual([]);
      expect(layout.duplicateIds, `${viewport.name}: duplicate IDs`).toEqual([]);
      for (const [cardIndex, card] of layout.assetCards.entries()) {
        expect(
          card.scrollHeight,
          `${viewport.name}: asset card ${cardIndex + 1} vertical content`,
        ).toBeLessThanOrEqual(card.clientHeight + 1);
        expect(card.actions).toHaveLength(2);
        for (const [actionIndex, action] of card.actions.entries()) {
          expect(
            action.top,
            `${viewport.name}: asset card ${cardIndex + 1} action ${actionIndex + 1} top`,
          ).toBeGreaterThanOrEqual(card.top - 1);
          expect(
            action.bottom,
            `${viewport.name}: asset card ${cardIndex + 1} action ${actionIndex + 1} bottom`,
          ).toBeLessThanOrEqual(card.bottom + 1);
          expect(action.height).toBeGreaterThanOrEqual(44);
        }
      }
      for (const bounds of layout.frameBounds) {
        expect(bounds.left, `${viewport.name}: frame left gutter`).toBeGreaterThanOrEqual(19);
        expect(bounds.right, `${viewport.name}: frame right gutter`).toBeLessThanOrEqual(
          layout.viewportWidth - 19,
        );
      }
      if (viewport.width < 768) {
        for (const action of layout.mobileActionHeights) {
          expect(
            action.height,
            `${viewport.name}: ${action.label} touch target`,
          ).toBeGreaterThanOrEqual(43.5);
        }
      }

      await expect(page.locator('.press-fact-sheet dt')).not.toHaveCount(0);
      await expect(page.locator('.press-asset-card__actions a')).toHaveCount(6);
      await expect(page.locator('.press-verification-list a')).toHaveCount(
        verificationLinks.length,
      );
      await expect(page.locator('.press-hero a[href="/contact"]')).toBeVisible();
      await expect(page.locator('.press-hero a[href="/about"]')).toBeVisible();
      await waitForPressImages(page);

      const imageIntegrity = await page.locator('.press-page img').evaluateAll((images) =>
        images.map((image) => {
          const element = image as HTMLImageElement;
          const box = element.getBoundingClientRect();
          const intrinsicRatio = element.naturalWidth / element.naturalHeight;
          const renderedRatio = box.width / box.height;
          const objectFit = getComputedStyle(element).objectFit;

          return {
            complete: element.complete,
            objectFit,
            preserved:
              Math.abs(renderedRatio - intrinsicRatio) <= 0.02 ||
              ['contain', 'cover', 'scale-down'].includes(objectFit),
          };
        }),
      );
      expect(
        imageIntegrity.every(({ complete, preserved }) => complete && preserved),
        `${viewport.name}: image loading/aspect ratio`,
      ).toBe(true);

      const footer = page.locator('app-site-footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer).toBeVisible();
      await expect(
        footer.getByRole('link', { name: 'Press / Media', exact: true }),
      ).toHaveAttribute('href', '/press');
      expect(
        await page.evaluate(() => globalThis.document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(viewport.width + 1);
    }

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('hero routes and the founder-photography anchor work with fixed-header clearance', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(pressPath, { waitUntil: 'networkidle' });

    await page.locator('.press-hero a[href="/press#founder-photography"]').click();
    await expect(page).toHaveURL(/\/press#founder-photography$/);
    await expect.poll(() => page.evaluate(() => globalThis.scrollY)).toBeGreaterThan(200);

    const target = page.locator('#founder-photography');
    const targetTop = await target.evaluate((element) => element.getBoundingClientRect().top);
    const header = await visibleHeaderGeometry(page);
    expect(targetTop).toBeGreaterThanOrEqual(header.bottom + 4);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Founder photography' }),
    ).toBeVisible();

    await page.goto(pressPath);
    await page.locator('.press-hero a[href="/contact"]').click();
    await expect(page).toHaveURL('/contact');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Start With a Clear Message' }),
    ).toBeVisible();

    await page.goto(pressPath);
    await page.locator('.press-hero a[href="/about"]').click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1, name: 'Serhat Soruklu' })).toBeVisible();

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('dark, light, and system preferences stay deliberate while Press remains English-only', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(
      ({ languageKey }) => {
        globalThis.localStorage.setItem(languageKey, 'tr');
      },
      { languageKey: identityLanguageStorageKey },
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pressPath, { waitUntil: 'networkidle' });

    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(page.locator('.press-page')).toHaveAttribute('lang', 'en-GB');
    const dark = await page.locator('.press-page').evaluate((element) => ({
      background: getComputedStyle(element.closest('main') as HTMLElement).backgroundImage,
      cardBorder: getComputedStyle(element.querySelector('.press-fact-sheet') as HTMLElement)
        .borderColor,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(dark.heading).toBe('rgb(245, 247, 250)');

    await setStoredTheme(page, 'light');
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    const light = await page.locator('.press-page').evaluate((element) => ({
      background: getComputedStyle(element.closest('main') as HTMLElement).backgroundImage,
      cardBorder: getComputedStyle(element.querySelector('.press-fact-sheet') as HTMLElement)
        .borderColor,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(light.heading).toBe('rgb(17, 24, 39)');
    expect(light.background).not.toBe(dark.background);
    expect(light.cardBorder).not.toBe(dark.cardBorder);

    await page.emulateMedia({ colorScheme: 'dark' });
    await setStoredTheme(page, 'system');
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(page.locator('.press-page')).toHaveAttribute('lang', 'en-GB');
    await expect(page.locator('.press-page [data-testid*="language"]')).toHaveCount(0);
    const pageText = (await page.locator('.press-page').textContent()) ?? '';
    expect(pageText).not.toMatch(/\bSly\b/i);
    expect(pageText).toContain('Quick facts');

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('closing and footer form one intentional dark and light surface at all seam viewports', async ({
    page,
  }, testInfo) => {
    test.setTimeout(150_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    for (const viewport of seamViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pressPath, { waitUntil: 'networkidle' });

      for (const theme of ['dark', 'light'] as const) {
        await setStoredTheme(page, theme);
        await page.locator('app-site-footer').scrollIntoViewIfNeeded();

        const seam = await page.evaluate(() => {
          const closing = globalThis.document.querySelector('.press-closing') as HTMLElement;
          const footerHost = globalThis.document.querySelector('app-site-footer') as HTMLElement;
          const footer = globalThis.document.querySelector('.site-footer') as HTMLElement;
          const divider = getComputedStyle(closing, '::after');
          const closingBox = closing.getBoundingClientRect();
          const footerBox = footerHost.getBoundingClientRect();
          const closingBackground = getComputedStyle(closing).backgroundImage;
          const footerAtmosphere = getComputedStyle(footer, '::after').backgroundImage;
          const closingContinuation = closingBackground
            .slice(0, closingBackground.lastIndexOf(', linear-gradient('))
            .replace('at 50% 100%', 'at 50% 0%');

          return {
            backgroundsContinue: closingContinuation === footerAtmosphere,
            boundaryDelta: footerBox.top - closingBox.bottom,
            closingBackground,
            dividerBackground: divider.backgroundImage,
            dividerBottom: divider.bottom,
            dividerInset:
              (globalThis.document.documentElement.clientWidth - Number.parseFloat(divider.width)) /
              2,
            footerBackground: getComputedStyle(footerHost).backgroundColor,
            footerRuleOpacity: getComputedStyle(footer, '::before').opacity,
            scrollWidth: globalThis.document.documentElement.scrollWidth,
            viewportWidth: globalThis.document.documentElement.clientWidth,
          };
        });

        expect(
          Math.abs(seam.boundaryDelta),
          `${viewport.name} ${theme}: page/footer boundary`,
        ).toBeLessThanOrEqual(1.5);
        const expectedSurface = theme === 'dark' ? 'rgb(7, 9, 13)' : 'rgb(255, 255, 255)';
        expect(
          seam.closingBackground,
          `${viewport.name} ${theme}: closing resolves into footer surface`,
        ).toContain(expectedSurface);
        expect(seam.footerBackground, `${viewport.name} ${theme}: footer surface`).toBe(
          expectedSurface,
        );
        expect(
          seam.backgroundsContinue,
          `${viewport.name} ${theme}: mirrored closing/footer atmosphere`,
        ).toBe(true);
        expect(seam.dividerBackground, `${viewport.name} ${theme}: closing divider`).not.toBe(
          'none',
        );
        expect(seam.dividerBottom, `${viewport.name} ${theme}: visible inset rule`).toBe('1px');
        expect(
          seam.dividerInset,
          `${viewport.name} ${theme}: divider inset`,
        ).toBeGreaterThanOrEqual(19);
        expect(seam.footerRuleOpacity, `${viewport.name} ${theme}: no double divider`).toBe('0');
        expect(seam.scrollWidth).toBeLessThanOrEqual(seam.viewportWidth + 1);

        // Scrolling directly to the footer activates the below-fold lazy media. Let those
        // same-origin requests finish before the next deliberate theme reload/navigation.
        await waitForPressImages(page);
      }
    }

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('keyboard order stays visible and 200% Press text scaling remains reflow-safe', async ({
    page,
  }, testInfo) => {
    test.setTimeout(90_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pressPath, { waitUntil: 'networkidle' });

    const desktopHeaderActions = page
      .getByTestId('desktop-header')
      .locator('a:visible, button:visible');
    await desktopHeaderActions.last().focus();
    await page.keyboard.press('Tab');

    const heroActions = page.locator('.press-hero a');
    const expectedHeroOrder = ['/contact', '/about', '/press#founder-photography'];
    for (let index = 0; index < expectedHeroOrder.length; index += 1) {
      const action = heroActions.nth(index);

      await expectVisibleKeyboardFocus(action, `hero action ${index + 1}`);
      await expect(action).toHaveAttribute('href', expectedHeroOrder[index]);
      if (index < expectedHeroOrder.length - 1) {
        await page.keyboard.press('Tab');
      }
    }

    await page.locator('.press-inline-link').focus();
    await page.keyboard.press('Tab');
    const firstAssetActions = page.locator('.press-asset-card').first().locator('a');
    await expectVisibleKeyboardFocus(firstAssetActions.first(), 'first asset open action');
    await expect(firstAssetActions.first()).toHaveAttribute('target', '_blank');
    await page.keyboard.press('Tab');
    await expectVisibleKeyboardFocus(firstAssetActions.nth(1), 'first asset download action');
    await expect(firstAssetActions.nth(1)).toHaveAttribute(
      'download',
      'serhat-soruklu-ceo-founder-of-coupyn.png',
    );

    await page.locator('.press-system-card a').last().focus();
    await page.keyboard.press('Tab');
    const verificationActions = page.locator('.press-verification-list a');
    for (let index = 0; index < verificationLinks.length; index += 1) {
      const action = verificationActions.nth(index);

      await expectVisibleKeyboardFocus(action, `verification action ${index + 1}`);
      await expect(action).toHaveAttribute('href', verificationLinks[index].href);
      if (index < verificationLinks.length - 1) {
        await page.keyboard.press('Tab');
      }
    }

    for (const viewport of [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'desktop', width: 1440, height: 900 },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(pressPath, { waitUntil: 'networkidle' });

      const typeScale = await page.evaluate(() => {
        const pressPage = globalThis.document.querySelector('.press-page') as HTMLElement;
        const heading = pressPage.querySelector('h1') as HTMLElement;
        const initialHeadingSize = Number.parseFloat(getComputedStyle(heading).fontSize);
        const textElements = Array.from(
          pressPage.querySelectorAll<HTMLElement>('h1, h2, h3, p, dt, dd, a, strong, li'),
        );
        const initialSizes = textElements.map((element) =>
          Number.parseFloat(getComputedStyle(element).fontSize),
        );

        textElements.forEach((element, index) => {
          element.style.fontSize = `${initialSizes[index] * 2}px`;
        });

        return {
          initialHeadingSize,
          scaledHeadingSize: Number.parseFloat(getComputedStyle(heading).fontSize),
        };
      });

      expect(typeScale.scaledHeadingSize).toBeCloseTo(typeScale.initialHeadingSize * 2, 1);
      const scaledLayout = await page.evaluate(() => {
        const viewportWidth = globalThis.document.documentElement.clientWidth;
        const selectors = [
          '.press-hero h1',
          '.press-fact-sheet',
          '.press-bio-card',
          '.press-asset-card',
          '.press-coupyn-asset',
          '.press-system-card',
          '.press-verification-list a',
          '.press-action',
        ].join(',');
        const clipped = Array.from(globalThis.document.querySelectorAll<HTMLElement>(selectors))
          .filter((element) => {
            const box = element.getBoundingClientRect();

            return box.width > 0 && (box.left < -1 || box.right > viewportWidth + 1);
          })
          .map((element) => element.className);
        const assetCards = Array.from(
          globalThis.document.querySelectorAll<HTMLElement>('.press-asset-card'),
        ).map((card) => {
          const cardBox = card.getBoundingClientRect();
          const actions = Array.from(
            card.querySelectorAll<HTMLElement>('.press-asset-card__actions a'),
          ).map((action) => {
            const box = action.getBoundingClientRect();

            return { bottom: box.bottom, height: box.height, top: box.top };
          });

          return {
            actions,
            bottom: cardBox.bottom,
            clientHeight: card.clientHeight,
            scrollHeight: card.scrollHeight,
            top: cardBox.top,
          };
        });

        return {
          assetCards,
          clipped,
          scrollWidth: globalThis.document.documentElement.scrollWidth,
          viewportWidth,
        };
      });

      expect(scaledLayout.clipped, `${viewport.name}: 200% text clipping`).toEqual([]);
      expect(
        scaledLayout.scrollWidth,
        `${viewport.name}: 200% text horizontal overflow`,
      ).toBeLessThanOrEqual(scaledLayout.viewportWidth + 1);
      for (const [cardIndex, card] of scaledLayout.assetCards.entries()) {
        expect(
          card.scrollHeight,
          `${viewport.name}: 200% asset card ${cardIndex + 1} vertical content`,
        ).toBeLessThanOrEqual(card.clientHeight + 1);
        expect(card.actions).toHaveLength(2);
        for (const [actionIndex, action] of card.actions.entries()) {
          expect(
            action.top,
            `${viewport.name}: 200% asset ${cardIndex + 1} action ${actionIndex + 1} top`,
          ).toBeGreaterThanOrEqual(card.top - 1);
          expect(
            action.bottom,
            `${viewport.name}: 200% asset ${cardIndex + 1} action ${actionIndex + 1} bottom`,
          ).toBeLessThanOrEqual(card.bottom + 1);
          expect(action.height).toBeGreaterThanOrEqual(44);
        }
      }

      const closingContact = page.locator('.press-closing a[href="/contact"]');
      const finalVerification = verificationActions.last();
      await finalVerification.scrollIntoViewIfNeeded();
      await expect(finalVerification).toBeVisible();
      await closingContact.scrollIntoViewIfNeeded();
      await expect(closingContact).toBeVisible();
      await expect(page.locator('.site-footer')).toBeVisible();
    }

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('reduced motion disables non-essential Press entrance, lift, scale, and sweep effects', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);

    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(pressPath, { waitUntil: 'networkidle' });

    const motion = await page.evaluate(() => {
      const read = (selector: string) => {
        const styles = getComputedStyle(globalThis.document.querySelector(selector) as HTMLElement);

        return {
          animationName: styles.animationName,
          transitionDuration: styles.transitionDuration,
        };
      };

      return {
        asset: read('.press-asset-card'),
        bio: read('.press-bio-card'),
        dossier: read('.press-dossier'),
        hero: read('.press-hero__copy'),
        system: read('.press-system-card'),
        verification: read('.press-verification-list a'),
      };
    });

    for (const [name, styles] of Object.entries(motion)) {
      expect(styles.animationName, `${name}: animation`).toBe('none');
      expect(
        styles.transitionDuration
          .split(',')
          .map((duration) => duration.trim())
          .every((duration) => duration === '0s'),
        `${name}: transition`,
      ).toBe(true);
    }

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });

  test('captures the required Press, Contact callout, and footer review frames', async ({
    page,
  }, testInfo) => {
    test.setTimeout(240_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const assertNoLocalResourceFailures = installLocalResourceFailureGuard(page, testInfo);
    await mkdir(screenshotDirectory, { recursive: true });

    const capturePress = async (
      width: number,
      height: number,
      theme: 'dark' | 'light',
      fileName: string,
    ): Promise<void> => {
      await page.setViewportSize({ width, height });
      await page.goto(pressPath, { waitUntil: 'networkidle' });
      await setStoredTheme(page, theme);
      await waitForFonts(page);
      await waitForPressImages(page);
      await page.evaluate(() => globalThis.scrollTo({ left: 0, top: 0 }));
      await page.screenshot({
        animations: 'disabled',
        fullPage: true,
        path: `${screenshotDirectory}/${fileName}`,
      });
    };

    await capturePress(390, 844, 'dark', 'press-390x844-dark.png');
    await capturePress(390, 844, 'light', 'press-390x844-light.png');
    await capturePress(768, 1024, 'dark', 'press-768x1024-dark.png');
    await capturePress(768, 1024, 'light', 'press-768x1024-light.png');
    await capturePress(1024, 768, 'dark', 'press-1024x768-dark.png');
    await capturePress(1366, 768, 'dark', 'press-1366x768-dark.png');
    await capturePress(1440, 900, 'dark', 'press-1440x900-dark.png');
    await capturePress(1440, 900, 'light', 'press-1440x900-light.png');
    await capturePress(1920, 1080, 'dark', 'press-1920x1080-dark.png');
    await capturePress(1920, 1080, 'light', 'press-1920x1080-light.png');

    const captureContactCallout = async (
      width: number,
      height: number,
      fileName: string,
    ): Promise<void> => {
      await page.setViewportSize({ width, height });
      await page.goto('/contact', { waitUntil: 'networkidle' });
      await setStoredTheme(page, 'dark');
      const callout = page.locator('.contact-press-callout');
      await callout.scrollIntoViewIfNeeded();
      await expect(callout).toBeVisible();
      await waitForFonts(page);
      await page.screenshot({
        animations: 'disabled',
        path: `${screenshotDirectory}/${fileName}`,
      });
    };

    await captureContactCallout(390, 844, 'contact-press-callout-390x844-dark.png');
    await captureContactCallout(1440, 900, 'contact-press-callout-1440x900-dark.png');

    const captureFooter = async (
      width: number,
      height: number,
      theme: 'dark' | 'light',
      fileName: string,
    ): Promise<void> => {
      await page.setViewportSize({ width, height });
      await page.goto(pressPath, { waitUntil: 'networkidle' });
      await setStoredTheme(page, theme);
      const footer = page.locator('app-site-footer');
      await footer.scrollIntoViewIfNeeded();
      await expect(footer.getByRole('link', { name: 'Press / Media', exact: true })).toBeVisible();
      await waitForFonts(page);
      await page.screenshot({
        animations: 'disabled',
        path: `${screenshotDirectory}/${fileName}`,
      });
    };

    await captureFooter(1440, 900, 'dark', 'press-footer-1440x900-dark.png');
    await captureFooter(1440, 900, 'light', 'press-footer-1440x900-light.png');
    await captureFooter(390, 844, 'dark', 'press-footer-390x844-dark.png');
    await captureFooter(390, 844, 'light', 'press-footer-390x844-light.png');

    assertNoLocalResourceFailures();
    assertNoConsoleErrors();
  });
});
