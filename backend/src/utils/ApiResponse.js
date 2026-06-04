'use strict';

const success = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const created = (res, data) => success(res, data, 201);

const paginated = (res, data, meta) =>
  res.status(200).json({ success: true, data, meta });

const noContent = (res) => res.status(204).send();

module.exports = { success, created, paginated, noContent };
