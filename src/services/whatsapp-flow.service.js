'use strict';

const MENU = `👋 Welcome to Happy Menswear!

We're glad you're here.

Please choose an option below.

1. 🛍️ Shop Categories
2. 📍 Store Location
3. 💰 Latest Offers
4. 📞 Contact Us

Reply with 1, 2, 3, or 4.`;

const normalize = (text) => String(text || '').trim().toLowerCase();

const getFlowReply = (text) => {
  const input = normalize(text);

  if (['hi', 'hii', 'hello', 'hey', 'menu', 'start'].includes(input)) {
    return MENU;
  }

  if (['1', 'shop', 'shop categories', 'categories'].includes(input)) {
    return `🛍️ Shop Categories

• Shirts
• T-Shirts
• Trousers
• Jeans
• Traditional Wear

Reply MENU to return to the main menu.`;
  }

  if (['2', 'location', 'store location'].includes(input)) {
    return `📍 Store Location

${process.env.STORE_ADDRESS || 'Add your store address in STORE_ADDRESS.'}
${process.env.STORE_MAP_URL || ''}

Reply MENU to return to the main menu.`.replace(/\n{3,}/g, '\n\n');
  }

  if (['3', 'offer', 'offers', 'latest offers'].includes(input)) {
    return `💰 Latest Offers

${process.env.LATEST_OFFERS || 'Contact us to learn about our latest offers.'}

Reply MENU to return to the main menu.`;
  }

  if (['4', 'contact', 'contact us'].includes(input)) {
    return `📞 Contact Us

Phone: ${process.env.STORE_PHONE || 'Add your phone number in STORE_PHONE.'}
Email: ${process.env.STORE_EMAIL || 'Add your email in STORE_EMAIL.'}

Reply MENU to return to the main menu.`;
  }

  return `Sorry, I didn't understand that.

${MENU}`;
};

module.exports = { MENU, getFlowReply };
