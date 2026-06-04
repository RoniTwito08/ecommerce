'use strict';

const { z } = require('zod');

const addItemSchema = z.object({
  body: z.object({
    productId: z
      .number({ required_error: 'Product ID is required', invalid_type_error: 'Product ID must be a number' })
      .int()
      .positive('Product ID must be a positive integer'),
    quantity: z
      .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(99, 'Quantity cannot exceed 99 per item'),
  }),
});

const updateItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    quantity: z
      .number({ required_error: 'Quantity is required', invalid_type_error: 'Quantity must be a number' })
      .int('Quantity must be a whole number')
      .min(1, 'Quantity must be at least 1')
      .max(99, 'Quantity cannot exceed 99 per item'),
  }),
});

const cartItemParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

module.exports = { addItemSchema, updateItemSchema, cartItemParamsSchema };
