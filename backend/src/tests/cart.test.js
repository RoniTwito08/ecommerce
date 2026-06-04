'use strict';

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/database');

// ─── Setup ───────────────────────────────────────────────────────────────────

const BASE = '/api/cart';
const AUTH_BASE = '/api/auth';
const TEST_CATEGORY_SLUG = 'test-cat-cart-phase5';

const USER1 = { firstName: 'Cart', lastName: 'User1', email: 'cart.user1@helfy.dev', password: 'SecurePass1' };
const USER2 = { firstName: 'Cart', lastName: 'User2', email: 'cart.user2@helfy.dev', password: 'SecurePass1' };

let testCategory;
let product1;        // stockQuantity: 5
let product2;        // stockQuantity: 10
let inactiveProduct; // isActive: false

let token1;
let token2;
let user1Id;
let user2Id;

const login = async (credentials) => {
  const res = await request(app).post(`${AUTH_BASE}/login`).send(credentials);
  return res.body.data.accessToken;
};

const clearCartItems = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};

beforeAll(async () => {
  // Clean up any leftover test data from previous runs
  await prisma.user.deleteMany({ where: { email: { in: [USER1.email, USER2.email] } } });

  testCategory = await prisma.category.upsert({
    where: { slug: TEST_CATEGORY_SLUG },
    update: {},
    create: { name: 'Test Cart Category', slug: TEST_CATEGORY_SLUG },
  });

  product1 = await prisma.product.create({
    data: {
      name: 'Cart Test Product 1',
      description: 'Test product 1',
      price: '10.00',
      stockQuantity: 5,
      categoryId: testCategory.id,
      isActive: true,
      images: { create: [{ imageUrl: 'https://placehold.co/800x600', isPrimary: true, sortOrder: 0 }] },
    },
  });

  product2 = await prisma.product.create({
    data: {
      name: 'Cart Test Product 2',
      description: 'Test product 2',
      price: '25.00',
      stockQuantity: 10,
      categoryId: testCategory.id,
      isActive: true,
      images: { create: [{ imageUrl: 'https://placehold.co/800x600', isPrimary: true, sortOrder: 0 }] },
    },
  });

  inactiveProduct = await prisma.product.create({
    data: {
      name: 'Cart Test Inactive Product',
      description: 'Inactive product',
      price: '5.00',
      stockQuantity: 10,
      categoryId: testCategory.id,
      isActive: false,
      images: { create: [{ imageUrl: 'https://placehold.co/800x600', isPrimary: true, sortOrder: 0 }] },
    },
  });

  // Register and login both test users
  await request(app).post(`${AUTH_BASE}/register`).send(USER1);
  await request(app).post(`${AUTH_BASE}/register`).send(USER2);

  token1 = await login({ email: USER1.email, password: USER1.password });
  token2 = await login({ email: USER2.email, password: USER2.password });

  const u1 = await prisma.user.findUnique({ where: { email: USER1.email }, select: { id: true } });
  const u2 = await prisma.user.findUnique({ where: { email: USER2.email }, select: { id: true } });
  user1Id = u1.id;
  user2Id = u2.id;
});

beforeEach(async () => {
  // Empty carts before each test for a clean slate
  await clearCartItems(user1Id);
  await clearCartItems(user2Id);
});

afterAll(async () => {
  // Deleting users cascades to carts → cart items → refresh tokens
  await prisma.user.deleteMany({ where: { email: { in: [USER1.email, USER2.email] } } });
  await prisma.product.deleteMany({ where: { categoryId: testCategory.id } });
  await prisma.category.delete({ where: { id: testCategory.id } });
  await prisma.$disconnect();
});

// ─── GET /api/cart ────────────────────────────────────────────────────────────

