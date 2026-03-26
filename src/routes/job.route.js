const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
<<<<<<< HEAD

// router.use(authenticate); // TODO: bật lại khi deploy

/**
 * @swagger
 * tags:
 *   name: Scheduling
 *   description: Job scheduling and assignment management
 */

/**
 * @swagger
 * /api/v1/scheduling/jobs:
 *   get:
 *     summary: Get list of jobs
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Assigned, Completed, Cancelled]
 *         description: Filter by job status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of jobs returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/jobs', jobController.getJobsList);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}:
 *   get:
 *     summary: Get job details
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:id', jobController.getJobDetail);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/notary_availabilities:
 *   get:
 *     summary: Find available notaries matching job schedule and capabilities
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of matching notaries
 */
router.get('/jobs/:id/notary_availabilities', jobController.findNotaries);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/job_assignments:
 *   post:
 *     summary: Assign a job to a notary
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notary_id
 *             properties:
 *               notary_id:
 *                 type: integer
 *                 description: ID of the notary to assign
 *     responses:
 *       201:
 *         description: Job assigned successfully
 *       400:
 *         description: Bad request
 */
router.post('/jobs/:id/job_assignments', jobController.assignJob);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/job_assignments/{assignmentId}/accept:
 *   patch:
 *     summary: Notary accepts a job assignment
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment accepted
 */
router.patch('/jobs/:id/job_assignments/:assignmentId/accept', jobController.acceptJob);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/job_status:
 *   patch:
 *     summary: Update job status
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Assigned, Completed, Cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/jobs/:id/job_status', jobController.updateJobStatus);

/**
 * @swagger
 * /api/v1/scheduling/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics returned
 */
router.get('/metrics', jobController.getDashboardMetrics);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/timeline:
 *   get:
 *     summary: Get job change timeline / audit log
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Timeline entries
 */
router.get('/jobs/:id/timeline', jobController.getJobTimeline);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}:
 *   put:
 *     summary: Re-assign or edit a job
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notary_id:
 *                 type: integer
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated
 */
router.put('/jobs/:id', jobController.updateJob);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/notifications:
 *   get:
 *     summary: Get notification history for a job
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification history
 */
=======
const { authenticate } = require('../middlewares/auth.middleware');

// router.use(authenticate); // TODO: bật lại khi deploy

/**
 * @swagger
 * tags:
 *   name: Scheduling
 *   description: Job scheduling and assignment management
 */

/**
 * @swagger
 * /api/v1/scheduling/jobs:
 *   get:
 *     summary: Get list of jobs
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Assigned, Completed, Cancelled]
 *         description: Filter by job status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of jobs returned successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/jobs', jobController.getJobsList);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}:
 *   get:
 *     summary: Get job details
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/jobs/:id', jobController.getJobDetail);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/notary_availabilities:
 *   get:
 *     summary: Find available notaries matching job schedule and capabilities
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: List of matching notaries
 */
router.get('/jobs/:id/notary_availabilities', jobController.findNotaries);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/job_assignments:
 *   post:
 *     summary: Assign a job to a notary
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notary_id
 *             properties:
 *               notary_id:
 *                 type: integer
 *                 description: ID of the notary to assign
 *     responses:
 *       201:
 *         description: Job assigned successfully
 *       400:
 *         description: Bad request
 */
router.post('/jobs/:id/job_assignments', jobController.assignJob);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/job_assignments/{assignmentId}/accept:
 *   patch:
 *     summary: Notary accepts a job assignment
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment accepted
 */
router.patch('/jobs/:id/job_assignments/:assignmentId/accept', jobController.acceptJob);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/job_status:
 *   patch:
 *     summary: Update job status
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Assigned, Completed, Cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch('/jobs/:id/job_status', jobController.updateJobStatus);

/**
 * @swagger
 * /api/v1/scheduling/metrics:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics returned
 */
router.get('/metrics', jobController.getDashboardMetrics);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/timeline:
 *   get:
 *     summary: Get job change timeline / audit log
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Timeline entries
 */
router.get('/jobs/:id/timeline', jobController.getJobTimeline);

/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}:
 *   put:
 *     summary: Re-assign or edit a job
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notary_id:
 *                 type: integer
 *               scheduled_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Job updated
 */
router.put('/jobs/:id', jobController.updateJob);

<<<<<<< HEAD
// 10. Lấy lịch sử thông báo của Job
>>>>>>> 5dc67de (initial: setup project with proper gitignore)
=======
/**
 * @swagger
 * /api/v1/scheduling/jobs/{id}/notifications:
 *   get:
 *     summary: Get notification history for a job
 *     tags: [Scheduling]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification history
 */
>>>>>>> dabfe06 (feat/init databse and code base (#52))
router.get('/jobs/:id/notifications', jobController.getJobNotifications);

module.exports = router;
