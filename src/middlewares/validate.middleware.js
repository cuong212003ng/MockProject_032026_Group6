const { body, param, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/response.helper');

const DOCUMENT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
const INCIDENT_STATUSES = ['OPEN', 'UNDER_REVIEW', 'RESOLVED'];
const INCIDENT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(
      res,
      errors
        .array()
        .map((error) => error.msg)
        .join(', '),
      422,
      errors.array(),
    );
  }

  next();
};

const validateDateRange = (fromField, toField) => (req, res, next) => {
  const fromDate = req.query[fromField];
  const toDate = req.query[toField];

  if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
    return sendError(res, `${fromField} must be earlier than or equal to ${toField}`, 422, [
      { path: fromField, msg: `${fromField} must be earlier than or equal to ${toField}` },
    ]);
  }

  next();
};

const requireUploadedFile = (req, res, next) => {
  if (!req.file) {
    return sendError(res, 'file is required', 422, [{ path: 'file', msg: 'file is required' }]);
  }

  next();
};

const normalizeDocumentUploadPayload = (req, res, next) => {
  if (!req.body.document_type && req.body.doc_category) {
    req.body.document_type = req.body.doc_category;
  }

  next();
};

const requireDocumentType = (req, res, next) => {
  if (!req.body.document_type) {
    return sendError(res, 'document_type is required', 422, [
      { path: 'document_type', msg: 'document_type is required' },
    ]);
  }

  next();
};

const validateLogin = [
  body('identifier').notEmpty().withMessage('Username or email is required').trim(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const validateRegister = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
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
  body('role').optional().isIn(['ADMIN', 'USER']).withMessage('Role must be ADMIN or USER'),
  handleValidation,
];

const validateRefreshToken = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
  handleValidation,
];

const validateNotaryIdParam = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  handleValidation,
];

const validateDocumentIdParams = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('docId').isInt({ min: 1 }).withMessage('docId must be a positive integer'),
  handleValidation,
];

const validateDocumentListQuery = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('document_type')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('document_type must not be empty'),
  query('status').optional().isIn(DOCUMENT_STATUSES).withMessage('Invalid document status'),
  query('from_date').optional().isISO8601().withMessage('from_date must be a valid ISO date'),
  query('to_date').optional().isISO8601().withMessage('to_date must be a valid ISO date'),
  handleValidation,
  validateDateRange('from_date', 'to_date'),
];

const validateDocumentUpload = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('document_type').optional().trim().notEmpty().withMessage('document_type must not be empty'),
  body('doc_category').optional().trim().notEmpty().withMessage('doc_category must not be empty'),
  handleValidation,
  requireDocumentType,
  requireUploadedFile,
];

const validateDocumentVerification = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('docId').isInt({ min: 1 }).withMessage('docId must be a positive integer'),
  body('status')
    .isIn(DOCUMENT_STATUSES)
    .withMessage('status must be PENDING, APPROVED, or REJECTED'),
  handleValidation,
];

const validateAuditLogQuery = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('from_date').optional().isISO8601().withMessage('from_date must be a valid ISO date'),
  query('to_date').optional().isISO8601().withMessage('to_date must be a valid ISO date'),
  handleValidation,
  validateDateRange('from_date', 'to_date'),
];

const validateIncidentListQuery = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('status').optional().isIn(INCIDENT_STATUSES).withMessage('Invalid incident status'),
  handleValidation,
];

const validateIncidentCreate = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('incident_type').optional().trim(),
  body('description').optional().isString().withMessage('description must be a string'),
  body('severity').optional().isIn(INCIDENT_SEVERITIES).withMessage('Invalid incident severity'),
  body('status').optional().isIn(INCIDENT_STATUSES).withMessage('Invalid incident status'),
  handleValidation,
];

const validateBioUpdate = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('phone').optional().isString().withMessage('phone must be a string'),
  body('email').optional().isEmail().withMessage('email must be a valid email'),
  body('residential_address')
    .optional()
    .isString()
    .withMessage('residential_address must be a string'),
  body('internal_notes').optional().isString().withMessage('internal_notes must be a string'),
  body('photo_url').optional().isString().withMessage('photo_url must be a string'),
  handleValidation,
];

const validateToggleStatus = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('is_active').isBoolean().withMessage('is_active must be a boolean'),
  handleValidation,
];

// dev-trongtuan
const validateNotaryAndCommissionIdParams = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('commission_id').isInt({ min: 1 }).withMessage('commission_id must be a positive integer'),
  handleValidation,
];

