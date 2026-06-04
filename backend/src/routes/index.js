'use strict';

const { Router } = require('express');

const router = Router();

/**
 * API route registry.
 * Uncomment each line as the corresponding feature is built (Phase 3+).
 */
router.use('/auth',       require('./auth.routes'));
router.use('/products',   require('./product.routes'));
router.use('/categories', require('./category.routes'));
router.use('/cart',       require('./cart.routes'));
router.use('/orders',     require('./order.routes'));
// router.use('/users',      require('./user.routes'));

module.exports = router;
