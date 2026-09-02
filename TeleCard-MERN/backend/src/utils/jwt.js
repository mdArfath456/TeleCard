const jwt = require('jsonwebtoken');

const ACCESS_EXP_MS = Number(process.env.JWT_EXPIRATION || 900000); // 15 min
const REFRESH_EXP_MS = Number(process.env.JWT_REFRESH_EXPIRATION || 604800000); // 7 days

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.email, id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: Math.floor(ACCESS_EXP_MS / 1000) }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.email, id: user._id.toString(), type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: Math.floor(REFRESH_EXP_MS / 1000) }
  );
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  ACCESS_EXP_MS,
  REFRESH_EXP_MS,
};
