'use strict';

// Load environment variables before any other module reads process.env
require('dotenv').config();

const app = require('./app');
const { env } = require('./config/env');
const { logger } = require('./utils/logger');
const { prisma } = require('./config/database');

const server = app.listen(env.PORT, () => {
  logger.info(`🚀  Server started on port ${env.PORT}  [${env.NODE_ENV}]`);
  logger.info(`📚  Swagger docs → http://localhost:${env.PORT}/api/docs`);
});

// ─── Graceful shutdown ───────────────────────────────────────────────────────

const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed. Goodbye.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Safety nets ─────────────────────────────────────────────────────────────

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught exception');
  process.exit(1);
});
