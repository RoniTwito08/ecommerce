'use strict';

const request = require('supertest');
const app = require('../app');
const { prisma } = require('../config/database');

// ─── Setup ───────────────────────────────────────────────────────────────────

const BASE = '/api/products';

// All test data uses this unique slug to avoid colliding with seeded categories
const TEST_CATEGORY_SLUG = 'test-cat-products-phase4';

let testCategory;
let productAlpha; // price:  10, active
let productBeta;  // price:  50, active
let productGamma; // price: 100, active
let productDelta; // price:  25, inactive

const createProduct = (name, price, isActive, extra = {}) =>
  prisma.product.create({
    data: {
      name,
      description: `${name} description`,
      price,
      stockQuantity: 10,
      categoryId: testCategory.id,
      isActive,
      images: {
        create: [
          { imageUrl: `https://placehold.co/800x600?text=${name.replace(/\s/g, '+')}`, isPrimary: true, sortOrder: 0 },
          { imageUrl: `https://placehold.co/800x600?text=${name.replace(/\s/g, '+')}+Alt`, isPrimary: false, sortOrder: 1 },
        ],
      },
      ...extra,
    },
  });

beforeAll(async () => {
  testCategory = await prisma.category.upsert({
    where: { slug: TEST_CATEGORY_SLUG },
    update: {},
    create: { name: 'Test Products Category', slug: TEST_CATEGORY_SLUG },
  });

  productAlpha = await createProduct('Alpha Product', 10, true);
  productBeta  = await createProduct('Beta Product',  50, true);
  productGamma = await createProduct('Gamma Product', 100, true);
  productDelta = await createProduct('Delta Product', 25, false);
});

afterAll(async () => {
  const ids = [productAlpha, productBeta, productGamma, productDelta]
    .filter(Boolean)
    .map((p) => p.id);

  // ProductImages cascade — just deleting products is sufficient
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  await prisma.category.delete({ where: { id: testCategory.id } });
  await prisma.$disconnect();
});

// ─── GET /api/products ───────────────────────────────────────────────────────

