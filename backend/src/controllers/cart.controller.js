'use strict';

const cartService = require('../services/cart.service');
const { success } = require('../utils/ApiResponse');

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return success(res, { cart });
  } catch (err) {
    return next(err);
  }
};

const addItem = async (req, res, next) => {
  try {
    const cart = await cartService.addItem(req.user.id, req.body);
    return success(res, { cart });
  } catch (err) {
    return next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const cart = await cartService.updateItem(req.user.id, req.params.id, req.body);
    return success(res, { cart });
  } catch (err) {
    return next(err);
  }
};

const removeItem = async (req, res, next) => {
  try {
    await cartService.removeItem(req.user.id, req.params.id);
    return success(res, { message: 'Item removed from cart.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getCart, addItem, updateItem, removeItem };
