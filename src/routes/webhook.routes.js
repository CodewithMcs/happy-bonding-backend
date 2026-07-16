'use strict';

const express = require('express');
const webhookController = require('../controllers/webhook.controller');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.get('/', webhookController.verifyWebhook);
router.post('/', asyncHandler(webhookController.receiveWebhook));

module.exports = router;
