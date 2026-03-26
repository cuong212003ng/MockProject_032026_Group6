const express = require('express');
const router = express.Router();
const notaryController = require('../controllers/notary.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// router.use(authenticate); // TODO: bật lại khi deploy

/**
 * @swagger
 * tags:
 *   name: Notaries
 *   description: Notary profile management
 */

// ── Profile ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries:
 *   get:
 *     summary: Get list of notaries
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, PENDING]
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State code or state name
 *       - in: query
 *         name: capability
 *         schema:
 *           type: string
 *           enum: [mobile, RON, loan_signing, apostille]
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
 *         description: List of notaries
 *       401:
 *         description: Unauthorized
 */
router.get('/', notaryController.getNotaryList);

/**
 * @swagger
 * /api/v1/notaries:
 *   post:
 *     summary: Create a new notary profile
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *             properties:
 *               user_id:
 *                 type: integer
 *               ssn:
 *                 type: string
 *               full_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               photo_url:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               employment_type:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               internal_notes:
 *                 type: string
 *               residential_address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notary created
 *       400:
 *         description: Bad request
 */
router.post('/', notaryController.createNotary);

/**
 * @swagger
 * /api/v1/notaries/{id}:
 *   get:
 *     summary: Get notary profile by ID
 *     tags: [Notaries]
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
 *         description: Notary profile
 *       404:
 *         description: Not found
 */
router.get('/:id', notaryController.getNotaryById);

/**
 * @swagger
 * /api/v1/notaries/{id}/bio:
 *   patch:
 *     summary: Update notary bio (phone, email, address, photo, notes)
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               residential_address:
 *                 type: string
 *               internal_notes:
 *                 type: string
 *               photo_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bio updated
 */
router.patch('/:id/bio', notaryController.updateBio);

/**
 * @swagger
 * /api/v1/notaries/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a notary
 *     tags: [Notaries]
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
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.patch('/:id/status', notaryController.toggleStatus);

/**
 * @swagger
 * /api/v1/notaries/{id}/overview:
 *   get:
 *     summary: Get notary KPI overview (jobs completed, error rate, alerts)
 *     tags: [Notaries]
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
 *         description: KPI overview data
 */
router.get('/:id/overview', notaryController.getOverview);

/**
 * @swagger
 * /api/v1/notaries/{id}/status-history:
 *   get:
 *     summary: Get notary status change history
 *     tags: [Notaries]
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
 *         description: Status history list
 */
router.get('/:id/status-history', notaryController.getStatusHistory);

// ── Legal / Commissions ───────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries/{id}/commissions:
 *   get:
 *     summary: Get notary commissions with risk status
 *     tags: [Notaries]
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
 *         description: Commission list with risk_status (VALID | EXPIRING_SOON | EXPIRED)
 */
router.get('/:id/commissions', notaryController.getCommissions);

/**
 * @swagger
 * /api/v1/notaries/{id}/commissions:
 *   post:
 *     summary: Create a new commission for a notary
 *     tags: [Notaries]
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
 *               - commission_number
 *               - issue_date
 *               - expiration_date
 *             properties:
 *               commission_state_id:
 *                 type: integer
 *               commission_number:
 *                 type: string
 *               issue_date:
 *                 type: string
 *                 format: date
 *               expiration_date:
 *                 type: string
 *                 format: date
 *               is_renewal_applied:
 *                 type: boolean
 *               expected_renewal_date:
 *                 type: string
 *                 format: date
 *               authority_types:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Commission created
 */
router.post('/:id/commissions', notaryController.createCommission);

/**
 * @swagger
 * /api/v1/notaries/{id}/commissions/{cid}:
 *   patch:
 *     summary: Update a commission
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: cid
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commission_number:
 *                 type: string
 *               issue_date:
 *                 type: string
 *                 format: date
 *               expiration_date:
 *                 type: string
 *                 format: date
 *               is_renewal_applied:
 *                 type: boolean
 *               expected_renewal_date:
 *                 type: string
 *                 format: date
 *               authority_types:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Commission updated
 */
router.patch('/:id/commissions/:cid', notaryController.updateCommission);

// ── Compliance (Bond & Insurance) ────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries/{id}/compliance:
 *   get:
 *     summary: Get notary compliance info (bonds & insurances)
 *     tags: [Notaries]
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
 *         description: Bond and insurance details with risk_status
 */
router.get('/:id/compliance', notaryController.getCompliance);

