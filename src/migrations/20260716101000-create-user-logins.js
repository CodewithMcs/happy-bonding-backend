'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_logins', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      login_type: {
        type: Sequelize.ENUM('PASSWORD', 'GOOGLE', 'OTP'),
        allowNull: false,
      },
      device_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      device_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      browser: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      login_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      logout_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('SUCCESS', 'FAILED'),
        allowNull: false,
      },
    });

    await queryInterface.addIndex('user_logins', ['user_id'], {
      name: 'user_logins_user_id_idx',
    });
    await queryInterface.addIndex('user_logins', ['login_at'], {
      name: 'user_logins_login_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_logins');
  },
};
