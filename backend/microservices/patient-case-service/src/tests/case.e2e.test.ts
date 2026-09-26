import request from 'supertest';
import { app } from '../app';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

describe('MS-3: Patient & Case Continuity Service HTTP API E2E Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('GET /health - should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.service).toBe('patient-case-service');
    expect(res.body.status).toBe('HEALTHY');
  });

  it('Complete Lifecycle: Register Patient -> Open Case -> Append Timeline Events -> Query Unified Master Timeline', async () => {
    // 1. Register Patient
    const regRes = await request(app)
      .post('/api/v1/patients')
      .send({
        fullName: 'Meena Sharma',
        age: 34,
        gender: 'FEMALE',
        phone: '+919876540000',
        district: 'Amethi',
        state: 'Uttar Pradesh',
        preferredLanguage: 'hi',
        emergencyContactName: 'Rajesh Sharma',
        emergencyContactPhone: '+919876540001',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.patient.durablePatientCode).toBeDefined();
    const patientId = regRes.body.patient.id;

    // 2. Open Case (Direct Patient Intake)
    const caseRes = await request(app)
      .post('/api/v1/cases')
      .send({
        patientId,
        chiefComplaintSummary: 'Persistent high fever with chills for 4 days',
      });

    expect(caseRes.status).toBe(201);
    expect(caseRes.body.case.status).toBe('CREATED');
    const caseId = caseRes.body.case.id;

    // 3. Append Domain Events across care journey
    const facilityId = uuidv4();
    const doctorId = uuidv4();

    // Event 1: Safety Triaged (SAME_DAY)
    await request(app)
      .post(`/api/v1/cases/${caseId}/timeline/events`)
      .send({
        eventType: 'SAFETY_TRIAGED',
        actorId: 'SAFETY_ENGINE',
        actorRole: 'SYSTEM',
        eventData: { pathway: 'SAME_DAY', triggeredRules: ['RULE_FEVER_PROLONGED'] },
      });

    // Event 2: Facility Arrival & Reassessment
    await request(app)
      .post(`/api/v1/cases/${caseId}/timeline/events`)
      .send({
        eventType: 'PATIENT_ARRIVED',
        actorId: doctorId,
        actorRole: 'MEDICAL_OFFICER',
        facilityId,
        eventData: { triageAssessment: 'Moderate dehydration, vitals stable' },
      });

    // 4. Update Case Status to UNDER_CARE
    const statusUpdateRes = await request(app)
      .put(`/api/v1/cases/${caseId}/status`)
      .send({
        status: 'UNDER_CARE',
        assignedPathway: 'SAME_DAY',
        primaryFacilityId: facilityId,
        actorId: doctorId,
        actorRole: 'MEDICAL_OFFICER',
        eventReason: 'Patient admitted to day-care observation ward',
      });

    expect(statusUpdateRes.status).toBe(200);
    expect(statusUpdateRes.body.case.status).toBe('UNDER_CARE');

    // 5. Query Master Unified Timeline Projection
    const timelineRes = await request(app).get(`/api/v1/cases/${caseId}/timeline`);
    expect(timelineRes.status).toBe(200);
    expect(timelineRes.body.count).toBeGreaterThanOrEqual(3);
    const eventTypes = timelineRes.body.timeline.map((e: any) => e.eventType);
    expect(eventTypes).toContain('CASE_CREATED');
    expect(eventTypes).toContain('SAFETY_TRIAGED');
    expect(eventTypes).toContain('PATIENT_ARRIVED');

    // 6. Query Full Case Details
    const detailsRes = await request(app).get(`/api/v1/cases/${caseId}`);
    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.case.patient.fullName).toBe('Meena Sharma');
    expect(detailsRes.body.case.timeline.length).toBeGreaterThanOrEqual(3);
  });
});
