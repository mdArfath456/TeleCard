const Cart = require('../models/Cart');
const Card = require('../models/Card');
const { apiError } = require('../middleware/errorHandler');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.card');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findOne({ user: userId }).populate('items.card');
  }
  return cart;
}

function toResponse(cart) {
  const items = cart.items
    .filter((i) => i.card) // guard against deleted cards
    .map((i) => ({
      cartItemId: i._id,
      cardId: i.card._id,
      cardName: i.card.cardName,
      cardType: i.card.cardType,
      cardNetwork: i.card.cardNetwork,
      imageUrl: i.card.imageUrl,
      quantity: i.quantity,
      price: i.price,
      subtotal: Number((i.price * i.quantity).toFixed(2)),
    }));

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = Number(items.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2));

  return { cartId: cart._id, userId: cart.user, items, totalItems, totalAmount };
}

exports.getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(toResponse(cart));
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { cardId, quantity } = req.body;
    if (!cardId || !quantity || quantity < 1) throw apiError(400, 'cardId and a valid quantity are required');

    const card = await Card.findById(cardId);
    if (!card) throw apiError(404, 'Card not found');
    if (card.status !== 'ACTIVE') throw apiError(400, `${card.cardName} is currently unavailable`);

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i) => i.card && i.card._id.equals(card._id));

    const desiredQty = existing ? existing.quantity + quantity : quantity;
    if (desiredQty > card.stock) {
      throw apiError(400, `Only ${card.stock} ${card.cardName} card(s) available`);
    }

    if (existing) {
      existing.quantity = desiredQty;
    } else {
      cart.items.push({ card: card._id, quantity, price: card.price });
    }

    await cart.save();
    const populated = await getOrCreateCart(req.user._id);
    res.json(toResponse(populated));
  } catch (err) {
    next(err);
  }
};

async function findItem(cart, itemId) {
  const item = cart.items.id(itemId);
  if (!item) throw apiError(404, 'Cart item not found');
  return item;
}

exports.updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) throw apiError(400, 'A valid quantity is required');

    const cart = await getOrCreateCart(req.user._id);
    const item = await findItem(cart, req.params.itemId);
    if (quantity > item.card.stock) throw apiError(400, `Only ${item.card.stock} ${item.card.cardName} card(s) available`);

    item.quantity = quantity;
    await cart.save();
    res.json(toResponse(await getOrCreateCart(req.user._id)));
  } catch (err) {
    next(err);
  }
};

exports.increaseQuantity = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = await findItem(cart, req.params.itemId);
    if (item.quantity + 1 > item.card.stock) throw apiError(400, `Only ${item.card.stock} ${item.card.cardName} card(s) available`);
    item.quantity += 1;
    await cart.save();
    res.json(toResponse(await getOrCreateCart(req.user._id)));
  } catch (err) {
    next(err);
  }
};

exports.decreaseQuantity = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = await findItem(cart, req.params.itemId);
    if (item.quantity <= 1) {
      item.deleteOne();
    } else {
      item.quantity -= 1;
    }
    await cart.save();
    res.json(toResponse(await getOrCreateCart(req.user._id)));
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const item = await findItem(cart, req.params.itemId);
    item.deleteOne();
    await cart.save();
    res.json(toResponse(await getOrCreateCart(req.user._id)));
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (err) {
    next(err);
  }
};
