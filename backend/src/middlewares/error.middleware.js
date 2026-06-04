'use strict';

const { ApiError } = require('../utils/ApiError');
const { logger } = require('../utils/logger');

const errorMiddleware = (err, req, res, _next) => {
  const httpStatus =
    err.statusCode ?? (err.code === 'P2002' ? 409 : err.code === 'P2025' ? 404 : 500);
  const logLevel = httpStatus < 500 ? 'warn' : 'error';

  logger[logLevel](
    { err: { message: err.message, code: err.code, statusCode: httpStatus }, req: { method: req.method, url: req.url } },
    'Request error'
  );

  // Known operational errors — safe to expose the message
  if (err instanceof ApiError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, message: 'A record with this value already exists.' });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Record not found.' });
  }

  // Unknown errors — never expose internals to the client
  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
  });
};

module.exports = { errorMiddleware };
