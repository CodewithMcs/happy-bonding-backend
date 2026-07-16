'use strict';

const express = require('express');
const controller = require('../controllers/message.controller');
const validateGetMessages = require('../validators/message.validator');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

router.get('/', validateGetMessages, asyncHandler(controller.getAllMessages));

module.exports = router;
