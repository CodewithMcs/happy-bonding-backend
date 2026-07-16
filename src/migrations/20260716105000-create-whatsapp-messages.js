'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('whatsapp_messages', {
      id: { type: Sequelize.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
      customer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'customers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      whatsapp_message_id: { type: Sequelize.STRING(150), allowNull: true, unique: true },
      conversation_id: { type: Sequelize.STRING(150), allowNull: true },
      direction: { type: Sequelize.ENUM('INBOUND', 'OUTBOUND'), allowNull: false },
      sender_number: { type: Sequelize.STRING(20), allowNull: true },
      receiver_number: { type: Sequelize.STRING(20), allowNull: true },
      message_type: {
        type: Sequelize.ENUM(
          'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE', 'DOCUMENT', 'LOCATION',
          'CONTACT', 'STICKER', 'BUTTON', 'LIST', 'REACTION', 'SYSTEM',
        ),
        allowNull: true,
      },
      message_text: { type: Sequelize.TEXT('long'), allowNull: true },
      media_url: { type: Sequelize.STRING(1000), allowNull: true },
      media_mime_type: { type: Sequelize.STRING(100), allowNull: true },
      media_size: { type: Sequelize.BIGINT, allowNull: true },
      media_caption: { type: Sequelize.TEXT, allowNull: true },
      latitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      longitude: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
      reply_to_message_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'whatsapp_messages', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      is_forwarded: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_deleted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      is_read: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      delivered_at: { type: Sequelize.DATE, allowNull: true },
      read_at: { type: Sequelize.DATE, allowNull: true },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      received_at: { type: Sequelize.DATE, allowNull: true },
      webhook_payload: { type: Sequelize.JSON, allowNull: true },
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

    await queryInterface.addIndex('whatsapp_messages', ['customer_id', 'created_at'], {
      name: 'whatsapp_messages_customer_created_idx',
    });
    await queryInterface.addIndex('whatsapp_messages', ['conversation_id'], {
      name: 'whatsapp_messages_conversation_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('whatsapp_messages');
  },
};
