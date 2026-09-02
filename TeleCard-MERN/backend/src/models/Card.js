const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    cardName: { type: String, required: true, trim: true, maxlength: 150 },
    cardType: { type: String, required: true, trim: true, maxlength: 30 },
    cardNetwork: { type: String, required: true, trim: true, maxlength: 30 },
    validity: { type: String, maxlength: 50 },
    price: { type: Number, required: true },
    annualFee: { type: Number },
    interestRate: { type: Number },
    creditLimit: { type: Number },
    cashWithdrawalLimit: { type: Number },
    rewards: { type: String, maxlength: 1000 },
    benefits: { type: String, maxlength: 1000 },
    eligibility: { type: String, maxlength: 1000 },
    description: { type: String, maxlength: 1000 },
    imageUrl: { type: String, maxlength: 500 },
    stock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'], default: 'ACTIVE' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Card', cardSchema);
