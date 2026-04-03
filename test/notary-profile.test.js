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
const notaryProfileService = require('../src/services/notary-profile.service');
const commissionService = require('../src/services/commission.service');
const app = require('../src/index');

const originalState = {
  findById: notaryModel.findById,
  listDocuments: documentService.listDocuments,
  getDocumentDetail: documentService.getDocumentDetail,
  createDocument: documentService.createDocument,
  uploadDocument: documentService.uploadDocument,
  updateDocument: documentService.updateDocument,
  verifyDocument: documentService.verifyDocument,
  deleteDocument: documentService.deleteDocument,
  getAuditLogs: auditService.getAuditLogs,
  getAuditTrail: auditService.getAuditTrail,
  getAuditTrailDetail: auditService.getAuditTrailDetail,
  getIncidents: auditService.getIncidents,
  getRecentActivities: auditService.getRecentActivities,
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
      1: { id: 1, user_id: 10, status: 'ACTIVE' },
      2: { id: 2, user_id: 20, status: 'ACTIVE' },
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

  documentService.getDocumentDetail = async ({ notaryId, docId }) => ({
    doc_id: Number(docId),
    notary_id: Number(notaryId),
    document_type: 'COMMISSION_CER',
    file_name: 'commission.pdf',
    verified_status: 'PENDING',
    version: 2,
    file_url: '/uploads/notary-documents/1/commission.pdf',
  });

  documentService.createDocument = async ({ notaryId, body }) => ({
    doc_id: 201,
    notary_id: Number(notaryId),
    document_type: body.document_type,
    file_name: body.file_name || 'commission.pdf',
    verified_status: body.status || 'PENDING',
    version: 1,
    file_url: body.file_url || '/uploads/notary-documents/1/commission.pdf',
  });

  documentService.uploadDocument = async ({ notaryId, body, file }) => ({
    doc_id: 202,
    notary_id: Number(notaryId),
    document_type: body.document_type,
    file_name: file?.originalname || body.file_name || 'commission.pdf',
    verified_status: body.status || 'PENDING',
    version: 3,
    file_url: file?.storageUrl || body.file_url || '/uploads/notary-documents/1/commission.pdf',
  });

  documentService.updateDocument = async ({ notaryId, docId, payload }) => ({
    doc_id: Number(docId),
    notary_id: Number(notaryId),
    document_type: payload.document_type || 'COMMISSION_CER',
    file_name: payload.file_name || 'commission-v2.pdf',
    verified_status: payload.status || 'APPROVED',
    version: payload.version || 3,
    file_url: payload.file_url || '/uploads/notary-documents/1/commission-v2.pdf',
  });

  documentService.verifyDocument = async ({ notaryId, docId, status }) => ({
    doc_id: Number(docId),
    notary_id: Number(notaryId),
    verified_status: status,
  });

  documentService.deleteDocument = async ({ docId }) => ({
    id: Number(docId),
    status: 'INACTIVE',
    deleted_at: '2026-04-03T03:00:00.000Z',
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

  auditService.getAuditTrail = async ({ notaryId }) => ({
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

  auditService.getAuditTrailDetail = async ({ notaryId, auditId }) => ({
    id: Number(auditId),
    notary_id: Number(notaryId),
    action: 'UPDATE',
    changed_fields: [{ field: 'status', before: 'PENDING', after: 'APPROVED' }],
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

  auditService.getRecentActivities = async () => [
    {
      action_type: 'Document Uploaded',
      description: 'New document uploaded to the system',
      document_name: 'commission.pdf',
      performed_by: 1,
      timestamp: '2026-04-03T03:00:00.000Z',
    },
  ];

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
  documentService.getDocumentDetail = originalState.getDocumentDetail;
  documentService.createDocument = originalState.createDocument;
  documentService.uploadDocument = originalState.uploadDocument;
  documentService.updateDocument = originalState.updateDocument;
  documentService.verifyDocument = originalState.verifyDocument;
  documentService.deleteDocument = originalState.deleteDocument;
  auditService.getAuditLogs = originalState.getAuditLogs;
  auditService.getAuditTrail = originalState.getAuditTrail;
  auditService.getAuditTrailDetail = originalState.getAuditTrailDetail;
  auditService.getIncidents = originalState.getIncidents;
  auditService.getRecentActivities = originalState.getRecentActivities;
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
      .get(
        '/api/v1/notaries/1/documents?page=1&limit=10&document_type=COMMISSION_CER&status=PENDING',
      )
      .set('Authorization', `Bearer ${userOwnToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.items[0].document_type, 'COMMISSION_CER');
    assert.equal(response.body.data.pagination.total_items, 1);
  });

  await t.test('user can read own document detail', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/documents/101')
      .set('Authorization', `Bearer ${userOwnToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.doc_id, 101);
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

    assert.equal(response.statusCode, 422);
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

  await t.test('create document succeeds with json payload', async () => {
    const response = await request(app)
      .post('/api/v1/notaries/1/documents')
      .set('Authorization', `Bearer ${userOwnToken}`)
      .send({
        document_type: 'COMMISSION_CER',
        file_name: 'commission.pdf',
        file_url: 'https://files.example.com/commission.pdf',
        status: 'PENDING',
      });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.document_type, 'COMMISSION_CER');
  });

  await t.test('upload alias route succeeds', async () => {
    const response = await request(app)
      .post('/api/v1/notaries/1/documents/upload')
      .set('Authorization', `Bearer ${userOwnToken}`)
      .field('document_type', 'COMMISSION_CER')
      .attach('file', Buffer.from('%PDF-1.4 test file'), {
        filename: 'commission.pdf',
        contentType: 'application/pdf',
      });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.status, 'success');
  });

  await t.test('admin can update a document', async () => {
    const response = await request(app)
      .put('/api/v1/notaries/1/documents/202')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        document_type: 'COMMISSION_CER',
        file_name: 'commission-v2.pdf',
        status: 'APPROVED',
        version: 3,
      });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.file_name, 'commission-v2.pdf');
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

  await t.test('admin can delete a document', async () => {
    const response = await request(app)
      .delete('/api/v1/notaries/1/documents/202')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.status, 'INACTIVE');
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

  await t.test('admin can read audit trails via alias route', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/audit-trails?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.items[0].changed_fields[0].field, 'status');
  });

  await t.test('admin can read audit trail detail', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/audit-trails/301')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.id, 301);
  });

  await t.test('admin can read recent activities', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/activities?limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data[0].action_type, 'Document Uploaded');
  });
});