describe('GET /api/products', () => {
  it('200 — returns paginated list of active products only', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // 3 active, 1 inactive — only 3 should appear
    expect(res.body.data.length).toBe(3);
    expect(res.body.data.every((p) => p.primaryImage !== undefined)).toBe(true);
    // deletedAt and isActive must never be exposed
    expect(res.body.data[0].isActive).toBeUndefined();
    expect(res.body.data[0].deletedAt).toBeUndefined();
  });

  it('200 — inactive product is excluded from results', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id });

    const names = res.body.data.map((p) => p.name);
    expect(names).not.toContain('Delta Product');
  });

  it('200 — meta contains correct pagination fields', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, page: 1, limit: 20 });

    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 20,
      total: 3,
      totalPages: 1,
    });
  });

  it('200 — pagination returns correct page slice', async () => {
    // page 1 of 2, limit 2 → 2 products
    const page1 = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, page: 1, limit: 2, sort: 'name_asc' });

    expect(page1.status).toBe(200);
    expect(page1.body.data.length).toBe(2);
    expect(page1.body.meta.totalPages).toBe(2);

    // page 2 of 2 → 1 product
    const page2 = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, page: 2, limit: 2, sort: 'name_asc' });

    expect(page2.body.data.length).toBe(1);
    // No overlap between pages
    const page1Names = page1.body.data.map((p) => p.name);
    const page2Names = page2.body.data.map((p) => p.name);
    expect(page1Names.some((n) => page2Names.includes(n))).toBe(false);
  });

  it('200 — search by partial name (case-insensitive)', async () => {
    const res = await request(app).get(BASE).query({ search: 'alpha' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Alpha Product');
  });

  it('200 — search with no match returns empty array', async () => {
    const res = await request(app).get(BASE).query({ search: 'xyznonexistent' });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('200 — filter by categoryId', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id });

    expect(res.status).toBe(200);
    res.body.data.forEach((p) => {
      expect(p.categoryId).toBe(testCategory.id);
    });
  });

  it('200 — filter by minPrice excludes cheaper products', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, minPrice: 50 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2); // Beta (50) + Gamma (100)
    res.body.data.forEach((p) => {
      expect(parseFloat(p.price)).toBeGreaterThanOrEqual(50);
    });
  });

  it('200 — filter by maxPrice excludes pricier products', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, maxPrice: 50 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2); // Alpha (10) + Beta (50)
    res.body.data.forEach((p) => {
      expect(parseFloat(p.price)).toBeLessThanOrEqual(50);
    });
  });

  it('200 — price range (minPrice + maxPrice)', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, minPrice: 10, maxPrice: 50 });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2); // Alpha (10) + Beta (50)
  });

  it('200 — sort by price_asc returns ascending prices', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, sort: 'price_asc' });

    expect(res.status).toBe(200);
    const prices = res.body.data.map((p) => parseFloat(p.price));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('200 — sort by price_desc returns descending prices', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, sort: 'price_desc' });

    expect(res.status).toBe(200);
    const prices = res.body.data.map((p) => parseFloat(p.price));
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('200 — sort by name_asc returns alphabetical order', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, sort: 'name_asc' });

    expect(res.status).toBe(200);
    const names = res.body.data.map((p) => p.name);
    expect(names).toEqual(['Alpha Product', 'Beta Product', 'Gamma Product']);
  });

  it('200 — sort by newest returns a valid list', async () => {
    const res = await request(app)
      .get(BASE)
      .query({ categoryId: testCategory.id, sort: 'newest' });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
  });

  it('400 — invalid page (non-numeric)', async () => {
    const res = await request(app).get(BASE).query({ page: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('400 — limit exceeds maximum (100)', async () => {
    const res = await request(app).get(BASE).query({ limit: 101 });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'limit')).toBe(true);
  });

  it('400 — minPrice greater than maxPrice', async () => {
    const res = await request(app).get(BASE).query({ minPrice: 100, maxPrice: 10 });
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'minPrice')).toBe(true);
  });

  it('400 — invalid sort value', async () => {
    const res = await request(app).get(BASE).query({ sort: 'random_sort' });
    expect(res.status).toBe(400);
  });
});

// ─── GET /api/products/:id ───────────────────────────────────────────────────

describe('GET /api/products/:id', () => {
  it('200 — returns full product detail', async () => {
    const res = await request(app).get(`${BASE}/${productAlpha.id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product.id).toBe(productAlpha.id);
    expect(res.body.data.product.name).toBe('Alpha Product');
    expect(res.body.data.product.description).toBeDefined();
    // Internal fields must not be exposed
    expect(res.body.data.product.isActive).toBeUndefined();
    expect(res.body.data.product.deletedAt).toBeUndefined();
    expect(res.body.data.product.passwordHash).toBeUndefined();
  });

  it('200 — images are returned in sortOrder', async () => {
    const res = await request(app).get(`${BASE}/${productAlpha.id}`);

    const images = res.body.data.product.images;
    expect(images.length).toBeGreaterThanOrEqual(2);
    expect(images[0].isPrimary).toBe(true);
    expect(images[0].sortOrder).toBeLessThanOrEqual(images[1].sortOrder);
  });

  it('200 — category is embedded in response', async () => {
    const res = await request(app).get(`${BASE}/${productAlpha.id}`);

    const { category } = res.body.data.product;
    expect(category.id).toBe(testCategory.id);
    expect(category.name).toBe('Test Products Category');
    expect(category.slug).toBe(TEST_CATEGORY_SLUG);
  });

  it('404 — product does not exist', async () => {
    const res = await request(app).get(`${BASE}/999999`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('404 — inactive product returns 404 (not exposed to customers)', async () => {
    const res = await request(app).get(`${BASE}/${productDelta.id}`);
    expect(res.status).toBe(404);
  });

  it('400 — non-numeric ID', async () => {
    const res = await request(app).get(`${BASE}/not-a-number`);
    expect(res.status).toBe(400);
    expect(res.body.errors.some((e) => e.field === 'id')).toBe(true);
  });
});
