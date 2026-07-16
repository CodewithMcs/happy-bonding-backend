'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserLogin = sequelize.define(
    'UserLogin',
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
      login_type: {
        type: DataTypes.ENUM('PASSWORD', 'GOOGLE', 'OTP'),
        allowNull: false,
      },
      device_name: DataTypes.STRING(150),
      device_type: DataTypes.STRING(50),
      browser: DataTypes.STRING(100),
      os: DataTypes.STRING(100),
      ip_address: DataTypes.STRING(45),
      location: DataTypes.STRING(255),
      login_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      logout_at: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM('SUCCESS', 'FAILED'),
        allowNull: false,
      },
    },
    {
      tableName: 'user_logins',
      timestamps: false,
      underscored: true,
    },
  );

  UserLogin.associate = (models) => {
    UserLogin.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };

  return UserLogin;
};
