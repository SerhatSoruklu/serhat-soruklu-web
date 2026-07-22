import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { createServer } from 'node:net';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const frontendDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');
const browserDirectory = join(frontendDirectory, 'dist', 'frontend', 'browser');
const port = await findAvailablePort();
const baseUrl = `http://127.0.0.1:${port}`;
let output = '';

const child = spawn(process.execPath, ['./scripts/start-production.mjs'], {
  cwd: frontendDirectory,
  env: {
    ...process.env,
    PORT: String(port),
    FRONTEND_CANONICAL_HOST: 'serhatsoruklu.com',
    FRONTEND_ENABLE_HSTS: 'true',
    FRONTEND_ENFORCE_HTTPS: 'true',
    FRONTEND_HOST: '127.0.0.1',
    FRONTEND_SHUTDOWN_TIMEOUT_MS: '2000',
    FRONTEND_TRUST_PROXY: 'loopback',
  },
  shell: false,
  stdio: ['ignore', 'pipe', 'pipe'],
});

child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});
child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

try {
  await waitForServer();

  const insecureResponse = await fetch(`${baseUrl}/`, { redirect: 'manual' });
  assert.equal(insecureResponse.status, 308, 'Plain HTTP must redirect permanently.');
  assert.equal(
    insecureResponse.headers.get('location'),
    'https://serhatsoruklu.com/',
    'The HTTPS redirect must use the fixed canonical host.',
  );

  const insecureKnownRouteResponse = await fetch(`${baseUrl}/work?campaign=user-controlled`, {
    redirect: 'manual',
  });
  assert.equal(insecureKnownRouteResponse.status, 308);
  assert.equal(
    insecureKnownRouteResponse.headers.get('location'),
    'https://serhatsoruklu.com/work',
    'Known HTTPS redirects must come from the fixed route allowlist without reflecting query data.',
  );

  const insecureUnknownRouteResponse = await fetch(`${baseUrl}/unknown-http-route`, {
    redirect: 'manual',
  });
  assert.equal(insecureUnknownRouteResponse.status, 404);
  assert.equal(insecureUnknownRouteResponse.headers.get('location'), null);

  const homeResponse = await secureFetch('/');
  const homeHtml = await homeResponse.text();
  assert.equal(homeResponse.status, 200, 'The home route must SSR with HTTP 200.');
  assert.match(homeHtml, /<title>[^<]*Serhat Soruklu/i, 'The home response is not SSR HTML.');
  assert.equal(homeResponse.headers.get('x-powered-by'), null, 'X-Powered-By must be disabled.');
  assert.equal(homeResponse.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(homeResponse.headers.get('x-frame-options'), 'DENY');
  assert.equal(homeResponse.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.match(homeResponse.headers.get('permissions-policy') ?? '', /camera=\(\)/);
  const homeCsp = homeResponse.headers.get('content-security-policy') ?? '';
  assert.match(homeCsp, /frame-ancestors 'none'/);
  assert.match(homeCsp, /connect-src 'self' https:\/\/api\.serhatsoruklu\.com/);
  assert.match(homeCsp, /script-src[^;]*https:\/\/\*\.googletagmanager\.com/);
  assert.match(homeCsp, /connect-src[^;]*https:\/\/\*\.google-analytics\.com/);
  assert.match(homeCsp, /img-src[^;]*https:\/\/\*\.google-analytics\.com/);
  assert.match(
    homeCsp,
    /(?:^|;)upgrade-insecure-requests(?:;|$)/,
    'Production CSP must upgrade insecure subresources.',
  );
  const homeNonce = getCspNonce(homeCsp);
  assert.equal(homeHtml.includes('__CSP_NONCE__'), false, 'The CSP nonce sentinel must not leak.');
  assertInlineExecutableScriptsUseNonce(homeHtml, homeNonce);
  assertGoogleTag(homeHtml);
  assert.match(homeResponse.headers.get('strict-transport-security') ?? '', /max-age=31536000/);
  assert.equal(homeResponse.headers.get('content-encoding'), 'gzip');
  assert.equal(homeResponse.headers.get('cache-control'), 'no-store');

  const workResponse = await secureFetch('/work');
  const workHtml = await workResponse.text();
  assert.equal(workResponse.status, 200, 'The work route must SSR with HTTP 200.');
  assert.match(workHtml, /<title>Work \| Serhat Soruklu<\/title>/);
  assert.match(
    workHtml,
    /<link rel="canonical" href="https:\/\/serhatsoruklu\.com\/work">/,
  );
  assert.match(workHtml, /Built End-to-End/, 'The work response must include route content.');

  const unknownResponse = await secureFetch('/release-smoke-does-not-exist');
  const unknownHtml = await unknownResponse.text();
  assert.equal(unknownResponse.status, 404, 'An unknown Angular route must return HTTP 404.');
  assert.match(unknownHtml, /Page not found/i, 'The unknown route must render the not-found page.');
  assert.match(
    unknownHtml,
    /noindex,\s*follow/i,
    'The not-found response must be noindex, follow.',
  );
  const unknownNonce = getCspNonce(unknownResponse.headers.get('content-security-policy') ?? '');
  assert.notEqual(unknownNonce, homeNonce, 'Every HTML response must receive a unique CSP nonce.');
  assert.equal(
    unknownHtml.includes('__CSP_NONCE__'),
    false,
    'The not-found response must not leak the CSP nonce sentinel.',
  );
  assertInlineExecutableScriptsUseNonce(unknownHtml, unknownNonce);

  const explicit404Response = await secureFetch('/404');
  assert.equal(
    explicit404Response.status,
    404,
    'The explicit not-found route must return HTTP 404.',
  );

  const missingAssets = [
    '/assets/release-smoke-missing.js',
    '/assets/release-smoke-missing.css',
    '/assets/release-smoke-missing.png',
    '/assets/release-smoke-missing.woff2',
    '/assets/release-smoke-missing.js/',
    '/release-smoke-missing.xml',
    '/release-smoke-missing.webmanifest',
    '/sitemap.xml/',
    '/index.csr.html',
  ];
  for (const missingAsset of missingAssets) {
    const missingAssetResponse = await secureFetch(missingAsset);
    assert.equal(
      missingAssetResponse.status,
      404,
      `Missing asset ${missingAsset} must return HTTP 404.`,
    );
    assert.equal(
      missingAssetResponse.headers.get('location'),
      null,
      `Missing asset ${missingAsset} must not redirect.`,
    );
    assert.equal(
      (await missingAssetResponse.text()).includes('__CSP_NONCE__'),
      false,
      `Missing asset ${missingAsset} must not expose an internal nonce sentinel.`,
    );
  }

  const malformedResponse = await secureFetch('/%E0%A4%A');
  assert.equal(malformedResponse.status, 400, 'A malformed encoded path must return HTTP 400.');

  const repeatedSlashResponse = await secureFetch('/systems//chatpdm');
  assert.equal(repeatedSlashResponse.status, 404, 'A repeated-slash path must return HTTP 404.');

  const uppercaseResponse = await secureFetch('/WORK');
  assert.equal(uppercaseResponse.status, 404, 'An uppercase route variant must return HTTP 404.');
  assert.match(await uppercaseResponse.text(), /Page not found/i);

  const malformedNestedResponse = await secureFetch('/systems/chatpdm/unexpected');
  assert.equal(
    malformedNestedResponse.status,
    404,
    'A malformed nested route must return HTTP 404.',
  );
  assert.match(await malformedNestedResponse.text(), /Page not found/i);

  const trailingSlashResponse = await secureFetch('/work/?campaign=release-smoke', {
    redirect: 'manual',
  });
  assert.equal(
    trailingSlashResponse.status,
    308,
    'A trailing slash must canonicalize with HTTP 308.',
  );
  assert.equal(
    trailingSlashResponse.headers.get('location'),
    '/work',
    'Trailing-slash redirects must use the fixed route allowlist without reflecting query data.',
  );

  const robotsResponse = await secureFetch('/robots.txt');
  assert.equal(robotsResponse.status, 200);
  assert.equal(robotsResponse.headers.get('cache-control'), 'public, max-age=300, must-revalidate');

  const browserFiles = await readdir(browserDirectory);
  const hashedBundle = browserFiles.find((fileName) => /^main-[a-z0-9]{8}\.js$/i.test(fileName));
  assert.ok(hashedBundle, 'A hashed main bundle is required for the cache smoke test.');
  const hashedBundleResponse = await secureFetch(`/${hashedBundle}`);
  assert.equal(hashedBundleResponse.status, 200);
  assert.equal(
    hashedBundleResponse.headers.get('cache-control'),
    'public, max-age=31536000, immutable',
  );

  const healthResponse = await fetch(`${baseUrl}/healthz`);
  assert.equal(healthResponse.status, 200);
  assert.equal(healthResponse.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await healthResponse.json(), { status: 'ok', service: 'frontend-ssr' });

  console.log(
    '[smoke] production SSR status, redirects, errors, CSP nonces, compression, and caching passed',
  );
} catch (error) {
  if (output) {
    console.error(output.trim());
  }
  throw error;
} finally {
  await stopChild();
}

await verifyNonProductionHstsIsDisabled();
await verifyInvalidProductionEnvironmentIsRejected();

async function secureFetch(path, init = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'accept-encoding': 'gzip',
      // Match the production Nginx request shape. Angular intentionally
      // de-optimizes to CSR when an unexpected X-Forwarded-* header arrives.
      'x-forwarded-for': '203.0.113.10',
      'x-forwarded-proto': 'https',
      ...init.headers,
    },
  });
}

