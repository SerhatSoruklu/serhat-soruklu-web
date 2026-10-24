import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

/** Validate actual browser motion in the minified SSR build, not just CSS names. */
export async function verifyCountdownMotion(baseUrl) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      reducedMotion: 'no-preference',
      extraHTTPHeaders: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'serhatsoruklu.com',
      },
    });
    const page = await context.newPage();
    // Artifact validation must not send analytics from the local test origin.
    await page.route('https://*.googletagmanager.com/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: '',
      }),
    );
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-10-24T23:59:32Z'));
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    for (const theme of ['dark', 'light']) {
      await page.evaluate((setting) => {
        localStorage.setItem('serhatsoruklu-theme', setting);
        document.cookie = `serhatsoruklu-theme=${setting}; Path=/`;
      }, theme);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-unit=seconds] .clock-digit--changed .clock-value')
            ?.getAnimations().length > 0,
      );
      for (const width of [320, 427, 834, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator('.launch-clock').scrollIntoViewIfNeeded();
        const state = await page.locator('[data-unit=seconds]').evaluate((unit) => {
          const digit = unit.querySelector('.clock-digit--changed');
          const current = digit.querySelector('.clock-value');
          const previous = digit.querySelector('.clock-previous');
          const animations = digit.getAnimations({ subtree: true });
          for (const animation of animations) {
            animation.pause();
            animation.currentTime = 200;
          }
          const currentStyle = getComputedStyle(current);
          const previousStyle = getComputedStyle(previous);
          return {
            animations: animations.length,
            opacity: Number(currentStyle.opacity),
            oldOpacity: Number(previousStyle.opacity),
            transform: currentStyle.transform,
            mask: getComputedStyle(digit).maskImage,
            digitHeight: digit.clientHeight,
            faceHeight: unit.querySelector('.clock-face').clientHeight,
            staticAnimations: unit.querySelector('.clock-digit').getAnimations({ subtree: true })
              .length,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        const label = `${theme} at ${width}px`;
        assert.equal(state.animations, 2, `Incoming and outgoing glyphs must animate: ${label}`);
        assert.equal(state.staticAnimations, 0, `Unchanged digits must stay still: ${label}`);
        assert.ok(state.opacity > 0 && state.opacity < 1, `The incoming digit must fade: ${label}`);
        assert.ok(
          state.oldOpacity > 0 && state.oldOpacity < 1,
          `The outgoing digit must fade: ${label}`,
        );
        assert.notEqual(state.transform, 'none', `The digit must actually move: ${label}`);
        assert.match(state.mask, /linear-gradient/, `Digit edges must fade softly: ${label}`);
        assert.ok(
          Math.abs(state.digitHeight - state.faceHeight) <= 1,
          `The full tile must hold the motion: ${label}`,
        );
        assert.equal(state.overflow, false, `The countdown must fit its viewport: ${label}`);
      }
    }

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('.clock-digit')).every(
        (digit) => digit.getAnimations({ subtree: true }).length === 0,
      ),
    );
    await page.clock.setFixedTime(new Date('2026-10-24T23:59:33Z'));
    await page.waitForFunction(
      () => document.querySelector('[data-unit=seconds]')?.getAttribute('data-value') === '27',
    );
    assert.deepEqual(errors, [], 'The production countdown must hydrate without page errors.');
    console.log(
      '[smoke] production countdown motion, per-digit fades, soft edges, themes, reflow and reduced motion passed',
    );
  } finally {
    await browser.close();
  }
}
