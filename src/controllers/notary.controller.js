const notaryModel = require('../models/notary.model');
const documentService = require('../services/document.service');
const auditService = require('../services/audit.service');
const notaryProfileService = require('../services/notary-profile.service');
const commissionService = require('../services/commission.service');
const { isAppError } = require('../utils/app-error');
const { sendSuccess, sendError } = require('../utils/response.helper');

const handleServiceError = (res, error, fallbackMessage, scope) => {
  console.error(`[${scope}]`, error.message);

  if (isAppError(error)) {
    return sendError(res, error.message, error.statusCode, error.data);
  }

  return sendError(res, fallbackMessage, 500);
};

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
    return sendSuccess(
      res,
      { id: `#${id}`, status: 'PENDING' },
      'Notary created successfully',
      201,
    );
  } catch (err) {
    console.error('[createNotary]', err.message);
    return sendError(res, 'Failed to create notary', 500);
  }
};

// ─── 3. GET /api/v1/notaries/:id ─────────────────────────────────────────────
const getNotaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await notaryProfileService.getNotaryProfile(id);
    return sendSuccess(res, profile, 'Notary retrieved successfully');
  } catch (err) {
    console.error('[getNotaryById]', err.message);
    return handleServiceError(res, err, 'Failed to retrieve notary', 'getNotaryById');
  }
};

// ─── 3.5. DELETE /api/v1/notaries/:id ─────────────────────────────────────────
const deleteNotary = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notaryModel.softDeleteNotary(id);
    if (!result) return sendError(res, `Notary #${id} not found`, 404);
    return sendSuccess(res, result, 'Notary deleted successfully');
  } catch (err) {
    console.error('[deleteNotary]', err.message);
    return sendError(res, 'Failed to delete notary', 500);
  }
};

// ─── 4. PATCH /api/v1/notaries/:id/bio ───────────────────────────────────────
const updateBio = async (req, res) => {
  try {
    const result = await notaryProfileService.updateBio({
      notaryId: req.params.id,
      changes: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Bio updated successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to update bio', 'updateBio');
  }
};

// ─── 5. PATCH /api/v1/notaries/:id/status ────────────────────────────────────
const toggleStatus = async (req, res) => {
  try {
    const result = await notaryProfileService.toggleStatus({
      notaryId: req.params.id,
      status: req.body.status,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Status updated successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to toggle status', 'toggleStatus');
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
    const data = await commissionService.getCommissions(id, req.query);
    return sendSuccess(res, data, 'Commissions retrieved successfully');
  } catch (err) {
    console.error('[getCommissions]', err.message);
    return handleServiceError(res, err, 'Failed to retrieve commissions', 'getCommissions');
  }
};

const getLegalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await commissionService.getLegalInfo(id, req.query);
    return sendSuccess(res, data, 'Legal info retrieved successfully');
  } catch (err) {
    console.error('[getLegalInfo]', err.message);
    return handleServiceError(res, err, 'Failed to retrieve legal info', 'getLegalInfo');
  }
};

// ─── 9. POST /api/v1/notaries/:id/commissions ────────────────────────────────
const createCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await commissionService.createCommission(id, req.body);
    return sendSuccess(
      res,
      { id: `#${result.id}`, risk_status: result.risk_status },
      'Commission created successfully',
      201,
    );
  } catch (err) {
    console.error('[createCommission]', err.message);
    return sendError(res, 'Failed to create commission', 500);
  }
};

// ─── 10. PATCH /api/v1/notaries/:id/commissions/:cid ─────────────────────────
const updateCommission = async (req, res) => {
  try {
    const { id, cid } = req.params;
    const result = await commissionService.updateCommission(id, cid, req.body);
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
    const data = await notaryProfileService.getCapabilities(id);
    return sendSuccess(res, data, 'Capabilities retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve capabilities', 'getCapabilities');
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

// ─── 15. GET /api/v1/notaries/:id/performance ───────────────────────────────
const getPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notaryProfileService.getPerformance(id);
    return sendSuccess(res, result, 'Performance metrics retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve performance metrics', 'getPerformance');
  }
};

// ─── 16. GET /api/v1/notaries/:id/availability ───────────────────────────────
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

// ─── 16. PUT /api/v1/notaries/:id/availability ──────────────────────────────
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
    const data = await documentService.listDocuments({
      notaryId: req.params.id,
      filters: req.query,
    });

    return sendSuccess(res, data, 'Documents retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve documents', 'listDocuments');
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
    const result = await documentService.uploadDocument({
      notaryId: req.params.id,
      body: req.body,
      file: req.file,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Document uploaded successfully', 201);
  } catch (err) {
    return handleServiceError(res, err, 'Failed to upload document', 'uploadDocument');
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
    const result = await documentService.verifyDocument({
      notaryId: req.params.id,
      docId: req.params.docId,
      status: req.body.status,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

    return sendSuccess(res, result, 'Document verification updated');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to verify document', 'verifyDocument');
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
    const data = await auditService.getAuditLogs({
      notaryId: req.params.id,
      filters: req.query,
    });

    return sendSuccess(res, data, 'Audit logs retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve audit logs', 'getAuditLogs');
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
    const data = await auditService.getIncidents({
      notaryId: req.params.id,
      filters: req.query,
    });

    return sendSuccess(res, data, 'Incidents retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve incidents', 'getIncidents');
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
    const result = await auditService.createIncident({
      notaryId: req.params.id,
      payload: req.body,
      actorId: req.auditContext?.actorId || req.user?.id || null,
    });

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
  }
};

module.exports = {
  getNotaryList,
  createNotary,
  getNotaryById,
  deleteNotary,
  updateBio,
  toggleStatus,
  getOverview,
  getStatusHistory,
  getCommissions,
  getLegalInfo,
  createCommission,
  updateCommission,
  getCompliance,
  updateCompliance,
  getCapabilities,
  updateCapabilities,
  getPerformance,
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
  // ─── SC003: Personal Info (dev-trongtuan) ───
  updatePersonalInfo,
  // ─── SC004: Commission (dev-trongtuan) ───
  deleteCommission,
};
