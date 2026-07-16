'use strict';

const express = require('express');
const controller = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validator = require('../validators/auth.validator');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.post('/login', validator.login, asyncHandler(controller.login));
router.post('/refresh', validator.refreshToken, asyncHandler(controller.refresh));
router.post('/logout', validator.refreshToken, asyncHandler(controller.logout));
router.post('/forgot-password', validator.forgotPassword, asyncHandler(controller.forgotPassword));
router.post(
  '/forgot-password/verify-otp',
  validator.verifyForgotPasswordOtp,
  asyncHandler(controller.verifyForgotPasswordOtp),
);
router.post('/reset-password', validator.resetPassword, asyncHandler(controller.resetPassword));
router.post('/verify-email', validator.verifyEmail, asyncHandler(controller.verifyEmail));
router.post(
  '/resend-verification-email',
  validator.forgotPassword,
  asyncHandler(controller.resendVerificationEmail),
);
router.post(
  '/change-password',
  authenticate,
  validator.changePassword,
  asyncHandler(controller.changePassword),
);
router.get('/me', authenticate, asyncHandler(controller.getProfile));
router.patch('/me', authenticate, validator.updateProfile, asyncHandler(controller.updateProfile));

module.exports = router;
