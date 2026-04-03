const notaryModel = require('../models/notary.model');
<<<<<<< HEAD
<<<<<<< HEAD
const documentService = require('../services/document.service');
const auditService = require('../services/audit.service');
const notaryProfileService = require('../services/notary-profile.service');
const commissionService = require('../services/commission.service');
<<<<<<< HEAD
=======
const documentService = require('../services/document.service');
const auditService = require('../services/audit.service');
const notaryProfileService = require('../services/notary-profile.service');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
const { isAppError } = require('../utils/app-error');
const { sendSuccess, sendError } = require('../utils/response.helper');

const handleServiceError = (res, error, fallbackMessage, scope) => {
  console.error(`[${scope}]`, error.message);

  if (isAppError(error)) {
    return sendError(res, error.message, error.statusCode, error.data);
  }

  return sendError(res, fallbackMessage, 500);
};

<<<<<<< HEAD
=======
const { sendSuccess, sendError } = require('../utils/response.helper');

>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
// ─── 1. GET /api/v1/notaries ──────────────────────────────────────────────────
const getNotaryList = async (req, res) => {
  try {
    const { status, state, capability, page = 1, limit = 10 } = req.query;
    const data = await notaryModel.findAll({ status, state, capability, page, limit });
    return sendSuccess(res, data, 'Notary list retrieved successfully');
  } catch (err) {
    console.error('[getNotaryList]', err.message);
    return sendError(res, 'Failed to retrieve notary list', 500);
  }
};

// ─── 2. POST /api/v1/notaries ────────────────────────────────────────────────
const createNotary = async (req, res) => {
  try {
    const { full_name, email } = req.body;
    if (!full_name || !email) {
      return sendError(res, 'full_name and email are required', 400);
    }
    const id = await notaryModel.create(req.body);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
    return sendSuccess(
      res,
      { id: `#${id}`, status: 'PENDING' },
      'Notary created successfully',
      201,
    );
<<<<<<< HEAD
=======
    return sendSuccess(res, { id: `#${id}`, status: 'PENDING' }, 'Notary created successfully', 201);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
  } catch (err) {
    console.error('[createNotary]', err.message);
    return sendError(res, 'Failed to create notary', 500);
  }
};

// ─── 3. GET /api/v1/notaries/:id ─────────────────────────────────────────────
const getNotaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);
    return sendSuccess(res, notary, 'Notary retrieved successfully');
  } catch (err) {
    console.error('[getNotaryById]', err.message);
    return sendError(res, 'Failed to retrieve notary', 500);
  }
};

// ─── 4. PATCH /api/v1/notaries/:id/bio ───────────────────────────────────────
const updateBio = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const result = await notaryProfileService.updateBio({
      notaryId: req.params.id,
      changes: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });
<<<<<<< HEAD

    return sendSuccess(res, result, 'Bio updated successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to update bio', 'updateBio');
=======
    const { id } = req.params;
    const changedBy = req.user?.id || null;
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, result, 'Bio updated successfully');
  } catch (err) {
<<<<<<< HEAD
    console.error('[updateBio]', err.message);
    return sendError(res, 'Failed to update bio', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to update bio', 'updateBio');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

// ─── 5. PATCH /api/v1/notaries/:id/status ────────────────────────────────────
const toggleStatus = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const result = await notaryProfileService.toggleStatus({
      notaryId: req.params.id,
      isActive: req.body.is_active,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });
<<<<<<< HEAD

    return sendSuccess(res, result, 'Status updated successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to toggle status', 'toggleStatus');
=======
    const { id } = req.params;
    const { is_active } = req.body;
    const changedBy = req.user?.id || null;
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, result, 'Status updated successfully');
  } catch (err) {
<<<<<<< HEAD
    console.error('[toggleStatus]', err.message);
    return sendError(res, 'Failed to toggle status', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to toggle status', 'toggleStatus');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

// ─── 6. GET /api/v1/notaries/:id/overview ────────────────────────────────────
const getOverview = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const overview = await notaryModel.getOverview(id);
    return sendSuccess(res, overview, 'Overview retrieved successfully');
  } catch (err) {
    console.error('[getOverview]', err.message);
    return sendError(res, 'Failed to retrieve overview', 500);
  }
};