// ============================================================================
// START OF DEV-TRONGTUAN TEST CASES (SC003 & SC004)
// ============================================================================

test('====== SC003: Personal Info API Tests ======', async (t) => {
  await t.test('Admin can update personal information (HTTP 200)', async () => {
    // 1. Mock the Service to prevent actual Database operations
    const originalUpdate = notaryProfileService.updatePersonalInfo;
    notaryProfileService.updatePersonalInfo = async () => ({
      updated: true,
      data: { first_name: 'Tuan', phone: '0123456789' },
    });

    // 2. Send request via Supertest
    const response = await request(app)
      .patch('/api/v1/notaries/1/personal-info')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ first_name: 'Tuan', phone: '0123456789' });

    // 3. Assert the results
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.data.first_name, 'Tuan');

    // 4. Restore the original function to avoid affecting other tests
    notaryProfileService.updatePersonalInfo = originalUpdate;
  });
});

test('====== SC004: Commission API Tests ======', async (t) => {
  await t.test('Admin can retrieve Commission list (HTTP 200)', async () => {
    // Mock Service
    const originalGet = commissionService.getCommissions;
    commissionService.getCommissions = async () => ({ items: [], pagination: { total: 0 } });

    const response = await request(app)
      .get('/api/v1/notaries/1/commissions')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');

    // Restore
    commissionService.getCommissions = originalGet;
  });

  await t.test('Admin can create a new Commission (HTTP 201)', async () => {
    // Mock Service
    const originalCreate = commissionService.createCommission;
    commissionService.createCommission = async () => ({ id: 99, risk_status: 'VALID' });

    const response = await request(app)
      .post('/api/v1/notaries/1/commissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        state: 'CA',
        commission_number: 'COM-999',
        issue_date: '2024-01-01',
        expiration_date: '2028-01-01',
      });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.id, '#99'); // Check wrapper format

    // Restore
    commissionService.createCommission = originalCreate;
  });

  await t.test('Admin can update an existing Commission (HTTP 200)', async () => {
    // Mock Service
    const originalUpdate = commissionService.updateCommission;
    commissionService.updateCommission = async () => ({
      updated: true,
      risk_status: 'EXPIRING_SOON',
    });

    const response = await request(app)
      .patch('/api/v1/notaries/1/commissions/10')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commission_number: 'COM-NEW' });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');

    // Restore
    commissionService.updateCommission = originalUpdate;
  });

  await t.test('Admin can delete a Commission (HTTP 200)', async () => {
    // Mock Service
    const originalDelete = commissionService.deleteCommission;
    commissionService.deleteCommission = async () => ({ deleted: true, commission_id: 10 });

    const response = await request(app)
      .delete('/api/v1/notaries/1/commissions/10')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'success');

    // Restore
    commissionService.deleteCommission = originalDelete;
  });

  await t.test('Returns 404 error if deleting a non-existent Commission (HTTP 404)', async () => {
    // Mock Service to return null (simulating not found)
    const originalDelete = commissionService.deleteCommission;
    commissionService.deleteCommission = async () => null;

    const response = await request(app)
      .delete('/api/v1/notaries/1/commissions/999')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 404);
    assert.equal(response.body.status, 'error');

    // Restore
    commissionService.deleteCommission = originalDelete;
  });
});

