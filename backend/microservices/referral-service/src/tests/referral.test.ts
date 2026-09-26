import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { db } from '../db';
import { QRService } from '../services/qrService';
import { ReferralStateMachine } from '../services/stateMachine';

const app = createApp();

describe('MS-6: Referral State Machine & QR Service Test Suite', () => {
  const caseId = uuidv4();
  const patientId = uuidv4();
  const sourceFacilityId = uuidv4();
  const destFacilityId = uuidv4();
  const altFacilityId = uuidv4();
  const ashaActorId = uuidv4();
  const doctorActorId = uuidv4();
  const coordinatorStaffId = uuidv4();
  const nurseStaffId = uuidv4();

  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  describe('1. Referral Creation & Cryptographic QR Generation', () => {
    it('should create a valid referral with durable code, HMAC QR token and QR data URL', async () => {
      const res = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          sourceFacilityId,
          originatingActorId: ashaActorId,
          originatingActorRole: 'ASHA',
          destinationFacilityId: destFacilityId,
          pathway: 'ROUTINE',
          requiredCapabilities: ['ULTRASOUND_24X7', 'OB_GYN_ON_CALL'],
          clinicalSummary: '28-week pregnant mother requiring second trimester ultrasound screening'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.referralCode).toMatch(/^SS-REF-\d{4}-\d{5}$/);
      expect(res.body.data.currentState).toBe('ISSUED');
      expect(res.body.qrCodeUrl).toMatch(/^data:image\/png;base64,/);
      expect(res.body.qrToken).toBeDefined();

      // Verify QR signature validity
      const verifyRes = QRService.verifyQRToken(res.body.qrToken);
      expect(verifyRes.isValid).toBe(true);
      expect(verifyRes.payload?.referralId).toBe(res.body.data.id);
      expect(verifyRes.payload?.destinationFacilityId).toBe(destFacilityId);
    });

    it('should reject creation with missing required fields or invalid UUIDs', async () => {
      const res = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId: 'not-a-uuid',
          patientId,
          destinationFacilityId: destFacilityId,
          clinicalSummary: 'Test'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. End-to-End State Machine Lifecycle', () => {
    it('should execute full standard journey: ISSUED -> ACCEPTED -> EN_ROUTE -> ARRIVED -> TREATED -> DISCHARGED -> CLOSED', async () => {
      // 1. Create
      const createRes = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'SAME_DAY',
          requiredCapabilities: ['SURGICAL_SUITE'],
          clinicalSummary: 'Acute appendicitis suspected, requires surgical consult'
        });
      const referralId = createRes.body.data.id;
      const qrToken = createRes.body.qrToken;

      // 2. Accept by Facility
      const acceptRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/accept`)
        .send({
          staffId: coordinatorStaffId,
          staffRole: 'FACILITY_COORDINATOR',
          facilityId: destFacilityId,
          notes: 'Bed reserved in emergency triage ward'
        });
      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.currentState).toBe('ACCEPTED');

      // 3. Mark En Route
      const enRouteRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/en-route`)
        .send({
          actorId: ashaActorId,
          actorRole: 'ASHA',
          transportMode: 'AMBULANCE_108',
          estimatedArrivalMinutes: 25,
          vehicleNumber: 'MH-12-EM-108'
        });
      expect(enRouteRes.status).toBe(200);
      expect(enRouteRes.body.data.currentState).toBe('EN_ROUTE');
      expect(enRouteRes.body.data.transportDetails.vehicleNumber).toBe('MH-12-EM-108');

      // 4. Verify Arrival via QR Scan
      const arriveRes = await request(app)
        .post('/api/v1/referrals/verify-arrival')
        .send({
          qrToken,
          scannerFacilityId: destFacilityId,
          scannerStaffId: nurseStaffId,
          scannerStaffRole: 'TRIAGE_NURSE',
          triageNotes: 'Patient arrived with stable vitals'
        });
      expect(arriveRes.status).toBe(200);
      expect(arriveRes.body.arrivalConfirmed).toBe(true);
      expect(arriveRes.body.data.currentState).toBe('ARRIVED');

      // 5. Clinical Treatment
      const treatRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/outcome`)
        .send({
          targetState: 'TREATED',
          staffId: doctorActorId,
          staffRole: 'SURGEON',
          facilityId: destFacilityId,
          outcome: 'TREATED',
          notes: 'Emergency laparoscopic appendectomy successfully completed'
        });
      expect(treatRes.status).toBe(200);
      expect(treatRes.body.data.currentState).toBe('TREATED');

      // 6. Discharge
      const dischargeRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/outcome`)
        .send({
          targetState: 'DISCHARGED',
          staffId: doctorActorId,
          staffRole: 'SURGEON',
          facilityId: destFacilityId,
          dischargeSummary: 'Post-op recovery uneventful. Oral antibiotics prescribed for 5 days.'
        });
      expect(dischargeRes.status).toBe(200);
      expect(dischargeRes.body.data.currentState).toBe('DISCHARGED');

      // 7. Close Referral
      const closeRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/outcome`)
        .send({
          targetState: 'CLOSED',
          staffId: coordinatorStaffId,
          staffRole: 'FACILITY_COORDINATOR',
          facilityId: destFacilityId,
          notes: 'Care cycle completed'
        });
      expect(closeRes.status).toBe(200);
      expect(closeRes.body.data.currentState).toBe('CLOSED');

      // 8. Verify Complete Audit Ledger
      const detailsRes = await request(app).get(`/api/v1/referrals/${referralId}`);
      expect(detailsRes.status).toBe(200);
      expect(detailsRes.body.data.referral.currentState).toBe('CLOSED');
      expect(detailsRes.body.data.transitions.length).toBe(7); // Initial + Accept + EnRoute + Arrive + Treat + Discharge + Close
    });
  });

  describe('3. Strict State Transition Invariants & Tamper Protection', () => {
    it('should reject illegal state leaps (e.g. ISSUED directly to TREATED)', async () => {
      const createRes = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'ROUTINE',
          requiredCapabilities: ['OPHTHALMOLOGY'],
          clinicalSummary: 'Cataract assessment'
        });
      const referralId = createRes.body.data.id;

      const leapRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/outcome`)
        .send({
          targetState: 'TREATED',
          staffId: doctorActorId,
          facilityId: destFacilityId
        });
      expect(leapRes.status).toBe(400);
      expect(leapRes.body.error).toContain('Illegal state transition');
    });

    it('should reject tampered QR tokens', async () => {
      const createRes = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'ROUTINE',
          requiredCapabilities: ['X_RAY'],
          clinicalSummary: 'Fracture check'
        });
      const validToken = createRes.body.qrToken;
      const tamperedToken = validToken.slice(0, -5) + 'XXXXX';

      const scanRes = await request(app)
        .post('/api/v1/referrals/verify-arrival')
        .send({
          qrToken: tamperedToken,
          scannerFacilityId: destFacilityId,
          scannerStaffId: nurseStaffId
        });
      expect(scanRes.status).toBe(400);
      expect(scanRes.body.error).toContain('signature mismatch');
    });
  });

  describe('4. Facility Decline & Automated Re-routing', () => {
    it('should reject decline without a mandatory explanation reason', async () => {
      const createRes = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'ROUTINE',
          requiredCapabilities: ['CT_SCAN'],
          clinicalSummary: 'Head injury CT scan request'
        });
      const referralId = createRes.body.data.id;

      const declineRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/decline`)
        .send({
          staffId: coordinatorStaffId,
          facilityId: destFacilityId,
          reason: 'No' // too short (< 5 chars)
        });
      expect(declineRes.status).toBe(400);
    });

    it('should decline with valid reason and allow re-routing to alternative facility', async () => {
      const createRes = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'ROUTINE',
          requiredCapabilities: ['CT_SCAN'],
          clinicalSummary: 'Head injury CT scan request'
        });
      const referralId = createRes.body.data.id;

      // 1. Decline
      const declineRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/decline`)
        .send({
          staffId: coordinatorStaffId,
          facilityId: destFacilityId,
          reason: 'CT Scanner under emergency maintenance until tomorrow'
        });
      expect(declineRes.status).toBe(200);
      expect(declineRes.body.data.currentState).toBe('DECLINED');
      expect(declineRes.body.data.declineReason).toContain('maintenance');

      // 2. Re-route to alternative facility
      const rerouteRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/reroute`)
        .send({
          newDestinationFacilityId: altFacilityId,
          actorId: doctorActorId,
          actorRole: 'SYSTEM_ROUTER',
          reason: 'Re-routed to District Hospital with operational CT scanner'
        });
      expect(rerouteRes.status).toBe(200);
      expect(rerouteRes.body.data.currentState).toBe('ISSUED');
      expect(rerouteRes.body.data.destinationFacilityId).toBe(altFacilityId);
      expect(rerouteRes.body.qrCodeUrl).toBeDefined();

      // 3. New destination accepts
      const acceptRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/accept`)
        .send({
          staffId: coordinatorStaffId,
          facilityId: altFacilityId,
          notes: 'Accepted at District Hospital'
        });
      expect(acceptRes.status).toBe(200);
      expect(acceptRes.body.data.currentState).toBe('ACCEPTED');
    });
  });

  describe('5. Emergency Bypass Pathway', () => {
    it('should permit EMERGENCY referrals to transition ISSUED -> EN_ROUTE / ARRIVED directly bypassing routine acceptance', async () => {
      const createRes = await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: ashaActorId,
          originatingActorRole: 'ASHA',
          destinationFacilityId: destFacilityId,
          pathway: 'EMERGENCY',
          requiredCapabilities: ['CARDIAC_ICU', 'EMERGENCY_OT'],
          clinicalSummary: 'Acute ST-elevation myocardial infarction with cardiogenic shock',
          emergencyBypass: true
        });
      const referralId = createRes.body.data.id;
      const qrToken = createRes.body.qrToken;

      // Emergency: Mark en route directly from ISSUED
      const enRouteRes = await request(app)
        .post(`/api/v1/referrals/${referralId}/en-route`)
        .send({
          actorId: ashaActorId,
          actorRole: 'ASHA',
          transportMode: 'AMBULANCE_108',
          estimatedArrivalMinutes: 10,
          driverContact: '+919876543210'
        });
      expect(enRouteRes.status).toBe(200);
      expect(enRouteRes.body.data.currentState).toBe('EN_ROUTE');

      // Emergency: Arrival verified
      const arriveRes = await request(app)
        .post('/api/v1/referrals/verify-arrival')
        .send({
          qrToken,
          scannerFacilityId: destFacilityId,
          scannerStaffId: nurseStaffId,
          scannerStaffRole: 'EMERGENCY_TRIAGE_NURSE',
          triageNotes: 'Direct resuscitation bay transfer'
        });
      expect(arriveRes.status).toBe(200);
      expect(arriveRes.body.data.currentState).toBe('ARRIVED');
    });
  });

  describe('6. Facility Triage Inbox & Query Filtering', () => {
    it('should correctly query and filter incoming referrals in facility inbox', async () => {
      // Create 2 referrals for destFacilityId
      await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId: uuidv4(),
          patientId: uuidv4(),
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'ROUTINE',
          clinicalSummary: 'Inbox Test 1'
        });

      await request(app)
        .post('/api/v1/referrals')
        .send({
          caseId: uuidv4(),
          patientId: uuidv4(),
          originatingActorId: doctorActorId,
          originatingActorRole: 'DOCTOR',
          destinationFacilityId: destFacilityId,
          pathway: 'EMERGENCY',
          clinicalSummary: 'Inbox Test 2'
        });

      const inboxRes = await request(app).get(`/api/v1/referrals/facility/${destFacilityId}/inbox`);
      expect(inboxRes.status).toBe(200);
      expect(inboxRes.body.count).toBe(2);

      const emergencyInboxRes = await request(app).get(`/api/v1/referrals/facility/${destFacilityId}/inbox?pathway=EMERGENCY`);
      expect(emergencyInboxRes.status).toBe(200);
      expect(emergencyInboxRes.body.count).toBe(1);
      expect(emergencyInboxRes.body.data[0].pathway).toBe('EMERGENCY');
    });
  });
});