/**
 * @swagger
 * /api/v1/notaries/{id}/compliance:
 *   put:
 *     summary: Update notary bond and insurance (upsert)
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bond_provider:
 *                 type: string
 *               bond_amount:
 *                 type: number
 *               bond_effective_date:
 *                 type: string
 *                 format: date
 *               bond_expiry:
 *                 type: string
 *                 format: date
 *               bond_file_url:
 *                 type: string
 *               ins_provider:
 *                 type: string
 *               ins_coverage:
 *                 type: number
 *               ins_expiry:
 *                 type: string
 *                 format: date
 *               ins_policy_number:
 *                 type: string
 *               ins_file_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compliance updated
 */
router.put('/:id/compliance', notaryController.updateCompliance);

// ── Capabilities ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries/{id}/capabilities:
 *   get:
 *     summary: Get notary capabilities (mobile, RON, service areas)
 *     tags: [Notaries]
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
 *         description: Capabilities and RON technology info
 */
router.get('/:id/capabilities', notaryController.getCapabilities);

/**
 * @swagger
 * /api/v1/notaries/{id}/capabilities:
 *   patch:
 *     summary: Update notary capabilities
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mobile:
 *                 type: boolean
 *               RON:
 *                 type: boolean
 *               loan_signing:
 *                 type: boolean
 *               apostille_related_support:
 *                 type: boolean
 *               max_distance:
 *                 type: number
 *               ron_camera_ready:
 *                 type: boolean
 *               ron_internet_ready:
 *                 type: boolean
 *               digital_status:
 *                 type: string
 *               service_areas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     state_id:
 *                       type: integer
 *                     county_name:
 *                       type: string
 *     responses:
 *       200:
 *         description: Capabilities updated
 */
router.patch('/:id/capabilities', notaryController.updateCapabilities);

// ── Schedule / Availability ───────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries/{id}/availability:
 *   get:
 *     summary: Get notary availability schedule
 *     tags: [Notaries]
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
 *         description: Availability record
 */
router.get('/:id/availability', notaryController.getAvailability);

/**
 * @swagger
 * /api/v1/notaries/{id}/availability:
 *   post:
 *     summary: Create or update notary availability (upsert)
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               working_days_per_week:
 *                 type: integer
 *               start_time:
 *                 type: string
 *                 example: '08:00'
 *               end_time:
 *                 type: string
 *                 example: '17:00'
 *               fixed_days_off:
 *                 type: string
 *                 example: 'Saturday,Sunday'
 *     responses:
 *       200:
 *         description: Availability set
 */
router.post('/:id/availability', notaryController.setAvailability);

// ── Documents ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries/{id}/documents:
 *   get:
 *     summary: List notary documents (current versions only)
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: document_type
 *         schema:
 *           type: string
 *         description: Filter by document category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Document list
 */
router.get('/:id/documents', notaryController.listDocuments);

/**
 * @swagger
 * /api/v1/notaries/{id}/documents:
 *   post:
 *     summary: Upload a new document (auto-versions previous)
 *     tags: [Notaries]
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
 *               - doc_category
 *               - file_name
 *               - file_url
 *             properties:
 *               doc_category:
 *                 type: string
 *               file_name:
 *                 type: string
 *               file_url:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded, verified_status set to PENDING
 */
router.post('/:id/documents', notaryController.uploadDocument);

/**
 * @swagger
 * /api/v1/notaries/{id}/documents/{docId}/verify:
 *   patch:
 *     summary: Verify (approve/reject) a document
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: docId
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
 *                 enum: [APPROVED, PENDING, REJECTED]
 *     responses:
 *       200:
 *         description: Document verified
 */
router.patch('/:id/documents/:docId/verify', notaryController.verifyDocument);

// ── Audit & Incidents ────────────────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/notaries/{id}/audit-logs:
 *   get:
 *     summary: Get audit logs for a notary
 *     tags: [Notaries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: from_date
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to_date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Audit log entries
 */
router.get('/:id/audit-logs', notaryController.getAuditLogs);

/**
 * @swagger
 * /api/v1/notaries/{id}/incidents:
 *   get:
 *     summary: Get list of incidents for a notary
 *     tags: [Notaries]
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
 *         description: Incident list
 */
router.get('/:id/incidents', notaryController.getIncidents);

/**
 * @swagger
 * /api/v1/notaries/{id}/incidents:
 *   post:
 *     summary: Create a new incident record for a notary
 *     tags: [Notaries]
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
 *               incident_type:
 *                 type: string
 *               description:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: LOW
 *               status:
 *                 type: string
 *                 enum: [OPEN, RESOLVED]
 *                 default: OPEN
 *     responses:
 *       201:
 *         description: Incident created
 */
router.post('/:id/incidents', notaryController.createIncident);

module.exports = router;
