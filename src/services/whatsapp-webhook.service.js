'use strict';

const { Customer, WhatsAppMessage, sequelize } = require('../models');
const { getFlowReply } = require('./whatsapp-flow.service');

const timestampToDate = (timestamp) =>
  timestamp ? new Date(Number(timestamp) * 1000) : new Date();

const splitName = (name, fallback) => {
  const parts = (name || fallback).trim().split(/\s+/);
  return { firstName: parts.shift(), lastName: parts.join(' ') || null };
};

const messageType = (message) => {
  if (message.type === 'audio' && message.audio?.voice) return 'VOICE';
  if (message.type === 'interactive') {
    return message.interactive?.type === 'list_reply' ? 'LIST' : 'BUTTON';
  }
  if (message.type === 'contacts') return 'CONTACT';
  const type = String(message.type || 'system').toUpperCase();
  const supported = [
    'TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'LOCATION', 'STICKER',
    'BUTTON', 'REACTION', 'SYSTEM',
  ];
  return supported.includes(type) ? type : 'SYSTEM';
};

const messageText = (message) =>
  message.text?.body
  || message.button?.text
  || message.interactive?.button_reply?.title
  || message.interactive?.list_reply?.title
  || message.reaction?.emoji
  || message.system?.body
  || message.location?.name
  || null;

const mediaDetails = (message) => {
  const media = message.image || message.video || message.audio || message.document || message.sticker;
  return {
    media_url: media?.url || media?.id || null,
    media_mime_type: media?.mime_type || null,
    media_size: media?.file_size || null,
    media_caption: media?.caption || message.document?.filename || null,
  };
};

const saveInboundMessage = async (value, message) => {
  const contact = (value.contacts || []).find((item) => item.wa_id === message.from);
  const profileName = contact?.profile?.name || message.from;
  const { firstName, lastName } = splitName(profileName, message.from);
  const occurredAt = timestampToDate(message.timestamp);

  return sequelize.transaction(async (transaction) => {
    const [customer, created] = await Customer.findOrCreate({
      where: { mobile: message.from },
      defaults: {
        first_name: firstName,
        last_name: lastName,
        display_name: profileName,
        source: 'WHATSAPP',
        last_message_at: occurredAt,
        last_seen_at: occurredAt,
      },
      transaction,
    });

    if (created) {
      await customer.update(
        { customer_code: `CUS${String(customer.id).padStart(8, '0')}` },
        { transaction },
      );
    } else {
      await customer.update(
        { display_name: profileName, last_message_at: occurredAt, last_seen_at: occurredAt },
        { transaction },
      );
    }

    let replyTo = null;
    if (message.context?.id) {
      replyTo = await WhatsAppMessage.findOne({
        where: { whatsapp_message_id: message.context.id },
        attributes: ['id'],
        transaction,
      });
    }

    const [, messageCreated] = await WhatsAppMessage.findOrCreate({
      where: { whatsapp_message_id: message.id },
      defaults: {
        customer_id: customer.id,
        conversation_id: null,
        direction: 'INBOUND',
        sender_number: message.from,
        receiver_number: value.metadata?.display_phone_number || null,
        message_type: messageType(message),
        message_text: messageText(message),
        ...mediaDetails(message),
        latitude: message.location?.latitude || null,
        longitude: message.location?.longitude || null,
        reply_to_message_id: replyTo?.id || null,
        is_forwarded: Boolean(message.context?.forwarded || message.context?.frequently_forwarded),
        received_at: occurredAt,
        webhook_payload: { metadata: value.metadata, contact, message },
      },
      transaction,
    });

    return { customer, messageCreated };
  });
};

const sendTextMessage = async (value, recipient, text, customerId) => {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId =
    value.metadata?.phone_number_id || process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.warn(
      'WhatsApp reply skipped: META_WHATSAPP_ACCESS_TOKEN or '
      + 'META_WHATSAPP_PHONE_NUMBER_ID is missing.',
    );
    return;
  }

  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v22.0';
  const response = await fetch(
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: { preview_url: false, body: text },
      }),
    },
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      `Unable to send WhatsApp reply: ${result.error?.message || response.statusText}`,
    );
  }

  const whatsappMessageId = result.messages?.[0]?.id;
  if (whatsappMessageId) {
    await WhatsAppMessage.findOrCreate({
      where: { whatsapp_message_id: whatsappMessageId },
      defaults: {
        customer_id: customerId,
        direction: 'OUTBOUND',
        sender_number: value.metadata?.display_phone_number || null,
        receiver_number: recipient,
        message_type: 'TEXT',
        message_text: text,
        sent_at: new Date(),
        webhook_payload: { response: result },
      },
    });
  }
};

const updateMessageStatus = async (value, status) => {
  const occurredAt = timestampToDate(status.timestamp);
  const updates = {
    conversation_id: status.conversation?.id || undefined,
    webhook_payload: { metadata: value.metadata, status },
  };

  if (status.status === 'sent') updates.sent_at = occurredAt;
  if (status.status === 'delivered') updates.delivered_at = occurredAt;
  if (status.status === 'read') {
    updates.read_at = occurredAt;
    updates.is_read = true;
  }
  if (status.status === 'failed') updates.webhook_payload = { metadata: value.metadata, status };

  await WhatsAppMessage.update(updates, {
    where: { whatsapp_message_id: status.id },
  });
};

const processWebhook = async (payload) => {
  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== 'messages') continue;
      const value = change.value || {};

      for (const message of value.messages || []) {
        console.log('WhatsApp message received:', {
          from: message.from,
          type: message.type,
          text: messageText(message),
          messageId: message.id,
          receivedAt: timestampToDate(message.timestamp).toISOString(),
        });

        const { customer, messageCreated } = await saveInboundMessage(value, message);
        const text = messageText(message);
        if (messageCreated && text) {
          await sendTextMessage(value, message.from, getFlowReply(text), customer.id);
        }
      }
      for (const status of value.statuses || []) {
        await updateMessageStatus(value, status);
      }
    }
  }
};

module.exports = { processWebhook };
