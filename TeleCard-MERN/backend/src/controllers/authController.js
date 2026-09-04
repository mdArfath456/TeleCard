const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Cart = require('../models/Cart');
const { generateAccessToken, generateRefreshToken, verifyToken, ACCESS_EXP_MS, REFRESH_EXP_MS } = require('../utils/jwt');
const { apiError } = require('../middleware/errorHandler');
const { sendMail } = require('../utils/mailer');

function cookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: process.env.JWT_COOKIE_SECURE === 'true',
    sameSite: process.env.JWT_COOKIE_SAME_SITE || 'Lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function expiredCookieOptions() {
  return cookieOptions(0);
}

function setAuthCookies(res, accessToken, refreshToken) {
  const accessName = process.env.JWT_COOKIE_NAME || 'jwt';
  const refreshName = process.env.JWT_REFRESH_COOKIE_NAME || 'refreshJwt';
  res.cookie(accessName, accessToken, cookieOptions(ACCESS_EXP_MS));
  res.cookie(refreshName, refreshToken, cookieOptions(REFRESH_EXP_MS));
}

function buildAuthResponse(user, accessToken, refreshToken) {
  return {
    accessToken,
    tokenType: 'Bearer',
    userId: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    refreshToken,
  };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      throw apiError(400, 'All fields are required');
    }
    if (password !== confirmPassword) {
      throw apiError(400, 'Passwords do not match');
    }
    if (password.length < 6) {
      throw apiError(400, 'Password must be at least 6 characters');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (await User.exists({ email: normalizedEmail })) {
      throw apiError(400, 'Email already registered');
    }
    if (await User.exists({ phone: trimmedPhone })) {
      throw apiError(400, 'Phone number already registered');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: trimmedPhone,
      password: hashed,
      role: 'USER',
      enabled: true,
    });

    await Cart.create({ user: user._id, items: [] });

    // Fire-and-forget — never let a slow/failed mail provider hold up registration.
    sendMail({
      to: user.email,
      toName: user.name,
      subject: 'Welcome to TeleCard',
      html: `<p>Hi ${user.name},</p><p>Your TeleCard account is ready. Start browsing cards whenever you like.</p><p>— TeleCard</p>`,
    }).catch(() => { });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw apiError(400, 'Email and password are required');

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) throw apiError(400, 'Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw apiError(400, 'Invalid email or password');

    if (!user.enabled || user.status !== 'ACTIVE') {
      throw apiError(400, 'User account is disabled');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, refreshToken);

    res.json(buildAuthResponse(user, accessToken, refreshToken));
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const refreshName = process.env.JWT_REFRESH_COOKIE_NAME || 'refreshJwt';
    const token = req.cookies?.[refreshName];
    if (!token) return res.status(401).json({ message: 'Refresh token is required' });

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.enabled || user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'User not found or disabled' });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    setAuthCookies(res, accessToken, newRefreshToken);

    res.json(buildAuthResponse(user, accessToken, newRefreshToken));
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res) => {
  const accessName = process.env.JWT_COOKIE_NAME || 'jwt';
  const refreshName = process.env.JWT_REFRESH_COOKIE_NAME || 'refreshJwt';
  const options = expiredCookieOptions();
  res.clearCookie(accessName, options);
  res.clearCookie(refreshName, options);
  res.status(204).send();
};
