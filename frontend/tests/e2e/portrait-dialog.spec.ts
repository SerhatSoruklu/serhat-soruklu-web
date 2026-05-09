import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const themeStorageKey = 'serhatsoruklu-theme';
const viewports = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mini-laptop', width: 1024, height: 768 },
  { name: 'short-desktop', width: 1280, height: 720 },
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'wide', width: 1440, height: 900 },
  { name: 'large', width: 1920, height: 1080 }
];
const themeStates = [
  { name: 'dark', setting: 'dark', os: 'dark', resolved: 'dark' },
  { name: 'light', setting: 'light', os: 'light', resolved: 'light' },
  { name: 'system-dark', setting: 'system', os: 'dark', resolved: 'dark' },
  { name: 'system-light', setting: 'system', os: 'light', resolved: 'light' }
] as const;

type ThemeSetting = 'dark' | 'light' | 'system';

async function setInitialTheme(page: Page, setting: ThemeSetting): Promise<void> {
  await page.addInitScript(([key, value]) => {
    window.localStorage.setItem(key, value);
  }, [themeStorageKey, setting]);
}

async function openPortraitDialog(page: Page): Promise<void> {
  await page.getByTestId('home-hero-portrait-trigger').scrollIntoViewIfNeeded();
  await page.getByTestId('home-hero-portrait-trigger').click();
  await expect(page.getByTestId('portrait-dialog')).toBeVisible();
}

async function getDialogState(page: Page): Promise<{
  darkOpacity: string;
  lightOpacity: string;
  darkSrc: string;
  lightSrc: string;
  objectFit: string;
  iconCount: number;
  blankIcons: number;
  fontTitle: string;
  fontSummary: string;
  noOverflow: boolean;
  mobileGutters: { left: number; right: number; top: number; bottom: number } | null;
  closeCentered: boolean;
}> {
  return page.evaluate(() => {
    const panel = document.querySelector('.cdk-overlay-pane.serhat-portrait-dialog-panel')!;
    const close = document.querySelector('.portrait-dialog__close')!;
    const closeIcon = close.querySelector('mat-icon')!;
    const activeImage = document.querySelector('.portrait-dialog--light-portrait [data-testid="portrait-dialog-portrait-light"] img')
      ?? document.querySelector('[data-testid="portrait-dialog-portrait-dark"] img')!;
    const darkLayer = document.querySelector('[data-testid="portrait-dialog-portrait-dark"]')!;
    const lightLayer = document.querySelector('[data-testid="portrait-dialog-portrait-light"]')!;
    const darkImage = darkLayer.querySelector('img') as HTMLImageElement;
    const lightImage = lightLayer.querySelector('img') as HTMLImageElement;
    const title = document.querySelector('.portrait-dialog__title')!;
    const summary = document.querySelector('.portrait-dialog__summary')!;
    const icons = Array.from(document.querySelectorAll('.portrait-dialog mat-icon'));
    const box = (element: Element) => {
      const rect = element.getBoundingClientRect();

      return rect;
    };
    const closeBox = box(close);
    const iconBox = box(closeIcon);
    const panelBox = box(panel);

    return {
      darkOpacity: getComputedStyle(darkLayer).opacity,
      lightOpacity: getComputedStyle(lightLayer).opacity,
      darkSrc: darkImage.currentSrc || darkImage.src,
      lightSrc: lightImage.currentSrc || lightImage.src,
      objectFit: getComputedStyle(activeImage).objectFit,
      iconCount: icons.length,
      blankIcons: icons.filter((icon) => {
        const rect = icon.getBoundingClientRect();

        return rect.width < 1 || rect.height < 1;
      }).length,
      fontTitle: getComputedStyle(title).fontFamily,
      fontSummary: getComputedStyle(summary).fontFamily,
      noOverflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
      mobileGutters: document.documentElement.clientWidth < 768
        ? {
          left: Math.round(panelBox.left),
          right: Math.round(document.documentElement.clientWidth - panelBox.right),
          top: Math.round(panelBox.top),
          bottom: Math.round(document.documentElement.clientHeight - panelBox.bottom)
        }
        : null,
      closeCentered: Math.abs((closeBox.left + closeBox.width / 2) - (iconBox.left + iconBox.width / 2)) <= 1
        && Math.abs((closeBox.top + closeBox.height / 2) - (iconBox.top + iconBox.height / 2)) <= 1
    };
  });
}

test.describe('portrait dialog', () => {
  for (const viewport of viewports) {
    for (const themeState of themeStates) {
      test(`renders at ${viewport.name} in ${themeState.name}`, async ({ page }, testInfo) => {
        const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

        await page.emulateMedia({ colorScheme: themeState.os });
        await setInitialTheme(page, themeState.setting);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        await openPortraitDialog(page);
        await page.waitForTimeout(360);

        const state = await getDialogState(page);
        const expectedLight = themeState.resolved === 'light';

        expect(state.darkOpacity).toBe(expectedLight ? '0' : '1');
        expect(state.lightOpacity).toBe(expectedLight ? '1' : '0');
        expect(state.darkSrc).toContain('/assets/portfolio-image/serhat-soruklu-full-portrait-');
        expect(state.lightSrc).toContain('/assets/portfolio-image/serhat-soruklu-full-portrait-light-');
        expect(state.objectFit).toBe('contain');
        expect(state.iconCount).toBeGreaterThanOrEqual(10);
        expect(state.blankIcons).toBe(0);
        expect(state.fontTitle).toContain('Sora');
        expect(state.fontSummary).toContain('Sora');
        expect(state.closeCentered).toBe(true);
        expect(state.noOverflow).toBe(true);

        if (state.mobileGutters) {
          expect(state.mobileGutters.left).toBeGreaterThanOrEqual(19);
          expect(state.mobileGutters.right).toBeGreaterThanOrEqual(19);
          expect(state.mobileGutters.top).toBeGreaterThanOrEqual(19);
          expect(state.mobileGutters.bottom).toBeGreaterThanOrEqual(19);
          await page.getByTestId('portrait-dialog').evaluate((element) => {
            element.scrollTop = element.scrollHeight;
          });
          await expect(page.getByText('SEO', { exact: true })).toBeVisible();
        }

        assertNoConsoleErrors();
      });
    }
  }

  test('keyboard, backdrop, and close button interactions restore focus', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const trigger = page.getByTestId('home-hero-portrait-trigger');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('portrait-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('portrait-dialog')).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Space');
    await expect(page.getByTestId('portrait-dialog')).toBeVisible();
    await page.getByLabel('Close portrait dialog').click();
    await expect(page.getByTestId('portrait-dialog')).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(page.getByTestId('portrait-dialog')).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(page.getByTestId('portrait-dialog')).toBeHidden();
    await expect(trigger).toBeFocused();

    assertNoConsoleErrors();
  });

  test('system theme changes update the open dialog portrait', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ colorScheme: 'dark' });
    await setInitialTheme(page, 'system');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await openPortraitDialog(page);
    await page.waitForTimeout(360);
    await expect.poll(async () => (await getDialogState(page)).darkOpacity).toBe('1');

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect.poll(async () => (await getDialogState(page)).darkOpacity).toBe('0');
    await expect.poll(async () => (await getDialogState(page)).lightOpacity).toBe('1');

    assertNoConsoleErrors();
  });
});
