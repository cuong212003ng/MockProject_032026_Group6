const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

// 1. Lấy danh sách Job
router.get('/jobs', jobController.getJobsList);

// 2. Lấy chi tiết Job
router.get('/jobs/:id', jobController.getJobDetail);

// 3. Tìm Notary phù hợp theo lịch rảnh + năng lực
router.get('/jobs/:id/notary_availabilities', jobController.findNotaries);

// 4. Assign Job cho Notary
router.post('/jobs/:id/job_assignments', jobController.assignJob);

// 5. Notary xác nhận nhận Job
router.patch('/jobs/:id/job_assignments/:assignmentId/accept', jobController.acceptJob);

// 6. Cập nhật trạng thái Job
router.patch('/jobs/:id/job_status', jobController.updateJobStatus);

// 7. Lấy số liệu Dashboard Metrics
router.get('/metrics', jobController.getDashboardMetrics);

// 8. Lấy timeline / nhật ký thay đổi của Job
router.get('/jobs/:id/timeline', jobController.getJobTimeline);

// 9. Re-assign / Edit Job
router.put('/jobs/:id', jobController.updateJob);

// 10. Lấy lịch sử thông báo của Job
router.get('/jobs/:id/notifications', jobController.getJobNotifications);

module.exports = router;
