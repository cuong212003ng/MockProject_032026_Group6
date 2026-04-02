<<<<<<< HEAD
<<<<<<< HEAD
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const { env } = require('./env');

const [dbHost, dbInstance] = env.dbServer.split('\\');

const masterConfig = {
  server: dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: 'master',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: dbInstance || process.env.DB_INSTANCE || undefined,
  },
};

if (!masterConfig.options.instanceName) {
  masterConfig.port = env.dbPort;
}

const executeSqlFile = async (pool, filePath) => {
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  const batches = sqlContent
    .split(/^\s*GO\s*$/im)
    .map((batch) => batch.trim())
    .filter((batch) => batch.length > 0);

  for (const batch of batches) {
    await pool.request().query(batch);
  }
};

const initDb = async () => {
  let pool = null;

  try {
    console.log('[initDb] Checking database scripts...');
    pool = await sql.connect(masterConfig);

    const scriptPaths = [
      path.join(__dirname, '../../database/init.sql'),
      path.join(__dirname, '../../database/auth.sql'),
    ];

    for (const scriptPath of scriptPaths) {
      if (fs.existsSync(scriptPath)) {
        await executeSqlFile(pool, scriptPath);
      }
    }

    console.log('[initDb] Database notarial_db is ready');
  } catch (error) {
    console.error('[initDb] Database initialization failed:', error.message);
=======
const sql = require('mssql');
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
const { env } = require('./env');

const [dbHost, dbInstance] = env.dbServer.split('\\');

const masterConfig = {
  server: dbHost,
  user: env.dbUser,
  password: env.dbPassword,
  database: 'master',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: dbInstance || process.env.DB_INSTANCE || undefined,
  },
};

if (!masterConfig.options.instanceName) {
  masterConfig.port = env.dbPort;
}

const executeSqlFile = async (pool, filePath) => {
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  const batches = sqlContent
    .split(/^\s*GO\s*$/im)
    .map((batch) => batch.trim())
    .filter((batch) => batch.length > 0);

  for (const batch of batches) {
    await pool.request().query(batch);
  }
};

const initDb = async () => {
  let pool = null;

  try {
    console.log('[initDb] Checking database scripts...');
    pool = await sql.connect(masterConfig);

    const scriptPaths = [
      path.join(__dirname, '../../database/init.sql'),
      path.join(__dirname, '../../database/auth.sql'),
    ];

    for (const scriptPath of scriptPaths) {
      if (fs.existsSync(scriptPath)) {
        await executeSqlFile(pool, scriptPath);
      }
    }

<<<<<<< HEAD
    console.log('✅ [initDb] Database notarial_db đã sẵn sàng!');
  } catch (err) {
    console.error('❌ [initDb] Lỗi khởi tạo database:', err.message);
    // Không throw — server vẫn chạy, chỉ log lỗi
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    console.log('[initDb] Database notarial_db is ready');
  } catch (error) {
    console.error('[initDb] Database initialization failed:', error.message);
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

module.exports = initDb;
