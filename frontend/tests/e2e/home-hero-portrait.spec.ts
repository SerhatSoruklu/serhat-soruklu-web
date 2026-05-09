import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const themeStorageKey = 'serhatsoruklu-theme';
const viewports = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'wide', width: 1440, height: 900 },
  { name: 'large', width: 1920, height: 1080 }
];
const themeStates = [
  { name: 'dark', setting: 'dark', os: 'dark', resolved: 'dark' },
  { name: 'light', setting: 'light', os: 'dark', resolved: 'light' },
  { name: 'system-dark', setting: 'system', os: 'dark', resolved: 'dark' },
  { name: 'system-light', setting: 'system', os: 'light', resolved: 'light' }
] as const;

type ResolvedTheme = 'dark' | 'light';
type ThemeSetting = 'dark' | 'light' | 'system';

async function setInitialTheme(page: Page, setting: ThemeSetting): Promise<void> {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value);
  }, [themeStorageKey, setting]);
}

async function getPortraitState(page: Page): Promise<{
  darkOpacity: string;
  lightOpacity: string;
  darkSrc: string;
  lightSrc: string;
  darkLoaded: boolean;
  lightLoaded: boolean;
  overflow: boolean;
  frame: { width: number; height: number };
}> {
  return page.getByTestId('home-hero-portrait').evaluate((element) => {
    const darkLayer = element.querySelector('[data-testid="home-hero-portrait-dark"]')!;
    const lightLayer = element.querySelector('[data-testid="home-hero-portrait-light"]')!;
    const darkImage = darkLayer.querySelector('img') as HTMLImageElement;
    const lightImage = lightLayer.querySelector('img') as HTMLImageElement;
    const frame = element.querySelector('.home-hero__portrait-frame')!.getBoundingClientRect();

    return {
      darkOpacity: getComputedStyle(darkLayer).opacity,
      lightOpacity: getComputedStyle(lightLayer).opacity,
      darkSrc: darkImage.currentSrc || darkImage.src,
      lightSrc: lightImage.currentSrc || lightImage.src,
      darkLoaded: darkImage.complete && darkImage.naturalWidth > 0,
      lightLoaded: lightImage.complete && lightImage.naturalWidth > 0,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      frame: {
        width: Math.round(frame.width),
        height: Math.round(frame.height)
      }
    };
  });
}

test.describe('home hero portrait theme variants', () => {
  for (const viewport of viewports) {
    for (const themeState of themeStates) {
      test(`uses ${themeState.resolved} portrait at ${viewport.name} in ${themeState.name}`, async ({ page }, testInfo) => {
        const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

        await page.emulateMedia({ colorScheme: themeState.os });
        await setInitialTheme(page, themeState.setting);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        await expect(page.locator('html')).toHaveClass(new RegExp(`theme-${themeState.setting}`));
        await expect(page.locator('html')).toHaveClass(new RegExp(`theme-resolved-${themeState.resolved}`));
        await expect(page.getByTestId('home-hero-portrait')).toBeVisible();

        const state = await getPortraitState(page);
        const expectedLight = themeState.resolved === 'light';

        expect(state.darkLoaded).toBe(true);
        expect(state.lightLoaded).toBe(true);
        expect(state.darkSrc).toContain('/assets/portfolio-image/serhat-soruklu-portrait-');
        expect(state.darkSrc).not.toContain('portrait-light');
        expect(state.lightSrc).toContain('/assets/portfolio-image/serhat-soruklu-portrait-light-');
        expect(state.darkOpacity).toBe(expectedLight ? '0' : '1');
        expect(state.lightOpacity).toBe(expectedLight ? '1' : '0');
        expect(state.overflow).toBe(false);
        expect(state.frame.width).toBeGreaterThan(250);
        expect(state.frame.height).toBeGreaterThan(state.frame.width);

        assertNoConsoleErrors();
      });
    }
  }

  test('keeps dark portrait as the SSR/default SEO image', async ({ request }) => {
    const response = await request.get('/');
    const html = await response.text();
    const darkIndex = html.indexOf('/assets/portfolio-image/serhat-soruklu-portrait-818.jpg');
    const lightIndex = html.indexOf('/assets/portfolio-image/serhat-soruklu-portrait-light-818.jpg');

    expect(darkIndex).toBeGreaterThanOrEqual(0);
    expect(lightIndex).toBeGreaterThan(darkIndex);
    expect(html).toContain('"/assets/portfolio-image/serhat-soruklu-portrait-818.jpg"');
    expect(html).not.toContain('og:image" content="https://serhatsoruklu.com/assets/portfolio-image/serhat-soruklu-portrait-light');
    expect(html).not.toContain('twitter:image" content="https://serhatsoruklu.com/assets/portfolio-image/serhat-soruklu-portrait-light');
  });

  test('crossfades without changing hero portrait frame size', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const before = await getPortraitState(page);
    const transition = await page.getByTestId('home-hero-portrait-dark').evaluate((element) => {
      const styles = getComputedStyle(element);

      return {
        property: styles.transitionProperty,
        duration: styles.transitionDuration
      };
    });

    expect(transition.property).toContain('opacity');
    expect(transition.duration).not.toBe('0s');

    await page.getByTestId('desktop-theme-menu-button').click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect.poll(async () => (await getPortraitState(page)).darkOpacity).toBe('0');
    await expect.poll(async () => (await getPortraitState(page)).lightOpacity).toBe('1');

    const after = await getPortraitState(page);
    expect(after.frame).toEqual(before.frame);

    assertNoConsoleErrors();
  });

  test('disables portrait crossfade for reduced motion', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const transitionDuration = await page.getByTestId('home-hero-portrait-dark').evaluate((element) => (
      getComputedStyle(element).transitionDuration
    ));

    expect(transitionDuration).toBe('0s');
    assertNoConsoleErrors();
  });
});
