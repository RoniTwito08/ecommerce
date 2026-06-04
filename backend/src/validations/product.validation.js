'use strict';

const { z } = require('zod');

const getProductsSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
      // Empty search after trim is treated as no search in the service layer
      search: z.string().trim().optional(),
      categoryId: z.coerce.number().int().positive().optional(),
      minPrice: z.coerce.number().min(0).optional(),
      maxPrice: z.coerce.number().min(0).optional(),
      sort: z.enum(['price_asc', 'price_desc', 'newest', 'name_asc']).default('name_asc'),
    })
    .refine(
      ({ minPrice, maxPrice }) =>
        minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
      { message: 'minPrice must be less than or equal to maxPrice', path: ['minPrice'] }
    ),
});

const getProductByIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

module.exports = { getProductsSchema, getProductByIdSchema };
