const sql = require('mssql');
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
  Object.entries(params).forEach(([key, value]) => {
    request.input(key, value);
  });

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
