import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const themeStorageKey = 'serhatsoruklu-theme';
const resolvedThemeCookieKey = 'serhatsoruklu-resolved-theme';
const e2eBaseUrl =
  process.env['E2E_BASE_URL'] || `http://127.0.0.1:${process.env['E2E_PORT'] || '4201'}`;
const portraits = {
  dark: {
    path: '/assets/home/serhat-soruklu-founder-dark.png',
    alt: 'Serhat Soruklu seated at his workstation in a dark office.',
  },
  light: {
    path: '/assets/home/serhat-soruklu-founder-light.png',
    alt: 'Serhat Soruklu seated at his workstation in a bright office.',
  },
} as const;
const viewports = [
  { name: 'mobile-320', width: 320, height: 700 },
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mini-laptop', width: 1024, height: 768 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'short-desktop', width: 1366, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1728, height: 1117 },
  { name: 'wide-desktop', width: 1920, height: 1080 },
] as const;
const explicitThemes = ['dark', 'light'] as const;

type PortraitTheme = keyof typeof portraits;
type ThemeSetting = PortraitTheme | 'system';

async function setInitialTheme(
  page: Page,
  setting: ThemeSetting,
  resolvedTheme: PortraitTheme = setting === 'light' ? 'light' : 'dark',
): Promise<void> {
  await page.context().addCookies([
    { name: themeStorageKey, value: setting, url: e2eBaseUrl, sameSite: 'Lax' },
    { name: resolvedThemeCookieKey, value: resolvedTheme, url: e2eBaseUrl, sameSite: 'Lax' },
  ]);
  await page.addInitScript(
    ([key, value]) => {
      globalThis.window.localStorage.setItem(key, value);
    },
    [themeStorageKey, setting],
  );
}

async function waitForPortrait(page: Page, theme: PortraitTheme): Promise<void> {
  const image = page.getByTestId('home-hero-portrait-image');

  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute('data-portrait-theme', theme);
  await expect(image).toHaveAttribute('data-portrait-ready-theme', theme);
  await expect(image).toHaveAttribute('src', portraits[theme].path);
  await expect(image).toHaveAttribute('alt', portraits[theme].alt);
  await expect(image).toHaveAttribute('width', '1448');
  await expect(image).toHaveAttribute('height', '1086');
  await expect(image).toHaveAttribute('decoding', 'async');
  await expect(image).toHaveAttribute('fetchpriority', 'high');
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect
    .poll(() =>
      image.evaluate((element) => new URL((element as HTMLImageElement).currentSrc).pathname),
    )
    .toBe(portraits[theme].path);
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBe(1448);
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalHeight))
    .toBe(1086);
}

async function getHeroState(page: Page): Promise<{
  currentPath: string;
  frame: { height: number; width: number };
  headerBottom: number;
  contentTop: number;
  contentBottom: number;
  image: { height: number; width: number };
  imageObjectFit: string;
  layoutWidth: number;
  overflow: boolean;
  portraitTop: number;
  portraitWidth: number;
  proofInsideViewport: boolean;
  actionsUsable: boolean;
}> {
  return page.getByTestId('home-hero-portrait').evaluate((element) => {
    const image = element.querySelector(
      '[data-testid="home-hero-portrait-image"]',
    ) as HTMLImageElement;
    const frame = element.querySelector('.home-hero__portrait-frame')!.getBoundingClientRect();
    const imageBox = image.getBoundingClientRect();
    const layoutElement = element.closest('.home-hero__layout')!;
    const layout = layoutElement.getBoundingClientRect();
    const content = layoutElement.querySelector('.home-hero__content')!.getBoundingClientRect();
    const proofItems = Array.from(layoutElement.querySelectorAll('.home-hero__proof li'));
    const actions = Array.from(layoutElement.querySelectorAll('.home-hero__actions a'));
    const visibleHeaders = Array.from(globalThis.document.querySelectorAll('header'))
      .map((header) => ({ element: header, box: header.getBoundingClientRect() }))
      .filter(({ element: header, box }) => {
        const style = getComputedStyle(header);

        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) > 0 &&
          box.width > 0 &&
          box.height > 0
        );
      });
    const viewportWidth = globalThis.document.documentElement.clientWidth;

    return {
      currentPath: new URL(image.currentSrc || image.src).pathname,
      frame: { height: frame.height, width: frame.width },
      headerBottom: Math.max(0, ...visibleHeaders.map(({ box }) => box.bottom)),
      contentTop: content.top,
      contentBottom: content.bottom,
      image: { height: imageBox.height, width: imageBox.width },
      imageObjectFit: getComputedStyle(image).objectFit,
      layoutWidth: layout.width,
      overflow: globalThis.document.documentElement.scrollWidth > viewportWidth + 1,
      portraitTop: frame.top,
      portraitWidth: frame.width,
      proofInsideViewport: proofItems.every((item) => {
        const box = item.getBoundingClientRect();

        return box.left >= -1 && box.right <= viewportWidth + 1;
      }),
      actionsUsable: actions.every((action) => {
        const box = action.getBoundingClientRect();

        return box.width >= 44 && box.height >= 40;
      }),
    };
  });
}

