'use strict';

const orderService = require('../services/order.service');
const { success, created, paginated } = require('../utils/ApiResponse');

const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    return created(res, { order });
  } catch (err) {
    return next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { orders, meta } = await orderService.getOrders(req.user.id, req.query);
    return paginated(res, orders, meta);
  } catch (err) {
    return next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.user.id, req.params.id);
    return success(res, { order });
  } catch (err) {
    return next(err);
  }
};

module.exports = { createOrder, getOrders, getOrderById };
