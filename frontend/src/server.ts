import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import { randomBytes } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename, join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');
const cspNoncePlaceholder = '__CSP_NONCE__';
const isProduction = process.env['NODE_ENV'] === 'production';
const canonicalHost = process.env['FRONTEND_CANONICAL_HOST']?.trim() || 'serhatsoruklu.com';
const enforceHttps = readBooleanEnvironment('FRONTEND_ENFORCE_HTTPS', isProduction);
const enableHsts = readBooleanEnvironment('FRONTEND_ENABLE_HSTS', isProduction);
const shutdownTimeoutMs = readBoundedIntegerEnvironment(
  'FRONTEND_SHUTDOWN_TIMEOUT_MS',
  10_000,
  250,
  60_000,
);

if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(canonicalHost)) {
  throw new Error('FRONTEND_CANONICAL_HOST must be a hostname with an optional port.');
}

const app = express();
app.disable('x-powered-by');
configureTrustProxy(app);

app.use((_req, res, next) => {
  res.locals['cspNonce'] = randomBytes(18).toString('base64');
  next();
});

const angularApp = new AngularNodeAppEngine({
  allowedHosts: ['localhost', '127.0.0.1', 'serhatsoruklu.com', 'www.serhatsoruklu.com'],
  // Nginx is the only network path to this loopback-bound process and replaces
  // every forwarded header before proxying. Angular otherwise treats the
  // expected X-Forwarded-For header as untrusted and deliberately falls back
  // to the client-only shell instead of rendering the requested route.
  trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-for'],
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: isProduction
          ? [
              "'self'",
              'https://api.serhatsoruklu.com',
              'https://*.google-analytics.com',
              'https://*.analytics.google.com',
              'https://*.googletagmanager.com',
            ]
          : ["'self'", 'http://localhost:3000', 'http://127.0.0.1:3000', 'ws:', 'wss:'],
        fontSrc: ["'self'", 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        frameSrc: ["'none'"],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.google-analytics.com',
          'https://*.googletagmanager.com',
        ],
        manifestSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", createCspNonceDirective, 'https://*.googletagmanager.com'],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        workerSrc: ["'self'", 'blob:'],
        upgradeInsecureRequests: isProduction ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    frameguard: { action: 'deny' },
    hsts: enableHsts
      ? {
          maxAge: 31_536_000,
          includeSubDomains: true,
          preload: false,
        }
      : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }),
);

app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), screen-wake-lock=(), usb=()',
  );
  next();
});

app.use(compression());

app.use((req, res, next) => {
  const rawPath = getRawPath(req.originalUrl);

  try {
    decodeURI(rawPath);
  } catch {
    res.status(400).type('text/plain').send('Bad Request');
    return;
  }

  if (/\/{2,}/.test(rawPath)) {
    res.status(404).type('text/plain').send('Not Found');
    return;
  }

  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    const pathWithoutTrailingSlash = rawPath.slice(0, -1);
    if (looksLikeStaticAsset(pathWithoutTrailingSlash)) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(404).type('text/plain').send('Not Found');
      return;
    }

    if (!sendKnownRouteRedirect(res, pathWithoutTrailingSlash, false)) {
      res.status(404).type('text/plain').send('Not Found');
    }
    return;
  }

  if (enforceHttps && rawPath !== '/healthz' && !req.secure) {
    if (!sendKnownRouteRedirect(res, rawPath, true)) {
      res.status(404).type('text/plain').send('Not Found');
    }
    return;
  }

  next();
});

app.get('/healthz', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ status: 'ok', service: 'frontend-ssr' });
});

app.get('/index.csr.html', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(404).type('text/plain').send('Not Found');
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: setStaticCacheHeaders,
  }),
);

app.use((req, res, next) => {
  if (looksLikeStaticAsset(getRawPath(req.originalUrl))) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(404).type('text/plain').send('Not Found');
    return;
  }

  next();
});

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  angularApp
    .handle(req)
    .then(async (response) => {
      if (!response) {
        next();
        return;
      }

      await writeAngularResponse(response, res);
    })
    .catch(next);
});

app.use((_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.status(404).type('text/plain').send('Not Found');
});

app.use(
  (error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const errorName = error instanceof Error ? error.name : 'UnknownError';
    console.error('[frontend] request failed', { errorName });
    res.setHeader('Cache-Control', 'no-store');
    res.status(500).type('text/plain').send('Internal Server Error');
  },
);

/**
 * Start the server when executed directly or through the production wrapper.
 */
if (isMainModule(import.meta.url) || process.env['SSR_START'] === 'true' || process.env['pm_id']) {
  const port = readBoundedIntegerEnvironment('PORT', 4000, 1, 65_535);
  const host = process.env['FRONTEND_HOST']?.trim() || (isProduction ? '127.0.0.1' : 'localhost');
  const server = app.listen(port, host, () => {
    console.log(
      `[frontend] SSR listening on ${host}:${port} (${isProduction ? 'production' : 'development'})`,
    );
  });

  server.on('error', (error) => {
    console.error('[frontend] server error', { errorName: error.name });
    process.exitCode = 1;
  });

  let isShuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`[frontend] received ${signal}; closing HTTP server`);

    const forceExitTimer = setTimeout(() => {
      console.error('[frontend] graceful shutdown timed out; closing active connections');
      server.closeAllConnections();
      process.exit(1);
    }, shutdownTimeoutMs);
    forceExitTimer.unref();

    server.close((error) => {
      clearTimeout(forceExitTimer);
      if (error) {
        console.error('[frontend] HTTP server shutdown failed', { errorName: error.name });
        process.exitCode = 1;
      } else {
        console.log('[frontend] HTTP server closed');
      }
    });
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

