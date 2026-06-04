'use strict';

const { prisma } = require('../config/database');

const getCategories = async () => {
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: 'asc' },
  });
};

module.exports = { getCategories };
