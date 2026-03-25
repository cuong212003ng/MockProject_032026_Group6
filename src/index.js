const express = require('express');
require('dotenv').config();

const jobRoute = require('./routes/job.route');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/scheduling', jobRoute);

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Scheduling Service is running', data: null });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
});

app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.message);
  res.status(500).json({ success: false, message: 'Internal Server Error', data: null });
});
app.listen(PORT, () => {
  console.log(`Scheduling Service running on port ${PORT}`);
});

module.exports = app;
