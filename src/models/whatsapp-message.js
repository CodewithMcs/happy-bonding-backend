'use strict';

module.exports = (sequelize, DataTypes) => {
  const WhatsAppMessage = sequelize.define('WhatsAppMessage', {
    id: { type: DataTypes.BIGINT, allowNull: false, autoIncrement: true, primaryKey: true },
    customer_id: { type: DataTypes.BIGINT, allowNull: false },
    whatsapp_message_id: { type: DataTypes.STRING(150), unique: true },
    conversation_id: DataTypes.STRING(150),
    direction: { type: DataTypes.ENUM('INBOUND', 'OUTBOUND'), allowNull: false },
    sender_number: DataTypes.STRING(20),
    receiver_number: DataTypes.STRING(20),
    message_type: DataTypes.ENUM(
      'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'VOICE', 'DOCUMENT', 'LOCATION',
      'CONTACT', 'STICKER', 'BUTTON', 'LIST', 'REACTION', 'SYSTEM',
    ),
    message_text: DataTypes.TEXT('long'),
    media_url: DataTypes.STRING(1000),
    media_mime_type: DataTypes.STRING(100),
    media_size: DataTypes.BIGINT,
    media_caption: DataTypes.TEXT,
    latitude: DataTypes.DECIMAL(10, 7),
    longitude: DataTypes.DECIMAL(10, 7),
    reply_to_message_id: DataTypes.BIGINT,
    is_forwarded: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    delivered_at: DataTypes.DATE,
    read_at: DataTypes.DATE,
    sent_at: DataTypes.DATE,
    received_at: DataTypes.DATE,
    webhook_payload: DataTypes.JSON,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: 'whatsapp_messages',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  WhatsAppMessage.associate = (models) => {
    WhatsAppMessage.belongsTo(models.Customer, { as: 'customer', foreignKey: 'customer_id' });
    WhatsAppMessage.belongsTo(models.WhatsAppMessage, { as: 'replyTo', foreignKey: 'reply_to_message_id' });
  };

  return WhatsAppMessage;
};
