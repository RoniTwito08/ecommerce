'use strict';

const categoryService = require('../services/category.service');
const { success } = require('../utils/ApiResponse');

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    return success(res, { categories });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getCategories };
