const notaryModel = require('../models/notary.model');
const { sendSuccess, sendError } = require('../utils/response.helper');

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
    const { id } = req.params;
    const changedBy = req.user?.id || null;

    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.updateBio(id, req.body, changedBy);
    return sendSuccess(res, result, 'Bio updated successfully');
  } catch (err) {
    console.error('[updateBio]', err.message);
    return sendError(res, 'Failed to update bio', 500);
  }
};

// ─── 5. PATCH /api/v1/notaries/:id/status ────────────────────────────────────
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const changedBy = req.user?.id || null;

    if (is_active === undefined) {
      return sendError(res, 'is_active (boolean) is required', 400);
    }

    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.toggleStatus(id, is_active, changedBy);
    return sendSuccess(res, { status: result.status, id: `#${result.id}` }, 'Status updated successfully');
  } catch (err) {
    console.error('[toggleStatus]', err.message);
    return sendError(res, 'Failed to toggle status', 500);
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
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getCommissions(id);
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
    return sendSuccess(
      res,
      { id: `#${result.id}`, risk_status: result.risk_status },
      'Commission created successfully',
      201
    );
  } catch (err) {
    console.error('[createCommission]', err.message);
    return sendError(res, 'Failed to create commission', 500);
  }
};

// ─── 10. PATCH /api/v1/notaries/:id/commissions/:cid ─────────────────────────
const updateCommission = async (req, res) => {
  try {
    const { cid } = req.params;
    const result = await notaryModel.updateCommission(cid, req.body);
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
    const { id } = req.params;
    const { document_type, status } = req.query;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.listDocuments(id, { document_type, status });
    return sendSuccess(res, { data }, 'Documents retrieved successfully');
  } catch (err) {
    console.error('[listDocuments]', err.message);
    return sendError(res, 'Failed to retrieve documents', 500);
  }
};

// ─── 18. POST /api/v1/notaries/:id/documents ─────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.uploadDocument(id, req.body);
    return sendSuccess(res, result, 'Document uploaded successfully', 201);
  } catch (err) {
    console.error('[uploadDocument]', err.message);
    return sendError(res, 'Failed to upload document', 500);
  }
};

// ─── 19. PATCH /api/v1/notaries/:id/documents/:docId/verify ──────────────────
const verifyDocument = async (req, res) => {
  try {
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
  }
};

// ─── 20. GET /api/v1/notaries/:id/audit-logs ─────────────────────────────────
const getAuditLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { from_date, to_date } = req.query;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const logs = await notaryModel.getAuditLogs(id, { from_date, to_date });
    return sendSuccess(res, { logs }, 'Audit logs retrieved successfully');
  } catch (err) {
    console.error('[getAuditLogs]', err.message);
    return sendError(res, 'Failed to retrieve audit logs', 500);
  }
};

// ─── 21. GET /api/v1/notaries/:id/incidents ──────────────────────────────────
const getIncidents = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const data = await notaryModel.getIncidents(id);
    return sendSuccess(res, { data }, 'Incidents retrieved successfully');
  } catch (err) {
    console.error('[getIncidents]', err.message);
    return sendError(res, 'Failed to retrieve incidents', 500);
  }
};

// ─── 22. POST /api/v1/notaries/:id/incidents ─────────────────────────────────
const createIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const notary = await notaryModel.findById(id);
    if (!notary) return sendError(res, `Notary #${id} not found`, 404);

    const result = await notaryModel.createIncident(id, req.body);
    return sendSuccess(res, result, 'Incident created successfully', 201);
  } catch (err) {
    console.error('[createIncident]', err.message);
    return sendError(res, 'Failed to create incident', 500);
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
  uploadDocument,
  verifyDocument,
  getAuditLogs,
  getIncidents,
  createIncident,
};
