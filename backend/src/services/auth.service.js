'use strict';

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { env } = require('../config/env');
const { ApiError } = require('../utils/ApiError');
const { BCRYPT_ROUNDS, parseMs } = require('../constants');

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Pre-computed valid bcrypt hash used when the user is not found.
// Ensures bcrypt.compare always runs its full computation (~250ms) regardless
// of whether the user exists, preventing timing-based user enumeration.
// Evaluated once at module load — no overhead on individual requests.
const DUMMY_HASH = bcrypt.hashSync('helfy-dummy-timing-guard', BCRYPT_ROUNDS);

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  createdAt: true,
};

const generateAccessToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

const generateRefreshToken = () => crypto.randomBytes(64).toString('hex');

// Single source of truth for refresh expiry — reuses parseMs from constants
// so cookie maxAge and DB expiresAt are always derived from the same formula.
const buildExpiresAt = () =>
  new Date(Date.now() + parseMs(env.JWT_REFRESH_EXPIRES_IN || '7d'));

// ─── Service Methods ──────────────────────────────────────────────────────────

const register = async ({ firstName, lastName, email, password, phone }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  // bcrypt.hash is CPU-bound — run outside the transaction to avoid holding
  // the DB connection open during the computation (~250ms at 12 rounds).
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const refreshTokenValue = generateRefreshToken();
  const expiresAt = buildExpiresAt();

  // All three DB writes are wrapped in one interactive transaction.
  // If any write fails the entire operation rolls back — no ghost accounts.
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phone: phone ?? null,
        cart: { create: {} },
      },
      select: USER_SELECT,
    });

    await tx.refreshToken.create({
      data: { userId: newUser.id, token: refreshTokenValue, expiresAt },
    });

    return newUser;
  });

  const accessToken = generateAccessToken(user);

  return { accessToken, refreshToken: refreshTokenValue, user };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { ...USER_SELECT, passwordHash: true, deletedAt: true },
  });

  // Always run bcrypt regardless of whether the user exists.
  // DUMMY_HASH is a valid pre-computed hash — compare always runs the full
  // computation so response time is consistent for all failure reasons.
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const passwordMatch = await bcrypt.compare(password, hash);

  if (!user || !passwordMatch || user.deletedAt !== null) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const { passwordHash: _pw, deletedAt: _del, ...safeUser } = user;

  const accessToken = generateAccessToken(safeUser);
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: { userId: safeUser.id, token: refreshToken, expiresAt: buildExpiresAt() },
  });

  return { accessToken, refreshToken, user: safeUser };
};

const refresh = async (token) => {
  if (!token) throw ApiError.unauthorized('Refresh token missing.');

  const stored = await prisma.refreshToken.findUnique({ where: { token } });

  if (!stored) throw ApiError.unauthorized('Invalid refresh token.');
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw ApiError.unauthorized('Refresh token expired. Please log in again.');
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    select: { ...USER_SELECT, deletedAt: true },
  });

  if (!user || user.deletedAt !== null) {
    throw ApiError.unauthorized('Account not found.');
  }

  const { deletedAt: _del, ...safeUser } = user;
  const newAccessToken = generateAccessToken(safeUser);
  const newRefreshToken = generateRefreshToken();

  // Rotate: delete old token and create new one atomically
  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: { userId: safeUser.id, token: newRefreshToken, expiresAt: buildExpiresAt() },
    }),
  ]);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, user: safeUser };
};

const logout = async (token) => {
  if (!token) return;
  await prisma.refreshToken.deleteMany({ where: { token } });
};

const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...USER_SELECT, deletedAt: true },
  });

  if (!user || user.deletedAt !== null) throw ApiError.unauthorized('Account not found.');

  const { deletedAt: _del, ...safeUser } = user;
  return safeUser;
};

module.exports = { register, login, refresh, logout, getMe };