const validatePersonalInfoUpdate = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('email').optional().isEmail().withMessage('email must be a valid email'),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('phone must not be empty')
    .matches(/^[0-9+\-().\s]{7,20}$/)
    .withMessage('phone contains invalid characters'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('dob must be a valid date')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      if (Number.isNaN(dob.getTime()) || dob >= today) {
        throw new Error('dob must be a date in the past');
      }
      return true;
    }),
  body('address').optional().isObject().withMessage('address must be an object'),
  body('address.street')
    .if(body('address').exists())
    .isString()
    .trim()
    .notEmpty()
    .withMessage('address.street is required'),
  body('address.city')
    .if(body('address').exists())
    .isString()
    .trim()
    .notEmpty()
    .withMessage('address.city is required'),
  body('address.state')
    .if(body('address').exists())
    .isString()
    .trim()
    .notEmpty()
    .withMessage('address.state is required'),
  body('address.zip_code')
    .if(body('address').exists())
    .isString()
    .trim()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('address.zip_code must be a valid US ZIP code'),
  handleValidation,
];

const validateCommissionListQuery = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
  query('status')
    .optional()
    .trim()
    .escape()
    .isIn(['Valid', 'Not eligible', 'Expired'])
    .withMessage('status must be one of Valid, Not eligible, Expired'),
  query('state')
    .optional()
    .trim()
    .escape()
    .matches(/^[a-zA-Z\s]{2,60}$/)
    .withMessage('state contains invalid characters'),
  query('expiration_date')
    .optional()
    .trim()
    .matches(/^(\d+\s*days?\s*left|\d{4}-\d{2}-\d{2})$/i)
    .withMessage('expiration_date must be YYYY-MM-DD or "<n> days left"'),
  query('search')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 100 })
    .withMessage('search is too long'),
  handleValidation,
];

const validateCommissionPayload = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  body('commission_number')
    .notEmpty()
    .withMessage('commission_number is required')
    .isString()
    .withMessage('commission_number must be a string')
    .trim(),
  body('state')
    .notEmpty()
    .withMessage('state is required')
    .isString()
    .withMessage('state must be a string')
    .trim()
    .matches(/^[a-zA-Z\s]{2,60}$/)
    .withMessage('state contains invalid characters'),
  body('issue_date')
    .notEmpty()
    .withMessage('issue_date is required')
    .isISO8601()
    .withMessage('issue_date must be a valid date'),
  body('expiration_date')
    .notEmpty()
    .withMessage('expiration_date is required')
    .isISO8601()
    .withMessage('expiration_date must be a valid date'),
  body('issue_date').custom((value, { req }) => {
    const issueDate = new Date(value);
    const expirationDate = new Date(req.body.expiration_date);
    if (issueDate >= expirationDate) {
      throw new Error('issue_date must be before expiration_date');
    }
    return true;
  }),
  handleValidation,
];

const validateCommissionUpdatePayload = [
  param('id').isInt({ min: 1 }).withMessage('id must be a positive integer'),
  param('commission_id').isInt({ min: 1 }).withMessage('commission_id must be a positive integer'),
  body('commission_number')
    .notEmpty()
    .withMessage('commission_number is required')
    .isString()
    .withMessage('commission_number must be a string')
    .trim(),
  body('state')
    .notEmpty()
    .withMessage('state is required')
    .isString()
    .withMessage('state must be a string')
    .trim()
    .matches(/^[a-zA-Z\s]{2,60}$/)
    .withMessage('state contains invalid characters'),
  body('issue_date')
    .notEmpty()
    .withMessage('issue_date is required')
    .isISO8601()
    .withMessage('issue_date must be a valid date'),
  body('expiration_date')
    .notEmpty()
    .withMessage('expiration_date is required')
    .isISO8601()
    .withMessage('expiration_date must be a valid date'),
  body('issue_date').custom((value, { req }) => {
    const issueDate = new Date(value);
    const expirationDate = new Date(req.body.expiration_date);
    if (issueDate >= expirationDate) {
      throw new Error('issue_date must be before expiration_date');
    }
    return true;
  }),
  handleValidation,
];

module.exports = {
  handleValidation,
  normalizeDocumentUploadPayload,
  validateLogin,
  validateRegister,
  validateRefreshToken,
  validateNotaryIdParam,
  validateNotaryAndCommissionIdParams,
  validateDocumentIdParams,
  validateDocumentListQuery,
  validateDocumentUpload,
  validateDocumentVerification,
  validateAuditLogQuery,
  validateIncidentListQuery,
  validateIncidentCreate,
  validateBioUpdate,
  validateToggleStatus,
  validatePersonalInfoUpdate,
  validateCommissionListQuery,
  validateCommissionPayload,
  validateCommissionUpdatePayload,
};
