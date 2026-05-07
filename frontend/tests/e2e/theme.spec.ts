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
    await expect(page.getByRole('tooltip')).toHaveText('Theme: Light. Switch appearance.');
    await page.mouse.move(10, 10);
    await expect(page.getByRole('tooltip')).toBeHidden();

    await themeButton.click();
    await page.getByRole('menuitemradio', { name: 'System' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    assertNoConsoleErrors();
  });
});
