const crypto = require('node:crypto');
const path = require('node:path');
const net = require('node:net');

const requestedNodeEnv = process.argv.includes('--production')
  ? 'production'
  : (process.argv.includes('--development') ? 'development' : (process.env.NODE_ENV || 'development'));
process.env.NODE_ENV = requestedNodeEnv;

require('dotenv').config({
  path: path.join(__dirname, requestedNodeEnv === 'production' ? '.env.production' : '.env'),
  quiet: true
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const {
  createContactReadiness,
  createContactRouter,
  createSmtpMailer
} = require('./contact');
const { createApiLandingHandlers } = require('./templates/api-landing');

const DEFAULT_PORT = 3000;
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;
const NODE_ENV = process.env.NODE_ENV;
const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');
const frontendFaviconPath = path.join(frontendPublicPath, 'favicon.ico');
const frontendApiLogoPath = path.join(
  frontendPublicPath,
  'assets',
  'brand',
  'favicons',
  'web-app-manifest-192x192.png'
);

function parseBoolean(value) {
  return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
}

function parseBoundedInteger(value, fallback, minimum, maximum) {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < minimum) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

function logLifecycle(logger, level, event, details = {}) {
  const suffix = Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${String(value).replace(/\s+/gu, '_')}`)
    .join(' ');
  const message = suffix ? `[backend] event=${event} ${suffix}` : `[backend] event=${event}`;

  logger[level]?.(message);
}

function getSafeLogCode(error, fallback) {
  return typeof error?.code === 'string' && /^[A-Z0-9_]{1,50}$/u.test(error.code)
    ? error.code
    : fallback;
}

function isPortAcceptingConnections(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port: Number(port) });

    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });

    socket.once('error', () => {
      resolve(false);
    });

    socket.setTimeout(500, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

function getAllowedOrigins(env = process.env, nodeEnv = env.NODE_ENV || NODE_ENV) {
  const configuredOrigins = env.CORS_ORIGINS || env.CORS_ORIGIN;
  const productionOrigins = [
    'https://serhatsoruklu.com',
    'https://www.serhatsoruklu.com'
  ];

  if (configuredOrigins) {
    const parsedOrigins = configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);

    return nodeEnv === 'production'
      ? [...new Set([...productionOrigins, ...parsedOrigins])]
      : parsedOrigins;
  }

  if (nodeEnv === 'production') {
    return productionOrigins;
  }

  return ['http://localhost:4200'];
}

function getTrustProxySetting(env = process.env) {
  const trustProxy = String(env.TRUST_PROXY || '').trim().toLowerCase();

  if (!trustProxy || trustProxy === 'false' || trustProxy === '0') {
    return false;
  }

  if (/^[1-9]\d?$/u.test(trustProxy)) {
    return Math.min(Number(trustProxy), 10);
  }

  if (parseBoolean(trustProxy)) {
    return 1;
  }

  return false;
}

function applyTrustProxy(expressApp, env = process.env) {
  const setting = getTrustProxySetting(env);

  if (setting !== false) {
    expressApp.set('trust proxy', setting);
  }

  return setting;
}

function createRequestIdMiddleware() {
  return (req, res, next) => {
    const suppliedId = req.get('X-Request-Id');
    const requestId = suppliedId && /^[A-Za-z0-9._:-]{8,100}$/u.test(suppliedId)
      ? suppliedId
      : crypto.randomUUID();

    req.requestId = requestId;
    res.set('X-Request-Id', requestId);
    next();
  };
}

function getPublicError(error, statusCode) {
  if (statusCode >= 500) {
    return 'Internal server error';
  }

  if (error.type === 'entity.parse.failed') {
    return 'Invalid JSON request body';
  }

  if (statusCode === 403) {
    return 'Request origin is not allowed';
  }

  return error.expose === true ? error.message : 'Request failed';
}

function createBackendApp(options = {}) {
  const env = options.env || process.env;
  const nodeEnv = options.nodeEnv || env.NODE_ENV || 'development';
  const logger = options.logger || console;
  const expressApp = express();
  const allowedOrigins = getAllowedOrigins(env, nodeEnv);
  const mailer = options.mailer === undefined ? createSmtpMailer(env) : options.mailer;
  const readiness = options.readiness || createContactReadiness({
    env,
    logger,
    mailer,
    nodeEnv,
    verifyOnStart: options.verifyOnStart,
    verifyTimeoutMs: options.verifyTimeoutMs
  });
  const staticAssetRateLimiter = rateLimit({
    windowMs: parseBoundedInteger(
      env.STATIC_RATE_LIMIT_WINDOW_MS,
      15 * 60 * 1000,
      1_000,
      24 * 60 * 60 * 1000
    ),
    max: parseBoundedInteger(env.STATIC_RATE_LIMIT_MAX, 600, 1, 10_000),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      success: false,
      error: 'Too many requests'
    }
  });
  const {
    serveFavicon,
    serveLandingPage,
    serveLogo
  } = createApiLandingHandlers({
    faviconPath: frontendFaviconPath,
    logoPath: frontendApiLogoPath,
    nodeEnv
  });

  applyTrustProxy(expressApp, env);
  expressApp.disable('x-powered-by');
  expressApp.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          baseUri: ["'none'"],
          connectSrc: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"]
        }
      },
      strictTransportSecurity: nodeEnv === 'production'
        ? { maxAge: 31_536_000, includeSubDomains: true }
        : false
    })
  );
  expressApp.use(compression());
  expressApp.use(createRequestIdMiddleware());
  expressApp.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        const error = new Error('Origin rejected');
        error.status = 403;
        callback(error);
      }
    })
  );
  expressApp.use(express.json({ limit: '100kb' }));
  expressApp.use(express.urlencoded({ extended: false, limit: '100kb' }));

  expressApp.get('/favicon.ico', staticAssetRateLimiter, serveFavicon);
  expressApp.get('/api-logo-192.png', staticAssetRateLimiter, serveLogo);
  expressApp.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
    res.status(204).end();
  });
  expressApp.get('/', serveLandingPage);

  expressApp.use('/api', (_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  expressApp.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      success: true,
      service: 'serhatsoruklu-backend',
      status: 'alive',
      timestamp: new Date().toISOString()
    });
  });

  expressApp.get('/api/ready', (_req, res) => {
    const contactStatus = readiness.getStatus();

    res.status(contactStatus.ready ? 200 : 503).json({
      ok: contactStatus.ready,
      success: contactStatus.ready,
      service: 'serhatsoruklu-backend',
      status: contactStatus.ready ? 'ready' : 'not_ready',
      checks: {
        contactDelivery: contactStatus
      },
      timestamp: new Date().toISOString()
    });
  });

  expressApp.use('/api', createContactRouter({
    env,
    idempotencyStore: options.idempotencyStore,
    logger,
    mailer,
    rateLimit: options.contactRateLimit
  }));

  expressApp.use('/api', (_req, res) => {
    res.status(404).json({
      ok: false,
      success: false,
      error: 'API route not found'
    });
  });

  expressApp.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const statusCode = error.statusCode || error.status || 500;

    if (statusCode >= 500) {
      logLifecycle(logger, 'error', 'request_failed', {
        code: getSafeLogCode(error, 'UNEXPECTED_ERROR'),
        request_id: req.requestId,
        status: statusCode
      });
    }

    res.status(statusCode).json({
      ok: false,
      success: false,
      error: getPublicError(error, statusCode),
      requestId: req.requestId
    });
  });

  return {
    allowedOrigins,
    app: expressApp,
    mailer,
    nodeEnv,
    readiness
  };
}

function closeHttpServer(server) {
  return new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.closeIdleConnections?.();
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

async function closeMongoConnection(mongooseClient) {
  if (mongooseClient.connection?.readyState !== 0) {
    await mongooseClient.disconnect();
  }
}

async function closeMailer(mailer) {
  if (mailer && typeof mailer.close === 'function') {
    await mailer.close();
  }
}

function createGracefulShutdown(options) {
  const {
    logger = console,
    mongooseClient = mongoose,
    server
  } = options;
  const timeoutMs = parseBoundedInteger(
    options.timeoutMs,
    DEFAULT_SHUTDOWN_TIMEOUT_MS,
    250,
    60_000
  );
  let shutdownPromise = null;

  return function shutdown(signal = 'manual') {
    if (shutdownPromise) {
      return shutdownPromise;
    }

    logLifecycle(logger, 'info', 'shutdown_started', { signal });
    shutdownPromise = new Promise((resolve) => {
      let completed = false;
      const timeoutId = setTimeout(() => {
        if (completed) {
          return;
        }

        completed = true;
        server.closeAllConnections?.();
        logLifecycle(logger, 'error', 'shutdown_forced', { timeout_ms: timeoutMs });
        resolve(false);
      }, timeoutMs);

      (async () => {
        const results = [];

        results.push(...await Promise.allSettled([closeHttpServer(server)]));
        results.push(...await Promise.allSettled([
          closeMailer(options.mailer),
          closeMongoConnection(mongooseClient)
        ]));

        if (results.some((result) => result.status === 'rejected')) {
          throw new Error('Runtime shutdown did not complete cleanly.');
        }
      })().then(() => {
        if (completed) {
          return;
        }

        completed = true;
        clearTimeout(timeoutId);
        logLifecycle(logger, 'info', 'shutdown_completed', { clean: true });
        resolve(true);
      }).catch(() => {
        if (completed) {
          return;
        }

        completed = true;
        clearTimeout(timeoutId);
        logLifecycle(logger, 'error', 'shutdown_completed', { clean: false });
        resolve(false);
      });
    });

    return shutdownPromise;
  };
}

function registerShutdownHandlers(shutdown, options = {}) {
  const exit = options.exit || process.exit;
  const processObject = options.processObject || process;
  const handlers = new Map();

  for (const signal of ['SIGTERM', 'SIGINT']) {
    const handler = () => {
      void shutdown(signal).then((clean) => exit(clean ? 0 : 1));
    };
    handlers.set(signal, handler);
    processObject.once(signal, handler);
  }

  return () => {
    for (const [signal, handler] of handlers) {
      processObject.removeListener(signal, handler);
    }
  };
}

const defaultRuntime = createBackendApp();
const app = defaultRuntime.app;

async function startServer(options = {}) {
  const env = options.env || process.env;
  const nodeEnv = options.nodeEnv || env.NODE_ENV || NODE_ENV;
  const logger = options.logger || console;
  const port = Number(options.port || env.PORT || DEFAULT_PORT);
  const runtime = options.runtime || defaultRuntime;
  const mongooseClient = options.mongooseClient || mongoose;

  if (nodeEnv === 'development' && await isPortAcceptingConnections(port)) {
    logLifecycle(logger, 'warn', 'port_in_use_reusing_dev_server', { port });
    return null;
  }

  if (env.MONGODB_URI) {
    await mongooseClient.connect(env.MONGODB_URI);
    logLifecycle(logger, 'info', 'mongodb_connected');
  } else {
    logLifecycle(logger, 'info', 'mongodb_skipped');
  }

  const server = await new Promise((resolve, reject) => {
    const candidate = runtime.app.listen(port, () => {
      candidate.removeListener('error', reject);
      resolve(candidate);
    });

    candidate.once('error', reject);
  });
  const shutdown = createGracefulShutdown({
    logger,
    mailer: runtime.mailer,
    mongooseClient,
    server,
    timeoutMs: env.SHUTDOWN_TIMEOUT_MS
  });

  logLifecycle(logger, 'info', 'listening', { mode: nodeEnv, port });
  void runtime.readiness.initialize();

  if (options.registerSignalHandlers ?? require.main === module) {
    registerShutdownHandlers(shutdown);
  }

  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    logLifecycle(console, 'error', 'startup_failed', {
      code: getSafeLogCode(error, 'STARTUP_ERROR')
    });
    process.exit(1);
  });
}

module.exports = {
  app,
  applyTrustProxy,
  closeHttpServer,
  closeMailer,
  closeMongoConnection,
  createBackendApp,
  createGracefulShutdown,
  getAllowedOrigins,
  getTrustProxySetting,
  parseBoolean,
  registerShutdownHandlers,
  startServer
};
