'use strict';

const { Router } = require('express');
const productController = require('../controllers/product.controller');
const { validate } = require('../middlewares/validate.middleware');
const { getProductsSchema, getProductByIdSchema } = require('../validations/product.validation');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductCategory:
 *       type: object
 *       properties:
 *         id:   { type: integer, example: 1 }
 *         name: { type: string,  example: Electronics }
 *         slug: { type: string,  example: electronics }
 *
 *     ProductImage:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 1 }
 *         imageUrl:  { type: string,  example: 'https://placehold.co/800x600' }
 *         isPrimary: { type: boolean, example: true }
 *         sortOrder: { type: integer, example: 0 }
 *
 *     ProductSummary:
 *       type: object
 *       description: Compact product representation used in list/card views
 *       properties:
 *         id:            { type: integer, example: 1 }
 *         name:          { type: string,  example: Wireless Headphones }
 *         price:         { type: string,  example: '299.99' }
 *         stockQuantity: { type: integer, example: 45 }
 *         categoryId:    { type: integer, example: 1 }
 *         createdAt:     { type: string,  format: date-time }
 *         category:
 *           $ref: '#/components/schemas/ProductCategory'
 *         primaryImage:
 *           type: string
 *           nullable: true
 *           example: 'https://placehold.co/800x600'
 *
 *     ProductDetail:
 *       type: object
 *       description: Full product representation used on the detail page
 *       properties:
 *         id:            { type: integer, example: 1 }
 *         name:          { type: string,  example: Wireless Headphones }
 *         description:   { type: string,  example: Premium over-ear headphones... }
 *         price:         { type: string,  example: '299.99' }
 *         stockQuantity: { type: integer, example: 45 }
 *         categoryId:    { type: integer, example: 1 }
 *         createdAt:     { type: string,  format: date-time }
 *         updatedAt:     { type: string,  format: date-time }
 *         category:
 *           $ref: '#/components/schemas/ProductCategory'
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProductImage'
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products with pagination, search, filtering, and sorting
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Partial name match (case-insensitive)
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer }
 *         description: Filter by category ID
 *       - in: query
 *         name: minPrice
 *         schema: { type: number, minimum: 0 }
 *         description: Minimum price (inclusive)
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number, minimum: 0 }
 *         description: Maximum price (inclusive). Must be >= minPrice when both are provided.
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name_asc, price_asc, price_desc, newest]
 *           default: name_asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated product list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductSummary'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 */
router.get('/', validate(getProductsSchema), productController.getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get full product details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product detail with full image gallery
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     product:
 *                       $ref: '#/components/schemas/ProductDetail'
 *       400:
 *         description: ID is not a valid positive integer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Product not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validate(getProductByIdSchema), productController.getProductById);

module.exports = router;
