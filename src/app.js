'use strict';

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const webhookRoutes = require('./routes/webhook.routes');
const { success, error: errorResponse } = require('./utils/api-response');

const app = express();

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
  : true;

app.set('trust proxy', process.env.TRUST_PROXY === 'true');
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({
  limit: '1mb',
  verify: (req, res, buffer) => {
    req.rawBody = buffer;
  },
}));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  return success(res, 'Service is healthy', { status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

app.use((req, res) => {
  return errorResponse(res, 'Route not found', 404);
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  const statusCode =
    error.name === 'SequelizeUniqueConstraintError'
      ? 409
      : error.statusCode || error.status || 500;
  const message =
    statusCode === 500
      ? 'Internal server error'
      : statusCode === 409
        ? 'A record with that value already exists'
        : error.message;
  return errorResponse(res, message, statusCode);
});

module.exports = app;