describe('GET /api/cart', () => {
  it('200 — returns empty cart with correct shape', async () => {
    const res = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.cart.items).toEqual([]);
    expect(res.body.data.cart.subtotal).toBe('0.00');
    expect(res.body.data.cart.itemCount).toBe(0);
  });

  it('200 — returns cart with items, lineTotal, subtotal, and itemCount', async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 2 });

    const res = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    const { cart } = res.body.data;
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[0].lineTotal).toBeDefined();
    expect(cart.itemCount).toBe(2);
    expect(parseFloat(cart.subtotal)).toBeGreaterThan(0);
  });

  it('200 — subtotal equals sum of (quantity × price) for all items', async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 2 }); // 2 × 10.00 = 20.00

    await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product2.id, quantity: 1 }); // 1 × 25.00 = 25.00

    const res = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);
    const { cart } = res.body.data;

    const expected = cart.items
      .reduce((sum, item) => sum + item.quantity * parseFloat(item.product.price), 0)
      .toFixed(2);

    expect(cart.subtotal).toBe(expected); // '45.00'
  });

  it('200 — primaryImage is included per cart item', async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 1 });

    const res = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);
    expect(res.body.data.cart.items[0].product.primaryImage).not.toBeNull();
  });

  it('401 — no authorization token', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/cart/items ─────────────────────────────────────────────────────

describe('POST /api/cart/items', () => {
  it('200 — adds new product to cart and returns updated cart', async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.cart.items.length).toBe(1);
    expect(res.body.data.cart.items[0].product.id).toBe(product1.id);
    expect(res.body.data.cart.items[0].quantity).toBe(1);
  });

  it('200 — adding existing product increments quantity (no duplicate row)', async () => {
    await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 2 });

    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.data.cart.items.length).toBe(1); // still 1 row, not 2
    expect(res.body.data.cart.items[0].quantity).toBe(3); // 2 + 1
  });

  it('400 — quantity of 0 is rejected', async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 0 });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'quantity')).toBe(true);
  });

  it('400 — quantity exceeds Zod max (99)', async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 100 });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'quantity')).toBe(true);
  });

  it('400 — quantity exceeds available stock', async () => {
    // product1 has stockQuantity: 5
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 6 });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 — cumulative quantity exceeds stock', async () => {
    // Add 4 first (product1 stock = 5)
    await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 4 });

    // Adding 2 more would exceed stock (4 + 2 = 6 > 5)
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 2 });

    expect(res.status).toBe(400);
  });

  it('404 — product does not exist', async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: 999999, quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('404 — inactive product is rejected', async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: inactiveProduct.id, quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('401 — no authorization token', async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .send({ productId: product1.id, quantity: 1 });
    expect(res.status).toBe(401);
  });
});

// ─── PATCH /api/cart/items/:id ────────────────────────────────────────────────

describe('PATCH /api/cart/items/:id', () => {
  let cartItemId;

  beforeEach(async () => {
    // Add a product to user1's cart and capture the item ID
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 2 });
    cartItemId = res.body.data.cart.items[0].id;
  });

  it('200 — updates quantity and returns updated cart', async () => {
    const res = await request(app)
      .patch(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    const updatedItem = res.body.data.cart.items.find((i) => i.id === cartItemId);
    expect(updatedItem.quantity).toBe(3);
  });

  it('400 — quantity of 0 is rejected', async () => {
    const res = await request(app)
      .patch(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 0 });
    expect(res.status).toBe(400);
  });

  it('400 — quantity exceeds stock', async () => {
    // product1 stock = 5; try to set 6
    const res = await request(app)
      .patch(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 6 });
    expect(res.status).toBe(400);
  });

  it('403 — cannot update another users cart item', async () => {
    // user2 tries to update user1's item
    const res = await request(app)
      .patch(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ quantity: 1 });
    expect(res.status).toBe(403);
  });

  it('404 — item not found', async () => {
    const res = await request(app)
      .patch(`${BASE}/items/999999`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ quantity: 1 });
    expect(res.status).toBe(404);
  });

  it('401 — no authorization token', async () => {
    const res = await request(app)
      .patch(`${BASE}/items/${cartItemId}`)
      .send({ quantity: 1 });
    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/cart/items/:id ───────────────────────────────────────────────

describe('DELETE /api/cart/items/:id', () => {
  let cartItemId;

  beforeEach(async () => {
    const res = await request(app)
      .post(`${BASE}/items`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ productId: product1.id, quantity: 1 });
    cartItemId = res.body.data.cart.items[0].id;
  });

  it('200 — removes item from cart', async () => {
    const res = await request(app)
      .delete(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBeDefined();

    // Verify cart is now empty
    const cartRes = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);
    expect(cartRes.body.data.cart.items).toEqual([]);
  });

  it('200 — deleting already-removed item is idempotent', async () => {
    // Delete once
    await request(app)
      .delete(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token1}`);

    // Delete again — should still be 200
    const res = await request(app)
      .delete(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
  });

  it('403 — cannot delete another users cart item', async () => {
    const res = await request(app)
      .delete(`${BASE}/items/${cartItemId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });

  it('401 — no authorization token', async () => {
    const res = await request(app).delete(`${BASE}/items/${cartItemId}`);
    expect(res.status).toBe(401);
  });
});
