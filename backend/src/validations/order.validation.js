'use strict';

const { z } = require('zod');

const createOrderSchema = z.object({
  body: z.object({
    shippingName: z
      .string({ required_error: 'Shipping name is required' })
      .trim()
      .min(2, 'Shipping name must be at least 2 characters')
      .max(100),
    shippingEmail: z
      .string({ required_error: 'Shipping email is required' })
      .trim()
      .toLowerCase()
      .email('Must be a valid email address'),
    shippingPhone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
      .optional(),
    shippingAddress: z
      .string({ required_error: 'Shipping address is required' })
      .trim()
      .min(5, 'Address must be at least 5 characters')
      .max(200),
    shippingCity: z
      .string({ required_error: 'City is required' })
      .trim()
      .min(2, 'City must be at least 2 characters')
      .max(100),
    shippingState: z
      .string({ required_error: 'State/Province is required' })
      .trim()
      .min(2, 'State must be at least 2 characters')
      .max(100),
    shippingZip: z
      .string({ required_error: 'ZIP/Postal code is required' })
      .trim()
      .min(3, 'ZIP code must be at least 3 characters')
      .max(20),
    shippingCountry: z
      .string({ required_error: 'Country is required' })
      .trim()
      .min(2, 'Country must be at least 2 characters')
      .max(100),
    notes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional(),
  }),
});

const getOrdersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

const orderParamsSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

module.exports = { createOrderSchema, getOrdersSchema, orderParamsSchema };
