const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const sinon = require('sinon');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

const notaryProfileService = require('../src/services/notary-profile.service');
const commissionService = require('../src/services/commission.service');
const auditService = require('../src/services/audit.service');
const app = require('../src/index');

const issueToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

const adminToken = issueToken({ id: 1, username: 'admin', role: 'ADMIN' });

test.describe('Notary Overview APIs - Happy Path', () => {
  let notaryProfileServiceStubs = {};
  let commissionServiceStubs = {};
  let auditServiceStubs = {};

  test.beforeEach(() => {
    // Stub notaryProfileService methods
    notaryProfileServiceStubs.getNotaryProfile = sinon
      .stub(notaryProfileService, 'getNotaryProfile')
      .resolves({
        id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        rating: 4.8,
      });

    notaryProfileServiceStubs.toggleStatus = sinon
      .stub(notaryProfileService, 'toggleStatus')
      .resolves({
        id: '#1',
        status: 'ACTIVE',
      });

    notaryProfileServiceStubs.getCapabilities = sinon
      .stub(notaryProfileService, 'getCapabilities')
      .resolves({
        mobile: true,
        RON: false,
        loan_signing: true,
        apostille_related_support: false,
        max_distance: 50,
        service_areas: [
          { id: 1, county_name: 'Los Angeles', state_code: 'CA', state_name: 'California' },
        ],
        service_states: 'CA',
      });

    notaryProfileServiceStubs.getPerformance = sinon
      .stub(notaryProfileService, 'getPerformance')
      .resolves({
        total_jobs: 10,
        completed_jobs: 8,
        cancelled_jobs: 1,
        completion_rate: 80.0,
      });

    // Stub commissionService methods
    commissionServiceStubs.getLegalInfo = sinon.stub(commissionService, 'getLegalInfo').resolves({
      commissions: [{ id: 1, commission_number: 'COMM001', risk_status: 'VALID' }],
      bonds: [{ id: 1, provider_name: 'BondCo', risk_status: 'VALID' }],
      insurances: [{ id: 1, provider_name: 'InsureCo', risk_status: 'VALID' }],
    });

    // Stub auditService methods
    auditServiceStubs.getRecentActivities = sinon
      .stub(auditService, 'getRecentActivities')
      .resolves([
        {
          action_type: 'Document Uploaded',
          description: 'New document uploaded to the system',
          document_name: 'license.pdf',
          performed_by: 'admin',
          timestamp: '2024-01-01T00:00:00.000Z',
        },
      ]);
  });

  test.afterEach(() => {
    // Restore all stubs
    Object.values(notaryProfileServiceStubs).forEach((stub) => stub.restore());
    Object.values(commissionServiceStubs).forEach((stub) => stub.restore());    Object.values(auditServiceStubs).forEach(stub => stub.restore());  });

  test('GET /api/v1/notaries/:id - getNotaryById', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.id, 1);
    assert.strictEqual(response.body.data.rating, 4.8);
  });

  test('PATCH /api/v1/notaries/:id/status - toggleStatus', async () => {
    const response = await request(app)
      .patch('/api/v1/notaries/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' })
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.id, '#1');
    assert.strictEqual(response.body.data.status, 'ACTIVE');
  });

  test('GET /api/v1/notaries/:id/legal-info - getLegalInfo', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/legal-info')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.commissions.length, 1);
    assert.strictEqual(response.body.data.bonds.length, 1);
    assert.strictEqual(response.body.data.insurances.length, 1);
  });

  test('GET /api/v1/notaries/:id/capabilities - getCapabilities', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/capabilities')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.mobile, true);
    assert.strictEqual(response.body.data.service_states, 'CA');
  });

  test('GET /api/v1/notaries/:id/performance - getPerformance', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/performance')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.total_jobs, 10);
    assert.strictEqual(response.body.data.completion_rate, 80.0);
  });

  test('GET /api/v1/notaries/:id/activities - getRecentActivities', async () => {
    const response = await request(app)
      .get('/api/v1/notaries/1/activities')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    assert.strictEqual(response.body.success, true);
    assert.strictEqual(response.body.data.length, 1);
    assert.strictEqual(response.body.data[0].action_type, 'Document Uploaded');
  });
});
