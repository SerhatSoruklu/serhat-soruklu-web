import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const surnamePath = '/soruklu-surname';
const orderPath = '/soruklu-order';
const canonicalUrl = `https://serhatsoruklu.com${surnamePath}`;
const numberedSourceCount = 20;
const viewports = [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

type JsonLdEntity = Record<string, unknown>;

function getMetaContent(html: string, attribute: 'name' | 'property', key: string): string | null {
  const tag = (html.match(/<meta\b[^>]*>/g) ?? []).find((candidate) =>
    candidate.includes(`${attribute}="${key}"`),
  );

  return tag?.match(/\bcontent="([^"]*)"/)?.[1] ?? null;
}

function getCanonicalHref(html: string): string | null {
  const tag = (html.match(/<link\b[^>]*>/g) ?? []).find((candidate) =>
    candidate.includes('rel="canonical"'),
  );

  return tag?.match(/\bhref="([^"]*)"/)?.[1] ?? null;
}

function getRouteGraph(html: string): JsonLdEntity[] {
  const match = html.match(/<script\b[^>]*id="page-json-ld"[^>]*>([\s\S]*?)<\/script>/);
  const data = match ? (JSON.parse(match[1]) as JsonLdEntity) : {};

  return Array.isArray(data['@graph']) ? (data['@graph'] as JsonLdEntity[]) : [];
}

