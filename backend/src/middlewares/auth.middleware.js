'use strict';

const jwt = require('jsonwebtoken');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches { id, email } to req.user on success.
 * Does not query the database — access tokens are trusted for their 15min TTL.
 * The service layer is responsible for checking deletedAt when it needs fresh user state.
 */
const authenticate = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token missing.'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired.'));
    }
    return next(ApiError.unauthorized('Invalid access token.'));
  }
};

module.exports = { authenticate };
