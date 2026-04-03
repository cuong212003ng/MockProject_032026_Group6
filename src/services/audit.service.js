const notaryModel = require('../models/notary.model');
const auditLogService = require('./audit-log.service');
const notaryProfileService = require('./notary-profile.service');
<<<<<<< HEAD
const { AppError } = require('../utils/app-error');
=======
>>>>>>> 774e8f4 (fix: bug before merge)
const { normalizePagination, buildPagination } = require('../utils/pagination.helper');

const getAuditLogs = async ({ notaryId, filters = {} }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const pagination = normalizePagination(filters.page, filters.limit);
  const totalItems = await notaryModel.countAuditLogs(notaryId, filters);
  const items = await notaryModel.getAuditLogsPage(notaryId, filters, pagination);

  return {
    items: items.map(auditLogService.hydrateAuditLog),
    pagination: buildPagination({
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
    }),
  };
};

<<<<<<< HEAD
const getAuditTrail = async ({ notaryId, filters = {} }) => getAuditLogs({ notaryId, filters });

const getAuditTrailDetail = async ({ notaryId, auditId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const auditLog = await notaryModel.findAuditLogById(auditId, notaryId);
  if (!auditLog) {
    throw new AppError(`Audit log #${auditId} not found`, 404);
  }

  return auditLogService.hydrateAuditLog(auditLog);
};

=======
>>>>>>> 774e8f4 (fix: bug before merge)
const getIncidents = async ({ notaryId, filters = {} }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const pagination = normalizePagination(filters.page, filters.limit);
  const totalItems = await notaryModel.countIncidents(notaryId, filters);
  const items = await notaryModel.getIncidentsPage(notaryId, filters, pagination);

  return {
    items,
    pagination: buildPagination({
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
    }),
  };
};

<<<<<<< HEAD
const getRecentIncidents = async ({ notaryId, filters = {} }) =>
  getIncidents({
    notaryId,
    filters: {
      limit: filters.limit || 5,
      ...filters,
    },
  });

const mapAuditLogToActivity = (auditLog) => {
  const tableName = auditLog.table_name;
  const changedFields = auditLog.changed_fields || [];
  const firstField = changedFields[0]?.field || null;

  if (tableName === 'Notary_documents' && auditLog.action === 'INSERT') {
    return {
      action_type: 'Document Uploaded',
      description: 'New document uploaded to the system',
      document_name: auditLog.new_value?.file_name || null,
      performed_by: auditLog.change_by,
      timestamp: auditLog.created_at,
    };
  }

  if (tableName === 'Notary_documents' && auditLog.action === 'UPDATE') {
    return {
      action_type: 'Document Updated',
      description: firstField
        ? `Document ${firstField} has been updated`
        : 'Document information has been updated',
      document_name: auditLog.new_value?.file_name || auditLog.old_value?.file_name || null,
      performed_by: auditLog.change_by,
      timestamp: auditLog.created_at,
    };
  }

  if (tableName === 'Notary_incidents' && auditLog.action === 'INSERT') {
    return {
      action_type: 'Incident Reported',
      description: 'A new incident has been created for this notary',
      document_name: null,
      performed_by: auditLog.change_by,
      timestamp: auditLog.created_at,
    };
  }

  return {
    action_type: `${auditLog.action} ${tableName}`,
    description: 'Notary profile data has been updated',
    document_name: null,
    performed_by: auditLog.change_by,
    timestamp: auditLog.created_at,
  };
};

const getRecentActivities = async ({ notaryId, filters = {} }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const limit = Number.parseInt(filters.limit, 10) > 0 ? Number.parseInt(filters.limit, 10) : 5;
  const items = await notaryModel.getAuditLogsPage(notaryId, {}, { offset: 0, limit });

  return items.map((item) => mapAuditLogToActivity(auditLogService.hydrateAuditLog(item)));
};

=======
>>>>>>> 774e8f4 (fix: bug before merge)
const createIncident = async ({ notaryId, payload, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const incident = await notaryModel.createIncident(notaryId, payload);
  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'Notary_incidents',
    recordId: incident.inc_id,
    action: 'INSERT',
    oldValue: null,
    newValue: incident,
    changedBy: actorId,
  });

  return incident;
};

module.exports = {
  getAuditLogs,
<<<<<<< HEAD
  getAuditTrail,
  getAuditTrailDetail,
  getIncidents,
  getRecentIncidents,
  getRecentActivities,
=======
  getIncidents,
>>>>>>> 774e8f4 (fix: bug before merge)
  createIncident,
};
