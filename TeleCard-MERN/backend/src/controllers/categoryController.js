const Category = require('../models/Category');
const { apiError } = require('../middleware/errorHandler');

function toResponse(c) {
  return {
    id: c._id,
    name: c.name,
    description: c.description,
    active: c.active,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

exports.getActiveCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ active: true }).sort({ name: 1 });
    res.json(categories.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories.map(toResponse));
  } catch (err) {
    next(err);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, active } = req.body;
    if (!name) throw apiError(400, 'Category name is required');

    if (await Category.exists({ name })) throw apiError(400, 'Category name already exists');

    const category = await Category.create({
      name: name.trim(),
      description,
      active: active === undefined ? true : !!active,
    });

    res.json(toResponse(category));
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, active } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) throw apiError(404, 'Category not found');

    if (name && name.trim() !== category.name) {
      if (await Category.exists({ name: name.trim(), _id: { $ne: category._id } })) {
        throw apiError(400, 'Category name already exists');
      }
      category.name = name.trim();
    }
    if (description !== undefined) category.description = description;
    if (active !== undefined) category.active = !!active;

    await category.save();
    res.json(toResponse(category));
  } catch (err) {
    next(err);
  }
};

exports.setActive = (activeValue) => async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw apiError(404, 'Category not found');
    category.active = activeValue;
    await category.save();
    res.json(toResponse(category));
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) throw apiError(404, 'Category not found');
    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
};
