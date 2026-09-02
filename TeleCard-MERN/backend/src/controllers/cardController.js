const Card = require('../models/Card');
const Category = require('../models/Category');
const { apiError } = require('../middleware/errorHandler');

function toResponse(c) {
  return {
    id: c._id,
    cardName: c.cardName,
    cardType: c.cardType,
    cardNetwork: c.cardNetwork,
    validity: c.validity,
    price: c.price,
    annualFee: c.annualFee,
    interestRate: c.interestRate,
    creditLimit: c.creditLimit,
    cashWithdrawalLimit: c.cashWithdrawalLimit,
    rewards: c.rewards,
    benefits: c.benefits,
    eligibility: c.eligibility,
    description: c.description,
    imageUrl: c.imageUrl,
    stock: c.stock,
    status: c.status,
    categoryId: c.category?._id || c.category,
    categoryName: c.category?.name,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

exports.getCards = async (req, res, next) => {
  try {
    const { categoryId, search } = req.query;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const cards = await Card.find({
        status: 'ACTIVE',
        $or: [{ cardName: regex }, { cardType: regex }, { cardNetwork: regex }, { description: regex }],
      }).populate('category');
      return res.json(cards.map(toResponse));
    }

    if (categoryId) {
      const cards = await Card.find({ status: 'ACTIVE', category: categoryId }).populate('category');
      return res.json(cards.map(toResponse));
    }

    const cards = await Card.find({ status: 'ACTIVE' }).populate('category').sort({ createdAt: -1 });
    res.json(cards.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id).populate('category');
    if (!card) throw apiError(404, 'Card not found');
    res.json(toResponse(card));
  } catch (err) {
    next(err);
  }
};

exports.getAllCards = async (req, res, next) => {
  try {
    const cards = await Card.find().populate('category').sort({ createdAt: -1 });
    res.json(cards.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const body = req.body;
    if (!body.categoryId) throw apiError(400, 'categoryId is required');
    const category = await Category.findById(body.categoryId);
    if (!category) throw apiError(400, 'Category not found');

    const card = await Card.create({
      cardName: body.cardName,
      cardType: body.cardType,
      cardNetwork: body.cardNetwork,
      validity: body.validity,
      price: body.price,
      annualFee: body.annualFee,
      interestRate: body.interestRate,
      creditLimit: body.creditLimit,
      cashWithdrawalLimit: body.cashWithdrawalLimit,
      rewards: body.rewards,
      benefits: body.benefits,
      eligibility: body.eligibility,
      description: body.description,
      imageUrl: body.imageUrl,
      stock: body.stock ?? 0,
      status: body.status || 'ACTIVE',
      category: category._id,
    });

    await card.populate('category');
    res.json(toResponse(card));
  } catch (err) {
    next(err);
  }
};

exports.updateCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) throw apiError(404, 'Card not found');

    const body = req.body;
    if (body.categoryId) {
      const category = await Category.findById(body.categoryId);
      if (!category) throw apiError(400, 'Category not found');
      card.category = category._id;
    }

    const fields = [
      'cardName', 'cardType', 'cardNetwork', 'validity', 'price', 'annualFee',
      'interestRate', 'creditLimit', 'cashWithdrawalLimit', 'rewards', 'benefits',
      'eligibility', 'description', 'imageUrl', 'stock', 'status',
    ];
    fields.forEach((f) => {
      if (body[f] !== undefined) card[f] = body[f];
    });

    await card.save();
    await card.populate('category');
    res.json(toResponse(card));
  } catch (err) {
    next(err);
  }
};

exports.setStatus = async (req, res, next) => {
  try {
    const { status } = req.query;
    if (!['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'].includes(status)) {
      throw apiError(400, 'Invalid status');
    }
    const card = await Card.findById(req.params.id);
    if (!card) throw apiError(404, 'Card not found');
    card.status = status;
    await card.save();
    await card.populate('category');
    res.json(toResponse(card));
  } catch (err) {
    next(err);
  }
};

exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) throw apiError(404, 'Card not found');
    await card.deleteOne();
    res.json({ success: true, message: 'Card deleted successfully' });
  } catch (err) {
    next(err);
  }
};
