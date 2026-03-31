const notaryModel = require('../models/notary.model');
const documentService = require('../services/document.service');
const auditService = require('../services/audit.service');
const notaryProfileService = require('../services/notary-profile.service');
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
    return sendSuccess(res, { id: `#${id}`, status: 'PENDING' }, 'Notary created successfully', 201);
  } catch (err) {
    console.error('[createNotary]', err.message);
    return sendError(res, 'Failed to create notary', 500);
  }
};

// dev-trongtuan
// ─── 3. GET /api/v1/notaries/:id (personal info + header fields) ────────────
const getNotaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.getPersonalInfoById(id);
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
      isActive: req.body.is_active,
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

// dev-trongtuan
// ─── 8. GET /api/v1/notaries/:id/commissions ─────────────────────────────────
const getCommissions = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getCommissions(id, req.query);
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

    const result = await notaryModel.createCommission(id, req.body);
    if (!result) return sendError(res, 'Commission state is invalid', 400);
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

// ─── 10. PUT /api/v1/notaries/:id/commissions/:commission_id ────────────────
const updateCommission = async (req, res) => {
  try {
    const { commission_id: commissionId } = req.params;
    const result = await notaryModel.updateCommission(commissionId, req.body);
    if (!result) return sendError(res, 'Commission state is invalid', 400);
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
    const data = await documentService.listDocuments({
      notaryId: req.params.id,
      filters: req.query,
    });

    return sendSuccess(res, data, 'Documents retrieved successfully');
  } catch (err) {
    return handleServiceError(res, err, 'Failed to retrieve documents', 'listDocuments');
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

// dev-trongtuan
const updatePersonalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await notaryModel.updatePersonalInfo(id, req.body);
    if (!result) return sendError(res, `Notary #${id} not found`, 404);
    return sendSuccess(res, result, 'Personal information updated successfully');
  } catch (err) {
    console.error('[updatePersonalInfo]', err.message);
    return sendError(res, 'Failed to update personal information', 500);
  }
};

const deleteCommission = async (req, res) => {
  try {
    const { id, commission_id: commissionId } = req.params;
    const result = await notaryModel.deleteCommission(id, commissionId);
    if (!result) return sendError(res, `Commission #${commissionId} not found`, 404);
    return sendSuccess(res, result, 'Commission deleted successfully');
  } catch (err) {
    console.error('[deleteCommission]', err.message);
    return sendError(res, 'Failed to delete commission', 500);
  }
};

module.exports = {
  getNotaryList,
  createNotary,
  getNotaryById,
  updatePersonalInfo,
  updateBio,
  toggleStatus,
  getOverview,
  getStatusHistory,
  getCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
  getCompliance,
  updateCompliance,
  getCapabilities,
  updateCapabilities,
  getAvailability,
  setAvailability,
  listDocuments,
  uploadDocument,
  verifyDocument,
  getAuditLogs,
  getIncidents,
  createIncident,
};
