import request from 'supertest';
import { app } from '../app';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

describe('MS-4: Intake Service HTTP API E2E Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('intake-service');
    expect(res.body.status).toBe('HEALTHY');
  });

  it('Complete Intake Flow: Start Session -> Process Hindi Message -> Process Audio -> Retrieve Facts', async () => {
    const caseId = uuidv4();
    const patientId = uuidv4();

    // 1. Start Session
    const startRes = await request(app)
      .post('/api/v1/intake/sessions')
      .send({
        caseId,
        patientId,
        languageCode: 'hi',
      });

    expect(startRes.status).toBe(201);
    expect(startRes.body.session.status).toBe('IN_PROGRESS');
    const sessionId = startRes.body.session.id;

    // 2. Process Text Message
    const msgRes = await request(app)
      .post(`/api/v1/intake/sessions/${sessionId}/messages`)
      .send({
        senderType: 'PATIENT',
        rawText: 'मुझे दो दिन से बहुत तेज बुखार है',
        languageCode: 'hi',
      });

    expect(msgRes.status).toBe(200);
    expect(msgRes.body.facts.chiefSymptoms.length).toBeGreaterThan(0);
    expect(msgRes.body.facts.chiefSymptoms[0].symptomName).toBe('FEVER');

    // 3. Process Voice Audio via Bhashini adapter
    const audioRes = await request(app)
      .post(`/api/v1/intake/sessions/${sessionId}/messages`)
      .send({
        senderType: 'PATIENT',
        audioBase64: 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        languageCode: 'hi',
      });

    expect(audioRes.status).toBe(200);
    expect(audioRes.body.facts.reportedRedFlags).toContain('CHEST_PAIN_ACUTE');

    // 4. Query Extracted Facts endpoint
    const factsRes = await request(app).get(`/api/v1/intake/sessions/${sessionId}/facts`);
    expect(factsRes.status).toBe(200);
    expect(factsRes.body.facts.isAiGenerated).toBe(true);

    // 5. Query Messages History
    const historyRes = await request(app).get(`/api/v1/intake/sessions/${sessionId}/messages`);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.count).toBe(2);
  });
});
