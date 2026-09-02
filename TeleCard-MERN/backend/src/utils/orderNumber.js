const Order = require('../models/Order');

async function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const count = await Order.countDocuments();
  const nextId = count + 1;
  return `TC-${y}${m}${d}-${String(nextId).padStart(6, '0')}`;
}

module.exports = generateOrderNumber;
