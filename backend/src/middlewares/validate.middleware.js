'use strict';

const { ApiError } = require('../utils/ApiError');

/**
 * Zod validation middleware factory.
 *
 * Pass a Zod schema that validates { body, query, params }.
 * Only include the keys you need — the rest are passed through unchanged.
 *
 * Usage:
 *   const schema = z.object({ body: z.object({ email: z.string().email() }) });
 *   router.post('/', validate(schema), controller);
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.slice(1).join('.'), // strip leading 'body'/'query'/'params'
      message: e.message,
    }));
    return next(ApiError.badRequest('Validation failed', errors));
  }

  // Attach Zod-coerced values (e.g. string "2" → number 2 for pagination)
  if (result.data.body !== undefined) req.body = result.data.body;
  if (result.data.query !== undefined) req.query = result.data.query;
  if (result.data.params !== undefined) req.params = result.data.params;

  return next();
};

module.exports = { validate };
