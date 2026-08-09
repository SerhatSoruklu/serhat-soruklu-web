import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';

const socialAssetDirectory = new URL('../public/assets/social/', import.meta.url);
const publicAssetDirectory = new URL('../public/', import.meta.url);
const fontAssetDirectory = new URL('../public/assets/fonts/', import.meta.url);
const rasterFontAssetDirectory = new URL('./assets/fonts/', import.meta.url);
const maximumIntentionalWordmarkKerning = 5;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

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
    source: 'serhat-soruklu-about-og.svg',
    target: 'serhat-soruklu-about-og.png',
    validateWordmark: false,
    portrait: {
      expectedHeight: 1341,
      expectedWidth: 1173,
      selector: '#about-og-portrait',
      sourcePath: '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
    },
  },
  {
    source: 'serhat-soruklu-press-og.svg',
    target: 'serhat-soruklu-press-og.png',
    validateWordmark: false,
    portrait: {
      expectedHeight: 1341,
      expectedWidth: 1173,
      selector: '#press-og-portrait',
      sourcePath: '/assets/about/serhat-soruklu-ceo-founder-of-coupyn.png',
    },
  },
  {
    source: 'serhat-soruklu-systems-chatpdm-og.svg',
    target: 'serhat-soruklu-systems-chatpdm-og.png',
    validateWordmark: true,
  },
  {
    source: 'serhat-soruklu-systems-coupyn-og.svg',
    target: 'serhat-soruklu-systems-coupyn-og.png',
    validateSignalFlow: true,
    validateWordmark: true,
  },
  {
    source: 'serhat-soruklu-writing-og.svg',
    target: 'serhat-soruklu-writing-og.png',
    validateWordmark: false,
    writing: {
      embeddedFontFamily: 'Writing Arial',
      embeddedFontStyleId: 'writing-og-fonts',
      logoSelector: '#brand-logo-card',
      minimumTitleLogoGap: 0,
      titleSelector: '#writing-og-title',
      weights: [400, 700],
    },
  },
  {
    source: 'serhat-soruklu-soruklu-surname-og.svg',
    target: 'serhat-soruklu-soruklu-surname-og.png',
    validateWordmark: false,
  },
];

const synchronizeEmbeddedPortraits = process.argv.includes('--sync-embedded-portraits');
const requestedTargets = process.argv
  .slice(2)
  .filter((argument) => argument !== '--sync-embedded-portraits');
const previewsToRender =
  requestedTargets.length === 0
    ? previews
    : previews.filter((preview) => requestedTargets.includes(preview.target));

if (requestedTargets.length > 0 && previewsToRender.length !== new Set(requestedTargets).size) {
  const knownTargets = previews.map((preview) => preview.target).join(', ');
  throw new Error(`Unknown social-preview target. Expected one of: ${knownTargets}`);
}

const browser = await chromium.launch({ headless: true });

