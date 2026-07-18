import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const routes = [
  { path: '/', heading: /I build fast, structured web platforms.*architect.*founder/ },
  { path: '/work', heading: 'Built End-to-End, Owned Completely' },
  { path: '/systems', heading: 'Systems Built To Hold Shape' },
  {
    path: '/systems/coupyn',
    heading: 'A live public offer and referral intelligence platform.',
  },
  {
    path: '/systems/chatpdm',
    heading: 'Deterministic interpretation inside defined constraints.',
  },
  { path: '/systems/deterministic-boundary-firewall', heading: 'Deterministic Boundary Firewall' },
  { path: '/systems/continuity-identity-model', heading: 'Continuity Identity Model' },
  { path: '/writing', heading: 'Notes from building systems that have to stay standing.' },
  { path: '/github', heading: 'GitHub' },
  { path: '/soruklu-order', heading: 'The Soruklu Order' },
  { path: '/velari', heading: /^Velari$/ },
  { path: '/contact', heading: 'Start With a Clear Message' },
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
