const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
