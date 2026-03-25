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
    console.log(`Server: ${process.env.DB_SERVER}, DB: ${process.env.DB_NAME}`);
  }
};

testConnection();
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
