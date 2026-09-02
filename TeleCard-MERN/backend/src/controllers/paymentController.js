const crypto = require('crypto');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { apiError } = require('../middleware/errorHandler');
const { razorpay, isConfigured, keyId, keySecret } = require('../config/razorpay');

function toResponse(payment) {
  const order = payment.order;
  const user = order.user;
  return {
    id: payment._id,
    orderId: order._id,
    orderNumber: order.orderNumber,
    userId: user?._id,
    userName: user?.name,
    userEmail: user?.email,
    userPhone: user?.phone,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    payerName: payment.payerName,
    utrNumber: payment.utrNumber,
    screenshotUrl: payment.screenshotUrl,
    screenshotViewUrl: payment.screenshotUrl
      ? payment.screenshotUrl.startsWith('http')
        ? payment.screenshotUrl
        : `/uploads/${payment.screenshotUrl}`
      : null,
    status: payment.status,
    gateway: payment.gateway,
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    adminRemarks: payment.adminRemarks,
    submittedAt: payment.submittedAt,
    verifiedAt: payment.verifiedAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

async function loadPaymentDeep(filter) {
  return Payment.findOne(filter).populate({ path: 'order', populate: { path: 'user' } });
}

// Shared by both the Razorpay auto-verify path and the admin manual-verify path.
// Validates stock, decrements it, flips the payment/order into their "paid" state.
async function finalizeVerifiedPayment(payment, order, { remarks } = {}) {
  await order.populate('items.card');

  for (const item of order.items) {
    const card = item.card;
    if (!card) continue;
    if (card.status !== 'ACTIVE') throw apiError(400, `Card ${card.cardName} is no longer available`);
    if (card.stock == null || card.stock < item.quantity) throw apiError(400, `Insufficient stock for ${card.cardName}`);
  }
  for (const item of order.items) {
    const card = item.card;
    if (!card) continue;
    card.stock -= item.quantity;
    if (card.stock === 0) card.status = 'OUT_OF_STOCK';
    await card.save();
  }

  payment.status = 'VERIFIED';
  payment.verifiedAt = new Date();
  if (remarks) payment.adminRemarks = remarks;
  order.status = 'PROCESSING';
  if (remarks) order.adminRemarks = remarks;

  await payment.save();
  await order.save();
}

async function getOrCreatePayment(order) {
  let payment = await Payment.findOne({ order: order._id });
  if (!payment) {
    payment = await Payment.create({
      order: order._id,
      amount: order.totalAmount,
      paymentMethod: 'PENDING',
      status: 'PENDING',
      gateway: 'MANUAL',
    });
  }
  return payment;
}

exports.getGatewayConfig = async (req, res) => {
  res.json({ razorpayEnabled: isConfigured, keyId: isConfigured ? keyId : null });
};

exports.createPayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) throw apiError(404, 'Order not found');
    if (order.status !== 'PAYMENT_PENDING') throw apiError(400, 'Payment cannot be created for this order');

    const payment = await getOrCreatePayment(order);
    const populated = await loadPaymentDeep({ _id: payment._id });
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};

// --- Razorpay flow (primary) ---------------------------------------------

