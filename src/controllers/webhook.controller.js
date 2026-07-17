'use strict';

const crypto = require('crypto');
const { processWebhook } = require('../services/whatsapp-webhook.service');

const verifySignature = (req) => {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) return process.env.NODE_ENV !== 'production';

  const signature = req.get('x-hub-signature-256');
  if (!signature || !req.rawBody) return false;

  const expected = `sha256=${crypto
    .createHmac('sha256', appSecret)
    .update(req.rawBody)
    .digest('hex')}`;

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
};

const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (
    mode === 'subscribe'
    && token
    && token === process.env.META_WEBHOOK_VERIFY_TOKEN
  ) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

const receiveWebhook = async (req, res) => {
  // if (!verifySignature(req)) return res.sendStatus(401);
  if (req.body.object !== 'whatsapp_business_account') return res.sendStatus(404);

  await processWebhook(req.body);
  return res.status(200).send('EVENT_RECEIVED');
};

module.exports = { receiveWebhook, verifyWebhook };
