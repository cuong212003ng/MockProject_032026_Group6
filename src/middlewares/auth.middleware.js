const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response.helper');

// ── authenticate: verify JWT access token ─────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return sendError(res, 'Access token is required', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

// ── authorize: RBAC role guard ────────────────────────────
// Usage: authorize('ADMIN') or authorize('ADMIN', 'USER')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied — requires role: ${roles.join(' | ')}`, 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
