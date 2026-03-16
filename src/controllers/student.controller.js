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
    const parsedId = Number.parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid id. id must be an integer.' });
    }

    const student = await studentService.getStudentById(parsedId);
    res.json(student);
  } catch (err) {
    next(err);
  }
}

async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;
    const parsedId = Number.parseInt(id, 10);
    if (Number.isNaN(parsedId)) {
      return res.status(400).json({ message: 'Invalid id. id must be an integer.' });
    }

    const student = await studentService.getStudentById(parsedId);
    if (!student) {
      return res.status(404).json({ message: 'Student Not Found' });
    }

    const updated = await studentService.updateStudent(parsedId, req.body);
    if (updated) {
      res.json({ message: 'Student updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update student' });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudent
}