function configureTrustProxy(expressApp: express.Express): void {
  const configuredValue = process.env['FRONTEND_TRUST_PROXY']?.trim() || 'loopback';
  const normalizedValue = configuredValue.toLowerCase();

  if (normalizedValue === 'false' || normalizedValue === 'off' || normalizedValue === '0') {
    expressApp.set('trust proxy', false);
    return;
  }

  const unsafeValues = new Set(['true', '*', '0.0.0.0/0', '::/0']);
  const trustedProxyRanges = configuredValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (
    trustedProxyRanges.length === 0 ||
    trustedProxyRanges.some((entry) => unsafeValues.has(entry.toLowerCase()))
  ) {
    throw new Error(
      'FRONTEND_TRUST_PROXY must contain explicit proxy IPs/subnets or safe names such as loopback.',
    );
  }

  expressApp.set('trust proxy', trustedProxyRanges);
}

function createCspNonceDirective(_req: IncomingMessage, res: ServerResponse): string {
  return `'nonce-${getCspNonce(res as express.Response)}'`;
}

function getCspNonce(res: express.Response): string {
  const nonce = res.locals['cspNonce'];
  if (typeof nonce !== 'string' || nonce.length === 0) {
    throw new Error('A CSP nonce was not created for the response.');
  }

  return nonce;
}

async function writeAngularResponse(response: Response, res: express.Response): Promise<void> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().includes('text/html')) {
    writeResponseToNodeResponse(response, res);
    return;
  }

  const html = await response.text();
  if (!html.includes(cspNoncePlaceholder)) {
    throw new Error('The Angular HTML response is missing its CSP nonce placeholder.');
  }

  const transformedHtml = html.replaceAll(cspNoncePlaceholder, getCspNonce(res));
  if (transformedHtml.includes(cspNoncePlaceholder)) {
    throw new Error('The Angular HTML response contains an unresolved CSP nonce placeholder.');
  }

  response.headers.forEach((value, name) => {
    if (name.toLowerCase() !== 'content-length') {
      res.setHeader(name, value);
    }
  });
  res.status(response.status).send(transformedHtml);
}

function getRawPath(originalUrl: string): string {
  const queryIndex = originalUrl.indexOf('?');
  return queryIndex === -1 ? originalUrl : originalUrl.slice(0, queryIndex);
}

function sendKnownRouteRedirect(
  res: express.Response,
  pathname: string,
  useCanonicalOrigin: boolean,
): boolean {
  const origin = useCanonicalOrigin ? `https://${canonicalHost}` : '';
  let location: string;

  switch (pathname) {
    case '/':
      location = `${origin}/`;
      break;
    case '/404':
      location = `${origin}/404`;
      break;
    case '/contact':
      location = `${origin}/contact`;
      break;
    case '/favicon.ico':
      location = `${origin}/favicon.ico`;
      break;
    case '/github':
      location = `${origin}/github`;
      break;
    case '/manifest.json':
      location = `${origin}/manifest.json`;
      break;
    case '/manifest.webmanifest':
      location = `${origin}/manifest.webmanifest`;
      break;
    case '/robots.txt':
      location = `${origin}/robots.txt`;
      break;
    case '/sitemap.xml':
      location = `${origin}/sitemap.xml`;
      break;
    case '/soruklu-order':
      location = `${origin}/soruklu-order`;
      break;
    case '/systems':
      location = `${origin}/systems`;
      break;
    case '/systems/chatpdm':
      location = `${origin}/systems/chatpdm`;
      break;
    case '/systems/continuity-identity-model':
      location = `${origin}/systems/continuity-identity-model`;
      break;
    case '/systems/coupyn':
      location = `${origin}/systems/coupyn`;
      break;
    case '/systems/deterministic-boundary-firewall':
      location = `${origin}/systems/deterministic-boundary-firewall`;
      break;
    case '/theme-init.js':
      location = `${origin}/theme-init.js`;
      break;
    case '/velari':
      location = `${origin}/velari`;
      break;
    case '/work':
      location = `${origin}/work`;
      break;
    case '/writing':
      location = `${origin}/writing`;
      break;
    default:
      return false;
  }

  res.setHeader('Location', location);
  res.status(308).type('text/plain').send('Permanent Redirect');
  return true;
}

function looksLikeStaticAsset(path: string): boolean {
  return (
    path.startsWith('/assets/') ||
    path.startsWith('/.well-known/') ||
    /\/[a-z0-9._-]+\.[a-z0-9]{1,16}$/i.test(path)
  );
}

function setStaticCacheHeaders(res: express.Response, filePath: string): void {
  const fileName = basename(filePath).toLowerCase();

  if (/-(?:[a-z0-9]{8,})\.(?:css|js)$/i.test(fileName)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  const mutableControlFiles = new Set([
    'manifest.json',
    'manifest.webmanifest',
    'robots.txt',
    'site.webmanifest',
    'sitemap.xml',
  ]);

  if (mutableControlFiles.has(fileName)) {
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
    return;
  }

  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
}

function readBooleanEnvironment(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === '') {
    return defaultValue;
  }

  if (value === 'true' || value === '1' || value === 'yes' || value === 'on') {
    return true;
  }

  if (value === 'false' || value === '0' || value === 'no' || value === 'off') {
    return false;
  }

  throw new Error(`${name} must be a boolean value.`);
}

function readBoundedIntegerEnvironment(
  name: string,
  defaultValue: number,
  minimum: number,
  maximum: number,
): number {
  const value = process.env[name]?.trim();
  if (value === undefined || value === '') {
    return defaultValue;
  }

  const parsedValue = Number(value);
  if (
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    throw new Error(`${name} must be an integer from ${minimum} to ${maximum}.`);
  }

  return parsedValue;
}
