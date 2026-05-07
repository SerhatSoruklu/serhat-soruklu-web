const path = require('path');
const net = require('net');

require('dotenv').config({
  path: path.join(__dirname, process.env.NODE_ENV === 'production' ? '.env.production' : '.env'),
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { createApiLandingHandlers } = require('./templates/api-landing');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
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

function handleServerError(error) {
  if (error.code === 'EADDRINUSE') {
    const message = `Port ${PORT} is already in use.`;

    if (NODE_ENV === 'development') {
      console.warn(`${message} Reusing the existing backend dev server; stop the old npm run dev session before starting a fresh one.`);
      return;
    }

    console.error(message);
    process.exit(1);
  }

  console.error('Backend server error:', error);
  process.exit(1);
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

function getAllowedOrigins() {
  const configuredOrigins = process.env.CORS_ORIGIN;

  if (configuredOrigins) {
    return configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean);
  }

  if (NODE_ENV === 'production') {
    return ['https://serhatsoruklu.com'];
  }

  return ['http://localhost:4200'];
}

function applyTrustProxy() {
  const trustProxy = process.env.TRUST_PROXY;

  if (!trustProxy || trustProxy === 'false') {
    return;
  }

  if (/^\d+$/.test(trustProxy)) {
    app.set('trust proxy', Number(trustProxy));
    return;
  }

  if (parseBoolean(trustProxy)) {
    app.set('trust proxy', 1);
  }
}

const allowedOrigins = getAllowedOrigins();
const apiRateLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: 'Too many requests'
  }
});
const staticAssetRateLimiter = rateLimit({
  windowMs: Number(process.env.STATIC_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.STATIC_RATE_LIMIT_MAX) || 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
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
  nodeEnv: NODE_ENV
});

applyTrustProxy();
app.disable('x-powered-by');
app.use(
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
    }
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error('Not allowed by CORS');
      error.status = 403;
      callback(error);
    }
  })
);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/favicon.ico', staticAssetRateLimiter, serveFavicon);
app.get('/api-logo-192.png', staticAssetRateLimiter, serveLogo);
app.get('/.well-known/appspecific/com.chrome.devtools.json', (_req, res) => {
  res.status(204).end();
});
app.get('/', serveLandingPage);

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.use('/api', apiRateLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'serhatsoruklu-backend',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', (_req, res) => {
  res.status(404).json({
    ok: false,
    error: 'API route not found',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const statusCode = error.statusCode || error.status || 500;

  res.status(statusCode).json({
    ok: false,
    error: statusCode >= 500 ? 'Internal server error' : error.message,
  });
});

async function startServer() {
  if (NODE_ENV === 'development' && await isPortAcceptingConnections(PORT)) {
    console.warn(`Port ${PORT} is already in use. Reusing the existing backend dev server; stop the old npm run dev session before starting a fresh one.`);
    return;
  }

  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } else {
    console.log('MONGODB_URI not set; skipping MongoDB connection');
  }

  const server = app.listen(PORT, () => {
    console.log(`SerhatSoruklu backend listening on port ${PORT} in ${NODE_ENV} mode`);
  });

  server.on('error', handleServerError);
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start backend:', error);
    process.exit(1);
  });
}

module.exports = {
  app,
  getAllowedOrigins,
  parseBoolean,
  startServer
};
