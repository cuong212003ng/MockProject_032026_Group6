const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const { env } = require('../config/env');
const notaryModel = require('../models/notary.model');
const { sendError } = require('../utils/response.helper');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
=======
const { sendError } = require('../utils/response.helper');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
    return sendError(res, 'Access token is required', 401);
  }

  try {
<<<<<<< HEAD
    const decoded = jwt.verify(token, env.jwtSecret);
=======
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

<<<<<<< HEAD
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, `Access denied. Requires role: ${roles.join(', ')}`, 403);
    }

    next();
  };

const authorizeNotaryOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    const notary = await notaryModel.findById(req.params.id);
    if (!notary) {
      return sendError(res, `Notary #${req.params.id} not found`, 404);
    }

    if (String(notary.user_id) !== String(req.user.id)) {
      return sendError(res, 'Access denied', 403);
    }

    req.notary = notary;
    next();
  } catch (error) {
    return sendError(res, 'Failed to validate notary ownership', 500);
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeNotaryOwnerOrAdmin,
};
=======
module.exports = { authenticate };
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
