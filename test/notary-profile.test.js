const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'notarial-service-test-uploads');
process.env.MAX_FILE_SIZE_MB = '1';

const notaryModel = require('../src/models/notary.model');
const documentService = require('../src/services/document.service');
const auditService = require('../src/services/audit.service');
const app = require('../src/index');

const originalState = {
  findById: notaryModel.findById,
  listDocuments: documentService.listDocuments,
  uploadDocument: documentService.uploadDocument,
  verifyDocument: documentService.verifyDocument,
  getAuditLogs: auditService.getAuditLogs,
  getIncidents: auditService.getIncidents,
  createIncident: auditService.createIncident,
};

const issueToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

const adminToken = issueToken({ id: 1, username: 'admin', role: 'ADMIN' });
const userOwnToken = issueToken({ id: 10, username: 'user-own', role: 'USER' });
const userOtherToken = issueToken({ id: 20, username: 'user-other', role: 'USER' });

const resetStubs = () => {
  notaryModel.findById = async (id) => {
    const map = {
      '1': { id: 1, user_id: 10, status: 'ACTIVE' },
      '2': { id: 2, user_id: 20, status: 'ACTIVE' },
    };

    return map[String(id)] || null;
  };

  documentService.listDocuments = async ({ notaryId }) => ({
    items: [
      {
        doc_id: 101,
        notary_id: Number(notaryId),
        document_type: 'COMMISSION_CER',
        file_name: 'commission.pdf',
        verified_status: 'PENDING',
        version: 2,
        file_url: '/uploads/notary-documents/1/commission.pdf',
      },
    ],
    pagination: {
      current_page: 1,
      total_items: 1,
      total_pages: 1,
      limit: 10,
    },
  });

  documentService.uploadDocument = async ({ notaryId, body, file }) => ({
    doc_id: 202,
    notary_id: Number(notaryId),
    document_type: body.document_type,
    file_name: file.originalname,
    verified_status: 'PENDING',
    version: 3,
    file_url: file.storageUrl,
  });

  documentService.verifyDocument = async ({ notaryId, docId, status }) => ({
    doc_id: Number(docId),
    notary_id: Number(notaryId),
    verified_status: status,
  });

  auditService.getAuditLogs = async ({ notaryId }) => ({
    items: [
      {
        id: 301,
        notary_id: Number(notaryId),
        action: 'UPDATE',
        old_value: { status: 'PENDING' },
        new_value: { status: 'APPROVED' },
        changed_fields: [{ field: 'status', before: 'PENDING', after: 'APPROVED' }],
      },
    ],
    pagination: {
      current_page: 1,
      total_items: 1,
      total_pages: 1,
      limit: 10,
    },
  });

  auditService.getIncidents = async ({ notaryId }) => ({
    items: [
      {
        inc_id: 401,
        notary_id: Number(notaryId),
        status: 'OPEN',
        severity: 'HIGH',
      },
    ],
    pagination: {
      current_page: 1,
      total_items: 1,
      total_pages: 1,
      limit: 10,
    },
  });

  auditService.createIncident = async ({ notaryId, payload }) => ({
    inc_id: 402,
    notary_id: Number(notaryId),
    status: payload.status || 'OPEN',
    severity: payload.severity || 'LOW',
  });
};

test.after(() => {
  notaryModel.findById = originalState.findById;
  documentService.listDocuments = originalState.listDocuments;
  documentService.uploadDocument = originalState.uploadDocument;
  documentService.verifyDocument = originalState.verifyDocument;
  auditService.getAuditLogs = originalState.getAuditLogs;
  auditService.getIncidents = originalState.getIncidents;
  auditService.createIncident = originalState.createIncident;

  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
});

test('Notary profile endpoints enforce auth, RBAC, wrapper, and upload behavior', async (t) => {
  resetStubs();
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });

  await t.test('missing token returns wrapped 401', async () => {
    const response = await request(app).get('/api/v1/notaries/1/documents');

    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.body, {
      success: false,
      status: 'error',
      message: 'Access token is required',
      data: null,
    });
  });

  await t.test('invalid token returns wrapped 401', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/documents')
      .set('Authorization', 'Bearer invalid-token');

    assert.equal(response.statusCode, 401);
    assert.equal(response.body.status, 'error');
    assert.equal(response.body.message, 'Invalid or expired token');
  });

  await t.test('user can list documents for own profile', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/documents?page=1&limit=10&document_type=COMMISSION_CER&status=PENDING')
      .set('Authorization', `Bearer ${userOwnToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.items[0].document_type, 'COMMISSION_CER');
    assert.equal(response.body.data.pagination.total_items, 1);
  });

  await t.test('user is blocked from another profile documents', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/documents')
      .set('Authorization', `Bearer ${userOtherToken}`);

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.status, 'error');
    assert.equal(response.body.message, 'Access denied');
  });

  await t.test('upload requires file', async () => {
    const response = await request(app)
      .post('/api/v1/notaries/1/documents')
      .set('Authorization', `Bearer ${userOwnToken}`)
      .field('document_type', 'COMMISSION_CER');

    assert.equal(response.statusCode, 400);
    assert.equal(response.body.success, false);
    assert.match(response.body.message, /file is required/i);
  });

  await t.test('upload rejects unsupported file type', async () => {
    const response = await request(app)
      .post('/api/v1/notaries/1/documents')
      .set('Authorization', `Bearer ${userOwnToken}`)
      .field('document_type', 'COMMISSION_CER')
      .attach('file', Buffer.from('plain text'), {
        filename: 'bad.txt',
        contentType: 'text/plain',
      });

    assert.equal(response.statusCode, 422);
    assert.equal(response.body.status, 'error');
    assert.match(response.body.message, /Unsupported file type/i);
  });

  await t.test('upload succeeds with multipart file and wrapped response', async () => {
    const response = await request(app)
      .post('/api/v1/notaries/1/documents')
      .set('Authorization', `Bearer ${userOwnToken}`)
      .field('document_type', 'COMMISSION_CER')
      .attach('file', Buffer.from('%PDF-1.4 test file'), {
        filename: 'commission.pdf',
        contentType: 'application/pdf',
      });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.document_type, 'COMMISSION_CER');
    assert.match(response.body.data.file_url, /^\/uploads\/notary-documents\/1\//);
  });

  await t.test('admin can verify a document', async () => {
    const response = await request(app)
      .patch('/api/v1/notaries/1/documents/202/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.verified_status, 'APPROVED');
  });

  await t.test('user cannot verify document', async () => {
    const response = await request(app)
      .patch('/api/v1/notaries/1/documents/202/verify')
      .set('Authorization', `Bearer ${userOwnToken}`)
      .send({ status: 'APPROVED' });

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.status, 'error');
  });

  await t.test('admin can read audit logs with pagination wrapper', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/audit-logs?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.items[0].changed_fields[0].field, 'status');
    assert.equal(response.body.data.pagination.total_items, 1);
  });

  await t.test('admin can read incidents with pagination wrapper', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/incidents?page=1&limit=10&status=OPEN')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.items[0].status, 'OPEN');
    assert.equal(response.body.data.pagination.total_items, 1);
  });
});
