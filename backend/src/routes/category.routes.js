'use strict';

const { Router } = require('express');
const categoryController = require('../controllers/category.controller');

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all categories
 *     responses:
 *       200:
 *         description: All categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:   { type: integer, example: 1 }
 *                           name: { type: string,  example: Electronics }
 *                           slug: { type: string,  example: electronics }
 */
router.get('/', categoryController.getCategories);

module.exports = router;
