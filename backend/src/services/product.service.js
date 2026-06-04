'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/ApiError');
const { SORT } = require('../constants');

// ─── Field Selects ────────────────────────────────────────────────────────────

// Product card data — description intentionally excluded from list to keep
// payload small (up to 20 items × avg 500-char description = ~10KB saved).
const LIST_SELECT = {
  id: true,
  name: true,
  price: true,
  stockQuantity: true,
  createdAt: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { imageUrl: true },
  },
};

// Full product detail — all gallery images ordered by sortOrder
const DETAIL_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  stockQuantity: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: { id: true, name: true, slug: true },
  },
  images: {
    orderBy: { sortOrder: 'asc' },
    select: { id: true, imageUrl: true, isPrimary: true, sortOrder: true },
  },
};

// ─── Query Builders ───────────────────────────────────────────────────────────

const buildWhere = ({ search, categoryId, minPrice, maxPrice }) => {
  const where = { isActive: true, deletedAt: null };

  // MySQL default collation (utf8mb4_general_ci) makes LIKE case-insensitive;
  // Prisma's mode: 'insensitive' is PostgreSQL-only and must not be used here.
  if (search) where.name = { contains: search };

  if (categoryId !== undefined) where.categoryId = categoryId;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  return where;
};

const buildOrderBy = (sort) => {
  const orderByMap = {
    [SORT.PRICE_ASC]: { price: 'asc' },
    [SORT.PRICE_DESC]: { price: 'desc' },
    [SORT.NEWEST]: { createdAt: 'desc' },
    [SORT.NAME_ASC]: { name: 'asc' },
  };
  return orderByMap[sort] ?? { name: 'asc' };
};

// Flattens the images array into a single primaryImage URL for card display
const toListItem = ({ images, ...rest }) => ({
  ...rest,
  primaryImage: images[0]?.imageUrl ?? null,
});

// ─── Service Methods ──────────────────────────────────────────────────────────

const getProducts = async ({ page, limit, search, categoryId, minPrice, maxPrice, sort }) => {
  const where = buildWhere({ search, categoryId, minPrice, maxPrice });
  const orderBy = buildOrderBy(sort);
  const skip = (page - 1) * limit;

  // Run count and list in the same transaction so both reflect the same DB state
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, select: LIST_SELECT, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    products: products.map(toListItem),
    meta: {
      page: Math.min(page, totalPages),
      limit,
      total,
      totalPages,
    },
  };
};

const getProductById = async (id) => {
  const product = await prisma.product.findFirst({
    where: { id, isActive: true, deletedAt: null },
    select: DETAIL_SELECT,
  });

  if (!product) throw ApiError.notFound('Product not found.');

  return product;
};

module.exports = { getProducts, getProductById };
