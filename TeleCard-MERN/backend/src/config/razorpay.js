const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isConfigured = Boolean(keyId && keySecret);

const razorpay = isConfigured ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

module.exports = { razorpay, isConfigured, keyId, keySecret };
