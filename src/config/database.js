'use strict';

require('dotenv').config();

const { Sequelize } = require('sequelize');

const requiredVariables = ['DB_HOST', 'DB_NAME', 'DB_USER'];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing database environment variables: ${missingVariables.join(', ')}`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      underscored: true,
      freezeTableName: true,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

module.exports = sequelize;
