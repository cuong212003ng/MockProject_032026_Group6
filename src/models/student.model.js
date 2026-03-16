// Tầng model tạm thời cho thực thể Sinh viên.
// File này định nghĩa các "hợp đồng" (contract) cho các hàm truy xuất dữ liệu.
// Các thành viên khác trong nhóm sẽ hiện thực (implement) các hàm này sau
// để làm việc với cơ sở dữ liệu thật (ví dụ: MySQL, MongoDB, PostgreSQL, ...).

const { query } = require('../config/db');

const GET_ALL_STUDENTS_QUERY = `
  SELECT * FROM students
`;

const GET_STUDENT_BY_ID_QUERY = `
  SELECT * FROM students WHERE id = @id
`;

async function findAll() {
  const result = await query(GET_ALL_STUDENTS_QUERY);
  return result.recordset;
}

async function findById(id) {
  const result = await query(GET_STUDENT_BY_ID_QUERY, { id });
  return result.recordset[0];
}

async function create(data) {
  throw new Error('StudentModel.create is not implemented yet');
}

async function update(id, data) {
  throw new Error('StudentModel.update is not implemented yet');
}

async function remove(id) {
  throw new Error('StudentModel.remove is not implemented yet');
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};

