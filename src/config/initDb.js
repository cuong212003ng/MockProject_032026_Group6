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
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const masterConfig = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'master', // kết nối vào master trước
  options: {
    encrypt: false,
    trustServerCertificate: true,
    instanceName: process.env.DB_INSTANCE || undefined, // lấy từ .env nếu có
  },
};

const initDb = async () => {
  let pool = null;
  try {
    console.log('🔄 [initDb] Đang kiểm tra database...');

    pool = await sql.connect(masterConfig);

    // Đọc toàn bộ file init.sql
    const sqlFilePath = path.join(__dirname, '../../database/init.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Tách theo GO (batch separator của SQL Server)
    // Loại bỏ các batch rỗng
    const batches = sqlContent
      .split(/^\s*GO\s*$/im)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    for (const batch of batches) {
      await pool.request().query(batch);
    }

    console.log('✅ [initDb] Database notarial_db đã sẵn sàng!');
  } catch (err) {
    console.error('❌ [initDb] Lỗi khởi tạo database:', err.message);
    // Không throw — server vẫn chạy, chỉ log lỗi
>>>>>>> dabfe06 (feat/init databse and code base (#52))
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

module.exports = initDb;
