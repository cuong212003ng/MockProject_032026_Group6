const path = require('path');
require('dotenv').config();

const toInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInteger(process.env.PORT, 3001),
  dbServer: process.env.DB_SERVER || 'localhost',
  dbPort: toInteger(process.env.DB_PORT, 1433),
  dbUser: process.env.DB_USER || 'sa',
  dbPassword: process.env.DB_PASSWORD || '123456',
  dbName: process.env.DB_NAME || 'notarial_db',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'uploads'),
  maxFileSizeMb: toInteger(process.env.MAX_FILE_SIZE_MB, 10),
};

env.maxFileSizeBytes = env.maxFileSizeMb * 1024 * 1024;

const assertRequiredEnv = (keys) => {
  const missingKeys = keys.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }
};

module.exports = { env, assertRequiredEnv };
