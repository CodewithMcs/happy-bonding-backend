'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_refresh_tokens', {
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
      token_hash: {
        type: Sequelize.CHAR(64),
        allowNull: false,
        unique: true,
      },
      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      device_name: {
        type: Sequelize.STRING(150),
        allowNull: true,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      last_used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    });

    await queryInterface.addIndex('user_refresh_tokens', ['user_id'], {
      name: 'user_refresh_tokens_user_id_idx',
    });
    await queryInterface.addIndex('user_refresh_tokens', ['expires_at', 'is_revoked'], {
      name: 'user_refresh_tokens_validity_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_refresh_tokens');
  },
};
