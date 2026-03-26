const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { env, assertRequiredEnv } = require('./config/env');
const initDb = require('./config/initDb');
const swaggerSpec = require('./config/swagger');
const authRoute = require('./routes/auth.route');
const jobRoute = require('./routes/job.route');
const notaryRoute = require('./routes/notary.route');
const { sendSuccess, sendError } = require('./utils/response.helper');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(env.uploadDir)));

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/scheduling', jobRoute);
app.use('/api/v1/notaries', notaryRoute);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/health', (req, res) => sendSuccess(res, null, 'Notarial Service is running'));

app.use((req, res) => sendError(res, 'Route not found', 404));

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error('[GlobalError]', error.message);
  return sendError(res, 'Internal Server Error', 500);
});

const startServer = async () => {
  assertRequiredEnv([
    'DB_SERVER',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'UPLOAD_DIR',
    'MAX_FILE_SIZE_MB',
  ]);

  await initDb();

  app.listen(env.port, () => {
    console.log(`Notarial Service running on port ${env.port}`);
    console.log(`Swagger UI: http://localhost:${env.port}/api-docs`);
  });
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error('[StartupError]', error.message);
    process.exit(1);
  });
}

module.exports = app;
