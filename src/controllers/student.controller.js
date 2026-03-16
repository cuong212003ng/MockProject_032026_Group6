const studentService = require('../services/student.service');

// Controller layer cho Student APIs.
// Hiện tại chỉ trả về thông báo "chưa triển khai" cho từng endpoint,
// để giữ cấu trúc project và cho phép chạy local, chưa có logic nghiệp vụ thật.

async function getAllStudents(req, res, next) {
  try {
    await studentService.getAllStudents();

    return res.status(501).json({
      message: 'GET /api/students - Chức năng lấy danh sách sinh viên chưa được triển khai.',
    });
  } catch (err) {
    return next(err);
  }
}

async function createStudent(req, res, next) {
  try {
    await studentService.createStudent(req.body);

    return res.status(501).json({
      message: 'POST /api/students - Chức năng thêm mới sinh viên chưa được triển khai.',
    });
  } catch (err) {
    return next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    await studentService.updateStudent(id, req.body);

    return res.status(501).json({
      message: 'PUT /api/students/:id - Chức năng cập nhật sinh viên chưa được triển khai.',
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    await studentService.deleteStudent(id);

    return res.status(501).json({
      message: 'DELETE /api/students/:id - Chức năng xóa sinh viên chưa được triển khai.',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
};