try {
  for (const preview of previewsToRender) {
    const page = await browser.newPage({
      deviceScaleFactor: 1,
      viewport: { width: 1200, height: 630 },
    });
    const sourceUrl = new URL(preview.source, socialAssetDirectory);
    let svg = await readFile(sourceUrl, 'utf8');

    if (preview.writing) {
      validateSelfContainedWritingFonts(svg, preview);
    }

    if (preview.portrait) {
      const portraitUrl = new URL(preview.portrait.sourcePath.slice(1), publicAssetDirectory);
      const portrait = await readFile(portraitUrl);
      const portraitDimensions = readPngDimensions(portrait, preview.portrait.sourcePath);

      if (
        portraitDimensions.width !== preview.portrait.expectedWidth ||
        portraitDimensions.height !== preview.portrait.expectedHeight
      ) {
        throw new Error(
          `${preview.portrait.sourcePath} is ${portraitDimensions.width}x${portraitDimensions.height}; expected ${preview.portrait.expectedWidth}x${preview.portrait.expectedHeight}`,
        );
      }

      if (synchronizeEmbeddedPortraits) {
        const synchronizedSvg = synchronizeEmbeddedPortrait(svg, preview, portrait);

        if (synchronizedSvg !== svg) {
          await writeFile(sourceUrl, synchronizedSvg, 'utf8');
          console.log(
            `Embedded ${preview.portrait.sourcePath} into ${preview.source} from the canonical PNG`,
          );
        }

        svg = synchronizedSvg;
      }

      validateEmbeddedPortrait(svg, preview, portrait);
    }

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

    if (preview.writing) {
      const embeddedFontsLoaded = await page.evaluate(async ({ family, weights }) => {
        const loadedFaces = await Promise.all(
          weights.map((weight) => document.fonts.load(`${weight} 72px "${family}"`)),
        );
        await document.fonts.ready;

        return loadedFaces.map((faces) => faces.length > 0);
      }, {
        family: preview.writing.embeddedFontFamily,
        weights: preview.writing.weights,
      });

      if (embeddedFontsLoaded.some((loaded) => !loaded)) {
        throw new Error(`${preview.source} embedded Writing Arial fonts did not load`);
      }

      const titleLogoGap = await page
        .locator(preview.writing.titleSelector)
        .evaluate((title, writing) => {
          const logo = document.querySelector(writing.logoSelector);

          if (!logo) {
            throw new Error('Missing Writing social-preview logo card');
          }

          return logo.getBoundingClientRect().left - title.getBoundingClientRect().right;
        }, preview.writing);

      if (titleLogoGap < preview.writing.minimumTitleLogoGap) {
        throw new Error(
          `${preview.source} title overlaps the logo card by ${Math.abs(titleLogoGap)}px`,
        );
      }
    }

    if (preview.portrait) {
      const renderedPortraitDimensions = await page
        .locator(preview.portrait.selector)
        .evaluate(async (portrait, expectedSourcePath) => {
          const href = portrait.getAttribute('href');
          const sourcePath = portrait.getAttribute('data-source-path');

          if (!href?.startsWith('data:image/png;base64,')) {
            throw new Error('The preview portrait was not embedded as a PNG data URL');
          }

          if (sourcePath !== expectedSourcePath) {
            throw new Error(
              'The preview portrait does not retain its canonical source-path marker',
            );
          }

          return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => {
              resolve({ height: image.naturalHeight, width: image.naturalWidth });
            });
            image.addEventListener('error', () =>
              reject(new Error('The preview portrait did not load')),
            );
            image.src = href;
          });
        }, preview.portrait.sourcePath);

      if (
        renderedPortraitDimensions.width !== preview.portrait.expectedWidth ||
        renderedPortraitDimensions.height !== preview.portrait.expectedHeight
      ) {
        throw new Error(
          `${preview.source} embedded portrait rendered at ${renderedPortraitDimensions.width}x${renderedPortraitDimensions.height}; expected ${preview.portrait.expectedWidth}x${preview.portrait.expectedHeight}`,
        );
      }
    }

    if (preview.validateWordmark) {
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
    }

    if (preview.validateSignalFlow) {
      const signalFlow = await page.locator('#coupyn-og-visual').evaluate((visual) => {
        const directFrames = visual.querySelectorAll(':scope > #coupyn-og-visual-box');
        const competingFrames = visual.querySelectorAll(':scope > rect:not(#coupyn-og-visual-box)');
        const nodes = Array.from(visual.querySelectorAll('[data-signal-node]')).map((node) =>
          node.getAttribute('data-signal-node'),
        );
        const connections = Array.from(
          visual.querySelectorAll('[data-signal-connection]'),
        ).map((connection) => ({
          markerEnd: connection.getAttribute('marker-end'),
          relation: connection.getAttribute('data-signal-connection'),
        }));

        return {
          competingFrameCount: competingFrames.length,
          connectionCount: connections.length,
          directFrameCount: directFrames.length,
          hasDirectionalConnections: connections.every(({ markerEnd }) =>
            markerEnd?.startsWith('url(#arrow-'),
          ),
          nodes,
          relations: connections.map(({ relation }) => relation),
        };
      });
      const expectedNodes = ['Trust', 'Signal', 'Offer', 'Proof'];
      const expectedRelations = [
        'trust-to-signal',
        'signal-to-offer',
        'offer-to-proof',
        'proof-to-trust',
      ];

      if (
        signalFlow.directFrameCount !== 1 ||
        signalFlow.competingFrameCount !== 0 ||
        signalFlow.connectionCount !== expectedRelations.length ||
        !signalFlow.hasDirectionalConnections ||
        signalFlow.nodes.join('|') !== expectedNodes.join('|') ||
        signalFlow.relations.join('|') !== expectedRelations.join('|')
      ) {
        throw new Error(
          `${preview.source} must render one un-nested Commerce Signals frame with the directional Trust → Signal → Offer → Proof → Trust loop`,
        );
      }
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

function readPngDimensions(image, source) {
  if (image.length < 24 || !image.subarray(0, pngSignature.length).equals(pngSignature)) {
    throw new Error(`${source} is not a valid PNG`);
  }

  if (image.subarray(12, 16).toString('ascii') !== 'IHDR') {
    throw new Error(`${source} does not begin with a PNG IHDR chunk`);
  }

  return {
    height: image.readUInt32BE(20),
    width: image.readUInt32BE(16),
  };
}

function validateSelfContainedWritingFonts(svg, preview) {
  const { embeddedFontFamily, embeddedFontStyleId, weights } = preview.writing;
  const stylePattern = new RegExp(
    `<style\\b[^>]*\\bid="${escapeRegExp(embeddedFontStyleId)}"[^>]*>([\\s\\S]*?)<\\/style>`,
  );
  const fontStyle = svg.match(stylePattern)?.[1];

  if (!fontStyle) {
    throw new Error(`${preview.source} is missing its embedded Writing font style`);
  }

  const fontFaces = [...fontStyle.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(
    (match) => match[1],
  );

  if (fontFaces.length !== weights.length) {
    throw new Error(
      `${preview.source} must embed ${weights.length} Writing font faces; found ${fontFaces.length}`,
    );
  }

  const embeddedWeights = [];

  for (const fontFace of fontFaces) {
    if (!fontFace.includes(`font-family:"${embeddedFontFamily}"`)) {
      throw new Error(`${preview.source} contains an unexpected embedded font family`);
    }

    const weight = Number(fontFace.match(/font-weight:(\d+)/)?.[1]);
    const source = fontFace.match(
      /src:url\("data:font\/ttf;base64,([A-Za-z0-9+/]+={0,2})"\)\s*format\("truetype"\)/,
    )?.[1];

    if (!source || source.length % 4 !== 0) {
      throw new Error(`${preview.source} contains an external or invalid embedded font source`);
    }

    const font = Buffer.from(source, 'base64');

    if (font.length < 1_000 || !font.subarray(0, 4).equals(Buffer.from([0, 1, 0, 0]))) {
      throw new Error(`${preview.source} contains an invalid embedded TrueType font`);
    }

    embeddedWeights.push(weight);
  }

  if (embeddedWeights.sort((left, right) => left - right).join('|') !== weights.join('|')) {
    throw new Error(
      `${preview.source} must embed Writing font weights ${weights.join(' and ')}`,
    );
  }
}

function synchronizeEmbeddedPortrait(svg, preview, portrait) {
  const portraitElement = findPortraitElement(svg, preview);
  const portraitDataUrl = `data:image/png;base64,${portrait.toString('base64')}`;
  const withSourcePath = setSvgAttribute(
    portraitElement,
    'data-source-path',
    preview.portrait.sourcePath,
  );
  const synchronizedElement = setSvgAttribute(withSourcePath, 'href', portraitDataUrl);

  return svg.replace(portraitElement, synchronizedElement);
}

function validateEmbeddedPortrait(svg, preview, canonicalPortrait) {
  const portraitElement = findPortraitElement(svg, preview);
  const sourcePath = readSvgAttribute(portraitElement, 'data-source-path');
  const sourcePathReferences = svg.split(preview.portrait.sourcePath).length - 1;

  if (sourcePath !== preview.portrait.sourcePath || sourcePathReferences !== 1) {
    throw new Error(
      `${preview.source} must retain exactly one data-source-path marker for ${preview.portrait.sourcePath}; found ${sourcePathReferences}`,
    );
  }

  const href = readSvgAttribute(portraitElement, 'href');
  const dataUrlPrefix = 'data:image/png;base64,';

  if (!href?.startsWith(dataUrlPrefix)) {
    throw new Error(
      `${preview.source} must embed its portrait as a self-contained PNG data URL. Run the renderer with --sync-embedded-portraits.`,
    );
  }

  const encodedPortrait = href.slice(dataUrlPrefix.length);

  if (
    encodedPortrait.length === 0 ||
    encodedPortrait.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(encodedPortrait)
  ) {
    throw new Error(`${preview.source} contains an invalid embedded portrait data URL`);
  }

  const embeddedPortrait = Buffer.from(encodedPortrait, 'base64');
  const embeddedDimensions = readPngDimensions(embeddedPortrait, `${preview.source} portrait`);

  if (
    embeddedDimensions.width !== preview.portrait.expectedWidth ||
    embeddedDimensions.height !== preview.portrait.expectedHeight
  ) {
    throw new Error(
      `${preview.source} embeds a ${embeddedDimensions.width}x${embeddedDimensions.height} portrait; expected ${preview.portrait.expectedWidth}x${preview.portrait.expectedHeight}`,
    );
  }

  if (!embeddedPortrait.equals(canonicalPortrait)) {
    throw new Error(
      `${preview.source} embedded portrait differs from ${preview.portrait.sourcePath}. Run the renderer with --sync-embedded-portraits.`,
    );
  }
}

function findPortraitElement(svg, preview) {
  const portraitId = preview.portrait.selector.startsWith('#')
    ? preview.portrait.selector.slice(1)
    : preview.portrait.selector;
  const portraitElements = [...svg.matchAll(/<image\b[^>]*\/>/g)]
    .map((match) => match[0])
    .filter((element) => readSvgAttribute(element, 'id') === portraitId);

  if (portraitElements.length !== 1) {
    throw new Error(
      `${preview.source} must contain exactly one image with id="${portraitId}"; found ${portraitElements.length}`,
    );
  }

  return portraitElements[0];
}

function readSvgAttribute(element, name) {
  const attribute = element.match(new RegExp(`(?:^|\\s)${escapeRegExp(name)}="([^"]*)"`));

  return attribute?.[1] ?? null;
}

function setSvgAttribute(element, name, value) {
  const attributePattern = new RegExp(`(\\s+)${escapeRegExp(name)}="[^"]*"`);

  if (attributePattern.test(element)) {
    return element.replace(attributePattern, `$1${name}="${value}"`);
  }

  const hrefLine = element.match(/\n([ \t]+)href=/);

  if (!hrefLine) {
    throw new Error(`Unable to add ${name} to the embedded SVG portrait`);
  }

  return element.replace(/\n([ \t]+)href=/, `\n$1${name}="${value}"\n$1href=`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
