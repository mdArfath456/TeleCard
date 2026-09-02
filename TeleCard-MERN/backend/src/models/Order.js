const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  cardName: { type: String, required: true },
  cardType: { type: String, required: true },
  cardNetwork: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  cardDetails: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'PAYMENT_SUBMITTED',
        'PAYMENT_VERIFIED',
        'PAYMENT_REJECTED',
        'PROCESSING',
        'COMPLETED',
        'CANCELLED',
      ],
      default: 'PAYMENT_PENDING',
    },
    items: [orderItemSchema],
    adminRemarks: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
