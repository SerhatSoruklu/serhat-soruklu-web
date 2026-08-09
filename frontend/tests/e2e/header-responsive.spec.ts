import { expect, Page, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const mobileViewports = [
  { name: '360 Galaxy S24', width: 360, height: 780 },
  { name: '390 phone', width: 390, height: 844 },
  { name: '430 phone', width: 430, height: 932 },
  { name: '768 tablet', width: 768, height: 1024 },
];
const darkLogoPath = '/assets/brand/logo/serhat_soruklu_s_dark_header.png';
const lightLogoPath = '/assets/brand/logo/serhat_soruklu_s_light_header.png';

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
}

async function getPrimaryHeadingLeft(page: Page): Promise<number> {
  return page.locator('h1').evaluate((element) => element.getBoundingClientRect().left);
}

async function expectElementInsideViewport(page: Page, testId: string): Promise<void> {
  const box = await page.getByTestId(testId).evaluate((element) => element.getBoundingClientRect());
  const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);

  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(viewportWidth);
}

async function expectLogoLoaded(page: Page, testId: string, expectedPath: string): Promise<void> {
  const logo = page.getByTestId(testId);
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('alt', 'Serhat Soruklu logo');
  await expect(logo).toHaveAttribute('src', new RegExp(`${expectedPath.replaceAll('/', '\\/')}$`));

  const naturalWidth = await logo.evaluate((element) => (element as HTMLImageElement).naturalWidth);
  expect(naturalWidth).toBeGreaterThan(0);
  expect(naturalWidth).toBeLessThanOrEqual(96);
}

async function expectResolvedLogo(
  page: Page,
  scope: 'desktop' | 'mobile',
  resolvedTheme: 'dark' | 'light',
): Promise<void> {
  const visibleTestId = `${scope}-brand-logo-${resolvedTheme}`;
  const hiddenTestId = `${scope}-brand-logo-${resolvedTheme === 'dark' ? 'light' : 'dark'}`;
  const expectedPath = resolvedTheme === 'dark' ? darkLogoPath : lightLogoPath;

  await expectLogoLoaded(page, visibleTestId, expectedPath);
  await expect(page.getByTestId(hiddenTestId)).toBeHidden();
}

async function expectPanelBelowHeader(page: Page, panelTestId: string): Promise<void> {
  await page.waitForTimeout(180);

  const headerBottom = await page
    .getByTestId('mobile-header')
    .evaluate((element) => element.getBoundingClientRect().bottom);
  const panelTop = await page
    .getByTestId(panelTestId)
    .evaluate((element) => element.getBoundingClientRect().top);

  expect(panelTop - headerBottom).toBeGreaterThanOrEqual(-2);
  expect(panelTop - headerBottom).toBeLessThanOrEqual(1);
}

