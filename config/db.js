const sql = require('mssql');

const config = {
    user: "sa   ",
    password: "123456",
    server: "localhost",
    port: 1433,
    database: "StudentManagement",
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

async function query(queryString, params = []) {
  await poolConnect;
  const request = pool.request();
  params.forEach(({ name, type, value }) => {
    request.input(name, type, value);
  });
  const result = await request.query(queryString);
  return result;
}

module.exports = { sql, query };