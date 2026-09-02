const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Verifies the JWT access token from the httpOnly cookie (or Authorization header)
// and attaches req.user (Mongoose doc) + req.userEmail to the request.
async function authenticate(req, res, next) {
  try {
    const cookieName = process.env.JWT_COOKIE_NAME || 'jwt';
    let token = req.cookies?.[cookieName];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.slice(7);
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const payload = verifyToken(token);

    if (payload.type === 'refresh') {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    const user = await User.findById(payload.id);

    if (!user || !user.enabled || user.status !== 'ACTIVE') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    req.user = user;
    req.userEmail = user.email;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

module.exports = { authenticate, requireAdmin };