async function expectThemeMenuAnchoredToButton(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const button = document.querySelector('[data-testid="mobile-theme-menu-button"]');
        const menu = document.querySelector('[data-testid="mobile-theme-menu"]');

        if (!button || !menu) {
          return Number.NEGATIVE_INFINITY;
        }

        return menu.getBoundingClientRect().top - button.getBoundingClientRect().bottom;
      }),
    )
    .toBeGreaterThanOrEqual(10);

  const geometry = await page.evaluate(() => {
    const button = document.querySelector('[data-testid="mobile-theme-menu-button"]');
    const menu = document.querySelector('[data-testid="mobile-theme-menu"]');

    if (!button || !menu) {
      return null;
    }

    const buttonBox = button.getBoundingClientRect();
    const menuBox = menu.getBoundingClientRect();

    return {
      gap: menuBox.top - buttonBox.bottom,
      rightDelta: Math.abs(menuBox.right - buttonBox.right),
      menuLeft: menuBox.left,
      menuRight: menuBox.right,
      menuWidth: menuBox.width,
      viewportWidth: document.documentElement.clientWidth,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.gap).toBeGreaterThanOrEqual(10);
  expect(geometry!.gap).toBeLessThanOrEqual(16);
  expect(geometry!.rightDelta).toBeLessThanOrEqual(1);
  expect(geometry!.menuLeft).toBeGreaterThanOrEqual(20);
  expect(geometry!.menuRight).toBeLessThanOrEqual(geometry!.viewportWidth - 20);
  expect(geometry!.menuWidth).toBeGreaterThanOrEqual(168);
  expect(geometry!.menuWidth).toBeLessThanOrEqual(184);
}

async function expectMobileMenuCloseToHeader(page: Page): Promise<void> {
  await page.waitForTimeout(180);

  const geometry = await page.evaluate(() => {
    const header = document.querySelector('[data-testid="mobile-header"]');
    const nav = document.querySelector('[data-testid="mobile-nav-panel"]');

    if (!header || !nav) {
      return null;
    }

    const headerBox = header.getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();

    return {
      gap: navBox.top - headerBox.bottom,
      navLeft: navBox.left,
      navRight: navBox.right,
      navHeight: navBox.height,
      viewportWidth: document.documentElement.clientWidth,
      viewportHeight: document.documentElement.clientHeight,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.gap).toBeGreaterThanOrEqual(-2);
  expect(geometry!.gap).toBeLessThanOrEqual(1);
  expect(geometry!.navLeft).toBeLessThanOrEqual(1);
  expect(geometry!.navRight).toBeGreaterThanOrEqual(geometry!.viewportWidth - 1);
  expect(geometry!.navHeight).toBeLessThan(geometry!.viewportHeight - 80);
}

async function expectMobileDropdownStyling(
  page: Page,
  testId: string,
  resolvedTheme: 'dark' | 'light',
): Promise<void> {
  const styles = await page.getByTestId(testId).evaluate((element) => {
    const computedStyle = getComputedStyle(element);

    return {
      backgroundColor: computedStyle.backgroundColor,
      borderColor: computedStyle.borderTopColor,
      borderBottomRadius: computedStyle.borderBottomLeftRadius,
      borderTopRadius: computedStyle.borderTopLeftRadius,
      boxShadow: computedStyle.boxShadow,
      zIndex: computedStyle.zIndex,
    };
  });

  if (testId === 'mobile-nav-panel') {
    expect(styles.borderTopRadius).toBe('0px');
    expect(styles.borderBottomRadius).toBe('0px');
  } else {
    expect(styles.borderTopRadius).toBe('10px');
  }

  expect(styles.boxShadow).not.toBe('none');

  if (resolvedTheme === 'light') {
    expect(styles.backgroundColor).toBe('rgb(248, 247, 243)');
    expect(styles.borderColor).toBe('rgb(229, 224, 214)');
    return;
  }

  expect(styles.backgroundColor).toBe('rgb(16, 20, 28)');
  expect(styles.borderColor).toBe('rgb(37, 43, 54)');
}

async function getMobileNavState(
  page: Page,
): Promise<
  Array<{ label: string; active: boolean; ariaCurrent: string | null; backgroundColor: string }>
> {
  return page
    .getByTestId('mobile-nav-panel')
    .locator('a.mobile-nav__home, a.mobile-nav__link')
    .evaluateAll((links) =>
      links.map((link) => ({
        label: link.getAttribute('aria-label') || link.textContent?.trim() || '',
        active:
          link.classList.contains('mobile-nav__link--active') ||
          link.classList.contains('mobile-nav__home--active'),
        ariaCurrent: link.getAttribute('aria-current'),
        backgroundColor: getComputedStyle(link).backgroundColor,
      })),
    );
}

async function expectOnlyMobileNavItemActive(
  page: Page,
  expectedLabel: string | null,
): Promise<void> {
  const state = await getMobileNavState(page);
  const activeItems = state.filter((item) => item.active);
  const highlightedItems = state.filter(
    (item) => item.active && item.backgroundColor !== 'rgba(0, 0, 0, 0)',
  );

  expect(activeItems.map((item) => item.label)).toEqual(expectedLabel ? [expectedLabel] : []);
  expect(highlightedItems.map((item) => item.label)).toEqual(expectedLabel ? [expectedLabel] : []);

  for (const item of state) {
    expect(item.ariaCurrent).toBe(item.label === expectedLabel ? 'page' : null);
  }
}

async function expectFirstVisualSectionBehindFixedHeader(page: Page): Promise<void> {
  const geometry = await page.evaluate(() => {
    const header = document.querySelector('[data-testid="mobile-header"]');
    const firstVisualSection = document.querySelector(
      '.page-stripe, .page-placeholder, .work-hero',
    );

    if (!header || !firstVisualSection) {
      return null;
    }

    const headerBox = header.getBoundingClientRect();
    const firstVisualSectionBox = firstVisualSection.getBoundingClientRect();

    return {
      headerBottom: headerBox.bottom,
      firstVisualSectionTop: firstVisualSectionBox.top,
      firstVisualSectionBottom: firstVisualSectionBox.bottom,
    };
  });

  expect(geometry).not.toBeNull();
  expect(geometry!.firstVisualSectionTop).toBeLessThan(geometry!.headerBottom);
  expect(geometry!.firstVisualSectionBottom).toBeGreaterThan(geometry!.headerBottom + 120);
}

async function sampleComputedColor(page: Page, selector: string): Promise<string[]> {
  return page.evaluate(async (targetSelector) => {
    const target = document.querySelector(targetSelector);

    if (!target) {
      return [];
    }

    const colors: string[] = [];

    for (let index = 0; index < 6; index += 1) {
      colors.push(getComputedStyle(target).color);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return colors;
  }, selector);
}

async function sampleUnderlineStyles(
  page: Page,
  selector: string,
): Promise<Array<{ backgroundColor: string; transform: string }>> {
  return page.evaluate(async (targetSelector) => {
    const target = document.querySelector(targetSelector);

    if (!target) {
      return [];
    }

    const styles: Array<{ backgroundColor: string; transform: string }> = [];

    for (let index = 0; index < 6; index += 1) {
      const underlineStyle = getComputedStyle(target, '::after');
      styles.push({
        backgroundColor: underlineStyle.backgroundColor,
        transform: underlineStyle.transform,
      });
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }

    return styles;
  }, selector);
}

async function expectTooltipArrowAligned(page: Page, triggerTestId: string): Promise<void> {
  const alignment = await page.evaluate((testId) => {
    const trigger = document.querySelector(`[data-testid="${testId}"]`);
    const tooltip = document.querySelector('[role="tooltip"]');

    if (!trigger || !tooltip) {
      return null;
    }

    const triggerBox = trigger.getBoundingClientRect();
    const tooltipBox = tooltip.getBoundingClientRect();
    const arrowStyle = getComputedStyle(tooltip).getPropertyValue('--tooltip-arrow-left');
    const arrowX = Number.parseFloat(arrowStyle);

    return {
      arrowCenter: tooltipBox.left + arrowX,
      triggerCenter: triggerBox.left + triggerBox.width / 2,
      tooltipLeft: tooltipBox.left,
      tooltipRight: tooltipBox.right,
      viewportWidth: document.documentElement.clientWidth,
    };
  }, triggerTestId);

  expect(alignment).not.toBeNull();
  expect(Math.abs(alignment!.arrowCenter - alignment!.triggerCenter)).toBeLessThanOrEqual(2);
  expect(alignment!.tooltipLeft).toBeGreaterThanOrEqual(0);
  expect(alignment!.tooltipRight).toBeLessThanOrEqual(alignment!.viewportWidth);
}

async function expectTooltipArrowTheme(page: Page, resolvedTheme: 'dark' | 'light'): Promise<void> {
  const colors = await page.getByRole('tooltip').evaluate((element) => {
    const before = getComputedStyle(element, '::before');
    const after = getComputedStyle(element, '::after');

    return {
      border: before.borderBottomColor,
      fill: after.borderBottomColor,
    };
  });

  if (resolvedTheme === 'light') {
    expect(colors.border).toBe('rgb(229, 224, 214)');
    expect(colors.fill).toBe('rgb(255, 255, 255)');
    return;
  }

  expect(colors.border).toBe('rgb(37, 43, 54)');
  expect(colors.fill).toBe('rgb(16, 20, 28)');
}

test.describe('responsive shell header', () => {
  test('desktop header renders nav, theme selector, and routes', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const consoleMessages: string[] = [];
    page.on('console', (message) => {
      consoleMessages.push(message.text());
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(700);

    const desktopHeader = page.getByTestId('desktop-header');
    await expect(
      desktopHeader.getByRole('link', { name: /Serhat Soruklu.*Systems Architect/i }),
    ).toBeVisible();
    await expect(desktopHeader.getByText('SYSTEMS ARCHITECT')).toBeVisible();
    const primaryNavigation = desktopHeader.getByRole('navigation', {
      name: 'Primary navigation',
    });
    await expect(primaryNavigation).toBeVisible();
    await expect(primaryNavigation.getByRole('link', { name: /press/i })).toHaveCount(0);
    await expect(desktopHeader.getByRole('link', { name: 'Work' })).toBeVisible();
    await expect(
      desktopHeader.getByRole('link', { name: 'Work' }).locator('.site-nav__icon'),
    ).toBeVisible();
    await expect(
      desktopHeader.getByRole('link', { name: 'GitHub' }).locator('svg.site-nav__github-icon'),
    ).toBeVisible();
    await expect(desktopHeader.getByTestId('desktop-theme-menu-button')).toBeVisible();
    await expectResolvedLogo(page, 'desktop', 'dark');
    await expect(page.getByTestId('mobile-header')).toBeHidden();
    await expect(page.getByTestId('mobile-menu-button')).toBeHidden();

    await desktopHeader.getByRole('link', { name: 'Work' }).click();
    await expect(page).toHaveURL('/work');
    await expect(
      page.getByRole('heading', {
        name: 'Built End-to-End, Owned Completely',
        exact: true,
        level: 1,
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(consoleMessages.some((message) => message.includes('NG0913'))).toBe(false);
    assertNoConsoleErrors();
  });

  test('desktop identity picker keeps an attached hover and keyboard interaction area', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1820, height: 1000 });
    await page.goto('/');

    const identityButton = page.getByTestId('desktop-identity-button');
    await identityButton.hover();
    const identityMenu = page.getByTestId('desktop-identity-menu');
    await expect(identityMenu).toBeVisible();
    await expect(identityMenu.getByRole('link', { name: /press/i })).toHaveCount(0);
    await expect(identityMenu.getByRole('link')).toHaveCount(4);
    expect(
      await identityMenu
        .getByRole('link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual(['/about', '/soruklu-surname', '/soruklu-order', '/velari']);

    const buttonBox = await identityButton.boundingBox();
    const menuBox = await identityMenu.boundingBox();
    expect(buttonBox).not.toBeNull();
    expect(menuBox).not.toBeNull();

    await page.mouse.move(
      buttonBox!.x + buttonBox!.width / 2,
      buttonBox!.y + buttonBox!.height / 2,
    );
    await page.mouse.move(menuBox!.x + 24, menuBox!.y + 8, { steps: 16 });
    await expect(identityMenu).toBeVisible();

    await page.mouse.move(10, 280);
    await expect(identityMenu).toBeHidden();

    await identityButton.hover();
    await identityMenu.getByRole('link', { name: 'Soruklu Order' }).click();
    await expect(page).toHaveURL('/soruklu-order');

    await page.goto('/');
    await page.mouse.move(10, 280);
    await page.getByTestId('desktop-identity-button').focus();
    await expect(page.getByTestId('desktop-identity-menu')).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('desktop-identity-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('desktop-identity-menu')).toBeHidden();
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('desktop logo follows dark and light theme selection', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expectResolvedLogo(page, 'desktop', 'dark');
    await page.getByTestId('desktop-theme-menu-button').click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expectResolvedLogo(page, 'desktop', 'light');
    assertNoConsoleErrors();
  });

  test('desktop theme tooltip reflects selected appearance and does not block dropdown', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const themeButton = page.getByTestId('desktop-theme-menu-button');
    await themeButton.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Dark theme');
    await expectTooltipArrowAligned(page, 'desktop-theme-menu-button');
    await expectTooltipArrowTheme(page, 'dark');
    await page.mouse.move(10, 10);
    await expect(page.getByRole('tooltip')).toBeHidden();

    await themeButton.focus();
    await expect(page.getByRole('tooltip')).toHaveText('Dark theme');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toBeHidden();

    await themeButton.click();
    await expect(page.getByRole('menu', { name: 'Theme options' })).toBeVisible();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await themeButton.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Light theme');
    await expectTooltipArrowAligned(page, 'desktop-theme-menu-button');
    await expectTooltipArrowTheme(page, 'light');

    await themeButton.click();
    await page.getByRole('menuitemradio', { name: 'System' }).click();
    await themeButton.hover();
    await expect(page.getByRole('tooltip')).toHaveText('System theme');
    await expectTooltipArrowAligned(page, 'desktop-theme-menu-button');
    assertNoConsoleErrors();
  });

  test('system theme logo follows resolved light mode', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ colorScheme: 'light' });
    await page.addInitScript(() => {
      window.localStorage.setItem('serhatsoruklu-theme', 'system');
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expectResolvedLogo(page, 'desktop', 'light');
    assertNoConsoleErrors();
  });

  test('home and inner page headings keep valid gutters', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const homeLeft = await getPrimaryHeadingLeft(page);

    await page.goto('/work');
    await expect(
      page.getByRole('heading', {
        name: 'Built End-to-End, Owned Completely',
        exact: true,
        level: 1,
      }),
    ).toBeVisible();
    const workLeft = await getPrimaryHeadingLeft(page);

    expect(homeLeft).toBeGreaterThanOrEqual(20);
    expect(workLeft).toBeGreaterThanOrEqual(20);
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('brand typography uses Sora display and Space Mono technical labels', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByTestId('desktop-header').getByText('SYSTEMS ARCHITECT')).toBeVisible();

    const headingFont = await page
      .locator('h1')
      .evaluate((element) => getComputedStyle(element).fontFamily);
    const subtitleFont = await page
      .getByTestId('desktop-header')
      .getByText('SYSTEMS ARCHITECT')
      .evaluate((element) => getComputedStyle(element).fontFamily);

    expect(headingFont).toContain('Sora');
    expect(subtitleFont).toContain('Space Mono');
    assertNoConsoleErrors();
  });

  test('saved light theme is applied before Angular bootstraps', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.addInitScript(() => {
      window.localStorage.setItem('serhatsoruklu-theme', 'light');
    });
    await page.goto('/');

    await expect(page.locator('html')).toHaveClass(/theme-light/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ffffff');
    await expectResolvedLogo(page, 'desktop', 'light');
    assertNoConsoleErrors();
  });

  test('mini laptop width uses desktop header', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    const desktopHeader = page.getByTestId('desktop-header');
    await expect(desktopHeader).toBeVisible();
    await expect(
      desktopHeader.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeVisible();
    await expect(page.getByTestId('mobile-header')).toBeHidden();
    await expect(page.getByTestId('mobile-menu-button')).toBeHidden();
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('desktop nav hover uses stable text color and gold underline', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const workLink = page.getByTestId('desktop-header').getByRole('link', { name: 'Work' });
    await workLink.hover();

    await expect(workLink).toHaveCSS('color', 'rgb(245, 247, 250)');
    await expect(workLink).toHaveCSS('text-decoration-line', 'none');

    const colors = await sampleComputedColor(page, '.site-nav__link[href="/work"]');
    expect(new Set(colors)).toEqual(new Set(['rgb(245, 247, 250)']));

    const underlineStyles = await sampleUnderlineStyles(page, '.site-nav__link[href="/work"]');
    expect(new Set(underlineStyles.map((style) => style.backgroundColor))).toEqual(
      new Set(['rgb(214, 168, 79)']),
    );
    expect(new Set(underlineStyles.map((style) => style.transform))).toEqual(new Set(['none']));
    assertNoConsoleErrors();
  });

  for (const viewport of mobileViewports) {
    test(`mobile/tablet nav active state is exact at ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
      const routeCases = [
        { path: '/', activeLabel: 'Home' },
        { path: '/work', activeLabel: 'Work' },
        { path: '/systems', activeLabel: 'Systems' },
        { path: '/writing', activeLabel: 'Writing' },
        { path: '/github', activeLabel: 'GitHub' },
        { path: '/contact', activeLabel: 'Contact' },
      ];

      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const routeCase of routeCases) {
        await page.goto(routeCase.path);
        await page.getByTestId('mobile-menu-button').click();
        await expectOnlyMobileNavItemActive(page, routeCase.activeLabel);
        await expectNoHorizontalOverflow(page);
      }

      await page.goto('/github');
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByTestId('mobile-menu-button').click();
      await expectOnlyMobileNavItemActive(page, 'GitHub');

      const contactLink = page
        .getByTestId('mobile-nav-panel')
        .getByRole('link', { name: 'Contact' });
      await contactLink.hover();
      await expectOnlyMobileNavItemActive(page, 'GitHub');
      await contactLink.focus();
      await expectOnlyMobileNavItemActive(page, 'GitHub');

      assertNoConsoleErrors();
    });

    test(`mobile/tablet header works at ${viewport.name}`, async ({ page }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      const mobileHeader = page.getByTestId('mobile-header');
      await expect(
        mobileHeader.getByRole('link', { name: /Serhat Soruklu.*Systems Architect/i }),
      ).toBeVisible();
      await expect(mobileHeader.locator('.mobile-brand__name')).toHaveText('Serhat Soruklu');
      await expect(mobileHeader.getByText('SYSTEMS ARCHITECT')).toBeVisible();
      await expect(mobileHeader.getByTestId('mobile-theme-menu-button')).toBeVisible();
      await expect(mobileHeader.getByTestId('mobile-menu-button')).toBeVisible();
      await expectResolvedLogo(page, 'mobile', 'dark');
      await expect(page.getByTestId('desktop-header')).toBeHidden();
      await expectElementInsideViewport(page, 'mobile-theme-menu-button');
      await expectElementInsideViewport(page, 'mobile-menu-button');
      await expectNoHorizontalOverflow(page);

      await mobileHeader.getByTestId('mobile-menu-button').click();
      const mobileNav = mobileHeader.getByTestId('mobile-nav-panel');
      await expect(mobileNav).toBeVisible();
      await expect(mobileNav).not.toHaveAttribute('aria-hidden');
      await expectPanelBelowHeader(page, 'mobile-nav-panel');
      await expectMobileMenuCloseToHeader(page);
      await expectMobileDropdownStyling(page, 'mobile-nav-panel', 'dark');
      await expect(mobileNav.getByRole('link', { name: 'Work' })).toBeVisible();
      await expect(
        mobileNav.getByRole('link', { name: 'Work' }).locator('.mobile-nav__icon'),
      ).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: 'Systems' })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: 'Writing' })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: 'GitHub' })).toBeVisible();
      await expect(
        mobileNav.getByRole('link', { name: 'GitHub' }).locator('svg.mobile-nav__github-icon'),
      ).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: 'Contact' })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: /press/i })).toHaveCount(0);

      const identityRoutes = [
        { label: 'About', path: '/about' },
        { label: 'Soruklu Surname', path: '/soruklu-surname' },
        { label: 'Soruklu Order', path: '/soruklu-order' },
        { label: 'Velari', path: '/velari' },
      ];

      for (const identityRoute of identityRoutes) {
        if (!(await mobileNav.isVisible())) {
          await mobileHeader.getByTestId('mobile-menu-button').click();
        }

        const identityButton = mobileNav.getByTestId('mobile-identity-button');
        const urlBeforeExpansion = page.url();
        await identityButton.click();
        await expect(identityButton).toHaveAttribute('aria-expanded', 'true');
        await expect(page).toHaveURL(urlBeforeExpansion);

        const identityChooser = mobileNav.getByTestId('mobile-identity-routes');
        await expect(identityChooser).toBeVisible();
        await expect(identityChooser.getByRole('link', { name: /press/i })).toHaveCount(0);
        await expect(identityChooser.getByRole('link')).toHaveCount(4);
        await identityChooser.getByRole('link', { name: identityRoute.label }).click();
        await expect(page).toHaveURL(identityRoute.path);
        await expect(mobileNav).toBeHidden();
      }

      await mobileHeader.getByTestId('mobile-theme-menu-button').click();
      await expect(mobileNav).toBeHidden();
      await expect(mobileHeader.getByRole('menu', { name: 'Theme options' })).toBeVisible();
      await expectThemeMenuAnchoredToButton(page);
      await expectMobileDropdownStyling(page, 'mobile-theme-menu', 'dark');
      await mobileHeader.getByTestId('mobile-menu-button').click();
      await expect(mobileHeader.getByRole('menu', { name: 'Theme options' })).toBeHidden();
      await expect(mobileNav).toBeVisible();

      await mobileNav.getByRole('link', { name: 'GitHub' }).click();
      await expect(page).toHaveURL('/github');
      await expect(page.getByRole('heading', { name: 'GitHub' })).toBeVisible();
      await expect(mobileNav).toBeHidden();

      await mobileHeader.getByTestId('mobile-menu-button').click();
      await mobileNav.getByRole('link', { name: 'Work' }).click();
      await expect(page).toHaveURL('/work');
      await expect(
        page.getByRole('heading', {
          name: 'Built End-to-End, Owned Completely',
          exact: true,
          level: 1,
        }),
      ).toBeVisible();
      await expect(mobileNav).toBeHidden();
      const focusInsideMobileNav = await mobileNav.evaluate((element) =>
        element.contains(document.activeElement),
      );
      expect(focusInsideMobileNav).toBe(false);

      await mobileHeader.getByTestId('mobile-theme-menu-button').click();
      await expect(mobileHeader.getByRole('menu', { name: 'Theme options' })).toBeVisible();
      await expectThemeMenuAnchoredToButton(page);
      await expectMobileDropdownStyling(page, 'mobile-theme-menu', 'dark');
      await mobileHeader.getByRole('menuitemradio', { name: 'Light' }).click();
      await expect(page.locator('html')).toHaveClass(/theme-light/);
      await expectResolvedLogo(page, 'mobile', 'light');
      await expect(mobileHeader.getByRole('menu', { name: 'Theme options' })).toBeHidden();
      await expectFirstVisualSectionBehindFixedHeader(page);
      await mobileHeader.getByTestId('mobile-theme-menu-button').click();
      await expect(mobileHeader.getByRole('menu', { name: 'Theme options' })).toBeVisible();
      await expectThemeMenuAnchoredToButton(page);
      await expectMobileDropdownStyling(page, 'mobile-theme-menu', 'light');
      await mobileHeader.getByRole('menuitemradio', { name: 'Dark' }).click();
      await expect(page.locator('html')).toHaveClass(/theme-dark/);
      await expectResolvedLogo(page, 'mobile', 'dark');
      await mobileHeader.getByTestId('mobile-theme-menu-button').focus();
      await expect(page.getByRole('tooltip')).toHaveText('Dark theme');
      await expectTooltipArrowAligned(page, 'mobile-theme-menu-button');
      await expectTooltipArrowTheme(page, 'dark');
      await page.keyboard.press('Escape');
      await expectNoHorizontalOverflow(page);
      assertNoConsoleErrors();
    });
  }
});
