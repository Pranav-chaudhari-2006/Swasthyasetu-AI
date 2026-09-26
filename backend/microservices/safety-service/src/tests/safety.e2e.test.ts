import request from 'supertest';
import { app } from '../app';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

describe('MS-5: Safety Service HTTP API E2E Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('safety-service');
    expect(res.body.status).toBe('HEALTHY');
  });

  it('GET /api/v1/safety/rules/info - should return active rule set governance metadata', async () => {
    const res = await request(app).get('/api/v1/safety/rules/info');
    expect(res.status).toBe(200);
    expect(res.body.ruleSet.versionTag).toBeDefined();
    expect(res.body.ruleSet.totalRules).toBeGreaterThanOrEqual(8);
  });

  it('POST /api/v1/safety/evaluate - evaluate acute emergency snapshot and query by caseId', async () => {
    const caseId = uuidv4();
    const patientId = uuidv4();

    const evalRes = await request(app)
      .post('/api/v1/safety/evaluate')
      .send({
        caseId,
        patientId,
        chiefSymptoms: [
          { symptomName: 'CHEST_PAIN', onsetDuration: 'ACUTE_HOURS', severityScore: 9 },
        ],
        reportedRedFlags: ['CHEST_PAIN_ACUTE'],
      });

    expect(evalRes.status).toBe(200);
    expect(evalRes.body.assessment.triagedPathway).toBe('EMERGENCY');
    expect(evalRes.body.assessment.isEmergencyBypass).toBe(true);
    expect(evalRes.body.assessment.recommendedCapabilities).toContain('CARDIOLOGY_ECG');

    // Query stored assessment by case ID
    const getRes = await request(app).get(`/api/v1/safety/case/${caseId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.assessment.triagedPathway).toBe('EMERGENCY');
  });
});
