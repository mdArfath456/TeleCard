const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { apiError } = require('../middleware/errorHandler');

function toUserResponse(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    enabled: u.enabled,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}
exports.toUserResponse = toUserResponse;

exports.getProfile = async (req, res, next) => {
  try {
    res.json(toUserResponse(req.user));
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (phone && phone.trim() !== user.phone) {
      const trimmed = phone.trim();
      if (await User.exists({ phone: trimmed, _id: { $ne: user._id } })) {
        throw apiError(400, 'Phone number already registered');
      }
      user.phone = trimmed;
    }

    await user.save();
    res.json(toUserResponse(user));
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw apiError(400, 'All fields are required');
    }
    if (newPassword !== confirmPassword) {
      throw apiError(400, 'New passwords do not match');
    }

    const isPlainTextMatch = user.password === currentPassword;
    const isHashedMatch = typeof user.password === 'string' && user.password.startsWith('$2')
      ? await bcrypt.compare(currentPassword, user.password)
      : false;

    if (!isPlainTextMatch && !isHashedMatch) {
      throw apiError(400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = req.user;
    user.status = 'DELETED';
    user.enabled = false;
    await user.save();
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (err) {
    next(err);
  }
};