// ─── 7. GET /api/v1/notaries/:id/status-history ───────────────────────────────
const getStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const history = await notaryModel.getStatusHistory(id);
    return sendSuccess(res, history, 'Status history retrieved successfully');
  } catch (err) {
    console.error('[getStatusHistory]', err.message);
    return sendError(res, 'Failed to retrieve status history', 500);
  }
};

// ─── 8. GET /api/v1/notaries/:id/commissions ─────────────────────────────────
const getCommissions = async (req, res) => {
  try {
    const { id } = req.params;
<<<<<<< HEAD
    const data = await commissionService.getCommissions(id);
=======
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getCommissions(id);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
    return sendSuccess(res, data, 'Commissions retrieved successfully');
  } catch (err) {
    console.error('[getCommissions]', err.message);
    return sendError(res, 'Failed to retrieve commissions', 500);
  }
};

// ─── 9. POST /api/v1/notaries/:id/commissions ────────────────────────────────
const createCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

<<<<<<< HEAD
<<<<<<< HEAD
    const result = await commissionService.createCommission(id, req.body);
=======
    const result = await notaryModel.createCommission(id, req.body);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    const result = await commissionService.createCommission(id, req.body);
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
    return sendSuccess(
      res,
      { id: `#${result.id}`, risk_status: result.risk_status },
      'Commission created successfully',
<<<<<<< HEAD
<<<<<<< HEAD
      201,
=======
      201
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
      201,
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
    );
  } catch (err) {
    console.error('[createCommission]', err.message);
    return sendError(res, 'Failed to create commission', 500);
  }
};

// ─── 10. PATCH /api/v1/notaries/:id/commissions/:cid ─────────────────────────
const updateCommission = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
    const { id, cid } = req.params;
    const result = await commissionService.updateCommission(id, cid, req.body);
=======
    const { cid } = req.params;
    const result = await notaryModel.updateCommission(cid, req.body);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    const { id, cid } = req.params;
    const result = await commissionService.updateCommission(id, cid, req.body);
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
    return sendSuccess(res, result, 'Commission updated successfully');
  } catch (err) {
    console.error('[updateCommission]', err.message);
    return sendError(res, 'Failed to update commission', 500);
  }
};

// ─── 11. GET /api/v1/notaries/:id/compliance ─────────────────────────────────
const getCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getCompliance(id);
    return sendSuccess(res, data, 'Compliance data retrieved successfully');
  } catch (err) {
    console.error('[getCompliance]', err.message);
    return sendError(res, 'Failed to retrieve compliance', 500);
  }
};

// ─── 12. PUT /api/v1/notaries/:id/compliance ─────────────────────────────────
const updateCompliance = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.updateCompliance(id, req.body);
    return sendSuccess(res, result, 'Compliance updated successfully');
  } catch (err) {
    console.error('[updateCompliance]', err.message);
    return sendError(res, 'Failed to update compliance', 500);
  }
};

// ─── 13. GET /api/v1/notaries/:id/capabilities ───────────────────────────────
const getCapabilities = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getCapabilities(id);
    return sendSuccess(res, data, 'Capabilities retrieved successfully');
  } catch (err) {
    console.error('[getCapabilities]', err.message);
    return sendError(res, 'Failed to retrieve capabilities', 500);
  }
};

// ─── 14. PATCH /api/v1/notaries/:id/capabilities ─────────────────────────────
const updateCapabilities = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.updateCapabilities(id, req.body);
    return sendSuccess(res, result, 'Capabilities updated successfully');
  } catch (err) {
    console.error('[updateCapabilities]', err.message);
    return sendError(res, 'Failed to update capabilities', 500);
  }
};

// ─── 15. GET /api/v1/notaries/:id/availability ───────────────────────────────
const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getAvailability(id);
    return sendSuccess(res, data, 'Availability retrieved successfully');
  } catch (err) {
    console.error('[getAvailability]', err.message);
    return sendError(res, 'Failed to retrieve availability', 500);
  }
};

