'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const db = {};

db.User = require('./user')(sequelize, DataTypes);
db.UserLogin = require('./user-login')(sequelize, DataTypes);
db.UserRefreshToken = require('./user-refresh-token')(sequelize, DataTypes);
db.Customer = require('./customer')(sequelize, DataTypes);
db.WhatsAppMessage = require('./whatsapp-message')(sequelize, DataTypes);

Object.values(db).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(db);
  }
});

db.sequelize = sequelize;

module.exports = db;
