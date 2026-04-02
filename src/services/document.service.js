const fs = require('fs/promises');
const db = require('../config/db');
const notaryModel = require('../models/notary.model');
const auditLogService = require('./audit-log.service');
const notaryProfileService = require('./notary-profile.service');
const { AppError } = require('../utils/app-error');
const { normalizePagination, buildPagination } = require('../utils/pagination.helper');

const listDocuments = async ({ notaryId, filters = {} }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const pagination = normalizePagination(filters.page, filters.limit);
  const totalItems = await notaryModel.countDocuments(notaryId, filters);
  const items = await notaryModel.listDocumentsPage(notaryId, filters, pagination);

  return {
    items,
    pagination: buildPagination({
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
    }),
  };
};

const uploadDocument = async ({ notaryId, body, file, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  if (!file) {
    throw new AppError('file is required', 422, [{ path: 'file', msg: 'file is required' }]);
  }

  const documentType = body.document_type || body.doc_category;
  if (!documentType) {
    throw new AppError('document_type is required', 422, [
      { path: 'document_type', msg: 'document_type is required' },
    ]);
  }

  try {
    return await db.withTransaction(async ({ query }) => {
      const createdDocument = await notaryModel.insertDocumentVersion(
        notaryId,
        {
          docCategory: documentType,
          fileName: file.originalname,
          fileUrl: file.storageUrl,
        },
        query,
      );

      await auditLogService.createAuditLog(
        {
          notaryId,
          tableName: 'Notary_documents',
          recordId: createdDocument.doc_id,
          action: 'INSERT',
          oldValue: null,
          newValue: createdDocument,
          changedBy: actorId,
        },
        { queryExecutor: query },
      );

      return createdDocument;
    });
  } catch (error) {
    await fs.unlink(file.path).catch(() => null);
    throw error;
  }
};

const verifyDocument = async ({ notaryId, docId, status, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const previousDocument = await notaryModel.findDocumentById(docId, notaryId);
  if (!previousDocument) {
    throw new AppError(`Document #${docId} not found`, 404);
  }

  const updatedDocument = await notaryModel.updateDocumentVerificationStatus(docId, notaryId, status);
  if (!updatedDocument) {
    throw new AppError('Invalid status value', 422, [{ path: 'status', msg: 'Invalid status value' }]);
  }

  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'Notary_documents',
    recordId: docId,
    action: 'UPDATE',
    oldValue: { verified_status: previousDocument.verified_status },
    newValue: { verified_status: updatedDocument.verified_status },
    changedBy: actorId,
  });

  return updatedDocument;
};

module.exports = {
  listDocuments,
  uploadDocument,
  verifyDocument,
};
