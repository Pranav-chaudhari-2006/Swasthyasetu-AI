import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { db } from '../db';

const app = createApp();

describe('MS-7: Emergency Coordination & 108 Handoff Service Test Suite', () => {
  const caseId = uuidv4();
  const patientId = uuidv4();
  const facilityAId = uuidv4();
  const facilityBId = uuidv4();
  const ashaActorId = uuidv4();
  const doctorActorId = uuidv4();
  const physicianId = uuidv4();

  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  describe('1. Emergency Dispatch & Zero-Click Acceptance Bypass', () => {
    it('should immediately dispatch emergency event and notify destination ER without waiting for approval', async () => {
      const res = await request(app)
        .post('/api/v1/emergency/dispatch')
        .send({
          caseId,
          patientId,
          triggeredByActorId: ashaActorId,
          triggeredByActorRole: 'ASHA',
          emergencyClassification: 'ACUTE_CORONARY_SYNDROME',
          emergencyReason: 'Patient unresponsive with severe crushing chest pain and diaphoresis',
          patientLocationLat: 18.52043,
          patientLocationLng: 73.85674,
          allocatedFacilityId: facilityAId,
          transportMode: 'AMBULANCE_108',
          driverName: 'Ramesh Patil',
          driverContact: '+919876543210',
          vehicleNumber: 'MH-12-EM-1081',
          estimatedArrivalMinutes: 15
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.mems108Reference).toMatch(/^MEMS-108-\d{4}-\d{5}$/);
      expect(res.body.data.status).toBe('DISPATCHED');
      expect(res.body.data.allocatedFacilityId).toBe(facilityAId);

      // Verify immediate presence in Facility A active emergency ER queue
      const activeRes = await request(app).get(`/api/v1/emergency/facility/${facilityAId}/active`);
      expect(activeRes.status).toBe(200);
      expect(activeRes.body.count).toBe(1);
      expect(activeRes.body.data[0].id).toBe(res.body.data.id);
    });

    it('should reject invalid dispatch requests missing required geographic coordinates', async () => {
      const res = await request(app)
        .post('/api/v1/emergency/dispatch')
        .send({
          caseId,
          patientId,
          triggeredByActorId: ashaActorId,
          triggeredByActorRole: 'ASHA',
          emergencyClassification: 'SNAKE_BITE',
          emergencyReason: 'Neurotoxic snake bite'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Emergency Lifecycle & Telemetry Updates', () => {
    it('should progress through transport stages with telemetry breadcrumbs', async () => {
      // 1. Dispatch
      const dispatchRes = await request(app)
        .post('/api/v1/emergency/dispatch')
        .send({
          caseId,
          patientId,
          triggeredByActorId: doctorActorId,
          triggeredByActorRole: 'DOCTOR',
          emergencyClassification: 'TRAUMA_HEMORRHAGE',
          emergencyReason: 'Severe road accident polytrauma',
          patientLocationLat: 18.5300,
          patientLocationLng: 73.8600,
          allocatedFacilityId: facilityAId
        });
      const eventId = dispatchRes.body.data.id;

      // 2. Status: EN_ROUTE_SCENE
      const sceneRes = await request(app)
        .put(`/api/v1/emergency/${eventId}/status`)
        .send({
          status: 'EN_ROUTE_SCENE',
          actorId: ashaActorId,
          actorRole: '108_DISPATCHER',
          estimatedArrivalMinutes: 8
        });
      expect(sceneRes.status).toBe(200);
      expect(sceneRes.body.data.status).toBe('EN_ROUTE_SCENE');

      // 3. Telemetry Log
      const telemRes = await request(app)
        .post(`/api/v1/emergency/${eventId}/telemetry`)
        .send({
          latitude: 18.5280,
          longitude: 73.8590,
          speedKmh: 65.5,
          headingDeg: 180.0
        });
      expect(telemRes.status).toBe(200);
      expect(telemRes.body.data.liveLocation.speedKmh).toBe(65.5);

      // 4. Status: PATIENT_ONBOARD
      const onboardRes = await request(app)
        .put(`/api/v1/emergency/${eventId}/status`)
        .send({
          status: 'PATIENT_ONBOARD',
          actorId: ashaActorId,
          actorRole: 'PARAMEDIC',
          estimatedArrivalMinutes: 12
        });
      expect(onboardRes.status).toBe(200);
      expect(onboardRes.body.data.status).toBe('PATIENT_ONBOARD');

      // 5. Status: ARRIVED_ER
      const arriveRes = await request(app)
        .put(`/api/v1/emergency/${eventId}/status`)
        .send({
          status: 'ARRIVED_ER',
          actorId: ashaActorId,
          actorRole: 'PARAMEDIC'
        });
      expect(arriveRes.status).toBe(200);
      expect(arriveRes.body.data.status).toBe('ARRIVED_ER');
      expect(arriveRes.body.data.arrivedAt).toBeDefined();
    });
  });

  describe('3. Dynamic Destination Redirection', () => {
    it('should redirect en-route emergency vehicle to another facility and record audit trail', async () => {
      const dispatchRes = await request(app)
        .post('/api/v1/emergency/dispatch')
        .send({
          caseId,
          patientId,
          triggeredByActorId: ashaActorId,
          triggeredByActorRole: 'ASHA',
          emergencyClassification: 'SEVERE_RESPIRATORY_DISTRESS',
          emergencyReason: 'Severe asthma unresponsive to bronchodilators, oxygen saturation 78%',
          patientLocationLat: 18.52043,
          patientLocationLng: 73.85674,
          allocatedFacilityId: facilityAId
        });
      const eventId = dispatchRes.body.data.id;

      // Redirect from Facility A to Facility B due to full ICU
      const redirectRes = await request(app)
        .post(`/api/v1/emergency/${eventId}/redirect`)
        .send({
          newFacilityId: facilityBId,
          actorId: doctorActorId,
          actorRole: 'EMERGENCY_COORDINATOR',
          reason: 'Facility A ICU at 100% capacity; redirecting to Facility B tertiary trauma ICU'
        });

      expect(redirectRes.status).toBe(200);
      expect(redirectRes.body.data.allocatedFacilityId).toBe(facilityBId);
      expect(redirectRes.body.data.redirectHistory.length).toBe(1);
      expect(redirectRes.body.data.redirectHistory[0].previousFacilityId).toBe(facilityAId);
      expect(redirectRes.body.data.redirectHistory[0].newFacilityId).toBe(facilityBId);

      // Verify Facility A no longer has this active emergency, and Facility B does
      const facA = await request(app).get(`/api/v1/emergency/facility/${facilityAId}/active`);
      expect(facA.body.count).toBe(0);

      const facB = await request(app).get(`/api/v1/emergency/facility/${facilityBId}/active`);
      expect(facB.body.count).toBe(1);
    });
  });

  describe('4. Rapid ER Clinical Handoff', () => {
    it('should complete clinical handoff with receiving physician and archive active alert', async () => {
      const dispatchRes = await request(app)
        .post('/api/v1/emergency/dispatch')
        .send({
          caseId,
          patientId,
          triggeredByActorId: ashaActorId,
          triggeredByActorRole: 'ASHA',
          emergencyClassification: 'ISCHEMIC_STROKE',
          emergencyReason: 'Sudden left-sided hemiplegia and facial droop within 90-minute window',
          patientLocationLat: 18.52043,
          patientLocationLng: 73.85674,
          allocatedFacilityId: facilityAId
        });
      const eventId = dispatchRes.body.data.id;

      // Complete Handoff in ER
      const handoffRes = await request(app)
        .post(`/api/v1/emergency/${eventId}/handoff`)
        .send({
          receivingPhysicianId: physicianId,
          receivingPhysicianRole: 'NEUROLOGIST',
          handoffNotes: 'Patient handed over directly in stroke resuscitation suite. Thrombolysis CT angiography initiated.',
          vitalsOnArrival: { bp: '170/100', hr: 88, spo2: 96, gcs: 14 }
        });

      expect(handoffRes.status).toBe(200);
      expect(handoffRes.body.data.status).toBe('HANDOFF_COMPLETED');
      expect(handoffRes.body.data.receivingPhysicianId).toBe(physicianId);
      expect(handoffRes.body.data.handoffCompletedAt).toBeDefined();

      // Ensure no longer listed in active queue
      const activeRes = await request(app).get(`/api/v1/emergency/facility/${facilityAId}/active`);
      expect(activeRes.body.count).toBe(0);

      // Verify complete details fetch
      const detailsRes = await request(app).get(`/api/v1/emergency/${eventId}`);
      expect(detailsRes.status).toBe(200);
      expect(detailsRes.body.data.event.status).toBe('HANDOFF_COMPLETED');
    });
  });
});
