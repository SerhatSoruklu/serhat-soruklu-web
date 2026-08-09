import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

import { installConsoleErrorGuard } from './support/console-errors';

const aboutPath = '/about';
const themeStorageKey = 'serhatsoruklu-theme';
const portraitPath = '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png';
const screenshotDirectory = 'test-results/about-review';
const viewports = [
  { name: 'minimum-mobile', width: 320, height: 700 },
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-430', width: 430, height: 932 },
  { name: 'wide-mobile', width: 640, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mini-laptop', width: 1024, height: 768 },
  { name: 'medium-laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'large-desktop', width: 1920, height: 1080 },
  { name: 'short-laptop', width: 1280, height: 640 },
] as const;

async function openProfileDialog(page: Page): Promise<void> {
  const trigger = page.getByTestId('about-portrait-trigger');

  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.getByTestId('about-profile-dialog')).toBeVisible();
}

test.describe('About identity page', () => {
  test('renders the documentary biography, chapter index, portrait, and public profile record', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const portraitResponse = await request.get(portraitPath);

    expect(portraitResponse.ok()).toBe(true);
    expect(portraitResponse.headers()['content-type']).toMatch(/^image\//);

    await page.goto(aboutPath);

    await expect(page.getByRole('heading', { level: 1, name: 'Serhat Soruklu' })).toBeVisible();
    await expect(page.locator('.about-page h1')).toHaveCount(1);
    await expect(page.locator('.about-hero__role')).toHaveText(
      'Founder & CEO of Coupyn · Systems Architect · Solo Full-Stack Developer',
    );
    await expect(
      page.getByRole('heading', { name: 'Between Osmancık and Tottenham' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Built through use. Designed to last.' }),
    ).toBeVisible();
    await expect(page.locator('.about-chapters a')).toHaveCount(8);
    await expect(page.locator('.about-chapters a').first()).toHaveAttribute(
      'href',
      '/about#origins',
    );
    await expect(page.locator('.about-system-card')).toHaveCount(4);
    await expect(page.locator('.about-principles > li')).toHaveCount(4);
    await expect(page.locator('.about-profiles a')).toHaveCount(7);

    const portrait = page.locator('.about-portrait__trigger img');
    await expect(portrait).toHaveAttribute('src', portraitPath);
    await expect(portrait).toHaveAttribute('width', '1173');
    await expect(portrait).toHaveAttribute('height', '1341');
    await expect(page.getByTestId('about-portrait-trigger')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    await expect(page.getByTestId('about-language-switch')).toContainText('Türkçe oku');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    assertNoConsoleErrors();
  });

  test('chapter links stay on About and restore anchored positions for clicks, history, and deep links', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(aboutPath);

    const originsLink = page.locator('.about-chapters a[href="/about#origins"]');
    await originsLink.click();
    await expect(page).toHaveURL(/\/about#origins$/);
    await expect.poll(() => page.evaluate(() => globalThis.window.scrollY)).toBeGreaterThan(300);

    const assertAnchorClearsHeader = async (targetId: string) => {
      const geometry = await page.evaluate((id) => {
        const header = globalThis.document.querySelector('[data-testid="desktop-header"]');
        const target = globalThis.document.getElementById(id);
        const heading = target?.querySelector('h2');

        return {
          headerBottom: header?.getBoundingClientRect().bottom ?? 0,
          headingTop: heading?.getBoundingClientRect().top ?? -1,
          targetTop: target?.getBoundingClientRect().top ?? -1,
        };
      }, targetId);

      expect(geometry.targetTop).toBeGreaterThanOrEqual(geometry.headerBottom + 4);
      expect(geometry.headingTop).toBeGreaterThan(geometry.headerBottom);
    };

    await assertAnchorClearsHeader('origins');

    await page.goBack();
    await expect(page).toHaveURL(/\/about$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/about#origins$/);
    await assertAnchorClearsHeader('origins');

    await page.goto('/about#private-servers');
    await expect(page).toHaveURL(/\/about#private-servers$/);
    await expect(page.locator('#private-servers-title')).toBeVisible();
    await assertAnchorClearsHeader('private-servers');
    assertNoConsoleErrors();
  });

  test('the closing section and footer share one themed surface with a restrained inset divider', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });

    for (const theme of ['dark', 'light'] as const) {
      await page.goto(aboutPath);
      await page.evaluate(({ key, setting }) => globalThis.localStorage.setItem(key, setting), {
        key: themeStorageKey,
        setting: theme,
      });
      await page.reload();
      await expect(page.locator('.about-closing')).toBeAttached();
      await page.evaluate(() => {
        globalThis.document.querySelector('.about-closing')?.scrollIntoView({ block: 'end' });
      });

      const blend = await page.evaluate(() => {
        const closing = globalThis.document.querySelector('.about-closing') as HTMLElement;
        const footerHost = globalThis.document.querySelector('app-site-footer') as HTMLElement;
        const footer = globalThis.document.querySelector('.site-footer') as HTMLElement;
        const divider = getComputedStyle(closing, '::after');
        const closingAtmosphere = getComputedStyle(closing).backgroundImage;
        const footerAtmosphere = getComputedStyle(footer, '::after').backgroundImage;
        const closingBox = closing.getBoundingClientRect();
        const footerBox = footerHost.getBoundingClientRect();

        return {
          boundaryDelta: footerBox.top - closingBox.bottom,
          backgroundsContinue:
            closingAtmosphere.replace(/, none$/, '').replace('at 50% 100%', 'at 50% 0%') ===
            footerAtmosphere,
          closingBackground: getComputedStyle(closing).backgroundColor,
          dividerBackground: divider.backgroundImage,
          dividerBottom: divider.bottom,
          dividerLeft: Number.parseFloat(divider.left),
          dividerRight: Number.parseFloat(divider.right),
          footerBackground: getComputedStyle(footerHost).backgroundColor,
          footerRuleOpacity: getComputedStyle(footer, '::before').opacity,
        };
      });

      const expectedBackground = theme === 'dark' ? 'rgb(7, 9, 13)' : 'rgb(255, 255, 255)';
      expect(blend.boundaryDelta).toBeCloseTo(-1, 0);
      expect(blend.closingBackground).toBe(expectedBackground);
      expect(blend.footerBackground).toBe(expectedBackground);
      expect(blend.backgroundsContinue).toBe(true);
      expect(blend.dividerBackground).not.toBe('none');
      expect(blend.dividerBottom).toBe('1px');
      expect(blend.dividerLeft).toBe(20);
      expect(blend.dividerRight).toBe(20);
      expect(blend.footerRuleOpacity).toBe('0');
    }

    assertNoConsoleErrors();
  });

  test('keyboard, close button, and backdrop dismissal restore focus to the portrait trigger', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(aboutPath);

    const trigger = page.getByTestId('about-portrait-trigger');
    const dialog = page.getByTestId('about-profile-dialog');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    expect(
      await page
        .locator('.cdk-overlay-pane.serhat-about-profile-dialog-panel')
        .evaluate((panel) => panel.contains(document.activeElement)),
    ).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await page.keyboard.press('Space');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Close Serhat Soruklu profile dialog' }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    assertNoConsoleErrors();
  });

  test('the shared language state updates the page and an already-open dialog immediately', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(aboutPath);
    await openProfileDialog(page);

    const dialog = page.getByTestId('about-profile-dialog');
    const languageSwitch = page.getByTestId('about-language-switch');

    await expect(dialog).toHaveAttribute('lang', 'en-GB');
    await expect(dialog.locator('.about-profile-dialog__eyebrow')).toHaveText(
      'PORTRAIT / FOUNDER PROFILE',
    );
    await expect(dialog.locator('dd')).toHaveText([
      '22 February 1996',
      'Osmancık, Çorum, Turkey',
      'London, United Kingdom',
      'Founder & CEO of Coupyn',
    ]);

    await languageSwitch.evaluate((button) => (button as HTMLButtonElement).click());

    await expect(page.locator('html')).toHaveAttribute('lang', 'tr-TR');
    await expect(page.locator('.about-page')).toHaveAttribute('lang', 'tr-TR');
    await expect(page.locator('#origins-title')).toHaveText('Osmancık ile Tottenham arasında');
    await expect(languageSwitch).toContainText('Read in English');
    await expect(page.getByTestId('about-portrait-trigger')).not.toHaveAttribute(
      'aria-label',
    );
    await expect(page.locator('.about-portrait__action')).toContainText(
      'Portreyi ve profili aç',
    );
    await expect(dialog).toHaveAttribute('lang', 'tr-TR');
    await expect(dialog.locator('.about-profile-dialog__eyebrow')).toHaveText(
      'PORTRE / KURUCU PROFİLİ',
    );
    await expect(dialog.locator('dd')).toHaveText([
      '22 Şubat 1996',
      'Osmancık, Çorum, Türkiye',
      'Londra, Birleşik Krallık',
      "Coupyn Kurucusu ve CEO'su",
    ]);
    await expect(dialog.locator('img')).toHaveAttribute(
      'alt',
      "Coupyn kurucusu ve CEO'su Serhat Soruklu'nun portresi.",
    );
    await expect(dialog.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Serhat Soruklu profil penceresini kapat',
    );

    await languageSwitch.evaluate((button) => (button as HTMLButtonElement).click());
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(dialog).toHaveAttribute('lang', 'en-GB');
    await page.keyboard.press('Escape');
    assertNoConsoleErrors();
  });

  test('all required viewports preserve gutters, portrait prominence, and dialog containment', async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(aboutPath);

      const layout = await page.evaluate(() => {
        const frame = document.querySelector('.about-hero__inner')?.getBoundingClientRect();
        const heading = document.querySelector('.about-hero h1')?.getBoundingClientRect();
        const portrait = document.querySelector('.about-portrait')?.getBoundingClientRect();
        const image = document.querySelector('.about-portrait__trigger img') as HTMLImageElement;
        const imageBox = image?.getBoundingClientRect();

        return {
          frameLeft: frame?.left ?? -1,
          frameRight: frame?.right ?? -1,
          frameWidth: frame?.width ?? 0,
          headingLeft: heading?.left ?? -1,
          headingRight: heading?.right ?? -1,
          imageComplete: image?.complete ?? false,
          imageNaturalHeight: image?.naturalHeight ?? 0,
          imageNaturalWidth: image?.naturalWidth ?? 0,
          imageObjectFit: image ? getComputedStyle(image).objectFit : '',
          imageRatio: imageBox && imageBox.height > 0 ? imageBox.width / imageBox.height : 0,
          portraitTop: portrait?.top ?? -1,
          portraitWidth: portrait?.width ?? 0,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      expect(layout.scrollWidth, `${viewport.name}: page overflow`).toBeLessThanOrEqual(
        layout.viewportWidth + 1,
      );
      expect(layout.frameLeft, `${viewport.name}: left gutter`).toBeGreaterThanOrEqual(19);
      expect(layout.frameRight, `${viewport.name}: right gutter`).toBeLessThanOrEqual(
        viewport.width - 19,
      );
      expect(layout.headingLeft, `${viewport.name}: heading left`).toBeGreaterThanOrEqual(19);
      expect(layout.headingRight, `${viewport.name}: heading right`).toBeLessThanOrEqual(
        viewport.width - 19,
      );
      expect(layout.portraitTop, `${viewport.name}: portrait visible`).toBeGreaterThan(0);
      expect(layout.imageComplete, `${viewport.name}: portrait loaded`).toBe(true);
      expect(layout.imageNaturalWidth).toBe(1173);
      expect(layout.imageNaturalHeight).toBe(1341);
      expect(layout.imageObjectFit).toBe('contain');
      expect(layout.imageRatio, `${viewport.name}: portrait aspect ratio`).toBeCloseTo(
        1173 / 1341,
        2,
      );

      if (viewport.width >= 1024) {
        const portraitShare = layout.portraitWidth / layout.frameWidth;
        expect(portraitShare, `${viewport.name}: portrait prominence`).toBeGreaterThanOrEqual(0.39);
        expect(portraitShare, `${viewport.name}: portrait prominence`).toBeLessThanOrEqual(0.49);
      }

      await openProfileDialog(page);
      const dialog = page.getByTestId('about-profile-dialog');
      const dialogImage = page.getByTestId('about-profile-dialog-image');
      const dialogLayout = await page.evaluate(() => {
        const panel = document
          .querySelector('.cdk-overlay-pane.serhat-about-profile-dialog-panel')
          ?.getBoundingClientRect();
        const dialogElement = document.querySelector('[data-testid="about-profile-dialog"]');
        const image = document.querySelector(
          '[data-testid="about-profile-dialog-image"]',
        ) as HTMLImageElement;

        return {
          dialogClientHeight: dialogElement?.clientHeight ?? 0,
          dialogScrollHeight: dialogElement?.scrollHeight ?? 0,
          documentOverflow:
            document.documentElement.scrollWidth - document.documentElement.clientWidth,
          imageObjectFit: image ? getComputedStyle(image).objectFit : '',
          imageObjectPosition: image ? getComputedStyle(image).objectPosition : '',
          left: panel?.left ?? -1,
          right: panel ? document.documentElement.clientWidth - panel.right : -1,
          top: panel?.top ?? -1,
          bottom: panel ? document.documentElement.clientHeight - panel.bottom : -1,
        };
      });

      expect(dialogLayout.left, `${viewport.name}: dialog left gutter`).toBeGreaterThanOrEqual(19);
      expect(dialogLayout.right, `${viewport.name}: dialog right gutter`).toBeGreaterThanOrEqual(
        19,
      );
      expect(dialogLayout.top, `${viewport.name}: dialog top gutter`).toBeGreaterThanOrEqual(19);
      expect(dialogLayout.bottom, `${viewport.name}: dialog bottom gutter`).toBeGreaterThanOrEqual(
        19,
      );
      expect(
        dialogLayout.documentOverflow,
        `${viewport.name}: dialog overflow`,
      ).toBeLessThanOrEqual(1);
      expect(dialogLayout.imageObjectFit).toBe('contain');
      expect(dialogLayout.imageObjectPosition).toBe('50% 50%');
      await expect(dialogImage).toHaveAttribute('width', '1173');
      await expect(dialogImage).toHaveAttribute('height', '1341');

      if (viewport.width < 1024) {
        expect(
          dialogLayout.dialogScrollHeight,
          `${viewport.name}: stacked dialog scroll height`,
        ).toBeGreaterThan(dialogLayout.dialogClientHeight);
        await dialog.evaluate((element) => {
          element.scrollTop = element.scrollHeight;
        });
        await expect(dialog.getByRole('link', { name: 'Open Coupyn in a new tab' })).toBeVisible();
      }

      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }

    assertNoConsoleErrors();
  });

  test('dark, light, and system themes style the page and open dialog deliberately', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(aboutPath);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    const darkPage = await page.locator('.about-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(darkPage.heading).toBe('rgb(245, 247, 250)');

    await openProfileDialog(page);
    const darkDialogBackground = await page
      .locator('.serhat-about-profile-dialog-panel .mat-mdc-dialog-surface')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(darkDialogBackground).toBe('rgb(11, 14, 20)');
    await page.keyboard.press('Escape');

    await page.evaluate((key) => window.localStorage.setItem(key, 'light'), themeStorageKey);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    const lightPage = await page.locator('.about-page').evaluate((element) => ({
      background: getComputedStyle(element).backgroundImage,
      heading: getComputedStyle(element.querySelector('h1') as HTMLElement).color,
    }));
    expect(lightPage.heading).toBe('rgb(17, 24, 39)');
    expect(lightPage.background).not.toBe(darkPage.background);

    await openProfileDialog(page);
    await expect(page.locator('.about-profile-dialog__title')).toHaveCSS(
      'color',
      'rgb(17, 24, 39)',
    );
    await expect(
      page.locator('.serhat-about-profile-dialog-panel .mat-mdc-dialog-surface'),
    ).toHaveCSS('background-color', 'rgb(248, 247, 243)');
    await page.keyboard.press('Escape');

    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate((key) => window.localStorage.setItem(key, 'system'), themeStorageKey);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    await openProfileDialog(page);

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(
      page.locator('.serhat-about-profile-dialog-panel .mat-mdc-dialog-surface'),
    ).toHaveCSS('background-color', 'rgb(248, 247, 243)');
    await page.keyboard.press('Escape');
    assertNoConsoleErrors();
  });

  test('fine-pointer hover effects remain pronounced without changing layout', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(aboutPath);

    const portraitTrigger = page.getByTestId('about-portrait-trigger');
    const portraitImage = portraitTrigger.locator('img');
    const portraitBefore = await portraitTrigger.boundingBox();

    await portraitTrigger.hover();
    await expect
      .poll(() => portraitImage.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe('none');
    const portraitAfter = await portraitTrigger.boundingBox();
    expect(portraitAfter?.width).toBeCloseTo(portraitBefore?.width ?? 0, 2);
    expect(portraitAfter?.height).toBeCloseTo(portraitBefore?.height ?? 0, 2);

    const systemCard = page.locator('.about-system-card').first();
    const systemCardBefore = await systemCard.boundingBox();
    await systemCard.hover();
    await expect
      .poll(() => systemCard.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe('none');
    const systemCardAfter = await systemCard.boundingBox();
    expect(systemCardAfter?.width).toBeCloseTo(systemCardBefore?.width ?? 0, 2);
    expect(systemCardAfter?.height).toBeCloseTo(systemCardBefore?.height ?? 0, 2);
    assertNoConsoleErrors();
  });

  test('reduced motion disables non-essential page and dialog animation', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(aboutPath);

    const motion = await page.evaluate(() => ({
      copyAnimation: getComputedStyle(document.querySelector('.about-hero__copy') as HTMLElement)
        .animationName,
      languageAnimation: getComputedStyle(
        document.querySelector('.about-language-switch') as HTMLElement,
      ).animationName,
      portraitAnimation: getComputedStyle(document.querySelector('.about-portrait') as HTMLElement)
        .animationName,
      portraitTransition: getComputedStyle(
        document.querySelector('.about-portrait__trigger img') as HTMLElement,
      ).transitionDuration,
      systemCardTransition: getComputedStyle(
        document.querySelector('.about-system-card') as HTMLElement,
      ).transitionDuration,
    }));

    expect(motion.copyAnimation).toBe('none');
    expect(motion.languageAnimation).toBe('none');
    expect(motion.portraitAnimation).toBe('none');
    expect(motion.portraitTransition).toBe('0s');
    expect(motion.systemCardTransition).toBe('0s');

    await openProfileDialog(page);
    await expect(page.locator('.about-profile-dialog__close')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await expect(page.locator('.about-profile-dialog__action')).toHaveCSS(
      'transition-duration',
      '0s',
    );
    await page.keyboard.press('Escape');
    assertNoConsoleErrors();
  });

  test('captures the required dark, light, responsive, and dialog review frames', async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000);
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    await mkdir(screenshotDirectory, { recursive: true });

    const capturePage = async (
      width: number,
      height: number,
      theme: 'dark' | 'light',
      filename: string,
    ) => {
      await page.setViewportSize({ width, height });
      await page.goto(aboutPath);
      await page.evaluate(({ key, setting }) => localStorage.setItem(key, setting), {
        key: themeStorageKey,
        setting: theme,
      });
      await page.reload();
      await expect(page.locator('html')).toHaveClass(
        theme === 'dark' ? /theme-resolved-dark/ : /theme-resolved-light/,
      );
      await expect(page.getByRole('heading', { level: 1, name: 'Serhat Soruklu' })).toBeVisible();
      const portrait = page.locator('.about-portrait__trigger img');
      await expect(portrait).toBeVisible();
      await expect
        .poll(() => portrait.evaluate((image) => (image as HTMLImageElement).naturalWidth))
        .toBe(1173);
      await page.screenshot({
        animations: 'disabled',
        fullPage: true,
        path: `${screenshotDirectory}/${filename}`,
      });
    };

    await capturePage(390, 844, 'dark', 'about-390x844-dark.png');
    await capturePage(390, 844, 'light', 'about-390x844-light.png');
    await capturePage(768, 1024, 'dark', 'about-768x1024-dark.png');
    await capturePage(1280, 800, 'dark', 'about-1280x800-dark.png');
    await capturePage(1440, 900, 'dark', 'about-1440x900-dark.png');
    await capturePage(1440, 900, 'light', 'about-1440x900-light.png');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(aboutPath);
    await page.evaluate((key) => localStorage.setItem(key, 'light'), themeStorageKey);
    await page.reload();
    await openProfileDialog(page);
    await expect
      .poll(() =>
        page
          .getByTestId('about-profile-dialog-image')
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBe(1173);
    await page.screenshot({
      animations: 'disabled',
      path: `${screenshotDirectory}/about-dialog-390x844-light.png`,
    });
    await page.keyboard.press('Escape');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate((key) => localStorage.setItem(key, 'dark'), themeStorageKey);
    await page.reload();
    await openProfileDialog(page);
    await expect
      .poll(() =>
        page
          .getByTestId('about-profile-dialog-image')
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBe(1173);
    await page.screenshot({
      animations: 'disabled',
      path: `${screenshotDirectory}/about-dialog-1440x900-dark.png`,
    });
    await page.keyboard.press('Escape');
    assertNoConsoleErrors();
  });
});
