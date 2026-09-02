const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { apiError } = require('../middleware/errorHandler');
const generateOrderNumber = require('../utils/orderNumber');
const { sendMail } = require('../utils/mailer');

function toResponse(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    userId: order.user?._id || order.user,
    userName: order.user?.name,
    userEmail: order.user?.email,
    userPhone: order.user?.phone,
    totalAmount: order.totalAmount,
    status: order.status,
    adminRemarks: order.adminRemarks,
    items: order.items.map((i) => ({
      id: i._id,
      cardId: i.card,
      cardName: i.cardName,
      cardType: i.cardType,
      cardNetwork: i.cardNetwork,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.subtotal,
      cardDetails: i.cardDetails,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function validateCard(card, quantity) {
  if (card.status !== 'ACTIVE') throw apiError(400, `Card ${card.cardName} is currently unavailable`);
  if (card.stock == null || card.stock <= 0) throw apiError(400, `Card ${card.cardName} is out of stock`);
  if (quantity > card.stock) throw apiError(400, `Only ${card.stock} ${card.cardName} card(s) available`);
}

exports.createOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.card');
    if (!cart || cart.items.length === 0) throw apiError(400, 'Your cart is empty');

    const requestedItems = req.body?.items; // [{ cartItemId, quantity }]

    let selections;
    if (!requestedItems || requestedItems.length === 0) {
      selections = cart.items.map((item) => ({ item, quantity: item.quantity }));
    } else {
      const seen = new Set();
      selections = requestedItems.map((sel) => {
        if (seen.has(sel.cartItemId)) throw apiError(400, `Cart item ${sel.cartItemId} was selected more than once`);
        seen.add(sel.cartItemId);

        const item = cart.items.id(sel.cartItemId);
        if (!item) throw apiError(400, `Cart item ${sel.cartItemId} does not belong to your cart`);
        if (sel.quantity > item.quantity) {
          throw apiError(400, `Requested quantity for cart item ${item._id} exceeds the quantity in your cart`);
        }
        return { item, quantity: sel.quantity };
      });
    }

    if (selections.length === 0) throw apiError(400, 'No cart items selected');

    let totalAmount = 0;
    const orderItems = selections.map(({ item, quantity }) => {
      const card = item.card;
      validateCard(card, quantity);
      const subtotal = Number((card.price * quantity).toFixed(2));
      totalAmount += subtotal;
      return {
        card: card._id,
        cardName: card.cardName,
        cardType: card.cardType,
        cardNetwork: card.cardNetwork,
        price: card.price,
        quantity,
        subtotal,
      };
    });

    const order = await Order.create({
      orderNumber: await generateOrderNumber(),
      user: req.user._id,
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'PAYMENT_PENDING',
      items: orderItems,
    });

    // Remove only the ordered quantities from the cart.
    selections.forEach(({ item, quantity }) => {
      if (quantity >= item.quantity) {
        item.deleteOne();
      } else {
        item.quantity -= quantity;
      }
    });
    await cart.save();

    await order.populate('user');
    res.json(toResponse(order));
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('user').sort({ createdAt: -1 });
    res.json(orders.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).populate('user');
    if (!order) throw apiError(404, 'Order not found');
    res.json(toResponse(order));
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user').sort({ createdAt: -1 });
    res.json(orders.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user');
    if (!order) throw apiError(404, 'Order not found');
    res.json(toResponse(order));
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.query;
    const order = await Order.findById(req.params.orderId).populate('user');
    if (!order) throw apiError(404, 'Order not found');

    order.status = status;
    if (remarks && remarks.trim()) order.adminRemarks = remarks.trim();
    await order.save();
    res.json(toResponse(order));
  } catch (err) {
    next(err);
  }
};

exports.fulfillOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('user');
    if (!order) throw apiError(404, 'Order not found');
    if (order.status !== 'PROCESSING') throw apiError(400, 'Only orders in PROCESSING status can be fulfilled');

    const { items, remarks } = req.body;
    items.forEach((f) => {
      const item = order.items.id(f.orderItemId);
      if (!item) throw apiError(400, `Order item ${f.orderItemId} does not belong to this order`);
      item.cardDetails = f.cardDetails.trim();
    });

    const allFilled = order.items.every((i) => i.cardDetails && i.cardDetails.trim());
    if (!allFilled) throw apiError(400, 'Card details must be provided for every item before completing the order');

    order.status = 'COMPLETED';
    if (remarks && remarks.trim()) order.adminRemarks = remarks.trim();
    await order.save();

    // Send the fulfilled card details to the customer — tries Brevo, then
    // Gmail SMTP, then just logs in dev if neither is configured.
    const itemsHtml = order.items
      .map((i) => `<li><strong>${i.cardName}</strong> (${i.cardType} · ${i.cardNetwork})<br/><code>${i.cardDetails}</code></li>`)
      .join('');
    await sendMail({
      to: order.user.email,
      toName: order.user.name,
      subject: `Your TeleCard order ${order.orderNumber} is ready`,
      html: `<p>Hi ${order.user.name},</p><p>Your order <strong>${order.orderNumber}</strong> has been fulfilled. Card details:</p><ul>${itemsHtml}</ul><p>— TeleCard</p>`,
    });

    res.json(toResponse(order));
  } catch (err) {
    next(err);
  }
};
