'use strict';

const { prisma } = require('../config/database');
const { ApiError } = require('../utils/ApiError');

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Converts a Decimal/string price to integer cents to eliminate floating-point
// accumulation errors when summing multiple line item totals.
const toCents = (price) => Math.round(parseFloat(price) * 100);

// ─── Service Methods ──────────────────────────────────────────────────────────

const createOrder = async (userId, orderData) => {
  const {
    shippingName, shippingEmail, shippingPhone,
    shippingAddress, shippingCity, shippingState,
    shippingZip, shippingCountry, notes,
  } = orderData;

  // All reads and writes share one interactive transaction.
  // Any failure at any step rolls back the entire operation.
  const order = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
                isActive: true,
                deletedAt: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Cannot place an order with an empty cart.');
    }

    // Validate every product before any write — uses the same transaction
    // snapshot so stock reads are consistent with the subsequent decrements.
    for (const item of cart.items) {
      const p = item.product;

      if (!p.isActive || p.deletedAt !== null) {
        throw ApiError.badRequest(`"${p.name}" is no longer available and cannot be ordered.`);
      }

      if (item.quantity > p.stockQuantity) {
        throw ApiError.badRequest(
          `Insufficient stock for "${p.name}". Requested: ${item.quantity}, available: ${p.stockQuantity}.`
        );
      }
    }

    // Calculate total from live DB prices using integer-cent arithmetic to
    // eliminate float accumulation errors. The client cannot influence this value.
    const totalAmount = (
      cart.items.reduce((sum, item) => sum + item.quantity * toCents(item.product.price), 0) / 100
    ).toFixed(2);

    // Create the order record
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: 'PENDING',
        shippingName,
        shippingEmail,
        shippingPhone: shippingPhone ?? null,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingZip,
        shippingCountry,
        notes: notes ?? null,
      },
      select: { id: true, status: true, totalAmount: true, createdAt: true },
    });

    // Create order items — unitPrice is a snapshot of the price at purchase time.
    // Future product price changes do not affect historical orders.
    await tx.orderItem.createMany({
      data: cart.items.map((item) => ({
        orderId: newOrder.id,
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    });

    // Decrement stock with an atomic gte guard per product.
    // updateMany returns count=0 if stockQuantity dropped below the required
    // quantity between our earlier validation and this write (concurrent order).
    for (const item of cart.items) {
      const result = await tx.product.updateMany({
        where: { id: item.product.id, stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        throw ApiError.badRequest(
          `Stock for "${item.product.name}" was depleted by a concurrent order. Please review your cart.`
        );
      }
    }

    // Clear the cart now that the order is confirmed
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
};

const getOrders = async (userId, { page, limit }) => {
  const skip = (page - 1) * limit;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    orders: orders.map(({ _count, ...rest }) => ({ ...rest, itemCount: _count.items })),
    meta: {
      page: Math.min(page, totalPages),
      limit,
      total,
      totalPages,
    },
  };
};

const getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      shippingName: true,
      shippingEmail: true,
      shippingPhone: true,
      shippingAddress: true,
      shippingCity: true,
      shippingState: true,
      shippingZip: true,
      shippingCountry: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              id: true,
              name: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { imageUrl: true },
              },
            },
          },
        },
      },
    },
  });

  if (!order) throw ApiError.notFound('Order not found.');

  const { items, ...orderRest } = order;

  return {
    ...orderRest,
    items: items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: ((item.quantity * toCents(item.unitPrice)) / 100).toFixed(2),
      product: {
        id: item.product.id,
        name: item.product.name,
        primaryImage: item.product.images[0]?.imageUrl ?? null,
      },
    })),
  };
};

module.exports = { createOrder, getOrders, getOrderById };
