import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const themeStorageKey = 'serhatsoruklu-theme';
const portraits = {
  dark: {
    path: '/assets/home/serhat-soruklu-founder-dark.png',
    alt: 'Serhat Soruklu seated at his workstation in a dark office.',
  },
  light: {
    path: '/assets/home/serhat-soruklu-founder-light.png',
    alt: 'Serhat Soruklu seated at his workstation in a bright office.',
  },
} as const;
const dialogCases = [
  { name: 'mobile-dark', width: 390, height: 844, theme: 'dark' },
  { name: 'mobile-light', width: 390, height: 844, theme: 'light' },
  { name: 'tablet-dark', width: 768, height: 1024, theme: 'dark' },
  { name: 'laptop-dark', width: 1366, height: 768, theme: 'dark' },
  { name: 'desktop-light', width: 1440, height: 900, theme: 'light' },
  { name: 'wide-desktop-dark', width: 1920, height: 1080, theme: 'dark' },
] as const;

type PortraitTheme = keyof typeof portraits;
type ThemeSetting = PortraitTheme | 'system';

async function setInitialTheme(page: Page, setting: ThemeSetting): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      globalThis.window.localStorage.setItem(key, value);
    },
    [themeStorageKey, setting],
  );
}

async function openPortraitDialog(page: Page): Promise<void> {
  const trigger = page.getByTestId('home-hero-portrait-trigger');

  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.getByTestId('portrait-dialog')).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Serhat Soruklu' })).toBeVisible();
}

async function waitForDialogPortrait(page: Page, theme: PortraitTheme): Promise<void> {
  const image = page.getByTestId('portrait-dialog-portrait-image');

  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute('data-portrait-theme', theme);
  await expect(image).toHaveAttribute('src', portraits[theme].path);
  await expect(image).toHaveAttribute('alt', portraits[theme].alt);
  await expect(image).toHaveAttribute('width', '1448');
  await expect(image).toHaveAttribute('height', '1086');
  await expect(image).toHaveAttribute('decoding', 'async');
  await expect(image).toHaveAttribute('loading', 'eager');
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBe(1448);
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalHeight))
    .toBe(1086);
}

async function getDialogState(page: Page): Promise<{
  closeCentered: boolean;
  contentOverflow: boolean;
  dialogHeight: number;
  documentOverflow: boolean;
  fontSummary: string;
  fontTitle: string;
  iconCount: number;
  invisibleIcons: number;
  mediaAspectRatio: number;
  objectFit: string;
  panelGutters: { bottom: number; left: number; right: number; top: number };
}> {
  return page.getByTestId('portrait-dialog').evaluate((dialog) => {
    const panel = dialog.closest('.cdk-overlay-pane.serhat-portrait-dialog-panel')!;
    const close = dialog.querySelector('.portrait-dialog__close')!;
    const closeIcon = close.querySelector('.mat-icon')!;
    const content = dialog.querySelector('.portrait-dialog__content')!;
    const image = dialog.querySelector(
      '[data-testid="portrait-dialog-portrait-image"]',
    ) as HTMLImageElement;
    const media = dialog.querySelector('.portrait-dialog__media')!;
    const summary = dialog.querySelector('.portrait-dialog__summary')!;
    const title = dialog.querySelector('.portrait-dialog__title')!;
    const icons = Array.from(dialog.querySelectorAll('.mat-icon'));
    const dialogBox = dialog.getBoundingClientRect();
    const panelBox = panel.getBoundingClientRect();
    const closeBox = close.getBoundingClientRect();
    const iconBox = closeIcon.getBoundingClientRect();
    const mediaBox = media.getBoundingClientRect();
    const viewportWidth = globalThis.document.documentElement.clientWidth;
    const viewportHeight = globalThis.document.documentElement.clientHeight;

    return {
      closeCentered:
        Math.abs(closeBox.left + closeBox.width / 2 - (iconBox.left + iconBox.width / 2)) <= 1 &&
        Math.abs(closeBox.top + closeBox.height / 2 - (iconBox.top + iconBox.height / 2)) <= 1,
      contentOverflow: [dialog, content].some(
        (element) => element.scrollWidth > element.clientWidth + 1,
      ),
      dialogHeight: dialogBox.height,
      documentOverflow: globalThis.document.documentElement.scrollWidth > viewportWidth + 1,
      fontSummary: getComputedStyle(summary).fontFamily,
      fontTitle: getComputedStyle(title).fontFamily,
      iconCount: icons.length,
      invisibleIcons: icons.filter((icon) => {
        const box = icon.getBoundingClientRect();

        return box.width < 1 || box.height < 1;
      }).length,
      mediaAspectRatio: mediaBox.width / mediaBox.height,
      objectFit: getComputedStyle(image).objectFit,
      panelGutters: {
        bottom: viewportHeight - panelBox.bottom,
        left: panelBox.left,
        right: viewportWidth - panelBox.right,
        top: panelBox.top,
      },
    };
  });
}