exports.createRazorpayOrder = async (req, res, next) => {
  try {
    if (!isConfigured) throw apiError(503, 'Razorpay is not configured on this server — use manual payment instead');

    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) throw apiError(404, 'Order not found');
    if (order.status !== 'PAYMENT_PENDING') throw apiError(400, 'Payment cannot be created for this order');

    const payment = await getOrCreatePayment(order);
    if (payment.status === 'VERIFIED') throw apiError(400, 'Payment has already been verified');

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: Math.round(order.totalAmount * 100), // paise
        currency: 'INR',
        receipt: order.orderNumber,
        notes: { orderId: order._id.toString() },
      });
    } catch (rzpErr) {
      // Surface as a normal API error so the frontend can fall back to manual payment.
      throw apiError(502, 'Could not reach Razorpay — please use manual payment instead');
    }

    payment.gateway = 'RAZORPAY';
    payment.paymentMethod = 'RAZORPAY';
    payment.razorpayOrderId = rzpOrder.id;
    await payment.save();

    res.json({
      keyId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderNumber: order.orderNumber,
      name: 'TeleCard',
      description: `Order ${order.orderNumber}`,
      prefill: { name: req.user.name, email: req.user.email, contact: req.user.phone },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    if (!isConfigured) throw apiError(503, 'Razorpay is not configured on this server');

    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).populate('user');
    if (!order) throw apiError(404, 'Order not found');

    const payment = await Payment.findOne({ order: order._id });
    if (!payment) throw apiError(404, 'Payment record not found');
    if (payment.status === 'VERIFIED') {
      const populated = await loadPaymentDeep({ _id: payment._id });
      return res.json(toResponse(populated));
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw apiError(400, 'razorpayOrderId, razorpayPaymentId and razorpaySignature are required');
    }
    if (payment.razorpayOrderId !== razorpayOrderId) throw apiError(400, 'Razorpay order mismatch');

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      payment.status = 'REJECTED';
      payment.adminRemarks = 'Razorpay signature verification failed';
      await payment.save();
      order.status = 'PAYMENT_REJECTED';
      await order.save();
      throw apiError(400, 'Payment signature verification failed');
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.submittedAt = new Date();

    await finalizeVerifiedPayment(payment, order, { remarks: 'Auto-verified via Razorpay' });

    const populated = await loadPaymentDeep({ _id: payment._id });
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};

// --- Manual flow (fallback) -----------------------------------------------

exports.submitPayment = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
    if (!order) throw apiError(404, 'Order not found');

    const payment = await Payment.findOne({ order: order._id });
    if (!payment) throw apiError(404, 'Payment record not found');

    if (payment.status === 'VERIFIED') throw apiError(400, 'Payment has already been verified');
    if (payment.status === 'SUBMITTED') throw apiError(400, 'Payment is already submitted for verification');

    const { paymentMethod, payerName, utrNumber } = req.body;
    if (!paymentMethod || !utrNumber) throw apiError(400, 'paymentMethod and utrNumber are required');
    if (!req.file) throw apiError(400, 'Payment screenshot is required');

    const utr = utrNumber.trim();
    if (await Payment.exists({ utrNumber: utr, _id: { $ne: payment._id } })) {
      throw apiError(400, 'This UTR number has already been submitted');
    }

    payment.gateway = 'MANUAL';
    payment.paymentMethod = paymentMethod.trim().toUpperCase();
    payment.payerName = payerName;
    payment.utrNumber = utr;
    payment.screenshotUrl = req.file.cloudinary ? req.file.path : `payments/${req.file.filename}`;
    payment.status = 'SUBMITTED';
    payment.submittedAt = new Date();
    await payment.save();

    order.status = 'PAYMENT_SUBMITTED';
    await order.save();

    const populated = await loadPaymentDeep({ _id: payment._id });
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};

exports.getMyPayment = async (req, res, next) => {
  try {
    const populated = await loadPaymentDeep({ order: req.params.orderId });
    if (!populated) throw apiError(404, 'Payment not found');
    if (!populated.order.user._id.equals(req.user._id)) throw apiError(403, 'You are not allowed to view this payment');
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate({ path: 'order', populate: { path: 'user' } }).sort({ createdAt: -1 });
    res.json(payments.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.getSubmittedPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ status: 'SUBMITTED' })
      .populate({ path: 'order', populate: { path: 'user' } })
      .sort({ createdAt: -1 });
    res.json(payments.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.getPaymentById = async (req, res, next) => {
  try {
    const populated = await loadPaymentDeep({ _id: req.params.paymentId });
    if (!populated) throw apiError(404, 'Payment not found');
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate({
      path: 'order',
      populate: [{ path: 'user' }, { path: 'items.card' }],
    });
    if (!payment) throw apiError(404, 'Payment not found');
    if (payment.status === 'VERIFIED') throw apiError(400, 'Payment is already verified');
    if (payment.status !== 'SUBMITTED') throw apiError(400, 'Only submitted payments can be verified');

    const { verified, remarks } = req.body;
    const order = payment.order;

    if (verified) {
      await finalizeVerifiedPayment(payment, order, { remarks });
    } else {
      payment.status = 'REJECTED';
      payment.adminRemarks = remarks;
      order.status = 'PAYMENT_REJECTED';
      order.adminRemarks = remarks;
      await payment.save();
      await order.save();
    }

    const populated = await loadPaymentDeep({ _id: payment._id });
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};
