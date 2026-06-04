'use strict';

const BCRYPT_ROUNDS = 12;

const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

const SORT = Object.freeze({
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  NAME_ASC: 'name_asc',
});

// Converts JWT expiry strings ('15m', '7d', '1h') to milliseconds so that the
// refresh token cookie lifetime always stays in sync with JWT_REFRESH_EXPIRES_IN.
const parseMs = (str) => {
  const match = /^(\d+)(s|m|h|d)$/.exec(str);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // safe fallback: 7 days
  const n = parseInt(match[1], 10);
  const units = { s: 1e3, m: 60e3, h: 3600e3, d: 86400e3 };
  return n * units[match[2]];
};

const REFRESH_TOKEN_COOKIE = Object.freeze({
  NAME: 'refreshToken',
  OPTIONS: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
  },
});

module.exports = { BCRYPT_ROUNDS, ORDER_STATUS, PAGINATION, SORT, REFRESH_TOKEN_COOKIE, parseMs };
