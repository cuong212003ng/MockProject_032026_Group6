const notaryModel = require('../models/notary.model');
const auditLogService = require('./audit-log.service');
const notaryProfileService = require('./notary-profile.service');
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
  getIncidents,
  createIncident,
};
