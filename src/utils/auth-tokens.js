'use strict';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const generateOpaqueToken = () => crypto.randomBytes(64).toString('hex');

const createAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET is not configured');

  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m' },
  );
};

const actionTokenSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT token secret is not configured');
  return secret;
};

const hashOtp = (challengeId, otp) =>
  crypto.createHmac('sha256', actionTokenSecret()).update(`${challengeId}:${otp}`).digest('hex');

const createActionToken = (payload, expiresIn) =>
  jwt.sign(payload, actionTokenSecret(), { expiresIn });

const verifyActionToken = (token) => jwt.verify(token, actionTokenSecret());

const refreshExpiry = () => {
  const days = Number.parseInt(process.env.REFRESH_TOKEN_EXPIRES, 10);
  return new Date(Date.now() + (Number.isFinite(days) ? days : 30) * 24 * 60 * 60 * 1000);
};

module.exports = {
  createAccessToken,
  createActionToken,
  generateOpaqueToken,
  hashToken,
  hashOtp,
  refreshExpiry,
  verifyActionToken,
};
