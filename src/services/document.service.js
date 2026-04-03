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

const getDocumentDetail = async ({ notaryId, docId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const document = await notaryModel.findDocumentById(docId, notaryId);
  if (!document || document.verified_status === 'INACTIVE') {
    throw new AppError(`Document #${docId} not found`, 404);
  }

  return document;
};

const createDocument = async ({ notaryId, body = {}, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const documentType = body.document_type || body.doc_category;
  if (!documentType) {
    throw new AppError('document_type is required', 422, [
      { path: 'document_type', msg: 'document_type is required' },
    ]);
  }

  const fileName = body.file_name || body.file_url?.split('/').pop() || `${documentType}.pdf`;
  if (!body.file_url) {
    throw new AppError('file_url is required', 422, [{ path: 'file_url', msg: 'file_url is required' }]);
  }

  return db.withTransaction(async ({ query }) => {
    const createdDocument = await notaryModel.insertDocumentVersion(
      notaryId,
      {
        docCategory: documentType,
        fileName,
        fileUrl: body.file_url,
      },
      query,
    );

    const normalizedChanges = {
      ...createdDocument,
      verified_status: body.status || body.verified_status || createdDocument.verified_status,
      upload_date: body.upload_date || createdDocument.upload_date,
      version: body.version || createdDocument.version,
      is_current_version:
        body.is_current_version !== undefined
          ? body.is_current_version
          : createdDocument.is_current_version,
    };

    const finalDocument = await notaryModel.updateDocumentById(
      createdDocument.doc_id,
      notaryId,
      normalizedChanges,
      query,
    );

    await auditLogService.createAuditLog(
      {
        notaryId,
        tableName: 'Notary_documents',
        recordId: finalDocument.doc_id,
        action: 'INSERT',
        oldValue: null,
        newValue: finalDocument,
        changedBy: actorId,
      },
      { queryExecutor: query },
    );

    return finalDocument;
  });
};

const uploadDocument = async ({ notaryId, body, file, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  if (!file) {
    if (body?.file_url) {
      return createDocument({ notaryId, body, actorId });
    }

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

const updateDocument = async ({ notaryId, docId, payload = {}, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const previousDocument = await notaryModel.findDocumentById(docId, notaryId);
  if (!previousDocument || previousDocument.verified_status === 'INACTIVE') {
    throw new AppError(`Document #${docId} not found`, 404);
  }

  const updatedDocument = await notaryModel.updateDocumentById(docId, notaryId, payload);

  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'Notary_documents',
    recordId: docId,
    action: 'UPDATE',
    oldValue: previousDocument,
    newValue: updatedDocument,
    changedBy: actorId,
  });

  return updatedDocument;
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

const deleteDocument = async ({ notaryId, docId, actorId }) => {
  await notaryProfileService.getNotaryOrThrow(notaryId);

  const previousDocument = await notaryModel.findDocumentById(docId, notaryId);
  if (!previousDocument || previousDocument.verified_status === 'INACTIVE') {
    throw new AppError(`Document #${docId} not found`, 404);
  }

  const deletedDocument = await notaryModel.softDeleteDocumentById(docId, notaryId);

  await auditLogService.createAuditLog({
    notaryId,
    tableName: 'Notary_documents',
    recordId: docId,
    action: 'DELETE',
    oldValue: previousDocument,
    newValue: deletedDocument,
    changedBy: actorId,
  });

  return deletedDocument;
};

module.exports = {
  getDocumentDetail,
  listDocuments,
  createDocument,
  uploadDocument,
  updateDocument,
  verifyDocument,
  deleteDocument,
};
