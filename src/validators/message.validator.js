'use strict';

const { query, validationResult } = require('express-validator');
const { error } = require('../utils/api-response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map(({ location, path, msg }) => ({ location, field: path, message: msg }));
  return error(res, 'Validation failed', 422, details);
};

const messageTypes = [
  'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE', 'DOCUMENT', 'LOCATION',
  'CONTACT', 'STICKER', 'BUTTON', 'LIST', 'REACTION', 'SYSTEM',
];

module.exports = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('customerId').optional().isInt({ min: 1 }).toInt(),
  query('direction').optional().isIn(['INBOUND', 'OUTBOUND']),
  query('messageType').optional().isIn(messageTypes),
  query('search').optional().isString().trim().isLength({ max: 500 }),
  validate,
];
