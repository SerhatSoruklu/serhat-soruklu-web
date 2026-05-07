const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, process.env.NODE_ENV === 'production' ? '.env.production' : '.env'),
});

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

function parseBoolean(value) {
  return ['1', 'true', 'yes'].includes(String(value).toLowerCase());
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

applyTrustProxy();
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"]
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
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } else {
    console.log('MONGODB_URI not set; skipping MongoDB connection');
  }

  app.listen(PORT, () => {
    console.log(`SerhatSoruklu backend listening on port ${PORT} in ${NODE_ENV} mode`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
