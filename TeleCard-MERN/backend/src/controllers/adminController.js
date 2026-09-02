const User = require('../models/User');
const { toUserResponse } = require('./userController');
const { apiError } = require('../middleware/errorHandler');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map(toUserResponse));
  } catch (err) {
    next(err);
  }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'USER' }).sort({ createdAt: -1 });
    res.json(users.map(toUserResponse));
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw apiError(404, 'User not found');
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw apiError(404, 'User not found');
    user.status = 'BLOCKED';
    user.enabled = false;
    await user.save();
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
};

exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw apiError(404, 'User not found');
    user.status = 'ACTIVE';
    user.enabled = true;
    await user.save();
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw apiError(404, 'User not found');
    await user.deleteOne();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.changeRole = async (req, res, next) => {
  try {
    const { role } = req.query;
    if (!['USER', 'ADMIN'].includes(role)) throw apiError(400, 'Invalid role');
    const user = await User.findById(req.params.id);
    if (!user) throw apiError(404, 'User not found');
    user.role = role;
    await user.save();
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
};