async function expectLastDialogContentReachable(page: Page): Promise<void> {
  const lastChip = page.getByText('SEO', { exact: true });

  if (await lastChip.isVisible()) {
    return;
  }

  const scrollTarget = await page.evaluate(() => {
    const candidates = [
      globalThis.document.querySelector('[data-testid="portrait-dialog"]'),
      globalThis.document.querySelector('.portrait-dialog__content'),
    ].filter((candidate): candidate is Element => candidate !== null);

    return candidates
      .map((element) => {
        const style = getComputedStyle(element);

        return {
          className: element.className,
          clientHeight: element.clientHeight,
          overflowY: style.overflowY,
          scrollHeight: element.scrollHeight,
        };
      })
      .find(
        ({ clientHeight, overflowY, scrollHeight }) =>
          scrollHeight > clientHeight + 1 && ['auto', 'scroll'].includes(overflowY),
      );
  });

  expect(
    scrollTarget,
    'dialog must expose a user-scrollable route to its final content',
  ).toBeTruthy();

  const selector = scrollTarget?.className.includes('portrait-dialog__content')
    ? '.portrait-dialog__content'
    : '[data-testid="portrait-dialog"]';

  await page.locator(selector).evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect(lastChip).toBeVisible();
}

function trackPortraitTraffic(page: Page): { failed: string[]; requested: string[] } {
  const failed: string[] = [];
  const requested: string[] = [];
  const portraitPaths = new Set<string>(Object.values(portraits).map(({ path }) => path));

  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;

    if (portraitPaths.has(path)) {
      requested.push(path);
    }
  });
  page.on('requestfailed', (request) => {
    const path = new URL(request.url()).pathname;

    if (portraitPaths.has(path)) {
      failed.push(path);
    }
  });

  return { failed, requested };
}

