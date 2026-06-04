'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/ApiError');

// ─── Field Select ─────────────────────────────────────────────────────────────

const CART_SELECT = {
  id: true,
  items: {
    orderBy: { id: 'asc' },
    select: {
      id: true,
      quantity: true,
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          stockQuantity: true,
          images: {
            where: { isPrimary: true },
            take: 1,
            select: { imageUrl: true },
          },
        },
      },
    },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Accumulates from raw prices (not from rounded lineTotal strings) to minimise
// compound floating-point rounding error across many items.
const formatCart = (cart) => {
  const items = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    lineTotal: (item.quantity * parseFloat(item.product.price)).toFixed(2),
    product: {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      stockQuantity: item.product.stockQuantity,
      primaryImage: item.product.images[0]?.imageUrl ?? null,
    },
  }));

  const subtotal = cart.items
    .reduce((sum, item) => sum + item.quantity * parseFloat(item.product.price), 0)
    .toFixed(2);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { id: cart.id, items, subtotal, itemCount };
};

// ─── Service Methods ──────────────────────────────────────────────────────────

const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: CART_SELECT,
  });

  // Cart is created at registration — this should never be null in normal flow.
  if (!cart) throw ApiError.notFound('Cart not found.');

  return formatCart(cart);
};

const addItem = async (userId, { productId, quantity }) => {
  // Fetch cart and validate product (read-only, safe outside transaction)
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!cart) throw ApiError.notFound('Cart not found.');

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, deletedAt: null },
    select: { id: true, stockQuantity: true },
  });

  if (!product) throw ApiError.notFound('Product not found.');

  // Read → validate → write inside a transaction to prevent race conditions
  // between concurrent requests for the same cart item.
  await prisma.$transaction(async (tx) => {
    const existing = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
      select: { id: true, quantity: true },
    });

    const proposedQty = (existing?.quantity ?? 0) + quantity;

    if (proposedQty > product.stockQuantity) {
      throw ApiError.badRequest(
        `Cannot add ${quantity} unit${quantity !== 1 ? 's' : ''}. Only ${product.stockQuantity} available in stock.`
      );
    }

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: proposedQty },
      });
    } else {
      await tx.cartItem.create({
        data: { cartId: cart.id, productId, quantity: proposedQty },
      });
    }
  });

  return getCart(userId);
};

const updateItem = async (userId, itemId, { quantity }) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      cart: { select: { userId: true } },
      product: { select: { stockQuantity: true } },
    },
  });

  if (!item) throw ApiError.notFound('Cart item not found.');
  if (item.cart.userId !== userId) throw ApiError.forbidden();

  if (quantity > item.product.stockQuantity) {
    throw ApiError.badRequest(
      `Only ${item.product.stockQuantity} unit${item.product.stockQuantity !== 1 ? 's' : ''} available in stock.`
    );
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getCart(userId);
};

const removeItem = async (userId, itemId) => {
  // deleteMany with the userId relation filter makes the delete ownership-aware
  // in one atomic operation, eliminating the TOCTOU gap between a separate
  // findUnique ownership check and the subsequent delete call.
  const result = await prisma.cartItem.deleteMany({
    where: { id: itemId, cart: { userId } },
  });

  if (result.count > 0) return; // Own item deleted successfully

  // count === 0: nothing was deleted — either item not found or wrong owner.
  // A secondary check distinguishes the two so we can still return 403 explicitly.
  const exists = await prisma.cartItem.findUnique({
    where: { id: itemId },
    select: { id: true },
  });

  if (exists) throw ApiError.forbidden(); // Item exists but wasn't ours to delete
  // Item not found — already removed or never existed — idempotent, no error
};

module.exports = { getCart, addItem, updateItem, removeItem };
