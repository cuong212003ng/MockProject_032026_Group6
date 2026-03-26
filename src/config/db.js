const sql = require('mssql');
require('dotenv').config();

const dbServer = process.env.DB_SERVER || 'localhost';
const [host, instance] = dbServer.split('\\');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: host,
  database: process.env.DB_NAME || 'notarial_db',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: instance || process.env.DB_INSTANCE || undefined,
  },
};

// Nếu không dùng Named Instance thì mới dùng static port
if (!config.options.instanceName) {
  config.port = parseInt(process.env.DB_PORT) || 1433;
}

const pool = new sql.ConnectionPool(config);

const getPool = async () => {
  if (!pool.connected) {
    await pool.connect();
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
    console.log(`Server: ${config.server}, DB: ${config.database}`);
  }
};

testConnection();
