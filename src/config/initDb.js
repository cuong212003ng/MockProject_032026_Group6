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
      path.join(__dirname, '../../database/crm.sql'),
    ];

    for (const scriptPath of scriptPaths) {
      if (fs.existsSync(scriptPath)) {
        await executeSqlFile(pool, scriptPath);
      }
    }

    console.log('[initDb] Database notarial_db is ready');
  } catch (error) {
    console.error('[initDb] Database initialization failed:', error.message);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

module.exports = initDb;
