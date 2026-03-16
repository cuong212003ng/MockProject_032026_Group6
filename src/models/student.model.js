// Tầng model tạm thời cho thực thể Sinh viên.
// File này định nghĩa các "hợp đồng" (contract) cho các hàm truy xuất dữ liệu.
// Các thành viên khác trong nhóm sẽ hiện thực (implement) các hàm này sau
// để làm việc với cơ sở dữ liệu thật (ví dụ: MySQL, MongoDB, PostgreSQL, ...).

async function findAll() {
  return [
    { id: 1, name: 'Nguyen Van A', major: 'IT' },
    { id: 2, name: 'Tran Thi B', major: 'Math' },
    { id: 3, name: 'Le Van C', major: 'Physics' },
  ];
}

async function findById(id) {
  const students = await findAll();
  const numericId = Number(id);
  const student = students.find((s) => s.id === numericId);
  return student || null;
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

