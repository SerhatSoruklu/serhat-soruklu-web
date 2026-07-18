import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

test.describe('console health', () => {
  test('home page has no unexpected browser console errors', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    assertNoConsoleErrors();
  });

  test('route navigation has no unexpected browser console errors', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/');
    await page.getByTestId('desktop-header').getByRole('link', { name: 'Work' }).click();
    await expect(page.getByRole('heading', { name: 'Built End-to-End, Owned Completely' })).toBeVisible();
    await page.getByTestId('desktop-header').getByRole('link', { name: 'Contact' }).click();
    await expect(page.getByRole('heading', { name: 'Start With a Clear Message' })).toBeVisible();
    assertNoConsoleErrors();
  });
});
