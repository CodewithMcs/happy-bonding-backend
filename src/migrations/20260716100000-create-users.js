'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      display_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      mobile: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      address: {
        type: Sequelize.STRING(250),
        allowNull: true,
      },
      profile_image: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('admin', 'agent'),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'BLOCKED', 'SUSPENDED'),
        allowNull: true,
        defaultValue: 'ACTIVE',
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      mobile_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    await queryInterface.addIndex('users', ['email'], { name: 'users_email_idx' });
    await queryInterface.addIndex('users', ['mobile'], { name: 'users_mobile_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
