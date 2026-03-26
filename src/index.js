const express = require('express');
require('dotenv').config();

const jobRoute = require('./routes/job.route');
const notaryRoute = require('./routes/notary.route');
const authRoute = require('./routes/auth.route');
const initDb = require('./config/initDb');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/scheduling', jobRoute);
app.use('/api/v1/notaries', notaryRoute);

// ── Swagger UI ────────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Scheduling Service is running', data: null });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});

(async () => {
  await initDb(); // Tự tạo DB + bảng nếu chưa có
  app.listen(PORT, () => {
    console.log(`Scheduling Service running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
})();

module.exports = app;

