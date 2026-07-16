'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { error: errorResponse } = require('../utils/api-response');

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const token = authorization.slice(7).trim();
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(payload.userId);

    if (!user || user.status !== 'ACTIVE') {
      return errorResponse(res, 'Invalid access token', 401);
    }

    req.user = user;
    req.auth = payload;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired', 401);
    }
    return errorResponse(res, 'Invalid access token', 401);
  }
};

module.exports = authenticate;
