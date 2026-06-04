'use strict';

const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .default('5000')
    .transform((val) => parseInt(val, 10)),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }),
  JWT_ACCESS_SECRET: z
    .string({ required_error: 'JWT_ACCESS_SECRET is required' })
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string({ required_error: 'JWT_REFRESH_SECRET is required' })
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌  Invalid environment variables:\n');
  const fields = parsed.error.flatten().fieldErrors;
  Object.entries(fields).forEach(([key, msgs]) => {
    console.error(`  ${key}: ${msgs.join(', ')}`);
  });
  console.error('\nFix the above variables and restart the server.\n');
  process.exit(1);
}

const env = parsed.data;

module.exports = { env };
