import { expect, test } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const viewports = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'wide', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 }
];

test.describe('home system architecture diagrams', () => {
  for (const viewport of viewports) {
    test(`Built Systems section stays valid at ${viewport.name}`, async ({ page }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');

      await expect(page.getByRole('heading', { name: 'Built Systems, Not Concepts' })).toBeVisible();
      await expect(page.getByTestId('coupyn-architecture-diagram')).toBeVisible();
      await expect(page.getByTestId('chatpdm-architecture-diagram')).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement;

        return root.scrollWidth > root.clientWidth + 1;
      });

      expect(hasHorizontalOverflow).toBe(false);

      for (const testId of ['coupyn-architecture-diagram', 'chatpdm-architecture-diagram']) {
        const diagram = page.getByTestId(testId);
        const box = await diagram.boundingBox();
        const fitsPanel = await diagram.evaluate((element) => {
          const panel = element.closest('.system-panel');

          if (!panel) {
            return false;
          }

          const diagramRect = element.getBoundingClientRect();
          const panelRect = panel.getBoundingClientRect();

          return diagramRect.left >= panelRect.left - 1 && diagramRect.right <= panelRect.right + 1;
        });

        expect(box?.width ?? 0).toBeGreaterThan(250);
        expect(box?.height ?? 0).toBeGreaterThan(150);
        expect(fitsPanel).toBe(true);
      }

      assertNoConsoleErrors();
    });
  }

  test('system diagrams remain visible in light theme', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.getByTestId('desktop-theme-menu-button').click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();

    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(page.getByTestId('coupyn-architecture-diagram')).toBeVisible();
    await expect(page.getByTestId('chatpdm-architecture-diagram')).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement;

      return root.scrollWidth > root.clientWidth + 1;
    });

    expect(hasHorizontalOverflow).toBe(false);
    assertNoConsoleErrors();
  });

  test('ChatPDM diagram uses resolve, refuse, and gate semantic colors', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('chatpdm-architecture-diagram')).toBeVisible();
    await page.waitForFunction(() => {
      const resolveRail = document.querySelector('[data-testid="chatpdm-architecture-diagram"] .architecture-rail--resolve');

      return resolveRail ? getComputedStyle(resolveRail).stroke !== '' : false;
    });

    const darkColors = await page.getByTestId('chatpdm-architecture-diagram').evaluate((diagram) => {
      const colorFor = (selector: string) => getComputedStyle(diagram.querySelector(selector)!).stroke;

      return {
        gate: colorFor('.architecture-rail--gold'),
        resolve: colorFor('.architecture-rail--resolve'),
        refuse: colorFor('.architecture-rail--refuse')
      };
    });

    expect(darkColors).toEqual({
      gate: 'rgb(214, 168, 79)',
      resolve: 'rgb(134, 201, 154)',
      refuse: 'rgb(212, 129, 120)'
    });

    await page.getByTestId('desktop-theme-menu-button').click();
    await page.getByRole('menuitemradio', { name: 'Light' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);

    const lightColors = await page.getByTestId('chatpdm-architecture-diagram').evaluate((diagram) => {
      const colorFor = (selector: string) => getComputedStyle(diagram.querySelector(selector)!).stroke;

      return {
        gate: colorFor('.architecture-rail--gold'),
        resolve: colorFor('.architecture-rail--resolve'),
        refuse: colorFor('.architecture-rail--refuse')
      };
    });

    expect(lightColors).toEqual({
      gate: 'rgb(184, 135, 47)',
      resolve: 'rgb(47, 143, 70)',
      refuse: 'rgb(179, 75, 66)'
    });
    assertNoConsoleErrors();
  });

  test('ChatPDM node icons and labels share centered axes', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('chatpdm-architecture-diagram')).toBeVisible();

    const alignment = await page.getByTestId('chatpdm-architecture-diagram').evaluate((diagram) => {
      const nodes = ['input', 'parse', 'contract', 'gate', 'resolve', 'refuse', 'audit'];

      return nodes.map((node) => {
        const group = diagram.querySelector(`[data-chatpdm-node="${node}"]`)!;
        const frame = group.querySelector('.architecture-card-frame')!;
        const icon = group.querySelector('.architecture-icon')!;
        const label = group.querySelector('.architecture-label')!;
        const centerFor = (element: Element) => {
          const box = element.getBoundingClientRect();

          return box.left + box.width / 2;
        };

        const frameCenter = centerFor(frame);

        return {
          node,
          iconDelta: Math.abs(centerFor(icon) - frameCenter),
          labelDelta: Math.abs(centerFor(label) - frameCenter)
        };
      });
    });

    for (const node of alignment) {
      expect(node.iconDelta, `${node.node} icon horizontal center`).toBeLessThanOrEqual(4);
      expect(node.labelDelta, `${node.node} label horizontal center`).toBeLessThanOrEqual(4);
    }

    assertNoConsoleErrors();
  });

  test('Coupyn diagram reserves gold for trusted outcomes and blue for commerce flow', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('coupyn-architecture-diagram')).toBeVisible();
    await page.waitForFunction(() => {
      const commerceRail = document.querySelector('[data-testid="coupyn-architecture-diagram"] .architecture-rail--blue');

      return commerceRail ? getComputedStyle(commerceRail).stroke !== '' : false;
    });

    const colors = await page.getByTestId('coupyn-architecture-diagram').evaluate((diagram) => {
      const colorFor = (selector: string, property: 'color' | 'stroke' = 'stroke') =>
        getComputedStyle(diagram.querySelector(selector)!).getPropertyValue(property);

      return {
        commerceRail: colorFor('.architecture-rail--blue'),
        offerIcon: colorFor('.architecture-icon--blue', 'color'),
        proofIcon: colorFor('.architecture-card--trusted .architecture-icon--gold', 'color')
      };
    });

    expect(colors).toEqual({
      commerceRail: 'rgb(114, 172, 243)',
      offerIcon: 'rgb(114, 172, 243)',
      proofIcon: 'rgb(240, 213, 140)'
    });
    assertNoConsoleErrors();
  });
});
