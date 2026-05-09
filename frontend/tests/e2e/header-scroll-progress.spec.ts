import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

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

type ThemeSetting = 'dark' | 'light' | 'system';

async function setInitialTheme(page: Page, setting: ThemeSetting): Promise<void> {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value);
  }, [themeStorageKey, setting]);
}

function activeHeader(page: Page, width: number): Locator {
  return page.getByTestId(width >= 1024 ? 'desktop-header' : 'mobile-header');
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasOverflow).toBe(false);
}

async function getHeaderVisualState(header: Locator): Promise<{
  backgroundColor: string;
  backgroundImage: string;
  backdropFilter: string;
  boxShadow: string;
  backingOpacity: string;
  backingBackgroundImage: string;
  backingBackdropFilter: string;
  backingBoxShadow: string;
}> {
  return header.evaluate((element) => {
    const styles = getComputedStyle(element);
    const backingStyles = getComputedStyle(element, '::before');

    return {
      backgroundColor: styles.backgroundColor,
      backgroundImage: styles.backgroundImage,
      backdropFilter: styles.backdropFilter,
      boxShadow: styles.boxShadow,
      backingOpacity: backingStyles.opacity,
      backingBackgroundImage: backingStyles.backgroundImage,
      backingBackdropFilter: backingStyles.backdropFilter,
      backingBoxShadow: backingStyles.boxShadow
    };
  });
}

async function getProgress(header: Locator): Promise<number> {
  return header.evaluate((element) => {
    const value = getComputedStyle(element).getPropertyValue('--scroll-progress').trim();

    return Number.parseFloat(value || '0');
  });
}

async function getProgressLineState(header: Locator): Promise<{
  height: number;
  barHeight: number;
  transitionDuration: string;
  backgroundImage: string;
}> {
  return header.evaluate((element) => {
    const progress = element.querySelector('[class$="__scroll-progress"]') as HTMLElement | null;
    const bar = element.querySelector('[class$="__scroll-progress-bar"]') as HTMLElement | null;

    if (!progress || !bar) {
      return {
        height: 0,
        barHeight: 0,
        transitionDuration: '',
        backgroundImage: ''
      };
    }

    const progressBox = progress.getBoundingClientRect();
    const barBox = bar.getBoundingClientRect();
    const barStyle = getComputedStyle(bar);

    return {
      height: progressBox.height,
      barHeight: barBox.height,
      transitionDuration: barStyle.transitionDuration,
      backgroundImage: barStyle.backgroundImage
    };
  });
}

test.describe('header transparency and scroll progress', () => {
  for (const viewport of viewports) {
    for (const themeState of themeStates) {
      test(`transparent rest state and progress at ${viewport.name} in ${themeState.name}`, async ({ page }, testInfo) => {
        const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

        await page.emulateMedia({ colorScheme: themeState.os });
        await setInitialTheme(page, themeState.setting);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await page.mouse.move(10, viewport.height - 10);

        const header = activeHeader(page, viewport.width);
        await expect(header).toBeVisible();
        await expect(page.locator('html')).toHaveClass(new RegExp(`theme-${themeState.setting}`));
        await expect(page.locator('html')).toHaveClass(new RegExp(`theme-resolved-${themeState.resolved}`));

        const atRest = await getHeaderVisualState(header);
        expect(atRest.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        expect(atRest.backgroundImage).toBe('none');
        expect(atRest.backdropFilter).toBe('none');
        expect(atRest.boxShadow).toBe('none');
        expect(atRest.backingOpacity).toBe('0');

        const line = await getProgressLineState(header);
        expect(line.height).toBe(2);
        expect(line.barHeight).toBe(2);
        expect(line.backgroundImage).toContain('linear-gradient');
        expect(line.transitionDuration).not.toBe('0s');

        expect(await getProgress(header)).toBe(0);
        await page.evaluate(() => window.scrollTo(0, Math.round(document.documentElement.scrollHeight * 0.45)));
        await expect.poll(async () => getProgress(header)).toBeGreaterThan(0.15);
        const midProgress = await getProgress(header);
        const scrolled = await getHeaderVisualState(header);
        expect(scrolled.backingOpacity).toBe('1');
        expect(scrolled.backingBackgroundImage).not.toBe('none');
        expect(scrolled.backingBackdropFilter).toContain('blur');
        expect(scrolled.backingBoxShadow).not.toBe('none');

        await page.evaluate(() => window.scrollTo(0, 0));
        await expect.poll(async () => getProgress(header)).toBeLessThan(midProgress);
        await expect.poll(async () => getProgress(header)).toBe(0);
        await expect.poll(async () => (await getHeaderVisualState(header)).backingOpacity).toBe('0');

        await expectNoHorizontalOverflow(page);
        assertNoConsoleErrors();
      });
    }
  }

  test('desktop hover and focus reveal the translucent header background', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const header = page.getByTestId('desktop-header');
    await header.hover();
    const hovered = await getHeaderVisualState(header);
    expect(hovered.backingOpacity).toBe('1');
    expect(hovered.backingBackgroundImage).not.toBe('none');
    expect(hovered.backingBackdropFilter).toContain('blur');
    expect(hovered.backingBoxShadow).not.toBe('none');

    await page.mouse.move(10, 500);
    await page.getByTestId('desktop-theme-menu-button').focus();
    const focused = await getHeaderVisualState(header);
    expect(focused.backingOpacity).toBe('1');
    expect(focused.backingBackgroundImage).not.toBe('none');
    expect(focused.backingBackdropFilter).toContain('blur');
    expect(focused.backingBoxShadow).not.toBe('none');

    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('desktop scrolled backing uses hysteresis near the top threshold', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.mouse.move(10, 500);

    const header = page.getByTestId('desktop-header');

    for (const scrollTop of [0, 8, 12, 16, 19]) {
      await page.evaluate((top) => window.scrollTo(0, top), scrollTop);
      await expect.poll(async () => getProgress(header)).toBeGreaterThanOrEqual(0);
      expect((await getHeaderVisualState(header)).backingOpacity).toBe('0');
    }

    await page.evaluate(() => window.scrollTo(0, 20));
    await expect.poll(async () => (await getHeaderVisualState(header)).backingOpacity).toBe('1');

    for (const scrollTop of [18, 10, 3]) {
      await page.evaluate((top) => window.scrollTo(0, top), scrollTop);
      expect((await getHeaderVisualState(header)).backingOpacity).toBe('1');
    }

    await page.evaluate(() => window.scrollTo(0, 2));
    await expect.poll(async () => (await getHeaderVisualState(header)).backingOpacity).toBe('0');

    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('mobile menu open state keeps header and menu readable', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.mouse.move(10, 830);

    const header = page.getByTestId('mobile-header');
    const resting = await getHeaderVisualState(header);
    expect(resting.backgroundImage).toBe('none');
    expect(resting.backingOpacity).toBe('0');

    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-nav-panel')).toBeVisible();
    const opened = await getHeaderVisualState(header);
    expect(opened.backingOpacity).toBe('1');
    expect(opened.backingBackgroundImage).not.toBe('none');
    expect(opened.backingBackdropFilter).toContain('blur');

    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('progress line minimizes motion when reduced motion is requested', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const line = await getProgressLineState(page.getByTestId('desktop-header'));
    expect(line.transitionDuration).toBe('0s');
    assertNoConsoleErrors();
  });
});
