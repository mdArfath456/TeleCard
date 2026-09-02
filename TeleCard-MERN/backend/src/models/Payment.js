const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true, maxlength: 100 },
    payerName: { type: String, maxlength: 100 },
    utrNumber: { type: String, maxlength: 100 },
    screenshotUrl: { type: String, maxlength: 500 },
    status: { type: String, enum: ['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED'], default: 'PENDING' },
    gateway: { type: String, enum: ['MANUAL', 'RAZORPAY'], default: 'MANUAL' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    adminRemarks: { type: String, maxlength: 1000 },
    submittedAt: { type: Date },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
