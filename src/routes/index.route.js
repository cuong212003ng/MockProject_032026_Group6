const express = require('express');
const router = express.Router();   

const studentRoutes = require('./student.route');

router.use('/students', studentRoutes);

module.exports = router;