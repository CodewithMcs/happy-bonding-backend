'use strict';

require('dotenv').config();

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const email = process.env.ADMIN_SEED_EMAIL;
    const password = process.env.ADMIN_SEED_PASSWORD;

    if (!email || !password) {
      throw new Error('ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD are required');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const existingId = await queryInterface.rawSelect(
      'users',
      { where: { email } },
      ['id'],
    );

    const values = {
      first_name: process.env.ADMIN_SEED_FIRST_NAME || 'Admin',
      last_name: process.env.ADMIN_SEED_LAST_NAME || 'User',
      display_name: process.env.ADMIN_SEED_DISPLAY_NAME || 'Administrator',
      role: 'admin',
      status: 'ACTIVE',
      password: passwordHash,
      email_verified: true,
      mobile_verified: false,
      updated_at: new Date(),
      deleted_at: null,
    };

    if (existingId) {
      await queryInterface.bulkUpdate('users', values, { id: existingId });
      return;
    }

    await queryInterface.bulkInsert('users', [
      { ...values, email, created_at: new Date() },
    ]);
  },

  async down(queryInterface) {
    if (process.env.ADMIN_SEED_EMAIL) {
      await queryInterface.bulkDelete('users', {
        email: process.env.ADMIN_SEED_EMAIL,
        role: 'admin',
      });
    }
  },
};
