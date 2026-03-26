const test = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'test';

const db = require('../src/config/db');
const notaryModel = require('../src/models/notary.model');
const auditLogService = require('../src/services/audit-log.service');
const documentService = require('../src/services/document.service');
const auditService = require('../src/services/audit.service');
const notaryProfileService = require('../src/services/notary-profile.service');

const originals = {
  withTransaction: db.withTransaction,
  countDocuments: notaryModel.countDocuments,
  listDocumentsPage: notaryModel.listDocumentsPage,
  insertDocumentVersion: notaryModel.insertDocumentVersion,
  findDocumentById: notaryModel.findDocumentById,
  updateDocumentVerificationStatus: notaryModel.updateDocumentVerificationStatus,
  countAuditLogs: notaryModel.countAuditLogs,
  getAuditLogsPage: notaryModel.getAuditLogsPage,
  countIncidents: notaryModel.countIncidents,
  getIncidentsPage: notaryModel.getIncidentsPage,
  createAuditLog: auditLogService.createAuditLog,
  getNotaryOrThrow: notaryProfileService.getNotaryOrThrow,
};

test.after(() => {
  db.withTransaction = originals.withTransaction;
  notaryModel.countDocuments = originals.countDocuments;
  notaryModel.listDocumentsPage = originals.listDocumentsPage;
  notaryModel.insertDocumentVersion = originals.insertDocumentVersion;
  notaryModel.findDocumentById = originals.findDocumentById;
  notaryModel.updateDocumentVerificationStatus = originals.updateDocumentVerificationStatus;
  notaryModel.countAuditLogs = originals.countAuditLogs;
  notaryModel.getAuditLogsPage = originals.getAuditLogsPage;
  notaryModel.countIncidents = originals.countIncidents;
  notaryModel.getIncidentsPage = originals.getIncidentsPage;
  auditLogService.createAuditLog = originals.createAuditLog;
  notaryProfileService.getNotaryOrThrow = originals.getNotaryOrThrow;
});

test('Service layer handles pagination and audit shaping', async (t) => {
  notaryProfileService.getNotaryOrThrow = async () => ({ id: 1, user_id: 10 });

  await t.test('document service returns pagination metadata', async () => {
    notaryModel.countDocuments = async () => 12;
    notaryModel.listDocumentsPage = async () => [{ doc_id: 1 }, { doc_id: 2 }];

    const result = await documentService.listDocuments({
      notaryId: 1,
      filters: { page: 2, limit: 5, document_type: 'COMMISSION_CER' },
    });

    assert.equal(result.items.length, 2);
    assert.deepEqual(result.pagination, {
      current_page: 2,
      total_items: 12,
      total_pages: 3,
      limit: 5,
    });
  });

  await t.test('document upload uses transaction and writes audit log', async () => {
    let auditPayload = null;

    db.withTransaction = async (callback) => callback({ query: async () => ({}) });
    notaryModel.insertDocumentVersion = async (notaryId, payload) => ({
      doc_id: 99,
      notary_id: notaryId,
      document_type: payload.docCategory,
      file_name: payload.fileName,
      file_url: payload.fileUrl,
      verified_status: 'PENDING',
      version: 4,
    });
    auditLogService.createAuditLog = async (payload) => {
      auditPayload = payload;
    };

    const result = await documentService.uploadDocument({
      notaryId: 1,
      body: { document_type: 'TRAINING_CER' },
      file: {
        originalname: 'training.pdf',
        storageUrl: '/uploads/notary-documents/1/training.pdf',
        path: '/tmp/training.pdf',
      },
      actorId: 1,
    });

    assert.equal(result.doc_id, 99);
    assert.equal(auditPayload.recordId, 99);
    assert.equal(auditPayload.action, 'INSERT');
  });

  await t.test('verify document records before and after status', async () => {
    let auditPayload = null;

    notaryModel.findDocumentById = async () => ({
      doc_id: 10,
      notary_id: 1,
      verified_status: 'PENDING',
    });
    notaryModel.updateDocumentVerificationStatus = async () => ({
      doc_id: 10,
      notary_id: 1,
      verified_status: 'APPROVED',
    });
    auditLogService.createAuditLog = async (payload) => {
      auditPayload = payload;
    };

    const result = await documentService.verifyDocument({
      notaryId: 1,
      docId: 10,
      status: 'APPROVED',
      actorId: 1,
    });

    assert.equal(result.verified_status, 'APPROVED');
    assert.deepEqual(auditPayload.oldValue, { verified_status: 'PENDING' });
    assert.deepEqual(auditPayload.newValue, { verified_status: 'APPROVED' });
  });

  await t.test('audit service parses changed fields from stored json', async () => {
    notaryModel.countAuditLogs = async () => 1;
    notaryModel.getAuditLogsPage = async () => [
      {
        id: 1,
        old_value: JSON.stringify({ status: 'PENDING', file_name: 'old.pdf' }),
        new_value: JSON.stringify({ status: 'APPROVED', file_name: 'new.pdf' }),
      },
    ];

    const result = await auditService.getAuditLogs({
      notaryId: 1,
      filters: { page: 1, limit: 10 },
    });

    assert.equal(result.items[0].changed_fields.length, 2);
    assert.equal(result.items[0].changed_fields[0].field, 'status');
    assert.equal(result.pagination.total_items, 1);
  });

  await t.test('incident service returns paginated recent items', async () => {
    notaryModel.countIncidents = async () => 2;
    notaryModel.getIncidentsPage = async () => [
      { inc_id: 1, status: 'OPEN' },
      { inc_id: 2, status: 'RESOLVED' },
    ];

    const result = await auditService.getIncidents({
      notaryId: 1,
      filters: { page: 1, limit: 10, status: 'OPEN' },
    });

    assert.equal(result.items.length, 2);
    assert.equal(result.pagination.total_items, 2);
  });
});
