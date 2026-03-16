const studentService = require("../services/student.service");

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
      return res
        .status(400)
        .json({ message: "Invalid id. id must be an integer." });
    }

    const student = await studentService.getStudentById(parsedId);
    res.json(student);
  } catch (err) {
    next(err);
    return res.status(501).json({
      message:
        "PUT /api/students/:id - Chức năng cập nhật sinh viên chưa được triển khai.",
    });
  }
}

async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;
    const existingStudent = await studentService.getStudentById(id);

    if (!existingStudent) {
      return res.status(404).json({
        message: `Sinh viên với id ${id} không tồn tại.`,
      });
    }

    await studentService.deleteStudent(id);

    return res.status(200).json({
      message: `Đã xóa thành công sinh viên với id ${id}.`,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  deleteStudent,
};
