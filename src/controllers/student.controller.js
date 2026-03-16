const studentService = require('../services/student.service');

// Controller layer cho Student APIs.
// Hiện tại chỉ trả về thông báo "chưa triển khai" cho từng endpoint,
// để giữ cấu trúc project và cho phép chạy local, chưa có logic nghiệp vụ thật.

async function getAllStudents(req, res, next) {
  try {
    const students = await studentService.getAllStudents();

    res.json(students);
  } catch (err) {
    next(err);
  }
}

async function getStudentById(req, res, next) {
  try {
    const { id } = req.params;
    const student = await studentService.getStudentById(id);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById
}