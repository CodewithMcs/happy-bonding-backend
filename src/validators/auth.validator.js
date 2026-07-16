'use strict';

const { body, header, validationResult } = require('express-validator');
const { error } = require('../utils/api-response');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map(({ location, path, msg }) => ({ location, field: path, message: msg }));
  return error(res, 'Validation failed', 422, details);
};

const passwordRule = (field) =>
  body(field)
    .isString()
    .isLength({ min: 8, max: 72 })
    .withMessage(`${field} must be between 8 and 72 characters`);

module.exports = {
  login: [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty(), validate],
  refreshToken: [header('x-refresh-token').isString().notEmpty(), validate],
  forgotPassword: [body('email').isEmail().normalizeEmail(), validate],
  verifyForgotPasswordOtp: [
    header('x-challenge-token').isString().notEmpty(),
    body('otp').isString().matches(/^\d{6}$/).withMessage('otp must be a 6-digit code'),
    validate,
  ],
  resetPassword: [header('x-reset-token').isString().notEmpty(), passwordRule('newPassword'), validate],
  changePassword: [passwordRule('currentPassword'), passwordRule('newPassword'), validate],
  verifyEmail: [header('x-verification-token').isString().notEmpty(), validate],
  updateProfile: [
    body('first_name').optional().isString().trim().isLength({ min: 1, max: 100 }),
    body('last_name').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('display_name').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
    body('mobile').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
    body('address').optional({ nullable: true }).isString().trim().isLength({ max: 250 }),
    body('profile_image').optional({ nullable: true }).isURL().isLength({ max: 500 }),
    validate,
  ],
};
