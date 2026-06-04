'use strict';

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/database');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BASE = '/api/auth';

const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'auth.test@helfy.dev',
  password: 'SecurePass1',
};

const cleanDb = async () => {
  await prisma.refreshToken.deleteMany({ where: { user: { email: testUser.email } } });
  await prisma.cart.deleteMany({ where: { user: { email: testUser.email } } });
  await prisma.user.deleteMany({ where: { email: testUser.email } });
};

const registerAndLogin = async () => {
  await request(app).post(`${BASE}/register`).send(testUser);
  const res = await request(app)
    .post(`${BASE}/login`)
    .send({ email: testUser.email, password: testUser.password });
  return {
    accessToken: res.body.data.accessToken,
    cookie: res.headers['set-cookie'],
  };
};

// ─── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await cleanDb();
  await prisma.$disconnect();
});

// ─── POST /register ──────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('201 — creates account and returns access token + user', async () => {
    const res = await request(app).post(`${BASE}/register`).send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('201 — creates a cart for the new user automatically', async () => {
    await request(app).post(`${BASE}/register`).send(testUser);
    const user = await prisma.user.findUnique({ where: { email: testUser.email } });
    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    expect(cart).not.toBeNull();
  });

  it('400 — missing required fields', async () => {
    const res = await request(app).post(`${BASE}/register`).send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('400 — invalid email format', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...testUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'email')).toBe(true);
  });

  it('400 — password too short', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...testUser, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('400 — password missing uppercase letter', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...testUser, password: 'nouppercase1' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('400 — password missing number', async () => {
    const res = await request(app)
      .post(`${BASE}/register`)
      .send({ ...testUser, password: 'NoNumberHere' });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'password')).toBe(true);
  });

  it('409 — duplicate email', async () => {
    await request(app).post(`${BASE}/register`).send(testUser);
    const res = await request(app).post(`${BASE}/register`).send(testUser);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });
});

// ─── POST /login ─────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post(`${BASE}/register`).send(testUser);
  });

  it('200 — returns access token and sets refresh cookie', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('400 — missing email', async () => {
    const res = await request(app).post(`${BASE}/login`).send({ password: 'SecurePass1' });
    expect(res.status).toBe(400);
  });

  it('400 — missing password', async () => {
    const res = await request(app).post(`${BASE}/login`).send({ email: testUser.email });
    expect(res.status).toBe(400);
  });

  it('401 — wrong email (user does not exist)', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: 'nobody@helfy.dev', password: 'SecurePass1' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('401 — correct email but wrong password', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ email: testUser.email, password: 'WrongPass9' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('persists refresh token in the database', async () => {
    await request(app)
      .post(`${BASE}/login`)
      .send({ email: testUser.email, password: testUser.password });

    const user = await prisma.user.findUnique({ where: { email: testUser.email } });
    const tokens = await prisma.refreshToken.findMany({ where: { userId: user.id } });
    expect(tokens.length).toBeGreaterThan(0);
  });
});

// ─── POST /refresh ───────────────────────────────────────────────────────────

describe('POST /api/auth/refresh', () => {
  it('200 — returns new access token and rotates refresh cookie', async () => {
    const { cookie } = await registerAndLogin();

    const res = await request(app)
      .post(`${BASE}/refresh`)
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('401 — no refresh cookie', async () => {
    const res = await request(app).post(`${BASE}/refresh`);
    expect(res.status).toBe(401);
  });

  it('401 — invalid (unknown) refresh token', async () => {
    const res = await request(app)
      .post(`${BASE}/refresh`)
      .set('Cookie', 'refreshToken=invalidtoken123');
    expect(res.status).toBe(401);
  });

  it('401 — expired refresh token in the database', async () => {
    const { cookie } = await registerAndLogin();
    const tokenValue = cookie[0].split(';')[0].replace('refreshToken=', '');

    // Back-date the token so it is already expired
    await prisma.refreshToken.update({
      where: { token: tokenValue },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    const res = await request(app).post(`${BASE}/refresh`).set('Cookie', cookie);
    expect(res.status).toBe(401);
  });

  it('rotates token — old token is removed from the database', async () => {
    const { cookie } = await registerAndLogin();
    const oldTokenValue = cookie[0].split(';')[0].replace('refreshToken=', '');

    await request(app).post(`${BASE}/refresh`).set('Cookie', cookie);

    const old = await prisma.refreshToken.findUnique({ where: { token: oldTokenValue } });
    expect(old).toBeNull();
  });
});

// ─── POST /logout ────────────────────────────────────────────────────────────

describe('POST /api/auth/logout', () => {
  it('200 — clears cookie and removes token from database', async () => {
    const { cookie } = await registerAndLogin();
    const tokenValue = cookie[0].split(';')[0].replace('refreshToken=', '');

    const res = await request(app).post(`${BASE}/logout`).set('Cookie', cookie);

    expect(res.status).toBe(200);

    const stored = await prisma.refreshToken.findUnique({ where: { token: tokenValue } });
    expect(stored).toBeNull();
  });

  it('200 — no cookie present (already logged out — graceful)', async () => {
    const res = await request(app).post(`${BASE}/logout`);
    expect(res.status).toBe(200);
  });
});

// ─── GET /me ─────────────────────────────────────────────────────────────────

describe('GET /api/auth/me', () => {
  it('200 — returns current user without sensitive fields', async () => {
    const { accessToken } = await registerAndLogin();

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.deletedAt).toBeUndefined();
  });

  it('401 — no authorization header', async () => {
    const res = await request(app).get(`${BASE}/me`);
    expect(res.status).toBe(401);
  });

  it('401 — malformed bearer token', async () => {
    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', 'Bearer not.a.real.token');
    expect(res.status).toBe(401);
  });

  it('401 — soft-deleted account is rejected', async () => {
    const { accessToken } = await registerAndLogin();
    const dbUser = await prisma.user.findUnique({ where: { email: testUser.email } });
    await prisma.user.update({ where: { id: dbUser.id }, data: { deletedAt: new Date() } });

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(401);
  });

  it('401 — expired access token', async () => {
    const jwt = require('jsonwebtoken');
    const { env } = require('../config/env');
    const expiredToken = jwt.sign({ sub: 999, email: 'x@x.com' }, env.JWT_ACCESS_SECRET, {
      expiresIn: -1,
    });

    const res = await request(app)
      .get(`${BASE}/me`)
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });
});
