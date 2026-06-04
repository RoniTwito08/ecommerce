'use strict';

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/database');

// ─── Setup ───────────────────────────────────────────────────────────────────

const BASE = '/api/orders';
const AUTH_BASE = '/api/auth';
const CART_BASE = '/api/cart';
const TEST_CATEGORY_SLUG = 'test-cat-orders-phase6';

const USER1 = { firstName: 'Order', lastName: 'User1', email: 'order.user1@helfy.dev', password: 'SecurePass1' };
const USER2 = { firstName: 'Order', lastName: 'User2', email: 'order.user2@helfy.dev', password: 'SecurePass1' };

const PRODUCT1_STOCK = 10;
const PRODUCT2_STOCK = 5;

const validShipping = {
  shippingName: 'Test Customer',
  shippingEmail: 'customer@example.com',
  shippingAddress: '123 Test Street',
  shippingCity: 'Test City',
  shippingState: 'Test State',
  shippingZip: '12345',
  shippingCountry: 'US',
};

let testCategory;
let product1; // price: 10.00, stock: 10
let product2; // price: 20.00, stock: 5
let inactiveProduct;

let token1;
let token2;
let user1Id;
let user2Id;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const addToCart = (token, productId, quantity) =>
  request(app)
    .post(`${CART_BASE}/items`)
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, quantity });

const placeOrder = (token, data = validShipping) =>
  request(app).post(BASE).set('Authorization', `Bearer ${token}`).send(data);

const clearOrdersForUsers = async (userIds) => {
  await prisma.orderItem.deleteMany({ where: { order: { userId: { in: userIds } } } });
  await prisma.order.deleteMany({ where: { userId: { in: userIds } } });
};

const clearCartItemsForUsers = async (userIds) => {
  for (const userId of userIds) {
    const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }
};

// ─── beforeAll / afterAll ─────────────────────────────────────────────────────

beforeAll(async () => {
  // Remove any leftover users from previous runs
  await prisma.user.deleteMany({ where: { email: { in: [USER1.email, USER2.email] } } });

  testCategory = await prisma.category.upsert({
    where: { slug: TEST_CATEGORY_SLUG },
    update: {},
    create: { name: 'Test Orders Category', slug: TEST_CATEGORY_SLUG },
  });

  product1 = await prisma.product.create({
    data: {
      name: 'Order Test Product 1',
      description: 'Test product 1',
      price: '10.00',
      stockQuantity: PRODUCT1_STOCK,
      categoryId: testCategory.id,
      isActive: true,
      images: { create: [{ imageUrl: 'https://placehold.co/800x600', isPrimary: true, sortOrder: 0 }] },
    },
  });

  product2 = await prisma.product.create({
    data: {
      name: 'Order Test Product 2',
      description: 'Test product 2',
      price: '20.00',
      stockQuantity: PRODUCT2_STOCK,
      categoryId: testCategory.id,
      isActive: true,
      images: { create: [{ imageUrl: 'https://placehold.co/800x600', isPrimary: true, sortOrder: 0 }] },
    },
  });

  inactiveProduct = await prisma.product.create({
    data: {
      name: 'Order Test Inactive Product',
      description: 'Inactive',
      price: '5.00',
      stockQuantity: 10,
      categoryId: testCategory.id,
      isActive: false,
      images: { create: [{ imageUrl: 'https://placehold.co/800x600', isPrimary: true, sortOrder: 0 }] },
    },
  });

  await request(app).post(`${AUTH_BASE}/register`).send(USER1);
  await request(app).post(`${AUTH_BASE}/register`).send(USER2);

  const login1 = await request(app).post(`${AUTH_BASE}/login`).send({ email: USER1.email, password: USER1.password });
  const login2 = await request(app).post(`${AUTH_BASE}/login`).send({ email: USER2.email, password: USER2.password });
  token1 = login1.body.data.accessToken;
  token2 = login2.body.data.accessToken;

  const u1 = await prisma.user.findUnique({ where: { email: USER1.email }, select: { id: true } });
  const u2 = await prisma.user.findUnique({ where: { email: USER2.email }, select: { id: true } });
  user1Id = u1.id;
  user2Id = u2.id;
});

