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

const toggleStatus = async ({ notaryId, isActive, actorId }) => {
  await getNotaryOrThrow(notaryId);

  const result = await notaryModel.toggleStatus(notaryId, isActive, actorId);
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
// ============================================================================
// dev-trongtuan (SC003 & SC004)
// ============================================================================
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

<<<<<<< HEAD
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
=======
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
module.exports = {
  getNotaryOrThrow,
  updateBio,
  toggleStatus,
<<<<<<< HEAD
<<<<<<< HEAD
  updatePersonalInfo,
=======
>>>>>>> 30a0d89 (feat(notary-profile): implement SC_007 SC_008 and security authorization)
=======
  updatePersonalInfo,
>>>>>>> 69a1ec8 (* feat: Add APIs of sc-003 sc-004)
};
