const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response.helper');

// ── Reusable middleware to collect and return validation errors ──
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      errors
        .array()
        .map((e) => e.msg)
        .join(', '),
      422,
      errors.array(),
    );
  }
  next();
};

// ── Auth validators ───────────────────────────────────────
const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Username or email is required')
    .trim(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidation,
];

const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3–50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username may only contain letters, digits, and underscores')
    .trim(),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'USER'])
    .withMessage('Role must be ADMIN or USER'),
  handleValidation,
];

const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateLogin,
  validateRegister,
  validateRefreshToken,
};
