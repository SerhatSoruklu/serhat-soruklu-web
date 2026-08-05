import { expect, test } from '@playwright/test';

import { pageSeoMetadata } from '../../src/app/core/seo/seo.config';
import { installConsoleErrorGuard } from './support/console-errors';

const surnamePath = '/soruklu-surname';
const orderPath = '/soruklu-order';
const canonicalUrl = `https://serhatsoruklu.com${surnamePath}`;
const viewports = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 1366 },
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
    await expect(page.getByText('What the records show', { exact: true })).toBeVisible();
    await expect(page.getByText('What remains unproven', { exact: true })).toBeVisible();
    await expect(page.getByTestId('surname-language-switch')).toContainText('Türkçe oku');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
    await expect(page.locator('.surname-page img')).toHaveCount(0);
    assertNoConsoleErrors();
  });

  test('the accessible language switch translates the whole page, persists, and returns', async ({
    page,
  }, testInfo) => {
    const assertNoConsoleErrors = installConsoleErrorGuard(page, testInfo);
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
    await expect(page.getByText('Kayıtların gösterdiği', { exact: true })).toBeVisible();
    await expect(page.getByText('Kanıtlanmamış noktalar', { exact: true })).toBeVisible();
    await expect(page.getByText('Kaynak notları', { exact: true })).toBeVisible();
    await expect(languageSwitch).toContainText('Read in English');
    await expect(page.locator('html')).toHaveAttribute('lang', 'tr-TR');
    await expect(page).toHaveTitle('Soruklu Soyadı: Anlamı ve Kökeni | Serhat Soruklu');
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'tr_TR');

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

    const sources = page.locator('.surname-sources a');
    await expect(sources).toHaveCount(5);
    for (let index = 0; index < 5; index += 1) {
      await expect(sources.nth(index)).toHaveAttribute('target', '_blank');
      await expect(sources.nth(index)).toHaveAttribute('rel', 'noopener noreferrer');
      await expect(sources.nth(index)).toHaveAttribute('aria-label', /new tab/);
    }

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
      if (viewport.width < 768) {
        expect(layout.heroHeight).toBeLessThanOrEqual(viewport.height * 0.93);
      }
      await expect(page.locator('app-site-footer')).toBeVisible();
      await expect(page.locator('.surname-sources h3').last()).toBeVisible();
    }
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
