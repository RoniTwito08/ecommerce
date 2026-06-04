'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http');
const swaggerUi = require('swagger-ui-express');

const { env } = require('./config/env');
const { swaggerSpec } = require('./config/swagger');
const { logger } = require('./utils/logger');
const routes = require('./routes');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { globalRateLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();

// ─── Security headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── HTTP request logging ────────────────────────────────────────────────────
app.use(pinoHttp({ logger }));

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Rate limiting (global) ──────────────────────────────────────────────────
app.use('/api', globalRateLimiter);

// ─── API documentation ───────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Health check (no auth, no logging noise) ────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── Feature routes ──────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 fallthrough ─────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }));

// ─── Centralised error handler ───────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