// ─── 16. POST /api/v1/notaries/:id/availability ──────────────────────────────
const setAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.setAvailability(id, req.body);
    return sendSuccess(res, result, 'Availability set successfully');
  } catch (err) {
    console.error('[setAvailability]', err.message);
    return sendError(res, 'Failed to set availability', 500);
  }
};

// ─── 17. GET /api/v1/notaries/:id/documents ──────────────────────────────────
const listDocuments = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const data = await documentService.listDocuments({
      notaryId: req.params.id,
      filters: req.query,
    });
<<<<<<< HEAD

    return sendSuccess(res, data, 'Documents retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve documents', 'listDocuments');
=======
    const { id } = req.params;
    const { document_type, status } = req.query;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, data, 'Documents retrieved successfully');
  } catch (err) {
<<<<<<< HEAD
    console.error('[listDocuments]', err.message);
    return sendError(res, 'Failed to retrieve documents', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to retrieve documents', 'listDocuments');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

const getDocumentDetail = async (req, res) => {
  try {
    const result = await documentService.getDocumentDetail({
      notaryId: req.params.id,
      docId: req.params.docId,
    });

    return sendSuccess(res, result, 'Document retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve document', 'getDocumentDetail');
  }
};

const createDocument = async (req, res) => {
  try {
    const result = await documentService.createDocument({
      notaryId: req.params.id,
      body: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Document created successfully', 201);
  } catch (err) {
    return handleServiceError(res, err, 'Failed to create document', 'createDocument');
  }
};

// ─── 18. POST /api/v1/notaries/:id/documents ─────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const result = await documentService.uploadDocument({
      notaryId: req.params.id,
      body: req.body,
      file: req.file,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });
<<<<<<< HEAD

    return sendSuccess(res, result, 'Document uploaded successfully', 201);
  } catch (err) {
    return handleServiceError(res, err, 'Failed to upload document', 'uploadDocument');
=======
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, result, 'Document uploaded successfully', 201);
  } catch (err) {
<<<<<<< HEAD
    console.error('[uploadDocument]', err.message);
    return sendError(res, 'Failed to upload document', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to upload document', 'uploadDocument');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

const updateDocument = async (req, res) => {
  try {
    const result = await documentService.updateDocument({
      notaryId: req.params.id,
      docId: req.params.docId,
      payload: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Document updated successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to update document', 'updateDocument');
  }
};

// ─── 19. PATCH /api/v1/notaries/:id/documents/:docId/verify ──────────────────
const verifyDocument = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const result = await documentService.verifyDocument({
      notaryId: req.params.id,
      docId: req.params.docId,
      status: req.body.status,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });
<<<<<<< HEAD

    return sendSuccess(res, result, 'Document verification updated');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to verify document', 'verifyDocument');
=======
    const { docId } = req.params;
    const { status } = req.body;
    const changedBy = req.user?.id || null;

    if (!status) return sendError(res, 'status is required (APPROVED / PENDING / REJECTED)', 400);

    const result = await notaryModel.verifyDocument(docId, status, changedBy);
    if (!result) return sendError(res, 'Invalid status value', 400);

    return sendSuccess(res, result, 'Document verification updated');
  } catch (err) {
    console.error('[verifyDocument]', err.message);
    return sendError(res, 'Failed to verify document', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======

    return sendSuccess(res, result, 'Document verification updated');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to verify document', 'verifyDocument');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

const deleteDocument = async (req, res) => {
  try {
    const result = await documentService.deleteDocument({
      notaryId: req.params.id,
      docId: req.params.docId,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Document deleted successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to delete document', 'deleteDocument');
  }
};

// ─── 20. GET /api/v1/notaries/:id/audit-logs ─────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const data = await auditService.getAuditLogs({
      notaryId: req.params.id,
      filters: req.query,
    });
<<<<<<< HEAD

    return sendSuccess(res, data, 'Audit logs retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve audit logs', 'getAuditLogs');
=======
    const { id } = req.params;
    const { from_date, to_date } = req.query;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, data, 'Audit logs retrieved successfully');
  } catch (err) {
<<<<<<< HEAD
    console.error('[getAuditLogs]', err.message);
    return sendError(res, 'Failed to retrieve audit logs', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to retrieve audit logs', 'getAuditLogs');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

const getAuditTrail = async (req, res) => {
  try {
    const data = await auditService.getAuditTrail({
      notaryId: req.params.id,
      filters: req.query,
    });

    return sendSuccess(res, data, 'Audit trail retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve audit trail', 'getAuditTrail');
  }
};

const getAuditTrailDetail = async (req, res) => {
  try {
    const data = await auditService.getAuditTrailDetail({
      notaryId: req.params.id,
      auditId: req.params.auditId,
    });

    return sendSuccess(res, data, 'Audit trail detail retrieved successfully');
  } catch (err) {
    return handleServiceError(
      res,
      err,
      'Failed to retrieve audit trail detail',
      'getAuditTrailDetail',
    );
  }
};

// ─── 21. GET /api/v1/notaries/:id/incidents ──────────────────────────────────
const getIncidents = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const data = await auditService.getIncidents({
      notaryId: req.params.id,
      filters: req.query,
    });
<<<<<<< HEAD

    return sendSuccess(res, data, 'Incidents retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve incidents', 'getIncidents');
=======
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, data, 'Incidents retrieved successfully');
  } catch (err) {
<<<<<<< HEAD
    console.error('[getIncidents]', err.message);
    return sendError(res, 'Failed to retrieve incidents', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to retrieve incidents', 'getIncidents');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
  }
};

const getRecentActivities = async (req, res) => {
  try {
    const data = await auditService.getRecentActivities({
      notaryId: req.params.id,
      filters: req.query,
    });

    return sendSuccess(res, data, 'Recent activities retrieved successfully');
  } catch (err) {
    return handleServiceError(
      res,
      err,
      'Failed to retrieve recent activities',
      'getRecentActivities',
    );
  }
};

// ─── 22. POST /api/v1/notaries/:id/incidents ─────────────────────────────────
const createIncident = async (req, res) => {
  try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
    const result = await auditService.createIncident({
      notaryId: req.params.id,
      payload: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });
<<<<<<< HEAD

    return sendSuccess(res, result, 'Incident created successfully', 201);
  } catch (err) {
    return handleServiceError(res, err, 'Failed to create incident', 'createIncident');
  }
};

// ============================================================================
// dev-trongtuan (SC003 & SC004)
// ============================================================================

// ─── SC003: Personal Info ───────────────────────────────────────────────────
const updatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notaryProfileService.updatePersonalInfo({
      notaryId: id,
      changes: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });
    return sendSuccess(res, result, 'Personal information updated successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to update personal info', 'updatePersonalInfo');
  }
};

