'use strict';

const success = (res, message, data = null, statusCode = 200) =>
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });

const error = (res, message, statusCode = 500, errors = null) =>
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });

module.exports = { success, error };
