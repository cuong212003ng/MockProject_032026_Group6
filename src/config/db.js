const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
};

const query = async (queryString, params = {}) => {
  const connectionPool = await getPool();
  const request = connectionPool.request();

  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

  return request.query(queryString);
};

module.exports = { query, sql };

const testConnection = async () => {
  try {
    const p = await getPool();
    if (p.connected) {
      console.log('✅ [SQL Server] Connection established successfully!');
      await p.request().query('SELECT 1'); 
    }
  } catch (err) {
    console.error('❌ [SQL Server] Connection failed!');
    console.error('Error Details:', err.message);
    console.log(`Server: ${process.env.DB_SERVER}, DB: ${process.env.DB_NAME}`);
  }
};

testConnection();