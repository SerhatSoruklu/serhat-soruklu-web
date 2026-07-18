import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const socialAssetDirectory = new URL('../public/assets/social/', import.meta.url);
const fontAssetDirectory = new URL('../public/assets/fonts/', import.meta.url);
const rasterFontAssetDirectory = new URL('./assets/fonts/', import.meta.url);
const maximumIntentionalWordmarkKerning = 5;

const rasterFontFaces = [
  {
    family: 'Arial',
    format: 'truetype',
    mime: 'font/ttf',
    source: new URL('LiberationSans-Regular.ttf', rasterFontAssetDirectory),
    weight: 400,
  },
  {
    family: 'Arial',
    format: 'truetype',
    mime: 'font/ttf',
    source: new URL('LiberationSans-Bold.ttf', rasterFontAssetDirectory),
    weight: 700,
  },
  {
    family: 'Inter',
    format: 'woff2',
    mime: 'font/woff2',
    source: new URL('inter-latin-600.woff2', fontAssetDirectory),
    weight: 600,
  },
  {
    family: 'Open Sans',
    format: 'woff2',
    mime: 'font/woff2',
    source: new URL('open-sans-latin-700.woff2', fontAssetDirectory),
    weight: 700,
  },
];

const rasterFontCss = (
  await Promise.all(
    rasterFontFaces.map(async ({ family, format, mime, source, weight }) => {
      const font = await readFile(source);

      return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:block;src:url("data:${mime};base64,${font.toString('base64')}") format("${format}")}`;
    }),
  )
).join('');

const previews = [
  {
    source: 'serhat-soruklu-systems-chatpdm-og.svg',
    target: 'serhat-soruklu-systems-chatpdm-og.png',
  },
  {
    source: 'serhat-soruklu-systems-coupyn-og.svg',
    target: 'serhat-soruklu-systems-coupyn-og.png',
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
      `<!doctype html><html><head><style>${rasterFontCss}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#07090d}svg{display:block}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' },
    );

    const fontsLoaded = await page.evaluate(async () => {
      const [arialRegular, arialBold, inter, openSans] = await Promise.all([
        document.fonts.load('400 26px Arial'),
        document.fonts.load('700 72px Arial'),
        document.fonts.load('600 36px Inter'),
        document.fonts.load('700 40px "Open Sans"'),
      ]);
      await document.fonts.ready;

      return {
        arialBold: arialBold.length > 0,
        arialRegular: arialRegular.length > 0,
        inter: inter.length > 0,
        openSans: openSans.length > 0,
      };
    });

    if (
      !fontsLoaded.arialBold ||
      !fontsLoaded.arialRegular ||
      !fontsLoaded.inter ||
      !fontsLoaded.openSans
    ) {
      throw new Error('Required system-preview fonts did not load');
    }

    const wordmarkGap = await page.locator('[id$="-og-logo"]').evaluate((logo) => {
      const words = Array.from(logo.querySelectorAll(':scope > text'));
      const firstWordBounds = words[0]?.getBBox();

      if (!firstWordBounds) {
        throw new Error('Missing system-preview wordmark');
      }

      const firstWordEnd = firstWordBounds.x + firstWordBounds.width;

      if (words.length > 1) {
        return words[1].getBBox().x - firstWordEnd;
      }

      const separator = logo.querySelector(':scope > circle');

      if (!separator) {
        throw new Error('Missing system-preview wordmark separator');
      }

      return separator.cx.baseVal.value - separator.r.baseVal.value - firstWordEnd;
    });

    if (wordmarkGap < -maximumIntentionalWordmarkKerning) {
      throw new Error(`${preview.source} wordmark overlaps by ${Math.abs(wordmarkGap)}px`);
    }

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
