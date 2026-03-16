const studentModel = require('../models/student.model');

// Tầng service cho nghiệp vụ Sinh viên.
// Hiện tại, tất cả các hàm chỉ là bản mẫu (stub)
// để dự án có thể chạy được local mà chưa cần nghiệp vụ phức tạp.
// Các thành viên trong nhóm sẽ bổ sung thêm nghiệp vụ thực tế cho từng hàm.

async function getAllStudents() {
  // Lấy danh sách tất cả sinh viên
  // Gọi xuống tầng model: studentModel.findAll()
  const students = await studentModel.findAll();
  return students;
}

async function createStudent(data) {
  // Tạo mới một sinh viên
  // data: dữ liệu sinh viên nhận từ controller (req.body)
  // Gọi xuống tầng model để insert vào DB: studentModel.create(data)
  const created = await studentModel.create(data);
  return created;
}

async function updateStudent(id, data) {
  // Cập nhật thông tin một sinh viên theo id
  // id: id sinh viên cần cập nhật
  // data: dữ liệu mới cần cập nhật
  // Gọi xuống tầng model để update trong DB: studentModel.update(id, data)
  const updated = await studentModel.update(id, data);
  return updated;
}

async function deleteStudent(id) {
  // Xóa một sinh viên theo id
  // Gọi xuống tầng model để xóa trong DB: studentModel.remove(id)
  const deleted = await studentModel.remove(id);
  return deleted;
}

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};
