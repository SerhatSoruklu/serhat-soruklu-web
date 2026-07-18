import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

test.describe('theme behavior', () => {
  test('dark is default', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/theme-dark/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#07090d');
    assertNoConsoleErrors();
  });

  test('light, system, persistence, and tooltip work from the desktop selector', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const themeButton = page.getByTestId('desktop-theme-menu-button');
    await themeButton.click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-light/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ffffff');

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-light/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);

    await themeButton.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Light theme');
    await page.mouse.move(10, 10);
    await expect(page.getByRole('tooltip')).toBeHidden();

    await themeButton.click();
    await page.getByRole('menuitemradio', { name: 'System' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    assertNoConsoleErrors();
  });

  test('global scrollbars follow resolved theme colors', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const darkScrollbar = await page.evaluate(() => ({
      color: getComputedStyle(document.documentElement).scrollbarColor,
      width: getComputedStyle(document.documentElement).scrollbarWidth,
      hasVerticalScroll: document.documentElement.scrollHeight > document.documentElement.clientHeight,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    }));

    expect(darkScrollbar.hasVerticalScroll).toBe(true);
    expect(darkScrollbar.hasHorizontalOverflow).toBe(false);
    expect(darkScrollbar.width).toBe('thin');
    expect(darkScrollbar.color).toContain('160, 135, 87');
    expect(darkScrollbar.color).toContain('7, 9, 13');

    await page.evaluate(() => {
      window.localStorage.setItem('serhatsoruklu-theme', 'light');
    });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);

    const lightScrollbar = await page.evaluate(() => ({
      color: getComputedStyle(document.documentElement).scrollbarColor,
      width: getComputedStyle(document.documentElement).scrollbarWidth,
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    }));

    expect(lightScrollbar.hasHorizontalOverflow).toBe(false);
    expect(lightScrollbar.width).toBe('thin');
    expect(lightScrollbar.color).toContain('184, 135, 47');
    expect(lightScrollbar.color).toContain('229, 224, 214');

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => {
      window.localStorage.setItem('serhatsoruklu-theme', 'system');
    });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);

    const systemScrollbar = await page.evaluate(() => getComputedStyle(document.documentElement).scrollbarColor);
    expect(systemScrollbar).toContain('160, 135, 87');
    assertNoConsoleErrors();
  });
});
