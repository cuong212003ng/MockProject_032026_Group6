const express = require('express');
const crmController = require('../controllers/crm.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

/**
 * @swagger
 * tags:
 *   name: CRM
 *   description: CRM dashboard and customer list
 */

/**
 * @swagger
 * /api/v1/crm/customers:
 *   get:
 *     summary: Get customer list with filters and pagination
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [B2B, B2C]
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, InProgress, Inactive]
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [id, customer_name, customer_type, industry, status, annual_revenue_usd, created_at]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Customer list
 */
router.get('/customers', crmController.getCustomers);

/**
 * @swagger
 * /api/v1/crm/customers/{id}/status:
 *   patch:
 *     summary: Update customer status
 *     tags: [CRM]
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
 *                 enum: [Active, InProgress, Inactive]
 *     responses:
 *       200:
 *         description: Customer status updated
 */
router.patch('/customers/:id/status', crmController.updateCustomerStatus);

/**
 * @swagger
 * /api/v1/crm/dashboard/overview:
 *   get:
 *     summary: Get dashboard enterprise overview
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview
 */
router.get('/dashboard/overview', crmController.getDashboardOverview);

/**
 * @swagger
 * /api/v1/crm/dashboard/top-clients:
 *   get:
 *     summary: Get top clients by revenue
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: Top clients
 */
router.get('/dashboard/top-clients', crmController.getTopClients);

/**
 * @swagger
 * /api/v1/crm/dashboard/revenue-trend:
 *   get:
 *     summary: Get monthly revenue trend
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue trend data points
 */
router.get('/dashboard/revenue-trend', crmController.getRevenueTrend);

/**
 * @swagger
 * /api/v1/crm/dashboard/alerts:
 *   get:
 *     summary: Get overdue invoices and contracts nearing expiration
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard alerts
 */
router.get('/dashboard/alerts', crmController.getAlerts);

module.exports = router;
