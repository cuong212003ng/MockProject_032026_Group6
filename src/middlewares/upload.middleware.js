const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { env } = require('../config/env');
const { sendError } = require('../utils/response.helper');

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = path.join(env.uploadDir, 'notary-documents', String(req.params.id));
    fs.mkdirSync(directory, { recursive: true });
    cb(null, directory);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const baseName = path
      .basename(file.originalname || 'document', extension)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    cb(null, `${Date.now()}-${baseName || 'document'}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxFileSizeBytes,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error('Unsupported file type. Allowed types: PDF, JPG, JPEG, PNG, WEBP.'));
      return;
    }

    cb(null, true);
  },
});

const uploadDocumentFile = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return sendError(
        res,
        `File size exceeds ${env.maxFileSizeMb}MB limit`,
        422,
        [{ path: 'file', msg: `File size exceeds ${env.maxFileSizeMb}MB limit` }],
      );
    }

    if (error) {
      return sendError(res, error.message, 422, [{ path: 'file', msg: error.message }]);
    }

    if (req.file) {
      const relativeFilePath = path.relative(env.uploadDir, req.file.path).replace(/\\/g, '/');
      req.file.storageUrl = `/uploads/${relativeFilePath}`;
    }

    next();
  });
};

module.exports = {
  uploadDocumentFile,
  ALLOWED_MIME_TYPES,
};