beforeEach(async () => {
  await clearOrdersForUsers([user1Id, user2Id]);
  await clearCartItemsForUsers([user1Id, user2Id]);
  // Reset stock so each test starts with a known baseline
  await prisma.product.update({ where: { id: product1.id }, data: { stockQuantity: PRODUCT1_STOCK } });
  await prisma.product.update({ where: { id: product2.id }, data: { stockQuantity: PRODUCT2_STOCK } });
});

afterAll(async () => {
  const userIds = [user1Id, user2Id].filter(Boolean);
  await clearOrdersForUsers(userIds);
  await clearCartItemsForUsers(userIds);
  await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.product.deleteMany({ where: { categoryId: testCategory.id } });
  await prisma.category.delete({ where: { id: testCategory.id } });
  await prisma.$disconnect();
});

// ─── POST /api/orders ─────────────────────────────────────────────────────────

describe('POST /api/orders', () => {
  it('201 — creates order and returns summary', async () => {
    await addToCart(token1, product1.id, 2);
    const res = await placeOrder(token1);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.order.id).toBeDefined();
    expect(res.body.data.order.status).toBe('PENDING');
    expect(res.body.data.order.totalAmount).toBeDefined();
  });

  it('201 — totalAmount is calculated from database prices', async () => {
    await addToCart(token1, product1.id, 2); // 2 × 10.00 = 20.00
    await addToCart(token1, product2.id, 1); // 1 × 20.00 = 20.00

    const res = await placeOrder(token1);

    expect(res.status).toBe(201);
    expect(parseFloat(res.body.data.order.totalAmount)).toBeCloseTo(40.0, 2);
  });

  it('201 — cart is cleared after successful order', async () => {
    await addToCart(token1, product1.id, 1);
    await placeOrder(token1);

    const cartRes = await request(app).get(CART_BASE).set('Authorization', `Bearer ${token1}`);
    expect(cartRes.body.data.cart.items).toEqual([]);
    expect(cartRes.body.data.cart.itemCount).toBe(0);
  });

  it('201 — product stock is decremented by ordered quantity', async () => {
    const orderedQty = 3;
    await addToCart(token1, product1.id, orderedQty);
    await placeOrder(token1);

    const updated = await prisma.product.findUnique({
      where: { id: product1.id },
      select: { stockQuantity: true },
    });
    expect(updated.stockQuantity).toBe(PRODUCT1_STOCK - orderedQty);
  });

  it('400 — empty cart is rejected', async () => {
    const res = await placeOrder(token1);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 — missing required shipping field', async () => {
    await addToCart(token1, product1.id, 1);
    const { shippingCity: _removed, ...incompleteShipping } = validShipping;

    const res = await placeOrder(token1, incompleteShipping);
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'shippingCity')).toBe(true);
  });

  it('400 — stock depleted between cart add and checkout', async () => {
    await addToCart(token1, product1.id, 2);
    // Reduce stock below the carted quantity
    await prisma.product.update({ where: { id: product1.id }, data: { stockQuantity: 1 } });

    const res = await placeOrder(token1);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 — product became inactive between cart add and checkout', async () => {
    await addToCart(token1, product2.id, 1);
    // Deactivate the product after it was added to cart
    await prisma.product.update({ where: { id: product2.id }, data: { isActive: false } });

    const res = await placeOrder(token1);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    // Restore — also handled by beforeEach but explicit here for clarity
    await prisma.product.update({ where: { id: product2.id }, data: { isActive: true } });
  });

  it('400 — inactive product in cart (inserted directly) prevents checkout', async () => {
    // Insert inactive product directly into cart (bypassing the cart API which correctly rejects it)
    const cart = await prisma.cart.findUnique({ where: { userId: user1Id }, select: { id: true } });
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: inactiveProduct.id, quantity: 1 },
    });

    const res = await placeOrder(token1);
    expect(res.status).toBe(400);
  });

  it('401 — no authorization token', async () => {
    const res = await request(app).post(BASE).send(validShipping);
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/orders ──────────────────────────────────────────────────────────

describe('GET /api/orders', () => {
  it('200 — returns empty list for a user with no orders', async () => {
    const res = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('200 — returns orders with correct summary fields', async () => {
    await addToCart(token1, product1.id, 1);
    await placeOrder(token1);

    const res = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);

    const order = res.body.data[0];
    expect(order.id).toBeDefined();
    expect(order.status).toBe('PENDING');
    expect(order.totalAmount).toBeDefined();
    expect(order.createdAt).toBeDefined();
    expect(order.itemCount).toBe(1);
    // Internal fields must never be exposed
    expect(order.userId).toBeUndefined();
    expect(order.shippingAddress).toBeUndefined();
  });

  it('200 — pagination returns correct slice and meta', async () => {
    // Create 3 orders
    for (let i = 0; i < 3; i++) {
      await addToCart(token1, product1.id, 1);
      await placeOrder(token1);
    }

    const res = await request(app)
      .get(BASE)
      .set('Authorization', `Bearer ${token1}`)
      .query({ page: 1, limit: 2 });

    expect(res.body.data.length).toBe(2);
    expect(res.body.meta).toMatchObject({ page: 1, limit: 2, total: 3, totalPages: 2 });
  });

  it('200 — user sees only their own orders', async () => {
    // user1 creates an order
    await addToCart(token1, product1.id, 1);
    await placeOrder(token1);

    // user2 creates an order
    await addToCart(token2, product1.id, 1);
    await placeOrder(token2);

    const res1 = await request(app).get(BASE).set('Authorization', `Bearer ${token1}`);
    const res2 = await request(app).get(BASE).set('Authorization', `Bearer ${token2}`);

    // Each user sees only their own order
    expect(res1.body.meta.total).toBe(1);
    expect(res2.body.meta.total).toBe(1);

    const order1Ids = res1.body.data.map((o) => o.id);
    const order2Ids = res2.body.data.map((o) => o.id);
    expect(order1Ids.some((id) => order2Ids.includes(id))).toBe(false);
  });

  it('401 — no authorization token', async () => {
    const res = await request(app).get(BASE);
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/orders/:id ──────────────────────────────────────────────────────

describe('GET /api/orders/:id', () => {
  let createdOrderId;

  beforeEach(async () => {
    await addToCart(token1, product1.id, 2);
    await addToCart(token1, product2.id, 1);
    const res = await placeOrder(token1);
    createdOrderId = res.body.data.order.id;
  });

  it('200 — returns full order detail', async () => {
    const res = await request(app)
      .get(`${BASE}/${createdOrderId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(res.status).toBe(200);
    const { order } = res.body.data;
    expect(order.id).toBe(createdOrderId);
    expect(order.shippingName).toBe(validShipping.shippingName);
    expect(order.items.length).toBe(2);
    // Internal fields must not be exposed
    expect(order.userId).toBeUndefined();
  });

  it('200 — each item has correct lineTotal', async () => {
    const res = await request(app)
      .get(`${BASE}/${createdOrderId}`)
      .set('Authorization', `Bearer ${token1}`);

    const { items } = res.body.data.order;
    items.forEach((item) => {
      const expected = (item.quantity * parseFloat(item.unitPrice)).toFixed(2);
      expect(item.lineTotal).toBe(expected);
    });
  });

  it('200 — items include product name and primaryImage', async () => {
    const res = await request(app)
      .get(`${BASE}/${createdOrderId}`)
      .set('Authorization', `Bearer ${token1}`);

    const { items } = res.body.data.order;
    items.forEach((item) => {
      expect(item.product.name).toBeDefined();
      expect(item.product.primaryImage).not.toBeUndefined();
    });
  });

  it('404 — order does not exist', async () => {
    const res = await request(app)
      .get(`${BASE}/999999`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(404);
  });

  it('404 — order belongs to another user (ownership returns 404, not 403)', async () => {
    // user2 tries to access user1's order — should get 404, not 403
    const res = await request(app)
      .get(`${BASE}/${createdOrderId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(404);
  });

  it('400 — non-numeric order ID', async () => {
    const res = await request(app)
      .get(`${BASE}/not-a-number`)
      .set('Authorization', `Bearer ${token1}`);
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'id')).toBe(true);
  });

  it('401 — no authorization token', async () => {
    const res = await request(app).get(`${BASE}/${createdOrderId}`);
    expect(res.status).toBe(401);
  });
});
