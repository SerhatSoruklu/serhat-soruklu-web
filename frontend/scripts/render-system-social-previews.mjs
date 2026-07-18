import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const socialAssetDirectory = new URL('../public/assets/social/', import.meta.url);

const previews = [
  {
    source: 'serhat-soruklu-systems-chatpdm-og.svg',
    target: 'serhat-soruklu-systems-chatpdm-og.png',
    overrides: [
      ['#chatpdm-og-logo', 'transform', 'translate(45 16) scale(0.7)'],
      ['#chatpdm-og-diagram', 'transform', 'translate(48 39) scale(0.7)'],
      ['#chatpdm-og-visual > circle:nth-of-type(1)', 'cx', '236'],
      ['#chatpdm-og-visual > circle:nth-of-type(1)', 'r', '18'],
      ['#chatpdm-og-visual > circle:nth-of-type(2)', 'cx', '236'],
      ['#chatpdm-og-visual > circle:nth-of-type(2)', 'cy', '187'],
      ['#chatpdm-og-visual > circle:nth-of-type(2)', 'r', '18'],
    ],
  },
  {
    source: 'serhat-soruklu-systems-coupyn-og.svg',
    target: 'serhat-soruklu-systems-coupyn-og.png',
    overrides: [
      ['#coupyn-og-logo', 'transform', 'translate(44 14) scale(0.76)'],
      ['#coupyn-og-diagram', 'transform', 'translate(51 39) scale(0.7)'],
      ['#coupyn-og-visual > circle:nth-of-type(1)', 'cy', '148'],
      ['#coupyn-og-visual > circle:nth-of-type(1)', 'r', '20'],
      ['#coupyn-og-visual > circle:nth-of-type(2)', 'cx', '218'],
      ['#coupyn-og-visual > circle:nth-of-type(2)', 'cy', '183'],
      ['#coupyn-og-visual > circle:nth-of-type(2)', 'r', '19'],
    ],
  },
];

const browser = await chromium.launch({ headless: true });

try {
  for (const preview of previews) {
    const page = await browser.newPage({
      deviceScaleFactor: 1,
      viewport: { width: 1200, height: 630 },
    });
    const sourceUrl = new URL(preview.source, socialAssetDirectory);
    const svg = await readFile(sourceUrl, 'utf8');

    await page.setContent(
      `<!doctype html><html><head><style>html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#07090d}svg{display:block}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' },
    );

    await page.evaluate((overrides) => {
      for (const [selector, attribute, value] of overrides) {
        const element = document.querySelector(selector);

        if (!element) {
          throw new Error(`Missing SVG element: ${selector}`);
        }

        element.setAttribute(attribute, value);
      }
    }, preview.overrides);

    const artwork = page.locator('svg');
    const dimensions = await artwork.evaluate((element) => ({
      height: element.clientHeight,
      width: element.clientWidth,
    }));

    if (dimensions.width !== 1200 || dimensions.height !== 630) {
      throw new Error(
        `${preview.source} rendered at ${dimensions.width}x${dimensions.height}; expected 1200x630`,
      );
    }

    await artwork.screenshot({
      animations: 'disabled',
      path: fileURLToPath(new URL(preview.target, socialAssetDirectory)),
      type: 'png',
    });
    await page.close();

    console.log(`Rendered ${preview.target} at 1200x630`);
  }
} finally {
  await browser.close();
}
