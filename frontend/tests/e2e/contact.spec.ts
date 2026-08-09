import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

import { installConsoleErrorGuard } from './support/console-errors';

const viewports = [
  { name: '360', width: 360, height: 780 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1366', width: 1366, height: 900 },
  { name: '1920', width: 1920, height: 1080 },
];

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

  expect(hasOverflow).toBe(false);
}

async function fillValidContactForm(page: Page): Promise<void> {
  await page.locator('#contact-topic').click();
  await page.getByRole('option', { name: 'Systems architecture' }).click();
  await page.locator('#contact-first-name').fill('Ada');
  await page.locator('#contact-last-name').fill('Lovelace');
  await page.locator('#contact-email').fill('ada@example.com');
  await page
    .locator('#contact-message')
    .fill(
      'I would like to discuss a systems architecture project with clear boundaries and practical delivery context.',
    );
  await expect(page.locator('#contact-first-name')).toHaveValue('Ada');
  await expect(page.locator('#contact-last-name')).toHaveValue('Lovelace');
  await expect(page.locator('#contact-email')).toHaveValue('ada@example.com');
}

test.describe('contact page', () => {
  for (const viewport of viewports) {
    test(`submits successfully with responsive layout at ${viewport.name}`, async ({
      page,
    }, testInfo) => {
      const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
      let requestBody: Record<string, unknown> | null = null;
      let idempotencyKey: string | undefined;
      let releaseContactResponse: () => void = () => undefined;
      const contactResponseGate = new Promise<void>((resolve) => {
        releaseContactResponse = resolve;
      });

      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.route('**/api/contact', async (route) => {
        requestBody = route.request().postDataJSON() as Record<string, unknown>;
        idempotencyKey = route.request().headers()['idempotency-key'];
        await contactResponseGate;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ok: true,
            success: true,
            message: 'Message received.',
          }),
        });
      });

      // Wait for client hydration to settle before exercising reactive-form state.
      // Under a fully parallel run, interacting with the SSR control too early can
      // let hydration restore its initial empty value after Playwright fills it.
      await page.goto('/contact', { waitUntil: 'networkidle' });

      await expect(page.getByRole('heading', { name: 'Start With a Clear Message' })).toBeVisible();
      await expect(page.getByText('Response: usually within 48h')).toBeVisible();
      await expect(page.locator('mat-form-field')).toHaveCount(0);
      await expect(page.locator('select')).toHaveCount(0);
      await expect(page.locator('#contact-message')).toHaveCSS('resize', 'none');
      await expect(page.locator('.contact-textarea-grip')).toBeVisible();
      const messageHeight = await page
        .locator('#contact-message')
        .evaluate((element) => element.getBoundingClientRect().height);
      expect(messageHeight).toBeLessThanOrEqual(viewport.width >= 1280 ? 122 : 136);
      await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled();

      if (viewport.width >= 1366) {
        const formTop = await page
          .locator('.contact-frame')
          .evaluate((element) => element.getBoundingClientRect().top);
        expect(formTop).toBeLessThan(viewport.height * 0.62);
      }

      await page.locator('#contact-first-name').focus();
      await expect(page.locator('#contact-first-name')).toBeFocused();
      const emailTopBeforeError = await page.locator('#contact-email').evaluate((element) => {
        return element.getBoundingClientRect().top + window.scrollY;
      });
      const emailInput = page.locator('#contact-email');
      await emailInput.fill('bad');
      await expect(emailInput).toHaveValue('bad');
      await emailInput.blur();
      await expect(emailInput).toHaveValue('bad');
      await expect(page.locator('#contact-email-feedback')).toContainText(
        'Enter a valid email address.',
      );
      const emailTopAfterError = await page.locator('#contact-email').evaluate((element) => {
        return element.getBoundingClientRect().top + window.scrollY;
      });
      expect(Math.abs(emailTopAfterError - emailTopBeforeError)).toBeLessThanOrEqual(1);
      await emailInput.fill('');
      await fillValidContactForm(page);
      await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
      await expectNoHorizontalOverflow(page);

      await page.getByRole('button', { name: 'Send Message' }).click();
      await expect(page.getByRole('button', { name: 'Sending...' })).toBeDisabled();
      await expect(page.locator('mat-spinner.contact-submit__spinner')).toBeVisible();
      await expect(page.locator('mat-spinner.contact-submit__spinner')).toHaveClass(
        /mat-mdc-progress-spinner/,
      );
      try {
        const spinnerMetrics = await page
          .locator('mat-spinner.contact-submit__spinner')
          .evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const circle = element.querySelector('circle');
            const circleStyles = circle ? getComputedStyle(circle) : null;

            return {
              circleCount: element.querySelectorAll('circle').length,
              height: rect.height,
              indeterminateVisible: getComputedStyle(
                element.querySelector('.mdc-circular-progress__indeterminate-container') as Element,
              ).opacity,
              stroke: circleStyles?.stroke || '',
              width: rect.width,
            };
          });
        expect(spinnerMetrics.width).toBeGreaterThanOrEqual(23);
        expect(spinnerMetrics.width).toBeLessThanOrEqual(25);
        expect(spinnerMetrics.height).toBeGreaterThanOrEqual(23);
        expect(spinnerMetrics.height).toBeLessThanOrEqual(25);
        expect(spinnerMetrics.circleCount).toBeGreaterThanOrEqual(3);
        expect(spinnerMetrics.indeterminateVisible).toBe('1');
        expect(spinnerMetrics.stroke).not.toBe('none');
      } finally {
        releaseContactResponse();
      }
      await expect(page.getByRole('heading', { name: 'Message sent.' })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      expect(requestBody).toMatchObject({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        topic: 'Systems architecture',
        website: '',
      });
      expect(requestBody).toMatchObject({ submissionId: expect.any(String) });
      expect(idempotencyKey).toBe(requestBody?.['submissionId']);
      assertNoConsoleErrors();
    });
  }

  test('blocks whitespace-only names and messages before the API request', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/contact', async (route) => {
      requestCount += 1;
      await route.abort();
    });

    await page.goto('/contact');
    await page.locator('#contact-topic').click();
    await page.getByRole('option', { name: 'Systems architecture' }).click();
    await page.locator('#contact-first-name').fill('   ');
    await page.locator('#contact-last-name').fill('\t ');
    await page.locator('#contact-email').fill('ada@example.com');
    await page.locator('#contact-message').fill('                    ');

    await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled();
    await expect(page.locator('#contact-first-name-feedback')).toContainText(
      'First name is required.',
    );
    await expect(page.locator('#contact-last-name-feedback')).toContainText(
      'Last name is required.',
    );
    await expect(page.locator('#contact-message-feedback')).toContainText('Message is required.');
    expect(requestCount).toBe(0);
  });

  test('rejects recipient lists and display-name email wrappers before submission', async ({
    page,
  }) => {
    await page.goto('/contact');
    await fillValidContactForm(page);

    for (const value of ['victim@example.com,other', '<victim@example.com>']) {
      await page.locator('#contact-email').fill(value);
      await page.locator('#contact-email').blur();
      await expect(page.locator('#contact-email-feedback')).toContainText(
        'Enter a valid email address.',
      );
      await expect(page.getByRole('button', { name: 'Send Message' })).toBeDisabled();
    }
  });

  test('shows explicit received status when confirmation delivery fails', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          success: true,
          code: 'PARTIAL_DELIVERY',
          deliveryStatus: 'internal_delivered',
          internalDelivered: true,
          confirmationDelivered: false,
          message: 'Your message was received, but we could not send a confirmation email.',
        }),
      });
    });

    await page.goto('/contact');
    await fillValidContactForm(page);
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('heading', { name: 'Message received.' })).toBeVisible();
    await expect(page.getByText(/there is no need to submit it again/i)).toBeVisible();
    await expect(page.locator('form.contact-form')).toHaveCount(0);
  });

  test('shows a no-resubmit state when SMTP delivery is uncertain', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({
        status: 202,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          success: true,
          code: 'CONTACT_DELIVERY_UNKNOWN',
          deliveryStatus: 'unknown',
          internalDelivered: false,
          internalDeliveryUnknown: true,
          confirmationDelivered: false,
          message: 'Delivery status is uncertain. Please do not resend this message.',
        }),
      }),
    );

    await page.goto('/contact');
    await fillValidContactForm(page);
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('heading', { name: 'Delivery status pending.' })).toBeVisible();
    await expect(page.getByText(/Please do not submit it again/)).toBeVisible();
    await expect(page.locator('form.contact-form')).toHaveCount(0);
  });

  test('renders backend validation failures in the custom error UI', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'expected-console-error',
      description: 'The mocked 400 response can emit a browser resource-load console error.',
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          success: false,
          code: 'VALIDATION_FAILED',
          error: 'Validation failed.',
          errors: {
            message: 'Message looks automated. Please write a normal short note.',
            form: 'Please check the highlighted fields.',
          },
        }),
      });
    });

    await page.goto('/contact');
    await fillValidContactForm(page);
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('alert')).toContainText('Please check the highlighted fields.');
    await expect(page.locator('#contact-message-feedback')).toContainText(
      'Message looks automated.',
    );
    await expectNoHorizontalOverflow(page);
  });

  test('renders rate-limit failures in the custom error UI', async ({ page }, testInfo) => {
    testInfo.annotations.push({
      type: 'expected-console-error',
      description: 'The mocked 429 response can emit a browser resource-load console error.',
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          code: 'RATE_LIMITED',
          message: 'Too many contact messages. Please try again later.',
        }),
      });
    });

    await page.goto('/contact');
    await fillValidContactForm(page);
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
    await page.getByRole('button', { name: 'Send Message' }).click();

    await expect(page.getByRole('alert')).toContainText(
      'Too many messages sent. Please try again later.',
    );
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeEnabled();
    await expectNoHorizontalOverflow(page);
  });

  test('opens a themed custom topic dropdown with keyboard support', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 390, height: 844 });
    // The SSR button is focusable before Angular has attached its keyboard
    // handler under a heavily parallel run, so wait for hydration to settle.
    await page.goto('/contact', { waitUntil: 'networkidle' });

    await page.locator('#contact-topic').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#contact-topic-listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Systems architecture' })).toBeVisible();
    const listboxMetrics = await page.locator('#contact-topic-listbox').evaluate((element) => ({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollbarColor: getComputedStyle(element).scrollbarColor,
      scrollbarWidth: getComputedStyle(element).scrollbarWidth,
    }));
    expect(listboxMetrics.clientHeight).toBeLessThanOrEqual(190);
    expect(listboxMetrics.scrollHeight).toBeGreaterThan(listboxMetrics.clientHeight);
    expect(listboxMetrics.scrollbarWidth).toBe('thin');
    expect(listboxMetrics.scrollbarColor).toContain('160, 135, 87');

    const listboxBackground = await page
      .locator('#contact-topic-listbox')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(listboxBackground).not.toBe('rgb(255, 255, 255)');

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('#contact-topic')).toContainText('Product engineering');
    await expect(page.locator('#contact-topic-listbox')).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('keeps the message textarea scrollbar and resize grip usable', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/contact');

    const longMessage = Array.from(
      { length: 24 },
      (_, index) => `Line ${index + 1} with enough message text to create textarea overflow.`,
    ).join('\n');
    await page.locator('#contact-message').fill(longMessage);

    const textareaMetrics = await page.locator('#contact-message').evaluate((element) => {
      const textareaRect = element.getBoundingClientRect();
      const gripRect = element.parentElement
        ?.querySelector('.contact-textarea-grip')
        ?.getBoundingClientRect();
      const styles = getComputedStyle(element);

      return {
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
        scrollbarColor: styles.scrollbarColor,
        scrollbarWidth: styles.scrollbarWidth,
        gripScrollbarGap: gripRect ? textareaRect.right - gripRect.right : 0,
      };
    });

    expect(textareaMetrics.scrollHeight).toBeGreaterThan(textareaMetrics.clientHeight);
    expect(textareaMetrics.scrollbarWidth).toBe('thin');
    expect(textareaMetrics.scrollbarColor).toContain('160, 135, 87');
    expect(textareaMetrics.gripScrollbarGap).toBeGreaterThanOrEqual(8);

    const grip = page.locator('.contact-textarea-grip');
    const gripBox = await grip.boundingBox();
    expect(gripBox).not.toBeNull();
    const messageHeightBefore = await page
      .locator('#contact-message')
      .evaluate((element) => element.getBoundingClientRect().height);

    await page.mouse.move(gripBox!.x + gripBox!.width / 2, gripBox!.y + gripBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(gripBox!.x + gripBox!.width / 2, gripBox!.y + gripBox!.height / 2 + 44);
    await page.mouse.up();

    const messageHeightAfter = await page
      .locator('#contact-message')
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(messageHeightAfter).toBeGreaterThan(messageHeightBefore + 24);
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('keeps the Press callout secondary and offers a dedicated media enquiry topic', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    for (const viewport of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/contact', { waitUntil: 'networkidle' });

      const callout = page.locator('.contact-press-callout');
      const pressLink = callout.getByRole('link', { name: /View press resources/ });
      await expect(callout.getByText('PRESS / MEDIA', { exact: true })).toBeVisible();
      await expect(
        callout.getByRole('heading', { level: 2, name: 'Working on a story or fact check?' }),
      ).toBeVisible();
      await expect(callout).toContainText(
        'Verified biographies, company facts, images and public verification links are available in the press resources.',
      );
      await expect(pressLink).toHaveAttribute('href', '/press');

      const layout = await page.evaluate(() => {
        const form = globalThis.document.querySelector('.contact-form');
        const calloutElement = globalThis.document.querySelector('.contact-press-callout');
        const link = calloutElement?.querySelector('a');
        const calloutBox = calloutElement?.getBoundingClientRect();
        const linkBox = link?.getBoundingClientRect();

        return {
          calloutAfterForm: Boolean(
            form &&
            calloutElement &&
            (form.compareDocumentPosition(calloutElement) &
              globalThis.Node.DOCUMENT_POSITION_FOLLOWING) !==
              0,
          ),
          calloutLeft: calloutBox?.left ?? -1,
          calloutRight: calloutBox?.right ?? -1,
          linkHeight: linkBox?.height ?? 0,
          scrollWidth: globalThis.document.documentElement.scrollWidth,
          viewportWidth: globalThis.document.documentElement.clientWidth,
        };
      });

      expect(layout.calloutAfterForm).toBe(true);
      expect(layout.calloutLeft).toBeGreaterThanOrEqual(19);
      expect(layout.calloutRight).toBeLessThanOrEqual(layout.viewportWidth - 19);
      expect(layout.linkHeight).toBeGreaterThanOrEqual(44);
      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);

      await page.locator('#contact-topic').click();
      await page.getByRole('option', { name: 'Press / media enquiry', exact: true }).click();
      await expect(page.locator('#contact-topic')).toContainText('Press / media enquiry');
      await expect(page.locator('#contact-topic-feedback')).toContainText(
        'Interviews, fact checks, publication permissions, and media requests.',
      );

      await pressLink.scrollIntoViewIfNeeded();
      await pressLink.click();
      await expect(page).toHaveURL('/press');
      await expect(
        page.getByRole('heading', { level: 1, name: 'Serhat Soruklu & Coupyn' }),
      ).toBeVisible();
    }

    assertNoConsoleErrors();
  });

  test('keeps light theme contact layouts readable', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(() => {
      window.localStorage.setItem('serhatsoruklu-theme', 'light');
    });
    await page.goto('/contact');

    await expect(page.locator('html')).toHaveClass(/theme-resolved-light/);
    await expect(page.getByRole('heading', { name: 'Start With a Clear Message' })).toBeVisible();
    await expect
      .poll(async () => {
        const textareaScrollbar = await page.locator('#contact-message').evaluate((element) => ({
          firefoxColor: getComputedStyle(element).scrollbarColor,
          webkitThumbColor: getComputedStyle(element, '::-webkit-scrollbar-thumb').backgroundColor,
        }));

        return `${textareaScrollbar.firefoxColor} ${textareaScrollbar.webkitThumbColor}`;
      })
      .toContain('184, 135, 47');
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });

  test('keeps system theme contact layouts readable', async ({ page }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      window.localStorage.setItem('serhatsoruklu-theme', 'system');
    });
    await page.goto('/contact');

    await expect(page.locator('html')).toHaveClass(/theme-system/);
    await expect(page.locator('html')).toHaveClass(/theme-resolved-dark/);
    await expect(page.getByRole('heading', { name: 'Start With a Clear Message' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    assertNoConsoleErrors();
  });
});
