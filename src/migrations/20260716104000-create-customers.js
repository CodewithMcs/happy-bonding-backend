'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: { type: Sequelize.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
      customer_code: { type: Sequelize.STRING(30), allowNull: true, unique: true },
      first_name: { type: Sequelize.STRING(100), allowNull: false },
      last_name: { type: Sequelize.STRING(100), allowNull: true },
      display_name: { type: Sequelize.STRING(200), allowNull: true },
      mobile: { type: Sequelize.STRING(20), allowNull: false, unique: true },
      email: { type: Sequelize.STRING(100), allowNull: true },
      profile_image: { type: Sequelize.STRING(500), allowNull: true },
      gender: { type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'), allowNull: true },
      dob: { type: Sequelize.DATEONLY, allowNull: true },
      language: { type: Sequelize.STRING(20), allowNull: true },
      source: {
        type: Sequelize.ENUM('WHATSAPP', 'WEBSITE', 'FACEBOOK', 'INSTAGRAM'),
        allowNull: false,
        defaultValue: 'WHATSAPP',
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'BLOCKED', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      last_message_at: { type: Sequelize.DATE, allowNull: true },
      last_seen_at: { type: Sequelize.DATE, allowNull: true },
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
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('customers', ['last_message_at'], {
      name: 'customers_last_message_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('customers');
  },
};