test.describe('Soruklu surname', () => {
  test('direct navigation renders the complete English default with exact metadata', async ({
    page,
    request,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const response = await request.get(surnamePath);
    const html = await response.text();

    expect(response.status()).toBe(200);
    expect(html.match(/<title>(.*?)<\/title>/)?.[1]).toBe(pageSeoMetadata.sorukluSurname.title);
    expect(getMetaContent(html, 'name', 'description')).toBe(
      pageSeoMetadata.sorukluSurname.description,
    );
    expect(getMetaContent(html, 'name', 'robots')).toBe('index, follow');
    expect(getCanonicalHref(html)).toBe(canonicalUrl);
    expect(getMetaContent(html, 'property', 'og:image')).toBe(
      `${canonicalUrl.replace(surnamePath, '')}${pageSeoMetadata.sorukluSurname.ogImage}`,
    );
    expect(getMetaContent(html, 'name', 'twitter:card')).toBe('summary_large_image');
    expect(getRouteGraph(html).map((entity) => entity['@type'])).toEqual([
      'BreadcrumbList',
      'AboutPage',
      'DefinedTerm',
      'WebSite',
      'Person',
    ]);

    await page.goto(surnamePath);
    await expect(
      page.getByRole('heading', { level: 1, name: 'What does Soruklu mean?' }),
    ).toBeVisible();
    await expect(page.locator('.surname-page h1')).toHaveCount(1);
    await expect(page.locator('.surname-formation__equation')).toContainText('Soruk+-lu→Soruklu');
    await expect(
      page.getByText('What can—and cannot—be concluded.', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('What remains unproven', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 2, name: 'The living footprint of a rare surname' }),
    ).toBeVisible();
    await expect(
      page.getByText('Working estimate · low confidence', { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId('surname-language-switch')).toContainText('Türkçe oku');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    const evidenceImages = page.locator('.surname-place-feature__media img');
    await expect(evidenceImages).toHaveCount(3);
    expect(
      await evidenceImages.evaluateAll((images) => images.map((image) => image.loading)),
    ).toEqual(['lazy', 'lazy', 'lazy']);
    assertNoConsoleErrors();
  });

  test('the accessible language switch translates the whole page, persists, and returns', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    const trackingWarnings: string[] = [];
    page.on('console', (message) => {
      if (message.text().includes('NG0956')) {
        trackingWarnings.push(message.text());
      }
    });
    await page.goto(surnamePath);
    const languageSwitch = page.getByTestId('surname-language-switch');

    await languageSwitch.focus();
    await expect(languageSwitch).toBeFocused();
    expect(
      await languageSwitch.evaluate((element) => getComputedStyle(element).outlineStyle),
    ).not.toBe('none');
    await page.keyboard.press('Space');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Soruklu ne anlama geliyor?' }),
    ).toBeVisible();
    await expect(page.getByText('Belgesel zaman çizgisi', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Neye varılabilir, neye varılamaz?', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Kanıtlanmamış noktalar', { exact: true })).toBeVisible();
    await expect(page.getByText('Nadir bir soyadının yaşayan izi', { exact: true })).toBeVisible();
    await expect(page.getByText('Çalışma tahmini · düşük güven', { exact: true })).toBeVisible();
    await expect(page.getByText('Kaynak notları', { exact: true })).toBeVisible();
    await expect(languageSwitch).toContainText('Read in English');
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr-TR');
    await expect(page).toHaveTitle('Soruklu Soyadı: Anlamı ve Kökeni | Serhat Soruklu');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'tr_TR');
    await expect(page).toHaveURL(new RegExp(`${surnamePath}$`));
    await expect(page.locator('.site-nav')).toContainText('Work');
    await expect(page.locator('.site-footer')).toContainText('Navigate');

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Soruklu ne anlama geliyor?' })).toBeVisible();
    await page.getByRole('link', { name: 'Soruklu Order’ı inceleyin' }).click();
    await page
      .locator('[aria-labelledby="site-footer-identity-title"]')
      .getByRole('link', { name: 'Soruklu surname', exact: true })
      .click();
    await expect(page.getByRole('heading', { name: 'Soruklu ne anlama geliyor?' })).toBeVisible();

    await page.getByTestId('surname-language-switch').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'What does Soruklu mean?' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(page).toHaveTitle(pageSeoMetadata.sorukluSurname.title);
    expect(trackingWarnings).toEqual([]);
    assertNoConsoleErrors();
  });

  test('footer identity order, cross-links, citations, and header scope are exact', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    await page.goto(surnamePath);

    const identity = page.locator('[aria-labelledby="site-footer-identity-title"]');
    await expect(identity.locator('.site-footer__link')).toHaveText([
      'Soruklu surname',
      'Soruklu Order',
      'Velari',
    ]);
    expect(
      await identity
        .locator('.site-footer__link')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual([surnamePath, orderPath, '/velari']);
    await expect(
      identity.getByRole('link', { name: 'Soruklu surname', exact: true }),
    ).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.site-nav a[href="/soruklu-surname"]')).toHaveCount(0);
    await expect(page.locator('.surname-page a[href="/soruklu-order"]')).toHaveCount(2);

    const sourceTitles = page.locator('.surname-sources__title-link');
    const sourceActions = page.locator('.surname-sources__action');
    await expect(sourceTitles).toHaveCount(numberedSourceCount);
    await expect(sourceActions).toHaveCount(numberedSourceCount);
    for (const sources of [sourceTitles, sourceActions]) {
      for (let index = 0; index < numberedSourceCount; index += 1) {
        await expect(sources.nth(index)).toHaveAttribute('target', '_blank');
        await expect(sources.nth(index)).toHaveAttribute('rel', 'noopener noreferrer');
        await expect(sources.nth(index)).toHaveAttribute('aria-label', /new tab/);
      }
    }
    await expect(sourceActions.first()).toContainText('Open source');
    await expect(sourceTitles.last()).toHaveAttribute(
      'href',
      'https://islamansiklopedisi.org.tr/evliya-celebi',
    );
    expect(
      await sourceActions
        .first()
        .evaluate((link) => Number.parseFloat(getComputedStyle(link).minHeight)),
    ).toBeGreaterThanOrEqual(44);

    await page.goto(orderPath);
    const historyLink = page.getByRole('link', {
      name: /Looking for the surname’s history\? Read about the meaning and documented origins/,
    });
    await expect(historyLink).toHaveAttribute('href', surnamePath);
    await historyLink.click();
    await expect(page).toHaveURL(new RegExp(`${surnamePath}$`));
    assertNoConsoleErrors();
  });

  test('every required viewport remains bounded with a balanced hero and complete footer', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(surnamePath);
      await page.locator('app-site-footer').scrollIntoViewIfNeeded();

      const layout = await page.evaluate(() => {
        const frame = document.querySelector('.surname-frame')?.getBoundingClientRect();
        const hero = document.querySelector('.surname-hero')?.getBoundingClientRect();
        const closing = document.querySelector('.surname-closing')?.getBoundingClientRect();
        const footer = document.querySelector('.site-footer')?.getBoundingClientRect();

        return {
          bodyWidth: document.body.scrollWidth,
          closingBottom: closing?.bottom,
          footerTop: footer?.top,
          frameLeft: frame?.left,
          frameRight: frame?.right,
          heroHeight: hero?.height,
          viewportWidth: document.documentElement.clientWidth,
        };
      });

      expect(layout.bodyWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.frameLeft).toBeGreaterThanOrEqual(19);
      expect(layout.frameRight).toBeLessThanOrEqual(viewport.width - 19);
      expect(Math.abs((layout.footerTop ?? 0) - (layout.closingBottom ?? 0))).toBeLessThanOrEqual(
        2,
      );
      if (viewport.width >= 360 && viewport.width < 768) {
        expect(layout.heroHeight).toBeLessThanOrEqual(viewport.height * 0.93);
      }
      await expect(page.locator('app-site-footer')).toBeVisible();
      await expect(page.locator('.surname-sources h3').last()).toBeVisible();
    }
    assertNoConsoleErrors();
  });

  test('the Sarıdibek dialog uses article-language wording and keeps the image accessible', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    await page.goto(surnamePath);

    const trigger = page.getByTestId('saridibek-photo-trigger');
    await expect(trigger).toHaveAttribute(
      'aria-label',
      'Open the Vezirkopru Saridibek Village photograph in a dialog',
    );
    await trigger.click();
    const dialog = page.getByTestId('saridibek-dialog');
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(
      'Vezirkopru Saridibek Village',
    );
    await expect(dialog.locator('img')).toHaveAttribute(
      'alt',
      'Green fields and forested mountains around Sarıdibek village near Vezirköprü, Türkiye.',
    );
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();

    await page.getByTestId('surname-language-switch').click();
    await expect(trigger).toHaveAttribute(
      'aria-label',
      'Vezirköprü Sarıdibek Köyü fotoğrafını fotoğraf penceresinde aç',
    );
    await trigger.click();
    await expect(dialog.getByRole('heading', { level: 2 })).toHaveText('Vezirköprü Sarıdibek Köyü');
    await expect(dialog).toHaveAttribute('lang', 'tr-TR');
    assertNoConsoleErrors();
  });

  test('the historical evidence dialogs preserve their images and restore trigger focus', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(surnamePath);

    const dictionaryTrigger = page.getByTestId('kamus-dictionary-trigger');
    await dictionaryTrigger.click();
    const dialog = page.getByTestId('saridibek-dialog');
    await expect(dialog).toHaveClass(/saridibek-dialog--dictionary/);
    await expect(
      dialog.getByRole('heading', {
        level: 2,
        name: 'Kâmûs-ı Türkî: the historical word soruk',
      }),
    ).toBeVisible();

    const dictionaryLayout = await dialog.evaluate((element) => {
      const media = element.querySelector('.saridibek-dialog__media')?.getBoundingClientRect();
      const image = element.querySelector('img')?.getBoundingClientRect();
      const imageElement = element.querySelector('img');

      return {
        imageComplete: imageElement?.complete,
        imageHeight: image?.height,
        mediaHeight: media?.height,
        objectFit: imageElement ? getComputedStyle(imageElement).objectFit : null,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });

    expect(dictionaryLayout.imageComplete).toBe(true);
    expect(dictionaryLayout.objectFit).toBe('contain');
    expect(
      Math.abs((dictionaryLayout.mediaHeight ?? 0) - (dictionaryLayout.imageHeight ?? 0)),
    ).toBeLessThanOrEqual(1);
    expect(dictionaryLayout.overflow).toBe(0);
    await dialog.getByRole('button', { name: /Close the Kâmûs-ı Türkî/ }).click();
    await expect(dictionaryTrigger).toBeFocused();

    const documentTrigger = page.getByTestId('evliya-document-trigger');
    await documentTrigger.click();
    await expect(dialog).toHaveClass(/saridibek-dialog--document/);
    await expect(
      dialog.getByRole('heading', { level: 2, name: 'Soruk in the Ottoman-script Seyahatname' }),
    ).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('alt', /page 402/i);
    await page.keyboard.press('Escape');
    await expect(documentTrigger).toBeFocused();
    assertNoConsoleErrors();
  });

  test('mobile navigation keeps its established behaviour and excludes the footer-only route', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(surnamePath);

    await page.getByTestId('mobile-menu-button').click();
    const mobileNavigation = page.getByTestId('mobile-nav-panel');
    await expect(mobileNavigation).toBeVisible();
    await expect(mobileNavigation.getByRole('link', { name: 'Work' })).toBeVisible();
    await expect(mobileNavigation.locator('a[href="/soruklu-surname"]')).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(mobileNavigation).toBeHidden();
    assertNoConsoleErrors();
  });
});