function getCspNonce(csp) {
  const match = csp.match(/'nonce-([^']+)'/);
  assert.ok(match?.[1], 'The response CSP must contain a nonce source.');
  return match[1];
}

function assertInlineExecutableScriptsUseNonce(html, nonce) {
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi;
  const inlineExecutableScripts = [...html.matchAll(scriptPattern)].filter((match) => {
    const attributes = match[1];
    if (/\bsrc\s*=/i.test(attributes)) {
      return false;
    }

    const type = attributes.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase();
    return (
      type === undefined || type === 'module' || /^(?:application|text)\/javascript$/.test(type)
    );
  });

  assert.ok(inlineExecutableScripts.length > 0, 'SSR must emit an inline hydration script.');
  for (const match of inlineExecutableScripts) {
    assert.match(
      match[1],
      new RegExp(`\\bnonce=["']${escapeRegExp(nonce)}["']`),
      'Every inline executable SSR script must use the response CSP nonce.',
    );
  }
}

function assertGoogleTag(html) {
  const measurementId = 'G-WQC8FJF6SL';
  const externalTags = [
    ...html.matchAll(
      /<script\b([^>]*)src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-WQC8FJF6SL["'][^>]*><\/script>/gi,
    ),
  ];
  assert.equal(
    externalTags.length,
    0,
    'SSR must not put the Google tag runtime on the critical rendering path.',
  );
  assert.equal(
    (html.match(new RegExp(`https://www\\.googletagmanager\\.com/gtag/js\\?id=${measurementId}`, 'g')) ?? [])
      .length,
    1,
    'SSR must retain exactly one deferred Google tag loader.',
  );
  assert.equal(
    (html.match(new RegExp(`gtag\\('config', '${measurementId}'\\)`, 'g')) ?? []).length,
    1,
    'SSR must configure the approved Google measurement ID exactly once.',
  );
  for (const consentType of [
    'ad_storage',
    'ad_user_data',
    'ad_personalization',
    'analytics_storage',
  ]) {
    assert.match(
      html,
      new RegExp(`${consentType}: 'denied'`),
      `Google consent must default ${consentType} to denied.`,
    );
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Production SSR exited before becoming healthy.\n${output}`);
    }

    try {
      const response = await fetch(`${baseUrl}/healthz`);
      if (response.status === 200) {
        return;
      }
    } catch {
      // The server has not started listening yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for production SSR.\n${output}`);
}

async function stopChild() {
  if (child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');
  const exited = await Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    new Promise((resolve) => setTimeout(() => resolve(false), 5_000)),
  ]);

  if (!exited && child.exitCode === null) {
    child.kill('SIGKILL');
    throw new Error('Production SSR did not stop within the graceful shutdown deadline.');
  }
}

