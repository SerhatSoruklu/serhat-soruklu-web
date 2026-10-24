import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = join(frontendDirectory, 'dist', 'frontend');
const browserDirectory = join(distDirectory, 'browser');
const serverEntry = join(distDirectory, 'server', 'server.mjs');
const aboutPortraitAsset = join(
  browserDirectory,
  'assets',
  'portraits',
  'serhat-soruklu-real-selfie.png',
);
const aboutSocialAsset = join(browserDirectory, 'assets', 'social', 'serhat-soruklu-about-natural-portrait-og.png');
const pressSocialAsset = join(browserDirectory, 'assets', 'social', 'serhat-soruklu-press-natural-portrait-og.png');
const codarisSocialAsset = join(browserDirectory, 'assets', 'social', 'serhat-soruklu-systems-codaris-og.png');
const codarisEmblemAsset = join(browserDirectory, 'assets', 'projects', 'codaris', 'emblem.svg');
const homeDarkPortraitAsset = join(
  browserDirectory,
  'assets',
  'portraits',
  'serhat-soruklu-office-dark-native.png',
);
const homeLightPortraitAsset = join(
  browserDirectory,
  'assets',
  'portraits',
  'serhat-soruklu-office-light-native.png',
);

await assertDirectory(browserDirectory, 'Production browser output is missing.');
await assertFile(serverEntry, 'Production SSR entry is missing.');
await assertPngDimensions(
  aboutPortraitAsset,
  1022,
  1533,
  'The production About portrait is missing or has unexpected dimensions.',
);
await assertPngDimensions(
  aboutSocialAsset,
  1200,
  630,
  'The production About social image is missing or has unexpected dimensions.',
);
await assertPngDimensions(
  pressSocialAsset,
  1200,
  630,
  'The production Press social image is missing or has unexpected dimensions.',
);
await assertPngDimensions(
  codarisSocialAsset,
  1200,
  630,
  'The production CODARIS social image is missing or has unexpected dimensions.',
);
await assertPngDimensions(
  join(browserDirectory, 'assets', 'social', 'serhat-soruklu-systems-stervox-og.png'),
  1200,
  630,
  'The production Stervox social image is missing or has unexpected dimensions.',
);
await assertFile(join(browserDirectory, 'assets', 'projects', 'stervox', 'wordmark-dark.svg'), 'The Stervox dark wordmark is missing.');
await assertFile(join(browserDirectory, 'assets', 'projects', 'stervox', 'wordmark-light.svg'), 'The Stervox light wordmark is missing.');
await assertFile(codarisEmblemAsset, 'The CODARIS emblem is missing from production output.');
await assertPngDimensions(
  homeDarkPortraitAsset,
  1846,
  852,
  'The production dark homepage portrait is missing or has unexpected dimensions.',
);
await assertPngDimensions(
  homeLightPortraitAsset,
  1846,
  852,
  'The production light homepage portrait is missing or has unexpected dimensions.',
);

for (const theme of ['dark', 'light']) {
  const prefix = join(browserDirectory, 'assets', 'portraits', `serhat-soruklu-office-${theme}`);
  await assertPngDimensions(`${prefix}-8k.png`, 7680, 3545, `The ${theme} 8K upscale export is missing or has unexpected dimensions.`);
  for (const width of [640, 960, 1440, 1846]) {
    for (const format of ['avif', 'webp']) {
      const path = `${prefix}-${width}.${format}`;
      await assertFile(path, `The responsive ${theme} portrait ${width}.${format} is missing.`);
      assert.ok((await stat(path)).size < 512 * 1024, `The responsive ${theme} portrait exceeds its 512 KiB display budget.`);
    }
  }
}

const browserFiles = await listFiles(browserDirectory);
const browserFileNames = browserFiles.map((filePath) => relative(browserDirectory, filePath));
const mainBundle = browserFileNames.find((fileName) => /^main-[a-z0-9]{8}\.js$/i.test(fileName));
const stylesBundle = browserFileNames.find((fileName) =>
  /^styles-[a-z0-9]{8}\.css$/i.test(fileName),
);

assert.ok(mainBundle, 'The production main bundle is not output-hashed.');
assert.ok(stylesBundle, 'The production stylesheet is not output-hashed.');
assert.equal(
  browserFileNames.some((fileName) => fileName.endsWith('.map')),
  false,
  'Production source maps must not be emitted.',
);
assert.equal(
  browserFileNames.includes('main.js'),
  false,
  'An unhashed development main.js exists.',
);
assert.equal(
  browserFileNames.includes('styles.css'),
  false,
  'An unhashed development styles.css exists.',
);

const indexHtml = await readFile(join(browserDirectory, 'index.csr.html'), 'utf8');
assert.match(
  indexHtml,
  /main-[a-z0-9]{8}\.js/i,
  'The browser index does not reference a hashed main bundle.',
);
assert.match(
  indexHtml,
  /styles-[a-z0-9]{8}\.css/i,
  'The browser index does not reference a hashed stylesheet.',
);

const scannableFiles = browserFiles.filter((filePath) =>
  /\.(?:css|html|js|json|xml)$/i.test(filePath),
);
const compiledBrowserText = (
  await Promise.all(scannableFiles.map((filePath) => readFile(filePath, 'utf8')))
).join('\n');

assert.doesNotMatch(
  compiledBrowserText,
  /http:\/\/localhost:3000(?:\/api)?/i,
  'The development backend endpoint leaked into the production browser output.',
);
assert.match(
  compiledBrowserText,
  /https:\/\/api\.serhatsoruklu\.com\/api/i,
  'The production API endpoint is missing from the browser output.',
);
assert.match(
  compiledBrowserText,
  /\/assets\/portraits\/serhat-soruklu-real-selfie\.png/i,
  'The About portrait URL is missing from the production browser output.',
);
assert.match(
  compiledBrowserText,
  /\/assets\/social\/serhat-soruklu-about-natural-portrait-og\.png/i,
  'The About social-image URL is missing from the production browser output.',
);
assert.match(
  compiledBrowserText,
  /\/assets\/social\/serhat-soruklu-press-natural-portrait-og\.png/i,
  'The Press social-image URL is missing from the production browser output.',
);
assert.match(
  compiledBrowserText,
  /\/assets\/social\/serhat-soruklu-systems-codaris-og\.png/i,
  'The CODARIS social-image URL is missing from the production browser output.',
);
assert.match(
  compiledBrowserText,
  /\/assets\/portraits\/serhat-soruklu-office-/i,
  'The responsive office portrait URL prefix is missing from the production browser output.',
);

console.log(
  `[artifact] verified ${browserFileNames.length} browser files, hashed bundles, production API replacement, CODARIS, About, Press, and homepage image assets, SSR entry, and no source maps`,
);

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map((entry) => {
      const entryPath = join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );
  return nestedFiles.flat();
}

async function assertDirectory(path, message) {
  const pathStat = await stat(path).catch(() => null);
  assert.ok(pathStat?.isDirectory(), message);
}

async function assertFile(path, message) {
  const pathStat = await stat(path).catch(() => null);
  assert.ok(pathStat?.isFile(), message);
}

async function assertPngDimensions(path, expectedWidth, expectedHeight, message) {
  const image = await readFile(path).catch(() => null);
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  assert.ok(image && image.length >= 24, message);
  assert.equal(image.subarray(0, pngSignature.length).equals(pngSignature), true, message);
  assert.equal(image.subarray(12, 16).toString('ascii'), 'IHDR', message);
  assert.equal(image.readUInt32BE(16), expectedWidth, message);
  assert.equal(image.readUInt32BE(20), expectedHeight, message);
}
