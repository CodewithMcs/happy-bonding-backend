'use strict';

const nodemailer = require('nodemailer');

const sendAuthEmail = async ({ to, subject, token }) => {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV EMAIL] ${subject} to ${to}; token: ${token}`);
      return;
    }
    throw new Error('Email provider is not configured');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text: `${subject}\n\nToken: ${token}\n\nIf you did not request this, ignore this email.`,
  });
};

module.exports = { sendAuthEmail };