test('Notary DELETE + Availability endpoints integration tests', async (t) => {
  const originalNotaryMethods = {
    findById: notaryModel.findById,
    getAvailability: notaryModel.getAvailability,
    setAvailability: notaryModel.setAvailability,
    softDeleteNotary: notaryModel.softDeleteNotary || notaryModel.softDelete || null,
  };

  t.after(() => {
    notaryModel.findById = originalNotaryMethods.findById;
    notaryModel.getAvailability = originalNotaryMethods.getAvailability;
    notaryModel.setAvailability = originalNotaryMethods.setAvailability;
    if (originalNotaryMethods.softDeleteNotary !== null) {
      notaryModel.softDeleteNotary = originalNotaryMethods.softDeleteNotary;
    }
  });

  await t.test('DELETE /api/v1/notaries/:id (ADMIN happy path)', async () => {
    notaryModel.findById = async (id) => ({ id: Number(id), status: 'ACTIVE' });
    notaryModel.softDeleteNotary = async (id) => ({ id: Number(id), status: 'INACTIVE' });

    const response = await request(app)
      .delete('/api/v1/notaries/1')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, 'success');
    assert.ok(response.body.message.toLowerCase().includes('delete'));
    assert.deepEqual(response.body.data, { id: 1, status: 'INACTIVE' });
  });

  await t.test('DELETE /api/v1/notaries/:id (USER forbidden 403)', async () => {
    const response = await request(app)
      .delete('/api/v1/notaries/1')
      .set('Authorization', `Bearer ${userOwnToken}`);

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.success, false);
    assert.equal(response.body.status, 'error');
  });

  await t.test('GET /api/v1/notaries/:id/availability (happy path 200)', async () => {
    notaryModel.findById = async (id) => ({ id: Number(id), status: 'ACTIVE' });
    notaryModel.getAvailability = async () => ({
      working_days_per_week: 5,
      start_time: '08:00',
      end_time: '17:00',
      fixed_days_off: 'sat,sun',
      blackout_dates: ['2026-05-23'],
      work_holiday: true,
      holiday_preferences: {
        federal: {
          mode: 'SELECTED',
          selected_holiday_ids: [1, 2, 4],
        },
        state: {
          mode: 'ALL',
          state_id: 5,
          selected_holiday_ids: [],
        },
      },
    });

    const response = await request(app)
      .get('/api/v1/notaries/1/availability')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.work_holiday, true);
    assert.deepEqual(response.body.data.holiday_preferences.federal, {
      mode: 'SELECTED',
      selected_holiday_ids: [1, 2, 4],
    });
    assert.deepEqual(response.body.data.holiday_preferences.state, {
      mode: 'ALL',
      state_id: 5,
      selected_holiday_ids: [],
    });
  });

  await t.test('GET /api/v1/notaries/:id/availability (404 not found)', async () => {
    notaryModel.findById = async () => null;

    const response = await request(app)
      .get('/api/v1/notaries/999/availability')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 404);
    assert.equal(response.body.success, false);
    assert.equal(response.body.status, 'error');
    assert.ok(response.body.message.includes('not found'));
  });

  await t.test('PUT /api/v1/notaries/:id/availability (happy path 200)', async () => {
    notaryModel.findById = async (id) => ({ id: Number(id), status: 'ACTIVE' });
    notaryModel.setAvailability = async (id, body) => ({ status: 'success', id, ...body });

    const payload = {
      working_days_per_week: 5,
      start_time: '08:00',
      end_time: '17:00',
      fixed_days_off: 'sat,sun',
      blackout_dates: ['2026-05-23'],
      work_holiday: true,
      holiday_preferences: {
        federal: {
          mode: 'SELECTED',
          selected_holiday_ids: [1, 2, 4],
        },
        state: {
          mode: 'ALL',
          state_id: 5,
          selected_holiday_ids: [],
        },
      },
    };

    const response = await request(app)
      .put('/api/v1/notaries/1/availability')
      .send(payload)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.status, 'success');
    assert.equal(response.body.data.status, 'success');
  });

  await t.test(
    'PUT /api/v1/notaries/:id/availability (validation error 422 for invalid holiday mode)',
    async () => {
      notaryModel.findById = async (id) => ({ id: Number(id), status: 'ACTIVE' });

      const invalidPayload = {
        working_days_per_week: 5,
        start_time: '08:00',
        end_time: '17:00',
        work_holiday: false,
        holiday_preferences: {
          federal: {
            mode: 'TEST_MODE',
            selected_holiday_ids: [1],
          },
          state: {
            mode: 'NONE',
            state_id: 5,
            selected_holiday_ids: [],
          },
        },
      };

      const response = await request(app)
        .put('/api/v1/notaries/1/availability')
        .send(invalidPayload)
        .set('Authorization', `Bearer ${adminToken}`);

      assert.equal([400, 422].includes(response.statusCode), true);
      assert.equal(response.body.success, false);
      assert.equal(response.body.status, 'error');
      assert.ok(
        response.body.message.toLowerCase().includes('federal mode') ||
          response.body.message.toLowerCase().includes('all, selected, or none'),
      );
    },
  );
});
// ============================================================================
// END OF DEV-TRONGTUAN TEST CASES
// ============================================================================
