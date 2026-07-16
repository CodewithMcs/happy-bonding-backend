'use strict';

require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  dialectOptions: process.env.DB_SSL === 'true'
    ? {
        ssl: {
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        },
      }
    : {},
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
};

module.exports = {
  development: baseConfig,
};
