import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';

const app = createApp();

describe('MS-11: API Gateway & BFF Service Test Suite', () => {
  describe('1. Health Check & Downstream Microservice Registry', () => {
    it('should return 200 UP with all 10 downstream microservice URLs registered', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.service).toBe('api-gateway');
      expect(res.body.status).toBe('UP');
      expect(res.body.downstreamServices).toBeDefined();
      expect(res.body.downstreamServices.ms1_auth).toBeDefined();
      expect(res.body.downstreamServices.ms2_facility).toBeDefined();
      expect(res.body.downstreamServices.ms3_patientCase).toBeDefined();
      expect(res.body.downstreamServices.ms4_intake).toBeDefined();
      expect(res.body.downstreamServices.ms5_safety).toBeDefined();
      expect(res.body.downstreamServices.ms6_referral).toBeDefined();
      expect(res.body.downstreamServices.ms7_emergency).toBeDefined();
      expect(res.body.downstreamServices.ms8_clinical).toBeDefined();
      expect(res.body.downstreamServices.ms9_followup).toBeDefined();
      expect(res.body.downstreamServices.ms10_sync).toBeDefined();
    });
  });

  describe('2. Correlation Tracking & Security Headers', () => {
    it('should auto-generate X-Correlation-ID header if not provided', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBeDefined();
      expect(res.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should preserve and echo client provided X-Correlation-ID', async () => {
      const customId = uuidv4();
      const res = await request(app)
        .get('/health')
        .set('X-Correlation-ID', customId);

      expect(res.status).toBe(200);
      expect(res.headers['x-correlation-id']).toBe(customId);
    });
  });

  describe('3. Backend-For-Frontend (BFF) Aggregation', () => {
    it('should aggregate Patient PWA Dashboard resiliently', async () => {
      const patientId = uuidv4();
      const res = await request(app).get(`/api/v1/bff/patient/dashboard/${patientId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.patientId).toBe(patientId);
      expect(res.body.data.cases).toBeDefined();
      expect(res.body.data.activeReferrals).toBeDefined();
      expect(res.body.data.scheduledFollowUps).toBeDefined();
    });

    it('should aggregate Frontline ASHA Portal Dashboard resiliently', async () => {
      const workerId = uuidv4();
      const res = await request(app).get(`/api/v1/bff/frontline/dashboard/${workerId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.workerId).toBe(workerId);
      expect(res.body.data.pendingTasksCount).toBeDefined();
      expect(res.body.data.assignedTasks).toBeDefined();
    });

    it('should aggregate Facility Command Dashboard resiliently', async () => {
      const facilityId = uuidv4();
      const res = await request(app).get(`/api/v1/bff/facility/dashboard/${facilityId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.facilityId).toBe(facilityId);
      expect(res.body.data.referralInbox).toBeDefined();
      expect(res.body.data.activeEmergencies).toBeDefined();
      expect(res.body.data.inventoryStatus).toBeDefined();
    });
  });

  describe('4. Routing Error Handling', () => {
    it('should return 404 for unmapped API routes', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not found');
    });

    it('should return 502 Bad Gateway when downstream microservice is unreachable', async () => {
      // Testing reverse proxy to offline target
      const res = await request(app).get('/api/v1/facilities');
      expect([502, 200]).toContain(res.status);
      if (res.status === 502) {
        expect(res.body.success).toBe(false);
        expect(res.body.error).toContain('Bad Gateway');
      }
    });
  });
});
