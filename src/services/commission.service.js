const db = require('../config/db');
const notaryModel = require('../models/notary.model');
const notaryProfileService = require('./notary-profile.service');

// Reuse computeRiskStatus from model
const { computeRiskStatus } = notaryModel;

const getCommissions = async (notaryId, filters) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);
  return await notaryModel.getCommissions(notaryId, filters);
};

const computeLegalRiskStatus = (expirationDate) => {
  if (!expirationDate) return 'VALID';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expirationDate);
  expiry.setHours(0, 0, 0, 0);

  return expiry < today ? 'EXPIRED' : 'VALID';
};

const getLegalInfo = async (notaryId, filters) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const commissions = await notaryModel.getCommissions(notaryId, filters);
  const compliance = await notaryModel.getCompliance(notaryId);

  const bonds = (compliance.bonds || []).map((bond) => ({
    ...bond,
    risk_status: computeLegalRiskStatus(bond.expiration_date),
  }));

  const insurances = (compliance.insurances || []).map((insurance) => ({
    ...insurance,
    risk_status: computeLegalRiskStatus(insurance.expiration_date),
  }));

  return {
    commissions,
    bonds,
    insurances,
  };
};

const createCommission = async (notaryId, payload) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const commStateId = await notaryModel.resolveCommissionStateId(payload.state);
  if (!commStateId) return null;

  const riskStatus = computeRiskStatus(payload.expiration_date);

  return await db.withTransaction(async ({ query: txQuery }) => {
    // 1. Insert into Notary_commissions
    const newCommissionId = await notaryModel.insertCommissionRecord(
      notaryId,
      commStateId,
      { ...payload, risk_status: riskStatus },
      txQuery,
    );

    // 2. Insert into Authority_scope
    if (payload.authority_types && payload.authority_types.length > 0) {
      for (const authType of payload.authority_types) {
        await notaryModel.insertAuthorityScope(newCommissionId, authType, txQuery);
      }
    }

    return { id: newCommissionId, risk_status: riskStatus };
  });
};

const updateCommission = async (notaryId, commissionId, payload) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const commStateId = await notaryModel.resolveCommissionStateId(payload.state);
  if (!commStateId) return null;

  const riskStatus = computeRiskStatus(payload.expiration_date);

  return await db.withTransaction(async ({ query: txQuery }) => {
    // 1. Check ownership
    const existing = await notaryModel.checkCommissionOwnership(commissionId, notaryId, txQuery);
    if (!existing) return null;

    // 2. Update Notary_commissions
    await notaryModel.updateCommissionRecord(
      commissionId,
      commStateId,
      { ...payload, risk_status: riskStatus },
      txQuery,
    );

    // 3. Replace Authority_scope
    if (payload.authority_types) {
      await notaryModel.deleteAuthorityScopes(commissionId, txQuery);
      for (const authType of payload.authority_types) {
        await notaryModel.insertAuthorityScope(commissionId, authType, txQuery);
      }
    }

    return { updated: true, risk_status: riskStatus };
  });
};

const deleteCommission = async (notaryId, commissionId) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  return await db.withTransaction(async ({ query: txQuery }) => {
    // 1. Check ownership
    const existing = await notaryModel.checkCommissionOwnership(commissionId, notaryId, txQuery);
    if (!existing) return null;

    // 2. Delete securely
    await notaryModel.deleteAuthorityScopes(commissionId, txQuery);
    await notaryModel.deleteCommissionRecord(commissionId, notaryId, txQuery);

    return { deleted: true, commission_id: parseInt(commissionId, 10) };
  });
};

module.exports = {
  getCommissions,
  getLegalInfo,
  createCommission,
  updateCommission,
  deleteCommission,
};
