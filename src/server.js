'use strict';

require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');

const port = Number(process.env.PORT) || 5000;
let server;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    console.log('Starting server...');
    server = app.listen(port, () => {
      console.log(`Server running on port ${port}.`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exitCode = 1;
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await sequelize.close();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer();
