'use strict';

const { Router } = require('express');
const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createOrderSchema,
  getOrdersSchema,
  orderParamsSchema,
} = require('../validations/order.validation');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderProduct:
 *       type: object
 *       properties:
 *         id:           { type: integer, example: 1 }
 *         name:         { type: string,  example: Wireless Headphones }
 *         primaryImage: { type: string, nullable: true, example: 'https://placehold.co/800x600' }
 *
 *     OrderItemDetail:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 10 }
 *         quantity:  { type: integer, example: 2 }
 *         unitPrice: { type: string,  example: '299.99' }
 *         lineTotal: { type: string,  example: '599.98' }
 *         product:
 *           $ref: '#/components/schemas/OrderProduct'
 *
 *     OrderSummary:
 *       type: object
 *       description: Compact order representation for the order history list
 *       properties:
 *         id:          { type: integer, example: 1 }
 *         status:      { type: string, enum: [PENDING, PROCESSING, COMPLETED, CANCELLED], example: PENDING }
 *         totalAmount: { type: string,  example: '599.98' }
 *         itemCount:   { type: integer, example: 2 }
 *         createdAt:   { type: string,  format: date-time }
 *
 *     OrderDetail:
 *       type: object
 *       description: Full order representation including shipping info and line items
 *       properties:
 *         id:              { type: integer, example: 1 }
 *         status:          { type: string, enum: [PENDING, PROCESSING, COMPLETED, CANCELLED] }
 *         totalAmount:     { type: string,  example: '599.98' }
 *         shippingName:    { type: string,  example: Jane Doe }
 *         shippingEmail:   { type: string,  example: jane@example.com }
 *         shippingPhone:   { type: string, nullable: true }
 *         shippingAddress: { type: string,  example: 123 Main St }
 *         shippingCity:    { type: string,  example: New York }
 *         shippingState:   { type: string,  example: NY }
 *         shippingZip:     { type: string,  example: '10001' }
 *         shippingCountry: { type: string,  example: US }
 *         notes:           { type: string, nullable: true }
 *         createdAt:       { type: string,  format: date-time }
 *         updatedAt:       { type: string,  format: date-time }
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemDetail'
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from the authenticated user's cart
 *     description: >
 *       Validates all products and stock levels, creates the order with a price snapshot
 *       per item, decrements product stock, and clears the cart — all in a single atomic
 *       transaction. The totalAmount is calculated from live database prices; no
 *       client-supplied total is accepted.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingName
 *               - shippingEmail
 *               - shippingAddress
 *               - shippingCity
 *               - shippingState
 *               - shippingZip
 *               - shippingCountry
 *             properties:
 *               shippingName:    { type: string, example: Jane Doe }
 *               shippingEmail:   { type: string, format: email, example: jane@example.com }
 *               shippingPhone:   { type: string, example: '+1 555 000 1234' }
 *               shippingAddress: { type: string, example: 123 Main Street }
 *               shippingCity:    { type: string, example: New York }
 *               shippingState:   { type: string, example: NY }
 *               shippingZip:     { type: string, example: '10001' }
 *               shippingCountry: { type: string, example: US }
 *               notes:           { type: string, example: Leave at front door }
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       type: object
 *                       properties:
 *                         id:          { type: integer, example: 1 }
 *                         status:      { type: string, example: PENDING }
 *                         totalAmount: { type: string, example: '599.98' }
 *                         createdAt:   { type: string, format: date-time }
 *       400:
 *         description: Empty cart, validation error, inactive product, or insufficient stock
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
 */
router.post('/', validate(createOrderSchema), orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get the authenticated user's order history
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 50, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated order history (newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderSummary'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validate(getOrdersSchema), orderController.getOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get full details of a specific order
 *     description: Returns 404 if the order does not exist or does not belong to the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Full order detail with items, prices, and shipping information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: ID is not a valid positive integer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Order not found or does not belong to this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validate(orderParamsSchema), orderController.getOrderById);

module.exports = router;
