'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserRefreshToken = sequelize.define(
    'UserRefreshToken',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      token_hash: {
        type: DataTypes.CHAR(64),
        allowNull: false,
        unique: true,
        validate: { is: /^[a-f0-9]{64}$/i },
      },
      device_id: DataTypes.STRING(255),
      device_name: DataTypes.STRING(150),
      ip_address: DataTypes.STRING(45),
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      last_used_at: DataTypes.DATE,
      is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: 'user_refresh_tokens',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  );

  UserRefreshToken.associate = (models) => {
    UserRefreshToken.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return UserRefreshToken;
};