async function verifyNonProductionHstsIsDisabled() {
  const developmentPort = await findAvailablePort();
  const developmentBaseUrl = `http://127.0.0.1:${developmentPort}`;
  const developmentEnvironment = {
    ...process.env,
    PORT: String(developmentPort),
    FRONTEND_ENFORCE_HTTPS: 'false',
    FRONTEND_HOST: '127.0.0.1',
    FRONTEND_SHUTDOWN_TIMEOUT_MS: '2000',
    FRONTEND_TRUST_PROXY: 'loopback',
  };
  delete developmentEnvironment.NODE_ENV;
  delete developmentEnvironment.SSR_START;
  delete developmentEnvironment.FRONTEND_ENABLE_HSTS;

  let developmentOutput = '';
  const developmentChild = spawn(process.execPath, ['./dist/frontend/server/server.mjs'], {
    cwd: frontendDirectory,
    env: developmentEnvironment,
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  developmentChild.stdout.on('data', (chunk) => {
    developmentOutput += chunk.toString();
  });
  developmentChild.stderr.on('data', (chunk) => {
    developmentOutput += chunk.toString();
  });

  try {
    const deadline = Date.now() + 30_000;
    let isHealthy = false;
    while (Date.now() < deadline) {
      if (developmentChild.exitCode !== null) {
        throw new Error(`Non-production SSR exited before becoming healthy.\n${developmentOutput}`);
      }

      try {
        const healthResponse = await fetch(`${developmentBaseUrl}/healthz`);
        if (healthResponse.status === 200) {
          isHealthy = true;
          break;
        }
      } catch {
        // The server has not started listening yet.
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    assert.equal(
      isHealthy,
      true,
      `Non-production SSR did not become healthy.\n${developmentOutput}`,
    );
    const response = await fetch(`${developmentBaseUrl}/`);
    assert.equal(response.status, 200);
    assert.equal(
      response.headers.get('strict-transport-security'),
      null,
      'HSTS must be disabled outside production by default.',
    );
    assert.doesNotMatch(
      response.headers.get('content-security-policy') ?? '',
      /(?:^|;)upgrade-insecure-requests(?:;|$)/,
      'Development CSP must not upgrade the HTTP test server to HTTPS.',
    );
  } finally {
    if (developmentChild.exitCode === null) {
      developmentChild.kill('SIGTERM');
      await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Non-production SSR did not stop gracefully.')),
          5_000,
        );
        developmentChild.once('exit', () => {
          clearTimeout(timer);
          resolve();
        });
      });
    }
  }
}

async function verifyInvalidProductionEnvironmentIsRejected() {
  const invalidCases = [
    { PORT: '65536' },
    { FRONTEND_SHUTDOWN_TIMEOUT_MS: '999999999999999999999' },
  ];

  for (const overrides of invalidCases) {
    let invalidOutput = '';
    const invalidChild = spawn(process.execPath, ['./scripts/start-production.mjs'], {
      cwd: frontendDirectory,
      env: {
        ...process.env,
        FRONTEND_ENFORCE_HTTPS: 'false',
        FRONTEND_HOST: '127.0.0.1',
        FRONTEND_TRUST_PROXY: 'loopback',
        ...overrides,
      },
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    invalidChild.stdout.on('data', (chunk) => {
      invalidOutput += chunk.toString();
    });
    invalidChild.stderr.on('data', (chunk) => {
      invalidOutput += chunk.toString();
    });

    const exitCode = await Promise.race([
      new Promise((resolve) => invalidChild.once('exit', (code) => resolve(code))),
      new Promise((resolve) => setTimeout(() => resolve(null), 5_000)),
    ]);

    if (exitCode === null) {
      invalidChild.kill('SIGKILL');
      throw new Error('Invalid production environment did not stop startup.');
    }

    assert.notEqual(
      exitCode,
      0,
      `Invalid production environment unexpectedly started.\n${invalidOutput}`,
    );
    assert.doesNotMatch(invalidOutput, /password|secret|token/i);
  }
}

async function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address === null || typeof address === 'string') {
        server.close();
        reject(new Error('Could not allocate a local test port.'));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });
}
