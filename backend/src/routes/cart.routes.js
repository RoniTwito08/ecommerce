'use strict';

const { Router } = require('express');
const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { addItemSchema, updateItemSchema, cartItemParamsSchema } = require('../validations/cart.validation');

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     CartProduct:
 *       type: object
 *       properties:
 *         id:            { type: integer, example: 1 }
 *         name:          { type: string,  example: Wireless Headphones }
 *         price:         { type: string,  example: '299.99' }
 *         stockQuantity: { type: integer, example: 45 }
 *         primaryImage:  { type: string, nullable: true, example: 'https://placehold.co/800x600' }
 *
 *     CartItem:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 5 }
 *         quantity:  { type: integer, example: 2 }
 *         lineTotal: { type: string,  example: '599.98' }
 *         product:
 *           $ref: '#/components/schemas/CartProduct'
 *
 *     Cart:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 1 }
 *         subtotal:  { type: string,  example: '599.98' }
 *         itemCount: { type: integer, example: 2 }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the authenticated user's cart
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart with items, line totals, subtotal, and item count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add a product to the cart
 *     description: >
 *       If the product already exists in the cart, its quantity is incremented.
 *       A new row is never created for an existing product.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: integer
 *                 example: 1
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 example: 2
 *     responses:
 *       200:
 *         description: Updated cart state after the item is added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error or quantity exceeds available stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Product not found or inactive
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/items', validate(addItemSchema), cartController.addItem);

/**
 * @swagger
 * /cart/items/{id}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update the quantity of a cart item
 *     description: Sets the quantity to the provided value (not additive). Validates stock availability.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 99
 *                 example: 3
 *     responses:
 *       200:
 *         description: Updated cart state after the quantity change
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Validation error or quantity exceeds stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Cart item belongs to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Cart item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/items/:id', validate(updateItemSchema), cartController.updateItem);

/**
 * @swagger
 * /cart/items/{id}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from the cart
 *     description: Idempotent — returns 200 even if the item was already removed.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed (or was already absent)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     message: { type: string, example: Item removed from cart. }
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Cart item belongs to another user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/items/:id', validate(cartItemParamsSchema), cartController.removeItem);

module.exports = router;
