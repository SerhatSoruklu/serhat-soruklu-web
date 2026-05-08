import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const routes = [
  { path: '/', heading: 'Serhat Soruklu' },
  { path: '/work', heading: 'Work' },
  { path: '/systems', heading: 'Systems' },
  { path: '/writing', heading: 'Writing' },
  { path: '/github', heading: 'GitHub' },
  { path: '/contact', heading: 'Contact' }
];

test.describe('smoke routes', () => {
  for (const route of routes) {
    test(`${route.path} loads without app crash`, async ({ page }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

      await page.goto(route.path);

      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible();
      await expect(page.locator('app-root')).toBeVisible();
      assertNoConsoleErrors();
    });
  }
});
