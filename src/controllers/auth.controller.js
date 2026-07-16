'use strict';

const bcrypt = require('bcrypt');
const { User, UserLogin, UserRefreshToken, sequelize } = require('../models');
const {
  createAccessToken, createActionToken, generateOpaqueToken, hashToken,
  hashOtp, refreshExpiry, verifyActionToken,
} = require('../utils/auth-tokens');
const { sendAuthEmail } = require('../services/mail.service');
const { success, error: errorResponse } = require('../utils/api-response');

const BCRYPT_ROUNDS = 12;
const PUBLIC_USER_FIELDS = [
  'id', 'first_name', 'last_name', 'display_name', 'email', 'mobile', 'address',
  'profile_image', 'role', 'status', 'email_verified', 'mobile_verified',
  'created_at', 'updated_at',
];

const requestIp = (req) => req.ip || req.socket.remoteAddress || null;

const issueTokens = async (user, req, transaction) => {
  const refreshToken = generateOpaqueToken();
  await UserRefreshToken.create(
    {
      user_id: user.id,
      token_hash: hashToken(refreshToken),
      device_id: req.body.device_id || null,
      device_name: req.body.device_name || null,
      ip_address: requestIp(req),
      expires_at: refreshExpiry(),
    },
    { transaction },
  );

  return { accessToken: createAccessToken(user), refreshToken };
};

const login = async (req, res) => {
  const user = await User.unscoped().findOne({ where: { email: req.body.email } });
  const passwordValid = user?.password
    ? await bcrypt.compare(req.body.password, user.password)
    : false;

  if (!user || !passwordValid) {
    if (user) {
      await UserLogin.create({
        user_id: user.id,
        login_type: 'PASSWORD',
        device_name: req.body.device_name || null,
        device_type: req.body.device_type || null,
        browser: req.body.browser || null,
        os: req.body.os || null,
        ip_address: requestIp(req),
        location: req.body.location || null,
        status: 'FAILED',
      });
    }
    return errorResponse(res, 'Invalid email or password', 401);
  }

  if (user.status !== 'ACTIVE') {
    return errorResponse(res, 'User account is not active', 403);
  }
  if (!user.email_verified) {
    return errorResponse(res, 'Email address is not verified', 403);
  }

  const tokens = await sequelize.transaction(async (transaction) => {
    const result = await issueTokens(user, req, transaction);
    await UserLogin.create(
      {
        user_id: user.id,
        login_type: 'PASSWORD',
        device_name: req.body.device_name || null,
        device_type: req.body.device_type || null,
        browser: req.body.browser || null,
        os: req.body.os || null,
        ip_address: requestIp(req),
        location: req.body.location || null,
        status: 'SUCCESS',
      },
      { transaction },
    );
    return result;
  });

  return success(res, 'Login successful', tokens);
};

