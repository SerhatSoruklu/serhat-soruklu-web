import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = join(frontendDirectory, 'dist', 'frontend');
const browserDirectory = join(distDirectory, 'browser');
const serverEntry = join(distDirectory, 'server', 'server.mjs');

await assertDirectory(browserDirectory, 'Production browser output is missing.');
await assertFile(serverEntry, 'Production SSR entry is missing.');

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

console.log(
  `[artifact] verified ${browserFileNames.length} browser files, hashed bundles, production API replacement, SSR entry, and no source maps`,
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