function trackPortraitRequests(page: Page): string[] {
  const requests: string[] = [];

  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;

    if (Object.values(portraits).some((portrait) => portrait.path === path)) {
      requests.push(path);
    }
  });

  return requests;
}

function getSsrHeroImageTag(html: string): string {
  const imageTag = html.match(/<img\b[^>]*data-testid="home-hero-portrait-image"[^>]*>/)?.[0];

  expect(imageTag).toBeDefined();
  return imageTag ?? '';
}

test.describe('home hero founder photography', () => {
  for (const viewport of viewports) {
    for (const theme of explicitThemes) {
      test(`uses the ${theme} founder image at ${viewport.name}`, async ({ page }, testInfo) => {
        const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

        await page.emulateMedia({ colorScheme: theme });
        await setInitialTheme(page, theme);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        await expect(page.locator('html')).toHaveClass(new RegExp(`theme-resolved-${theme}`));
        await expect(
          page.getByRole('heading', {
            level: 1,
            name: /I build fast, structured web platforms.*architect.*founder/,
          }),
        ).toBeVisible();
        await expect(page.getByRole('link', { name: 'About Serhat' })).toHaveAttribute(
          'href',
          '/about',
        );
        await expect(page.getByTestId('home-hero-portrait-trigger')).toHaveAttribute(
          'aria-label',
          'Open Serhat Soruklu operator profile',
        );
        await expect(page.getByTestId('home-hero-portrait-trigger')).toHaveAttribute(
          'aria-haspopup',
          'dialog',
        );
        await expect(page.locator('.home-hero__portrait-action')).toBeVisible();
        await waitForPortrait(page, theme);

        const state = await getHeroState(page);

        expect(state.currentPath).toBe(portraits[theme].path);
        expect(state.imageObjectFit).toBe('cover');
        expect(state.frame.width / state.frame.height).toBeCloseTo(4 / 3, 2);
        expect(Math.abs(state.image.width - state.frame.width)).toBeLessThanOrEqual(2.1);
        expect(Math.abs(state.image.height - state.frame.height)).toBeLessThanOrEqual(2.1);
        expect(state.contentTop).toBeGreaterThanOrEqual(state.headerBottom - 1);
        expect(state.proofInsideViewport).toBe(true);
        expect(state.actionsUsable).toBe(true);
        expect(state.overflow).toBe(false);

        if (viewport.width < 1024) {
          expect(state.portraitTop).toBeGreaterThanOrEqual(state.contentBottom - 1);
        } else {
          const portraitShare = state.portraitWidth / state.layoutWidth;

          expect(portraitShare).toBeGreaterThanOrEqual(0.35);
          expect(portraitShare).toBeLessThanOrEqual(0.42);
        }

        const footer = page.locator('footer.site-footer');

        await expect(footer).toHaveCount(1);
        await footer.scrollIntoViewIfNeeded();
        await expect(footer).toBeInViewport();

        assertNoConsoleErrors();
      });
    }
  }

  test('SSR exposes one intrinsic dark portrait and the refreshed crawlable copy', async ({
    request,
  }) => {
    const response = await request.get('/');
    const html = await response.text();
    const imageTag = getSsrHeroImageTag(html);

    expect(response.status()).toBe(200);
    expect(html.match(/data-testid="home-hero-portrait-image"/g)).toHaveLength(1);
    expect(imageTag).toContain(`src="${portraits.dark.path}"`);
    expect(imageTag).toContain('width="1448"');
    expect(imageTag).toContain('height="1086"');
    expect(html).toContain(`srcset="${portraits.light.path}" media="not all"`);
    expect(html).toContain(`srcset="${portraits.dark.path}" media="all"`);
    expect(html).toContain(
      'Founder &amp; CEO of Coupyn. Systems architect and solo full-stack developer building production platforms, deterministic systems and self-managed infrastructure.',
    );
    expect(html).toMatch(/<a\b[^>]*href="\/about"[^>]*>About Serhat<\/a>/);
  });

  test('SSR uses the persisted light theme portrait on refresh', async ({ request }) => {
    const response = await request.get('/', {
      headers: {
        cookie: `${themeStorageKey}=light; ${resolvedThemeCookieKey}=light`,
      },
    });
    const html = await response.text();
    const imageTag = getSsrHeroImageTag(html);

    expect(response.status()).toBe(200);
    expect(html.match(/data-testid="home-hero-portrait-image"/g)).toHaveLength(1);
    expect(imageTag).toContain(`src="${portraits.light.path}"`);
    expect(html).toContain('data-portrait-theme="light"');
    expect(html).toContain(`srcset="${portraits.light.path}" media="all"`);
    expect(html).toContain(`srcset="${portraits.dark.path}" media="not all"`);
  });

  test('hides the legacy SSR portrait during the first localStorage-only theme migration', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.addInitScript(
      ({ storageKey, darkPath }) => {
        globalThis.window.localStorage.setItem(storageKey, 'light');

        const audit = { wrongPortraitWasVisible: false };
        const auditWindow = globalThis.window as Window & {
          __portraitFlashAudit?: typeof audit;
        };

        auditWindow.__portraitFlashAudit = audit;

        const inspectPortrait = () => {
          const image = globalThis.document.querySelector<HTMLImageElement>(
            '[data-testid="home-hero-portrait-image"]',
          );

          if (
            image &&
            globalThis.document.documentElement.classList.contains('theme-resolved-light')
          ) {
            const style = getComputedStyle(image);
            const currentPath = new URL(image.currentSrc || image.src).pathname;
            const visible =
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              Number(style.opacity) > 0;

            if (
              visible &&
              (image.getAttribute('data-portrait-theme') !== 'light' || currentPath === darkPath)
            ) {
              audit.wrongPortraitWasVisible = true;
            }
          }

          globalThis.window.requestAnimationFrame(inspectPortrait);
        };

        globalThis.window.requestAnimationFrame(inspectPortrait);
      },
      { storageKey: themeStorageKey, darkPath: portraits.dark.path },
    );

    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await waitForPortrait(page, 'light');
    expect(
      await page.evaluate(
        () =>
          (
            globalThis.window as Window & {
              __portraitFlashAudit?: { wrongPortraitWasVisible: boolean };
            }
          ).__portraitFlashAudit?.wrongPortraitWasVisible,
      ),
    ).toBe(false);

    const cookies = await page.context().cookies();
    expect(cookies.find(({ name }) => name === themeStorageKey)?.value).toBe('light');
    expect(cookies.find(({ name }) => name === resolvedThemeCookieKey)?.value).toBe('light');

    const refreshedResponse = await page.reload();
    const refreshedHtml = await refreshedResponse?.text();

    expect(getSsrHeroImageTag(refreshedHtml ?? '')).toContain(`src="${portraits.light.path}"`);
    await waitForPortrait(page, 'light');
    assertNoConsoleErrors();
  });

  test('system mode selects the current OS portrait before a stale resolved cookie can request its fallback', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const requests = trackPortraitRequests(page);
    let activePortraitRequestBlocked = false;
    let releaseActivePortraitRequest = () => undefined;
    const activePortraitGate = new Promise<void>((resolve) => {
      releaseActivePortraitRequest = resolve;
    });

    await page.emulateMedia({ colorScheme: 'light' });
    await setInitialTheme(page, 'system', 'dark');
    await page.route(`**${portraits.light.path}`, async (route) => {
      activePortraitRequestBlocked = true;
      await activePortraitGate;
      await route.continue();
    });

    const navigation = page.goto('/');

    await expect.poll(() => activePortraitRequestBlocked).toBe(true);
    expect(requests.filter((path) => path === portraits.light.path).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(requests.filter((path) => path === portraits.dark.path)).toHaveLength(0);

    releaseActivePortraitRequest();
    await navigation;
    await waitForPortrait(page, 'light');
    assertNoConsoleErrors();
  });

  test('keeps one portrait on the critical path, then warms the alternative before switching', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const requests = trackPortraitRequests(page);
    let activePortraitRequestBlocked = false;
    let releaseActivePortraitRequest = () => undefined;
    const activePortraitGate = new Promise<void>((resolve) => {
      releaseActivePortraitRequest = resolve;
    });

    await page.route(`**${portraits.dark.path}`, async (route) => {
      activePortraitRequestBlocked = true;
      await activePortraitGate;
      await route.continue();
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await setInitialTheme(page, 'dark');
    const navigation = page.goto('/');

    await expect.poll(() => activePortraitRequestBlocked).toBe(true);
    // Intercepting the active preload can cause Chromium to issue a second
    // request when the matching <img> is parsed; both are still the one active
    // theme variant, and the alternative does not begin until the gate opens.
    expect(requests.filter((path) => path === portraits.dark.path).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(requests.filter((path) => path === portraits.light.path)).toHaveLength(0);

    releaseActivePortraitRequest();
    await navigation;
    await waitForPortrait(page, 'dark');
    await expect
      .poll(() => requests.filter((path) => path === portraits.light.path).length)
      .toBe(1);
    await expect
      .poll(() =>
        page.evaluate((path) => {
          const url = new URL(path, globalThis.window.location.origin).href;

          return performance
            .getEntriesByName(url)
            .some((entry) => (entry as PerformanceResourceTiming).responseEnd > 0);
        }, portraits.light.path),
      )
      .toBe(true);

    await page.evaluate(() => {
      globalThis.window.scrollTo(0, 480);
    });

    const image = page.getByTestId('home-hero-portrait-image');
    const frameBefore = await page.locator('.home-hero__portrait-frame').evaluate((element) => ({
      height: (element as HTMLElement).offsetHeight,
      width: (element as HTMLElement).offsetWidth,
    }));
    const scrollBefore = await page.evaluate(() => globalThis.window.scrollY);

    await page.getByTestId('desktop-theme-menu-button').click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await waitForPortrait(page, 'light');
    await image.evaluate(async (element) => {
      await (element as HTMLImageElement).decode();
    });

    const frameAfter = await page.locator('.home-hero__portrait-frame').evaluate((element) => ({
      height: (element as HTMLElement).offsetHeight,
      width: (element as HTMLElement).offsetWidth,
    }));
    const scrollAfter = await page.evaluate(() => globalThis.window.scrollY);

    expect(frameAfter).toEqual(frameBefore);
    expect(scrollAfter).toBeCloseTo(scrollBefore, 0);
    expect(requests.filter((path) => path === portraits.dark.path).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(requests.filter((path) => path === portraits.light.path).length).toBeGreaterThanOrEqual(
      1,
    );
    expect(new Set(requests)).toEqual(new Set([portraits.dark.path, portraits.light.path]));
    assertNoConsoleErrors();
  });

  test('system theme changes update the same image without moving the frame or page', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ colorScheme: 'dark' });
    await setInitialTheme(page, 'system');
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto('/');
    await waitForPortrait(page, 'dark');
    await page.evaluate(() => globalThis.window.scrollTo(0, 360));

    const image = page.getByTestId('home-hero-portrait-image');
    await image.evaluate((element) => {
      (globalThis.window as Window & { __homePortraitNode?: Element }).__homePortraitNode = element;
    });
    const frameBefore = await page.locator('.home-hero__portrait-frame').boundingBox();
    const scrollBefore = await page.evaluate(() => globalThis.window.scrollY);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await waitForPortrait(page, 'light');

    const frameAfter = await page.locator('.home-hero__portrait-frame').boundingBox();
    const scrollAfter = await page.evaluate(() => globalThis.window.scrollY);

    expect(
      await image.evaluate(
        (element) =>
          element ===
          (globalThis.window as Window & { __homePortraitNode?: Element }).__homePortraitNode,
      ),
    ).toBe(true);
    expect(frameAfter?.width).toBeCloseTo(frameBefore?.width ?? 0, 1);
    expect(frameAfter?.height).toBeCloseTo(frameBefore?.height ?? 0, 1);
    expect(scrollAfter).toBeCloseTo(scrollBefore, 0);
    assertNoConsoleErrors();
  });

  test('supports keyboard focus and restrained pointer hover interaction', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForPortrait(page, 'dark');

    const trigger = page.getByTestId('home-hero-portrait-trigger');
    const frame = page.locator('.home-hero__portrait-frame');
    const image = page.getByTestId('home-hero-portrait-image');
    const transformsBefore = await Promise.all([
      frame.evaluate((element) => getComputedStyle(element).transform),
      image.evaluate((element) => getComputedStyle(element).transform),
    ]);

    await trigger.focus();
    await expect(trigger).toBeFocused();
    expect(await trigger.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe(
      'none',
    );

    await trigger.hover();
    await expect
      .poll(() => frame.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(transformsBefore[0]);
    await expect
      .poll(() => image.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(transformsBefore[1]);
    assertNoConsoleErrors();
  });

  test('removes portrait motion when reduced motion is requested', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await waitForPortrait(page, 'dark');
    await page.getByTestId('home-hero-portrait-trigger').hover();

    const motion = await page.evaluate(() => {
      const frame = globalThis.document.querySelector('.home-hero__portrait-frame')!;
      const image = globalThis.document.querySelector('[data-testid="home-hero-portrait-image"]')!;

      return {
        frameTransform: getComputedStyle(frame).transform,
        frameTransition: getComputedStyle(frame).transitionDuration,
        imageTransform: getComputedStyle(image).transform,
        imageTransition: getComputedStyle(image).transitionDuration,
      };
    });

    expect(motion).toEqual({
      frameTransform: 'none',
      frameTransition: '0s',
      imageTransform: 'none',
      imageTransition: '0s',
    });
    assertNoConsoleErrors();
  });
});
