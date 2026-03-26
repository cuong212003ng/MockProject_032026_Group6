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
  } finally {
    if (pool) {
      await pool.close();
    }
  }
};

module.exports = initDb;