test.describe('portrait dialog', () => {
  for (const dialogCase of dialogCases) {
    test(`renders the single ${dialogCase.theme} portrait at ${dialogCase.name}`, async ({
      page,
    }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

      await page.emulateMedia({ colorScheme: dialogCase.theme });
      await setInitialTheme(page, dialogCase.theme);
      await page.setViewportSize({ width: dialogCase.width, height: dialogCase.height });
      await page.goto('/');
      await openPortraitDialog(page);
      await waitForDialogPortrait(page, dialogCase.theme);

      await expect(page.locator('#portrait-dialog-title')).toHaveCount(1);
      await expect(page.locator('.portrait-dialog__summary')).toHaveText(
        'Founder and solo operator building production web systems with a focus on:',
      );
      await expect(page.locator('.cdk-overlay-pane.serhat-portrait-dialog-panel')).toContainText(
        'Operator Profile',
      );

      const state = await getDialogState(page);

      expect(state.objectFit).toBe('contain');
      expect(state.iconCount).toBeGreaterThanOrEqual(10);
      expect(state.invisibleIcons).toBe(0);
      expect(state.fontTitle).toContain('Sora');
      expect(state.fontSummary).toContain('Sora');
      expect(state.closeCentered).toBe(true);
      expect(state.documentOverflow).toBe(false);
      expect(state.contentOverflow).toBe(false);
      expect(state.dialogHeight).toBeLessThanOrEqual(dialogCase.height - 38);
      expect(state.panelGutters.left).toBeGreaterThanOrEqual(19);
      expect(state.panelGutters.right).toBeGreaterThanOrEqual(19);
      expect(state.panelGutters.top).toBeGreaterThanOrEqual(19);
      expect(state.panelGutters.bottom).toBeGreaterThanOrEqual(19);

      if (dialogCase.width < 1024) {
        expect(state.mediaAspectRatio).toBeCloseTo(4 / 3, 2);
      }

      await expectLastDialogContentReachable(page);
      assertNoConsoleErrors();
    });
  }

  test('keeps focus trapped and restores it after Escape, close button, and backdrop closing', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const trigger = page.getByTestId('home-hero-portrait-trigger');
    const dialogPanel = page.locator('.cdk-overlay-pane.serhat-portrait-dialog-panel');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Serhat Soruklu' })).toBeVisible();
    expect(
      await dialogPanel.evaluate((panel) => panel.contains(globalThis.document.activeElement)),
      'initial dialog focus must move inside the focus trap',
    ).toBe(true);

    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press('Tab');
      expect(
        await dialogPanel.evaluate((panel) => panel.contains(globalThis.document.activeElement)),
        `focus escaped the dialog after ${index + 1} Tab presses`,
      ).toBe(true);
    }

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

  test('system theme updates the same open image once without moving the dialog or page', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const traffic = trackPortraitTraffic(page);

    await page.emulateMedia({ colorScheme: 'dark' });
    await setInitialTheme(page, 'system');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.getByTestId('home-hero-portrait-image')).toHaveAttribute(
      'src',
      portraits.dark.path,
    );
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => globalThis.window.scrollTo(0, 360));
    await openPortraitDialog(page);
    await waitForDialogPortrait(page, 'dark');

    const dialogImage = page.getByTestId('portrait-dialog-portrait-image');

    await page.getByTestId('portrait-dialog').evaluate(async (element) => {
      await Promise.all(
        element.getAnimations({ subtree: true }).map((animation) => animation.finished),
      );
    });

    await dialogImage.evaluate((element) => {
      (globalThis.window as Window & { __dialogPortraitNode?: Element }).__dialogPortraitNode =
        element;
    });

    const mediaBefore = await page.locator('.portrait-dialog__media').boundingBox();
    const scrollBefore = await page.evaluate(() => globalThis.window.scrollY);

    expect(traffic.requested.filter((path) => path === portraits.dark.path)).toHaveLength(1);
    await expect
      .poll(() => traffic.requested.filter((path) => path === portraits.light.path).length)
      .toBe(1);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await waitForDialogPortrait(page, 'light');
    await expect(page.getByTestId('home-hero-portrait-image')).toHaveAttribute(
      'src',
      portraits.light.path,
    );
    await dialogImage.evaluate(async (element) => {
      await (element as HTMLImageElement).decode();
    });

    const mediaAfter = await page.locator('.portrait-dialog__media').boundingBox();
    const scrollAfter = await page.evaluate(() => globalThis.window.scrollY);

    expect(
      await dialogImage.evaluate(
        (element) =>
          element ===
          (globalThis.window as Window & { __dialogPortraitNode?: Element }).__dialogPortraitNode,
      ),
    ).toBe(true);
    expect(Math.abs((mediaAfter?.width ?? 0) - (mediaBefore?.width ?? 0))).toBeLessThanOrEqual(1);
    expect(Math.abs((mediaAfter?.height ?? 0) - (mediaBefore?.height ?? 0))).toBeLessThanOrEqual(1);
    expect(scrollAfter).toBeCloseTo(scrollBefore, 0);
    expect(traffic.requested.filter((path) => path === portraits.dark.path)).toHaveLength(1);
    expect(
      traffic.requested.filter((path) => path === portraits.light.path).length,
    ).toBeGreaterThanOrEqual(1);
    const lightResourceTimings = await page.evaluate((path) => {
      const url = new URL(path, globalThis.window.location.origin).href;

      return performance
        .getEntriesByName(url)
        .map((entry) => (entry as PerformanceResourceTiming).transferSize);
    }, portraits.light.path);

    expect(lightResourceTimings.filter((transferSize) => transferSize > 1024)).toHaveLength(1);
    expect(traffic.failed).toEqual([]);
    assertNoConsoleErrors();
  });

  test('removes dialog motion when reduced motion is requested', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await openPortraitDialog(page);

    const motion = await page.evaluate(() => {
      const close = globalThis.document.querySelector('.portrait-dialog__close')!;
      const dialog = globalThis.document.querySelector('[data-testid="portrait-dialog"]')!;

      return {
        closeTransition: getComputedStyle(close).transitionDuration,
        dialogAnimation: getComputedStyle(dialog).animationName,
        dialogDuration: getComputedStyle(dialog).animationDuration,
      };
    });

    expect(motion).toEqual({
      closeTransition: '0s',
      dialogAnimation: 'none',
      dialogDuration: '0s',
    });
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('portrait-dialog')).toBeHidden();
    assertNoConsoleErrors();
  });
});
