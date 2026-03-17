// Tầng model tạm thời cho thực thể Sinh viên.
// File này định nghĩa các "hợp đồng" (contract) cho các hàm truy xuất dữ liệu.
// Các thành viên khác trong nhóm sẽ hiện thực (implement) các hàm này sau
// để làm việc với cơ sở dữ liệu thật (ví dụ: MySQL, MongoDB, PostgreSQL, ...).

const { sql, query } = require('../config/db');

const GET_ALL_STUDENTS_QUERY = `
  SELECT * FROM students
`;

const GET_STUDENT_BY_ID_QUERY = `
  SELECT * FROM students WHERE id = @id
`;

const CREATE_STUDENT_QUERY = `
  INSERT INTO students (full_name, class_name, major)
  OUTPUT INSERTED.*
  VALUES (@full_name, @class_name, @major)
`;

async function findAll() {
  const result = await query(GET_ALL_STUDENTS_QUERY);
  return result.recordset;
}

async function findById(id) {
  const parsedId = Number.parseInt(id, 10);
  const result = await query(GET_STUDENT_BY_ID_QUERY, [
    { name: 'id', type: sql.Int, value: parsedId },
  ]);
  return result.recordset[0];
}

async function create(data) {
  const { full_name, class_name, major } = data;
  const result = await query(CREATE_STUDENT_QUERY, [
    { name: 'full_name', type: sql.NVarChar, value: full_name },
    { name: 'class_name', type: sql.NVarChar, value: class_name },
    { name: 'major', type: sql.NVarChar, value: major },
  ]);
  return result.recordset[0];
}

async function update(id, data) {
  const parsedId = Number.parseInt(id, 10);
  const { full_name, class_name, major } = data;

  const UPDATE_STUDENT_QUERY = `
    UPDATE students 
    SET full_name = @full_name, 
        class_name = @class_name, 
        major = @major 
    WHERE id = @id
  `;

  const result = await query(UPDATE_STUDENT_QUERY, [
    { name: 'id', type: sql.Int, value: parsedId },
    { name: 'full_name', type: sql.NVarChar, value: full_name },
    { name: 'class_name', type: sql.NVarChar, value: class_name },
    { name: 'major', type: sql.NVarChar, value: major },
  ]);

  return result.rowsAffected[0] > 0;
}

async function remove(id) {
  const parsedId = Number.parseInt(id, 10);
  const DELETE_STUDENT_QUERY = `
    DELETE FROM students WHERE id = @id
  `;
  const result = await query(DELETE_STUDENT_QUERY, [
    { name: 'id', type: sql.Int, value: parsedId },
  ]);
  return result.rowsAffected[0] > 0;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};

