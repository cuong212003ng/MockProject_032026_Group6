const sql = require('mssql');
<<<<<<< HEAD
const { env } = require('./env');

const [host, instance] = env.dbServer.split('\\');

const config = {
  user: env.dbUser,
  password: env.dbPassword,
  server: host,
  database: env.dbName,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: instance || process.env.DB_INSTANCE || undefined,
  },
};

if (!config.options.instanceName) {
  config.port = env.dbPort;
}

const pool = new sql.ConnectionPool(config);

const getPool = async () => {
  if (!pool.connected) {
    await pool.connect();
  }

  return pool;
};

const bindParams = (request, params = {}) => {
=======
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

>>>>>>> 5dc67de (initial: setup project with proper gitignore)
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

<<<<<<< HEAD
  return request;
};

const createQueryExecutor = (requestFactory) => async (queryString, params = {}) => {
  const request = await requestFactory();
  bindParams(request, params);
  return request.query(queryString);
};

const query = createQueryExecutor(async () => {
  const connectionPool = await getPool();
  return connectionPool.request();
});

const withTransaction = async (callback) => {
  const connectionPool = await getPool();
  const transaction = new sql.Transaction(connectionPool);

  await transaction.begin();

  try {
    const txQuery = createQueryExecutor(async () => new sql.Request(transaction));
    const result = await callback({ query: txQuery, transaction, sql });
    await transaction.commit();
    return result;
  } catch (error) {
    if (!transaction._aborted) {
      await transaction.rollback();
    }

    throw error;
  }
};

module.exports = { query, sql, getPool, withTransaction };

const testConnection = async () => {
  try {
    const connectionPool = await getPool();
    if (connectionPool.connected) {
      console.log('[SQL Server] Connection established successfully');
      await connectionPool.request().query('SELECT 1');
    }
  } catch (error) {
    console.error('[SQL Server] Connection failed');
    console.error('Error Details:', error.message);
    console.log(`Server: ${config.server}, DB: ${config.database}`);
  }
};

if (env.nodeEnv !== 'test') {
  testConnection();
}
=======
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
<<<<<<< HEAD
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
=======
>>>>>>> dabfe06 (feat/init databse and code base (#52))
