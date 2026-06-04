'use strict';

const productService = require('../services/product.service');
const { success, paginated } = require('../utils/ApiResponse');

const getProducts = async (req, res, next) => {
  try {
    const { products, meta } = await productService.getProducts(req.query);
    return paginated(res, products, meta);
  } catch (err) {
    return next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return success(res, { product });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getProducts, getProductById };
