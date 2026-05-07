import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const routes = [
  { path: '/', heading: 'Hero working' },
  { path: '/work', heading: 'Work page working' },
  { path: '/systems', heading: 'Systems page working' },
  { path: '/writing', heading: 'Writing page working' },
  { path: '/contact', heading: 'Contact page working' }
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
