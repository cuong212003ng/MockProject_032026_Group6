// Tầng model tạm thời cho thực thể Sinh viên.
// File này định nghĩa các "hợp đồng" (contract) cho các hàm truy xuất dữ liệu.
// Các thành viên khác trong nhóm sẽ hiện thực (implement) các hàm này sau
// để làm việc với cơ sở dữ liệu thật (ví dụ: MySQL, MongoDB, PostgreSQL, ...).

async function findAll() {
  return [
    { id: 1, name: 'Nguyen Van A' },
    { id: 2, name: 'Tran Thi B' },
  ];
}

async function findById(id) {
  throw new Error('StudentModel.findById is not implemented yet');
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

