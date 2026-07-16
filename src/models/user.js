'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: DataTypes.STRING(100),
      display_name: DataTypes.STRING(200),
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      mobile: {
        type: DataTypes.STRING(20),
        unique: true,
      },
      address: DataTypes.STRING(250),
      profile_image: DataTypes.STRING(500),
      role: DataTypes.ENUM('admin', 'agent'),
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED'),
        defaultValue: 'ACTIVE',
      },
      email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      mobile_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      password: DataTypes.STRING(255),
      created_by: DataTypes.BIGINT,
      updated_by: DataTypes.BIGINT,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
    },
    {
      tableName: 'users',
      timestamps: true,
      paranoid: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      defaultScope: {
        attributes: {
          exclude: [
            'password',
          ],
        },
      },
      scopes: {
        withAuth: {
          attributes: { include: ['password'] },
        },
      },
    },
  );

  User.associate = (models) => {
    User.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'created_by',
    });
    User.belongsTo(models.User, {
      as: 'updater',
      foreignKey: 'updated_by',
    });
  };

  return User;
};
