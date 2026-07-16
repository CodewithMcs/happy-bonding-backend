'use strict';

const { Op } = require('sequelize');
const { Customer, WhatsAppMessage } = require('../models');
const { success } = require('../utils/api-response');

const getAllMessages = async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 50);
  const where = {};

  if (req.query.customerId) where.customer_id = req.query.customerId;
  if (req.query.direction) where.direction = req.query.direction;
  if (req.query.messageType) where.message_type = req.query.messageType;
  if (req.query.search) {
    where.message_text = { [Op.like]: `%${req.query.search}%` };
  }

  const { count, rows } = await WhatsAppMessage.findAndCountAll({
    where,
    include: [
      {
        model: Customer,
        as: 'customer',
        attributes: ['id', 'customer_code', 'first_name', 'last_name', 'display_name', 'mobile', 'profile_image'],
      },
      {
        model: WhatsAppMessage,
        as: 'replyTo',
        attributes: ['id', 'whatsapp_message_id', 'message_type', 'message_text'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset: (page - 1) * limit,
    distinct: true,
  });

  return success(res, 'Messages retrieved successfully', {
    messages: rows,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
};

module.exports = { getAllMessages };