// ─── SC004: Delete Commission ───────────────────────────────────────────────
const deleteCommission = async (req, res) => {
  try {
    const { id, commission_id } = req.params;
    const result = await commissionService.deleteCommission(id, commission_id);
    if (!result) return sendError(res, 'Commission not found', 404);
    return sendSuccess(res, result, 'Commission deleted successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to delete commission', 'deleteCommission');
<<<<<<< HEAD
=======
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)

    return sendSuccess(res, result, 'Incident created successfully', 201);
  } catch (err) {
<<<<<<< HEAD
    console.error('[createIncident]', err.message);
    return sendError(res, 'Failed to create incident', 500);
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
    return handleServiceError(res, err, 'Failed to create incident', 'createIncident');
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
  }
};

module.exports = {
  getNotaryList,
  createNotary,
  getNotaryById,
  updateBio,
  toggleStatus,
  getOverview,
  getStatusHistory,
  getCommissions,
  createCommission,
  updateCommission,
  getCompliance,
  updateCompliance,
  getCapabilities,
  updateCapabilities,
  getAvailability,
  setAvailability,
  listDocuments,
  getDocumentDetail,
  createDocument,
  uploadDocument,
  updateDocument,
  verifyDocument,
  deleteDocument,
  getAuditLogs,
  getAuditTrail,
  getAuditTrailDetail,
  getIncidents,
  getRecentActivities,
  createIncident,
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
  // ─── SC003: Personal Info (dev-trongtuan) ───
  updatePersonalInfo,
  // ─── SC004: Commission (dev-trongtuan) ───
  deleteCommission,
<<<<<<< HEAD
=======
>>>>>>> dabfe06 (feat/init databse and code base (#52))
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
};
