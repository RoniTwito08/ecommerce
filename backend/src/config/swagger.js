'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const { env } = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Helfy eCommerce API',
      version: '1.0.0',
      description:
        'REST API for the Helfy eCommerce platform. ' +
        'Protected endpoints require a Bearer token obtained from POST /auth/login.',
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token (15 min TTL). Refresh via POST /auth/refresh.',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Human-readable error description' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            totalPages: { type: 'integer', example: 8 },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
            phone: { type: 'string', nullable: true, example: '+1 555 000 1234' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication — register, login, refresh, logout' },
      { name: 'Products', description: 'Product catalogue — list, search, filter, detail' },
      { name: 'Categories', description: 'Product categories' },
      { name: 'Cart', description: 'Shopping cart — add, update, remove, clear' },
      { name: 'Orders', description: 'Order creation and history' },
      { name: 'Users', description: 'User profile management' },
    ],
  },
  // Routes and dedicated doc files will add JSDoc @swagger blocks
  apis: ['./src/routes/*.js', './src/docs/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
