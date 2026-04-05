const notaryModel = require('../models/notary.model');
const auditLogService = require('./audit-log.service');
const { AppError } = require('../utils/app-error');

const getNotaryOrThrow = async (notaryId) => {
  const notary = await notaryModel.findById(notaryId);
  if (!notary) {
    throw new AppError(`Notary #${notaryId} not found`, 404);
  }

  return notary;
};

const updateBio = async ({ notaryId, changes, actorId }) => {
  await getNotaryOrThrow(notaryId);

  const result = await notaryModel.updateBio(notaryId, changes);
  if (!result || !result.updated) {
    return { updated: false, updated_at: new Date().toISOString() };
  }

  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'notaries',
    recordId: notaryId,
    action: 'UPDATE',
    oldValue: result.previous,
    newValue: result.current,
    changedBy: actorId,
  });

  return {
    updated: true,
    updated_at: result.updated_at,
  };
};

const toggleStatus = async ({ notaryId, status, actorId }) => {
  await getNotaryOrThrow(notaryId);

  const result = await notaryModel.toggleStatus(notaryId, status, actorId);
  if (!result) {
    throw new AppError(`Notary #${notaryId} not found`, 404);
  }

  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'notaries',
    recordId: notaryId,
    action: 'UPDATE',
    oldValue: result.previous,
    newValue: result.current,
    changedBy: actorId,
  });

  return {
    id: `#${result.id}`,
    status: result.status,
  };
};

// ============================================================================
// dev-trongtuan (SC003 & SC004)
// ============================================================================
const getNotaryProfile = async (notaryId) => {
  const notary = await getNotaryOrThrow(notaryId);
  return {
    ...notary,
    rating: 4.8,
  };
};

const updatePersonalInfo = async ({ notaryId, changes, actorId }) => {
  await getNotaryOrThrow(notaryId);

  const result = await notaryModel.updatePersonalInfo(notaryId, changes);
  if (!result || !result.updated) {
    return { updated: false };
  }

  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'notaries',
    recordId: notaryId,
    action: 'UPDATE',
    oldValue: result.previous,
    newValue: result.current,
    changedBy: actorId,
  });

  return {
    updated: true,
    data: result.current,
  };
};

const getCapabilities = async (notaryId) => {
  await getNotaryOrThrow(notaryId);

  const capabilityFlags = await notaryModel.getCapabilityFlags(notaryId);
  const serviceAreas = await notaryModel.getNotaryServiceAreas(notaryId);

  const stateCodes = serviceAreas.map((area) => area.state_code).filter(Boolean);

  return {
    mobile: capabilityFlags?.mobile ?? false,
    RON: capabilityFlags?.RON ?? false,
    loan_signing: capabilityFlags?.loan_signing ?? false,
    apostille_related_support: capabilityFlags?.apostille_related_support ?? false,
    max_distance: capabilityFlags?.max_distance ?? null,
    service_areas: serviceAreas,
    service_states: stateCodes.join(', '),
  };
};

const getPerformance = async (notaryId) => {
  await getNotaryOrThrow(notaryId);

  const jobs = await notaryModel.getJobStatuses(notaryId);
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(
    (item) => String(item.status).toUpperCase() === 'COMPLETED',
  ).length;
  const cancelledJobs = jobs.filter(
    (item) => String(item.status).toUpperCase() === 'CANCELLED',
  ).length;
  const completionRate =
    totalJobs === 0 ? 0 : Number(((completedJobs / totalJobs) * 100).toFixed(2));

  return {
    total_jobs: totalJobs,
    completed_jobs: completedJobs,
    cancelled_jobs: cancelledJobs,
    completion_rate: completionRate,
  };
};

module.exports = {
  getNotaryOrThrow,
  getNotaryProfile,
  updateBio,
  toggleStatus,
  updatePersonalInfo,
  getCapabilities,
  getPerformance,
};
