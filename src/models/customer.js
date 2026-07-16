'use strict';

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
    customer_code: { type: DataTypes.STRING(30), unique: true },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: DataTypes.STRING(100),
    display_name: DataTypes.STRING(200),
    mobile: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(100), validate: { isEmail: true } },
    profile_image: DataTypes.STRING(500),
    gender: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    dob: DataTypes.DATEONLY,
    language: DataTypes.STRING(20),
    source: { type: DataTypes.ENUM('WHATSAPP', 'WEBSITE', 'FACEBOOK', 'INSTAGRAM'), defaultValue: 'WHATSAPP' },
    status: { type: DataTypes.ENUM('ACTIVE', 'BLOCKED', 'INACTIVE'), defaultValue: 'ACTIVE' },
    notes: DataTypes.TEXT,
    last_message_at: DataTypes.DATE,
    last_seen_at: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    deleted_at: DataTypes.DATE,
  }, {
    tableName: 'customers',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  });

  Customer.associate = (models) => {
    Customer.hasMany(models.WhatsAppMessage, { as: 'messages', foreignKey: 'customer_id' });
  };

  return Customer;
};
