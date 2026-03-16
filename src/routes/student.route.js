const express = require('express');
const studentController = require('../controllers/student.controller');

const router = express.Router();

// Hiện tại các route chỉ map tới controller stub.
// Các member sẽ triển khai logic thật cho từng action trong controller/service/model.

// Danh sách sinh viên
router.get('/', studentController.getAllStudents);

module.exports = router;