import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const repositoryLinks = [
  { testId: 'repository-chatpdm-link', url: 'https://github.com/SerhatSoruklu/chatpdm' },
  {
    testId: 'repository-deterministic-boundary-firewall-link',
    url: 'https://github.com/SerhatSoruklu/deterministic-boundary-firewall',
  },
  {
    testId: 'repository-continuity-identity-model-link',
    url: 'https://github.com/SerhatSoruklu/continuity-identity-model',
  },
  {
    testId: 'repository-serhat-soruklu-web-link',
    url: 'https://github.com/SerhatSoruklu/serhat-soruklu-web',
  },
  {
    testId: 'repository-zeroglare-continuity-system-link',
    url: 'https://github.com/SerhatSoruklu/zeroglare-continuity-system',
  },
] as const;

test.describe('GitHub page', () => {
  test('keeps general GitHub navigation internal', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/');
    const globalLinks = [
      page.locator('.site-nav__link[href="/github"]'),
      page.locator('.mobile-nav__link[href="/github"]'),
      page.locator('.site-footer__link[href="/github"]'),
      page.locator('.home-next__panel[href="/github"]'),
    ];

    for (const link of globalLinks) {
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('href', '/github');
      await expect(link).not.toHaveAttribute('target', '_blank');
    }

    await page.goto('/work');
    await expect(page.locator('.work-hero__actions a[href="/github"]')).toHaveAttribute(
      'href',
      '/github',
    );

    await page.goto('/systems');
    await expect(page.locator('.systems-next-card[href="/github"]')).toHaveAttribute(
      'href',
      '/github',
    );
    assertNoConsoleErrors();
  });

  test('renders the full repository architecture with exact link semantics', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/github');

    await expect(page.getByRole('heading', { name: 'GitHub', exact: true })).toBeVisible();
    await expect(page.locator('.page-placeholder')).toHaveCount(0);

    for (const repository of repositoryLinks) {
      const link = page.getByTestId(repository.testId);

      await expect(link).toHaveAttribute('href', repository.url);
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(link).not.toHaveAttribute('routerlink', /.+/);
    }

    const profileLinks = page.locator('[data-testid^="github-profile-"]');
    await expect(profileLinks).toHaveCount(2);
    for (const link of await profileLinks.all()) {
      await expect(link).toHaveAttribute('href', 'https://github.com/SerhatSoruklu');
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    const coupynSection = page.getByTestId('coupyn-private-section');
    await expect(coupynSection).toContainText('proprietary implementation details');
    await expect(coupynSection).toContainText('operational infrastructure');
    await expect(coupynSection).toContainText('security-sensitive system behaviour');
    await expect(coupynSection.getByText('View GitHub')).toHaveCount(0);
    await expect(coupynSection.locator('a[href*="github.com"]')).toHaveCount(0);
    await expect(
      coupynSection.getByRole('link', { name: /Explore Coupyn Architecture/ }),
    ).toHaveAttribute('href', '/systems/coupyn');
    await expect(coupynSection.getByRole('link', { name: /Open Coupyn/ })).toHaveAttribute(
      'href',
      'https://coupyn.com',
    );
    assertNoConsoleErrors();
  });

  test('routes repository links through /github and live products externally', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/systems');

    const systemCards = ['Deterministic Boundary Firewall', 'Continuity Identity Model'];

    for (const system of systemCards) {
      const card = page.locator('.system-card').filter({ hasText: system });
      const link = card.getByRole('link', { name: 'View GitHub' });

      await expect(link).toHaveAttribute('href', '/github');
      await expect(link).not.toHaveAttribute('target');
    }

    const coupynCard = page.locator('.system-card').filter({ hasText: 'Coupyn' });
    await expect(coupynCard.locator('.system-card__secondary')).toHaveAttribute(
      'href',
      'https://coupyn.com',
    );
    await expect(coupynCard.getByText('View GitHub')).toHaveCount(0);

    const chatpdmCard = page.locator('.system-card').filter({ hasText: 'ChatPDM' });
    const chatpdmLink = chatpdmCard.getByRole('link', { name: 'Open ChatPDM', exact: true });
    await expect(chatpdmLink).toHaveAttribute('href', 'https://chatpdm.com');
    await expect(chatpdmLink).toHaveAttribute('target', '_blank');
    await expect(chatpdmLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(chatpdmCard.getByText('View GitHub')).toHaveCount(0);

    for (const path of [
      '/systems/deterministic-boundary-firewall',
      '/systems/continuity-identity-model',
    ]) {
      await page.goto(path);
      const githubLinks = page
        .locator('.research-system-page')
        .getByRole('link', { name: /View GitHub|GitHub/ });

      await expect(githubLinks).toHaveCount(2);
      for (const link of await githubLinks.all()) {
        await expect(link).toHaveAttribute('href', '/github');
        await expect(link).not.toHaveAttribute('target');
      }
    }
    assertNoConsoleErrors();
  });

  test('keeps Explore Repositories on /github with keyboard and history support', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/github');
    const action = page.getByRole('link', { name: 'Explore Repositories' });
    await expect(action).toHaveAttribute('href', '/github#repositories');
    await action.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/github#repositories');
    await expect(page.locator('#repositories')).toBeInViewport();

    await page.goBack();
    await expect(page).toHaveURL('/github');
    await page.goForward();
    await expect(page).toHaveURL('/github#repositories');

    await page.goto('/github#repositories');
    await expect(page).toHaveURL('/github#repositories');
    await expect(page.locator('#repositories')).toBeVisible();
    assertNoConsoleErrors();
  });

  test('keeps the GitHub page responsive without horizontal overflow', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const viewports = [
      { width: 390, height: 844 },
      { width: 430, height: 932 },
      { width: 768, height: 1024 },
      { width: 1024, height: 768 },
      { width: 1440, height: 900 },
      { width: 1280, height: 650 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/github');
      await expect(page.getByTestId('github-hero')).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

      for (const selector of ['.github-hero__inner', '.github-section-frame']) {
        const frame = await page
          .locator(selector)
          .first()
          .evaluate((element) => {
            const bounds = element.getBoundingClientRect();

            return {
              left: bounds.left,
              right: document.documentElement.clientWidth - bounds.right,
            };
          });

        expect(frame.left).toBeCloseTo(20, 1);
        expect(frame.right).toBeCloseTo(20, 1);
      }

      const heroMinHeight = await page
        .getByTestId('github-hero')
        .locator('.github-hero__inner')
        .evaluate((element) => Number.parseFloat(getComputedStyle(element).minHeight));

      if (viewport.width < 1024) {
        expect(heroMinHeight).toBe(0);
      } else if (viewport.height <= 720) {
        expect(heroMinHeight).toBe(520);
      } else {
        expect(heroMinHeight).toBeGreaterThanOrEqual(560);
        expect(heroMinHeight).toBeLessThanOrEqual(760);
      }
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/github');
    const flagshipTop = await page
      .locator('#repositories')
      .evaluate((element) => element.getBoundingClientRect().top);
    expect(flagshipTop).toBeLessThan(900);
    assertNoConsoleErrors();
  });

  test('supports dark, light, and system theme resolution', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.goto('/github');
    await expect(page.locator('html')).toHaveClass(/theme-dark/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    const darkSurface = await page
      .locator('.github-page')
      .evaluate((element) => getComputedStyle(element).backgroundImage);

    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'light'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-light/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    const lightSurface = await page
      .locator('.github-page')
      .evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(lightSurface).not.toBe(darkSurface);

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => window.localStorage.setItem('serhatsoruklu-theme', 'system'));
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    await expect
      .poll(() =>
        page
          .locator('.github-page')
          .evaluate((element) => getComputedStyle(element).backgroundImage),
      )
      .toBe(darkSurface);

    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect
      .poll(() =>
        page
          .locator('.github-page')
          .evaluate((element) => getComputedStyle(element).backgroundImage),
      )
      .toBe(lightSurface);
    assertNoConsoleErrors();
  });
});