const refresh = async (req, res) => {
  const tokenHash = hashToken(req.get('x-refresh-token'));

  const tokens = await sequelize.transaction(async (transaction) => {
    const storedToken = await UserRefreshToken.findOne({
      where: { token_hash: tokenHash },
      include: [{ model: User, as: 'user', required: true }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!storedToken || storedToken.is_revoked || storedToken.expires_at <= new Date()) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
    if (storedToken.user.status !== 'ACTIVE') {
      const error = new Error('User account is not active');
      error.statusCode = 403;
      throw error;
    }

    await storedToken.update(
      { is_revoked: true, last_used_at: new Date() },
      { transaction },
    );
    return issueTokens(storedToken.user, req, transaction);
  });

  return success(res, 'Tokens refreshed successfully', tokens);
};

const logout = async (req, res) => {
  await UserRefreshToken.update(
    { is_revoked: true, last_used_at: new Date() },
    { where: { token_hash: hashToken(req.get('x-refresh-token')), is_revoked: false } },
  );
  return success(res, 'Logout successful');
};

const forgotPassword = async (req, res) => {
  const user = await User.unscoped().findOne({ where: { email: req.body.email } });
  const challengeId = generateOpaqueToken();
  const otp = String(require('crypto').randomInt(100000, 1000000));
  const challengeToken = createActionToken(
    {
      purpose: 'PASSWORD_RESET_OTP',
      challengeId,
      otpHash: hashOtp(challengeId, otp),
      userId: user?.id || 0,
      passwordFingerprint: hashToken(user?.password || ''),
    },
    '10m',
  );

  if (user && user.status === 'ACTIVE') {
    await sendAuthEmail({ to: user.email, subject: 'Password reset OTP', token: otp });
  }

  return success(res, 'If the email exists, a password reset OTP was sent', {
    challengeToken,
    expiresIn: 600,
  });
};

const verifyForgotPasswordOtp = async (req, res) => {
  let payload;
  try {
    payload = verifyActionToken(req.get('x-challenge-token'));
  } catch {
    return errorResponse(res, 'Invalid or expired OTP challenge', 400);
  }

  if (
    payload.purpose !== 'PASSWORD_RESET_OTP'
    || payload.otpHash !== hashOtp(payload.challengeId, req.body.otp)
  ) return errorResponse(res, 'Invalid or expired OTP', 400);

  const user = await User.unscoped().findByPk(payload.userId);
  if (
    !user
    || user.status !== 'ACTIVE'
    || payload.passwordFingerprint !== hashToken(user.password || '')
  ) return errorResponse(res, 'Invalid or expired OTP', 400);

  const resetToken = createActionToken(
    {
      purpose: 'PASSWORD_RESET',
      userId: user.id,
      passwordFingerprint: hashToken(user.password || ''),
    },
    '10m',
  );

  return success(res, 'OTP verified successfully', { resetToken, expiresIn: 600 });
};

const resetPassword = async (req, res) => {
  let payload;
  try {
    payload = verifyActionToken(req.get('x-reset-token'));
  } catch {
    return errorResponse(res, 'Invalid or expired reset token', 400);
  }
  const user = await User.unscoped().findByPk(payload.userId);
  if (
    payload.purpose !== 'PASSWORD_RESET'
    || !user
    || payload.passwordFingerprint !== hashToken(user.password || '')
  ) return errorResponse(res, 'Invalid or expired reset token', 400);

  const passwordHash = await bcrypt.hash(req.body.newPassword, BCRYPT_ROUNDS);
  await sequelize.transaction(async (transaction) => {
    await user.update(
      {
        password: passwordHash,
      },
      { transaction },
    );
    await UserRefreshToken.update(
      { is_revoked: true },
      { where: { user_id: user.id, is_revoked: false }, transaction },
    );
  });
  return success(res, 'Password reset successfully');
};

const changePassword = async (req, res) => {
  const user = await User.unscoped().findByPk(req.user.id);
  const valid = user.password
    ? await bcrypt.compare(req.body.currentPassword, user.password)
    : false;
  if (!valid) return errorResponse(res, 'Current password is incorrect', 400);
  if (await bcrypt.compare(req.body.newPassword, user.password)) {
    return errorResponse(res, 'New password must be different', 400);
  }

  const passwordHash = await bcrypt.hash(req.body.newPassword, BCRYPT_ROUNDS);
  await sequelize.transaction(async (transaction) => {
    await user.update({ password: passwordHash }, { transaction });
    await UserRefreshToken.update(
      { is_revoked: true },
      { where: { user_id: user.id, is_revoked: false }, transaction },
    );
  });
  return success(res, 'Password changed successfully; please log in again');
};

const verifyEmail = async (req, res) => {
  let payload;
  try {
    payload = verifyActionToken(req.get('x-verification-token'));
  } catch {
    return errorResponse(res, 'Invalid or expired verification token', 400);
  }
  const user = await User.unscoped().findByPk(payload.userId);
  if (payload.purpose !== 'EMAIL_VERIFICATION' || !user || user.email !== payload.email) {
    return errorResponse(res, 'Invalid or expired verification token', 400);
  }

  await user.update({ email_verified: true });
  return success(res, 'Email verified successfully');
};

const resendVerificationEmail = async (req, res) => {
  const user = await User.unscoped().findOne({ where: { email: req.body.email } });
  if (user && !user.email_verified && user.status === 'ACTIVE') {
    const token = createActionToken(
      { purpose: 'EMAIL_VERIFICATION', userId: user.id, email: user.email },
      '24h',
    );
    await sendAuthEmail({ to: user.email, subject: 'Verify your email address', token });
  }
  return success(res, 'If verification is required, an email was sent');
};

const getProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id, { attributes: PUBLIC_USER_FIELDS });
  return success(res, 'Profile retrieved successfully', { user });
};

const updateProfile = async (req, res) => {
  const allowedFields = ['first_name', 'last_name', 'display_name', 'mobile', 'address', 'profile_image'];
  const updates = Object.fromEntries(
    allowedFields.filter((field) => Object.hasOwn(req.body, field)).map((field) => [field, req.body[field]]),
  );
  await req.user.update(updates);
  const user = await User.findByPk(req.user.id, { attributes: PUBLIC_USER_FIELDS });
  return success(res, 'Profile updated successfully', { user });
};

module.exports = {
  login, logout, refresh, forgotPassword, verifyForgotPasswordOtp, resetPassword, changePassword,
  verifyEmail, resendVerificationEmail, getProfile, updateProfile,
};
