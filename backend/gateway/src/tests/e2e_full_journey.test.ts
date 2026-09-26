import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';

// Import microservice application instances
import { app as authApp } from '../../../microservices/auth-service/src/app';
import { app as facilityApp } from '../../../microservices/facility-service/src/app';
import { app as patientCaseApp } from '../../../microservices/patient-case-service/src/app';
import { app as intakeApp } from '../../../microservices/intake-service/src/app';
import { app as safetyApp } from '../../../microservices/safety-service/src/app';
import { createApp as createReferralApp } from '../../../microservices/referral-service/src/app';
import { createApp as createEmergencyApp } from '../../../microservices/emergency-service/src/app';
import { createApp as createClinicalApp } from '../../../microservices/clinical-service/src/app';
import { createApp as createFollowupApp } from '../../../microservices/followup-service/src/app';
import { createApp as createSyncApp } from '../../../microservices/sync-service/src/app';
import { CryptoService as SyncCrypto } from '../../../microservices/sync-service/src/services/cryptoService';
import { SyncService } from '../../../microservices/sync-service/src/services/syncService';

const referralApp = createReferralApp();
const emergencyApp = createEmergencyApp();
const clinicalApp = createClinicalApp();
const followupApp = createFollowupApp();
const syncApp = createSyncApp();

// Authentication helpers
async function getPatientToken(phone: string): Promise<string> {
  const reqRes = await request(authApp)
    .post('/api/v1/auth/patient/otp/request')
    .send({ phone })
    .expect(200);

  const { challengeId, plainOtpDevOnly } = reqRes.body;

  const verRes = await request(authApp)
    .post('/api/v1/auth/patient/otp/verify')
    .send({ challengeId, phone, otp: plainOtpDevOnly })
    .expect(200);

  return verRes.body.accessToken;
}

async function getStaffAuth(role: 'MEDICAL_OFFICER' | 'SPECIALIST' | 'ASHA' | 'ANM'): Promise<{ token: string; staffId: string; facilityId: string }> {
  const facilityId = uuidv4();
  const email = `staff_${role.toLowerCase()}_${Date.now()}_${Math.floor(Math.random()*10000)}@sih-gov.in`;

  const regRes = await request(authApp)
    .post('/api/v1/auth/staff/register')
    .send({
      email,
      phone: '+91' + Math.floor(1000000000 + Math.random() * 9000000000),
      password: 'SecurePass2026!',
      role,
      fullName: `Staff ${role}`,
      designation: role,
      facilityId,
      district: 'Pune',
      state: 'Maharashtra',
      licenseNumber: `LIC-${Date.now().toString().slice(-6)}`,
    })
    .expect(201);

  const loginRes = await request(authApp)
    .post('/api/v1/auth/staff/login')
    .send({
      emailOrPhone: email,
      password: 'SecurePass2026!',
    })
    .expect(200);

  return { token: loginRes.body.accessToken, staffId: regRes.body.user.id, facilityId };
}

describe('Phase 13: Full-Journey End-to-End System Integration Test Suite', () => {

  beforeAll(async () => {
    // Publish baseline offline safety rules
    await SyncService.publishOfflineRules('v1.2.0-deterministic-pilot', {
      rules: [
        { id: 'RULE-ACS-001', trigger: 'chest_pain', category: 'EMERGENCY' },
        { id: 'RULE-URI-002', trigger: 'cough_fever', category: 'ROUTINE' }
      ]
    });
  });

  // -------------------------------------------------------------
  // JOURNEY 1: Direct Patient Routine Primary Care Journey
  // -------------------------------------------------------------
  describe('Journey 1: Direct Patient Routine Primary Care Flow', () => {
    let patientToken: string;
    let patientId: string;
    let caseId: string;
    let referralId: string;
    let qrToken: string;
    let facilityId: string;
    let staffId: string;
    let doctorToken: string;
    let doctorId: string;
    let taskId: string;

    it('Step 1.1: Patient requests OTP and authenticates with role PATIENT', async () => {
      patientToken = await getPatientToken('+919876543210');
      expect(patientToken).toBeDefined();
    });

    it('Step 1.2: Patient profile is registered and a new clinical case is opened', async () => {
      const patRes = await request(patientCaseApp)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          fullName: 'Anand Varma',
          age: 38,
          gender: 'MALE',
          phone: '+919876543210',
          district: 'Pune',
          state: 'Maharashtra',
        })
        .expect(201);

      expect(patRes.body.success).toBe(true);
      expect(patRes.body.patient.id).toBeDefined();
      patientId = patRes.body.patient.id;

      const caseRes = await request(patientCaseApp)
        .post('/api/v1/cases')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          patientId,
          chiefComplaintSummary: 'Mild fever and dry cough for 3 days',
        })
        .expect(201);

      expect(caseRes.body.success).toBe(true);
      expect(caseRes.body.case.id).toBeDefined();
      caseId = caseRes.body.case.id;
    });

    it('Step 1.3: Patient completes multilingual intake and safety engine triages as ROUTINE', async () => {
      // Start conversational intake session
      const sessRes = await request(intakeApp)
        .post('/api/v1/intake/sessions')
        .send({
          caseId,
          patientId,
          languageCode: 'hi',
        })
        .expect(201);

      expect(sessRes.body.success).toBe(true);
      const sessionId = sessRes.body.session.id;

      // Send symptom message
      const msgRes = await request(intakeApp)
        .post(`/api/v1/intake/sessions/${sessionId}/messages`)
        .send({
          senderType: 'PATIENT',
          rawText: 'Mujhe teen din se halka bukhar aur gala kharab hai',
        })
        .expect(200);

      expect(msgRes.body.success).toBe(true);
      expect(msgRes.body.facts.isAiGenerated).toBe(true);

      // Deterministic Safety Engine Evaluation
      const safetyRes = await request(safetyApp)
        .post('/api/v1/safety/evaluate')
        .send({
          caseId,
          patientId,
          chiefSymptoms: [
            { symptomName: 'Mild fever', onsetDuration: '3 days', severityScore: 3 },
            { symptomName: 'Dry cough', onsetDuration: '3 days', severityScore: 2 },
          ],
          reportedRedFlags: [],
          vitalSigns: { systolicBP: 122, diastolicBP: 78, pulseRate: 76, temperatureF: 99.4, spo2Percentage: 98 },
        })
        .expect(200);

      expect(safetyRes.body.success).toBe(true);
      expect(safetyRes.body.assessment.triagedPathway).toBe('ROUTINE');
      expect(safetyRes.body.assessment.isEmergencyBypass).toBe(false);
    });

    it('Step 1.4: Referral is issued with HMAC-SHA256 QR token', async () => {
      facilityId = uuidv4();
      staffId = uuidv4();

      const refRes = await request(referralApp)
        .post('/api/v1/referrals')
        .send({
          caseId,
          patientId,
          originatingActorId: staffId,
          originatingActorRole: 'ASHA',
          destinationFacilityId: facilityId,
          pathway: 'ROUTINE',
          requiredCapabilities: ['PRIMARY_OPD'],
          clinicalSummary: 'Routine viral upper respiratory symptoms. No dyspnea or hypoxia.',
        })
        .expect(201);

      expect(refRes.body.success).toBe(true);
      expect(refRes.body.qrToken).toBeDefined();
      expect(refRes.body.data.currentState).toBe('ISSUED');
      referralId = refRes.body.data.id;
      qrToken = refRes.body.qrToken;
    });

    it('Step 1.5: Facility accepts referral and patient physical arrival is confirmed via QR token', async () => {
      // Step A: Target facility accepts referral
      const acceptRes = await request(referralApp)
        .post(`/api/v1/referrals/${referralId}/accept`)
        .send({
          staffId,
          staffRole: 'FACILITY_COORDINATOR',
          facilityId,
          notes: 'Routine primary care consult appointment confirmed',
        })
        .expect(200);

      expect(acceptRes.body.success).toBe(true);
      expect(acceptRes.body.data.currentState).toBe('ACCEPTED');

      // Step B: Patient arrives at reception and scans arrival QR
      const arriveRes = await request(referralApp)
        .post('/api/v1/referrals/verify-arrival')
        .send({
          qrToken,
          scannerFacilityId: facilityId,
          scannerStaffId: staffId,
          scannerStaffRole: 'TRIAGE_NURSE',
          triageNotes: 'Patient present, vitals stable',
        })
        .expect(200);

      expect(arriveRes.body.success).toBe(true);
      expect(arriveRes.body.arrivalConfirmed).toBe(true);
      expect(arriveRes.body.data.currentState).toBe('ARRIVED');
    });

    it('Step 1.6: Medical officer performs clinical evaluation, prescribes medication and pharmacy dispenses', async () => {
      const docAuth = await getStaffAuth('MEDICAL_OFFICER');
      doctorToken = docAuth.token;
      doctorId = docAuth.staffId;

      // Clinical assessment
      const assessRes = await request(clinicalApp)
        .post('/api/v1/clinical/assessments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          caseId,
          patientId,
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER',
          facilityId,
          chiefComplaint: 'Mild fever and sore throat',
          physicalFindings: { bp: '120/80', temp: 99.0 },
          differentialDiagnosis: ['Viral pharyngitis', 'Common cold'],
          finalDiagnosis: 'Acute Upper Respiratory Tract Infection',
          clinicalNotes: 'Viral rhinitis, symptomatic management initiated',
        })
        .expect(201);

      expect(assessRes.body.success).toBe(true);
      const assessmentId = assessRes.body.data.id;

      // Ensure inventory exists
      await request(clinicalApp)
        .post('/api/v1/clinical/inventory')
        .send({ facilityId, medicineName: 'Paracetamol 500mg', stockCount: 100, unit: 'tablets' });

      await request(clinicalApp)
        .post('/api/v1/clinical/inventory')
        .send({ facilityId, medicineName: 'Cetirizine 10mg', stockCount: 50, unit: 'tablets' });

      // E-Prescription
      const rxRes = await request(clinicalApp)
        .post('/api/v1/clinical/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          caseId,
          patientId,
          assessmentId,
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER',
          facilityId,
          instructions: 'Take after meals',
          items: [
            { medicineName: 'Paracetamol 500mg', dosage: '500mg', frequency: 'TDS', durationDays: 3, quantity: 9 },
            { medicineName: 'Cetirizine 10mg', dosage: '10mg', frequency: 'HS', durationDays: 3, quantity: 3 },
          ],
        })
        .expect(201);

      expect(rxRes.body.success).toBe(true);
      const prescriptionId = rxRes.body.data.id;
      const rxItems = rxRes.body.data.items;

      // Pharmacy Dispensing
      const dispenseRes = await request(clinicalApp)
        .post('/api/v1/clinical/medicines/dispense')
        .send({
          prescriptionId,
          facilityId,
          dispensedById: doctorId,
          dispensedByRole: 'PHARMACIST',
          items: [
            { itemId: rxItems[0].id, quantity: 9 },
            { itemId: rxItems[1].id, quantity: 3 },
          ],
        })
        .expect(200);

      expect(dispenseRes.body.success).toBe(true);
      expect(dispenseRes.body.data.id).toBe(prescriptionId);
    });

    it('Step 1.7: Post-treatment follow-up task is scheduled and verified completed', async () => {
      const taskRes = await request(followupApp)
        .post('/api/v1/followup/tasks')
        .send({
          caseId,
          patientId,
          assignedAshaId: staffId,
          dueDate: '2026-09-30',
          taskType: 'TELE_CONSULT',
          priority: 'ROUTINE',
          instructions: 'Call patient after 3 days to verify fever resolution.',
        })
        .expect(201);

      expect(taskRes.body.success).toBe(true);
      taskId = taskRes.body.data.id;

      const completeRes = await request(followupApp)
        .post(`/api/v1/followup/tasks/${taskId}/complete`)
        .send({
          completedBy: staffId,
          completedByRole: 'ASHA',
          completionNotes: 'Patient contacted via phone, afebrile, dry cough subsided.',
          vitalsObserved: { systolic_bp: 120, diastolic_bp: 80 },
        })
        .expect(200);

      expect(completeRes.body.success).toBe(true);
      expect(completeRes.body.data.status).toBe('COMPLETED');
    });
  });

  // -------------------------------------------------------------
  // JOURNEY 2: Frontline Worker Assisted Emergency Journey (108 Handoff)
  // -------------------------------------------------------------
  describe('Journey 2: Frontline Worker Assisted Emergency & 108 Handoff', () => {
    let ashaToken: string;
    let ashaActorId: string;
    let docActorId: string;
    let tertiaryFacilityId: string;
    let emgCaseId: string;
    let emgPatientId: string;
    let dispatchId: string;

    it('Step 2.1: ASHA worker logs in and registers critical emergency intake', async () => {
      const ashaAuth = await getStaffAuth('ASHA');
      ashaToken = ashaAuth.token;
      ashaActorId = ashaAuth.staffId;

      const docAuth = await getStaffAuth('SPECIALIST');
      docActorId = docAuth.staffId;
      tertiaryFacilityId = docAuth.facilityId;

      // Patient registration
      const patRes = await request(patientCaseApp)
        .post('/api/v1/patients')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          fullName: 'Ramesh Kulkarni',
          age: 54,
          gender: 'MALE',
          phone: '+919876543299',
          district: 'Pune',
          state: 'Maharashtra',
        })
        .expect(201);

      emgPatientId = patRes.body.patient.id;

      // Case creation
      const caseRes = await request(patientCaseApp)
        .post('/api/v1/cases')
        .set('Authorization', `Bearer ${ashaToken}`)
        .send({
          patientId: emgPatientId,
          operatedBy: ashaActorId,
          actorRole: 'ASHA',
          chiefComplaintSummary: 'Crushing chest pain radiating to left jaw with diaphoresis',
        })
        .expect(201);

      emgCaseId = caseRes.body.case.id;

      // Emergency Intake via session
      const sessRes = await request(intakeApp)
        .post('/api/v1/intake/sessions')
        .send({
          caseId: emgCaseId,
          patientId: emgPatientId,
          operatedBy: ashaActorId,
          languageCode: 'en',
        })
        .expect(201);

      const sessId = sessRes.body.session.id;

      await request(intakeApp)
        .post(`/api/v1/intake/sessions/${sessId}/messages`)
        .send({
          senderType: 'ASHA',
          rawText: 'Patient collapsed with severe chest pressure, cold clammy skin, breathlessness, and left shoulder pain since 45 minutes.',
        })
        .expect(200);

      // Deterministic Safety Engine Evaluation
      const safetyRes = await request(safetyApp)
        .post('/api/v1/safety/evaluate')
        .send({
          caseId: emgCaseId,
          patientId: emgPatientId,
          chiefSymptoms: [
            { symptomName: 'Crushing chest pain', onsetDuration: '45 mins', severityScore: 10, bodySite: 'Precordial' },
            { symptomName: 'Severe dyspnea', onsetDuration: '45 mins', severityScore: 9 },
          ],
          reportedRedFlags: ['CRUSHING_CHEST_PAIN', 'DIAPHORESIS', 'HYPOXIA'],
          vitalSigns: { systolicBP: 160, diastolicBP: 102, pulseRate: 116, spo2Percentage: 89 },
        })
        .expect(200);

      expect(safetyRes.body.success).toBe(true);
      expect(safetyRes.body.assessment.triagedPathway).toBe('EMERGENCY');
      expect(safetyRes.body.assessment.isEmergencyBypass).toBe(true);
      expect(safetyRes.body.assessment.triggeredRuleIds.length).toBeGreaterThan(0);
    });

    it('Step 2.2: Zero-click bypass triggers 108 emergency dispatch and streams telemetry', async () => {
      const emgRes = await request(emergencyApp)
        .post('/api/v1/emergency/dispatch')
        .send({
          caseId: emgCaseId,
          patientId: emgPatientId,
          triggeredByActorId: ashaActorId,
          triggeredByActorRole: 'ASHA',
          emergencyClassification: 'RED',
          emergencyReason: 'Acute Coronary Syndrome with severe hypoxia',
          patientLocationLat: 18.5204,
          patientLocationLng: 73.8567,
          allocatedFacilityId: tertiaryFacilityId,
          transportMode: 'AMBULANCE_108',
          mems108Reference: '108-MH-PUNE-8821',
          driverName: 'Sanjay Patil',
          driverContact: '+919822001122',
          vehicleNumber: 'MH-12-EM-1081',
          estimatedArrivalMinutes: 8,
        })
        .expect(201);

      expect(emgRes.body.success).toBe(true);
      expect(emgRes.body.data.status).toBe('DISPATCHED');
      dispatchId = emgRes.body.data.id;

      // Telemetry update en route
      const telemRes = await request(emergencyApp)
        .post(`/api/v1/emergency/${dispatchId}/telemetry`)
        .send({
          latitude: 18.5255,
          longitude: 73.8590,
          speedKmh: 65,
          headingDeg: 120,
        })
        .expect(200);

      expect(telemRes.body.success).toBe(true);
      expect(telemRes.body.data.liveLocation.speedKmh).toBe(65);
    });

    it('Step 2.3: Ambulance arrives at District Hospital ER and formal 108 handoff is executed', async () => {
      const handoffRes = await request(emergencyApp)
        .post(`/api/v1/emergency/${dispatchId}/handoff`)
        .send({
          receivingPhysicianId: docActorId,
          receivingPhysicianRole: 'EMERGENCY_PHYSICIAN',
          handoffNotes: 'Patient received in Resuscitation Bay. ST elevation on ECG confirmed. Thrombolysis commenced.',
          vitalsOnArrival: { bp: '150/96', hr: 110, spo2: 92 },
        })
        .expect(200);

      expect(handoffRes.body.success).toBe(true);
      expect(handoffRes.body.data.status).toBe('HANDOFF_COMPLETED');
      expect(handoffRes.body.data.handoffCompletedAt).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // JOURNEY 3: Rejection Recovery & Deterministic Auto-Reroute Flow
  // -------------------------------------------------------------
  describe('Journey 3: Rejection Recovery & Auto-Reroute Flow', () => {
    let referralId: string;
    let chcFacilityId: string;
    let distHospitalId: string;
    let actorId: string;

    it('Step 3.1: Referral is issued to CHC, which declines due to ICU capacity exhaustion', async () => {
      chcFacilityId = uuidv4();
      distHospitalId = uuidv4();
      actorId = uuidv4();

      const refRes = await request(referralApp)
        .post('/api/v1/referrals')
        .send({
          caseId: uuidv4(),
          patientId: uuidv4(),
          originatingActorId: actorId,
          originatingActorRole: 'PHC_DOCTOR',
          destinationFacilityId: chcFacilityId,
          pathway: 'SAME_DAY',
          requiredCapabilities: ['HIGH_FLOW_OXYGEN', 'ICU_BACKUP'],
          clinicalSummary: 'Severe acute asthma exacerbation requiring high-flow oxygen and ICU backup.',
        })
        .expect(201);

      referralId = refRes.body.data.id;
      expect(refRes.body.data.currentState).toBe('ISSUED');

      // CHC declines referral
      const declineRes = await request(referralApp)
        .post(`/api/v1/referrals/${referralId}/decline`)
        .send({
          staffId: uuidv4(),
          staffRole: 'FACILITY_COORDINATOR',
          facilityId: chcFacilityId,
          reason: 'ICU Beds at 100% capacity; unable to safely admit high-flow oxygen dependent patient.',
          alternativeFacilitySuggestions: [distHospitalId],
        })
        .expect(200);

      expect(declineRes.body.success).toBe(true);
      expect(declineRes.body.data.currentState).toBe('DECLINED');
      expect(declineRes.body.data.declineReason).toBeDefined();
    });

    it('Step 3.2: Deterministic reroute transitions referral to District Hospital which accepts', async () => {
      const rerouteRes = await request(referralApp)
        .post(`/api/v1/referrals/${referralId}/reroute`)
        .send({
          actorId,
          actorRole: 'SYSTEM_ROUTER',
          newDestinationFacilityId: distHospitalId,
          reason: 'Auto-rerouted due to capacity decline at initial facility',
        })
        .expect(200);

      expect(rerouteRes.body.success).toBe(true);
      expect(rerouteRes.body.data.destinationFacilityId).toBe(distHospitalId);

      // District Hospital accepts
      const acceptRes = await request(referralApp)
        .post(`/api/v1/referrals/${referralId}/accept`)
        .send({
          staffId: uuidv4(),
          staffRole: 'FACILITY_COORDINATOR',
          facilityId: distHospitalId,
          notes: 'ICU Bed 04 reserved. Ready to receive patient.',
        })
        .expect(200);

      expect(acceptRes.body.success).toBe(true);
      expect(acceptRes.body.data.currentState).toBe('ACCEPTED');
    });
  });

  // -------------------------------------------------------------
  // JOURNEY 4: Offline Resilience & Cryptographic Batch Reconciliation
  // -------------------------------------------------------------
  describe('Journey 4: Offline Resilience & Cryptographic Batch Sync', () => {
    it('Step 4.1: Frontline worker obtains signed offline rule package', async () => {
      const rulesPkg = await request(syncApp)
        .get('/api/v1/sync/rules/offline-package')
        .expect(200);

      expect(rulesPkg.body.success).toBe(true);
      expect(rulesPkg.body.data.versionTag).toBe('v1.2.0-deterministic-pilot');
      expect(rulesPkg.body.data.packageSignature).toBeDefined();
      expect(rulesPkg.body.data.rulesDefinition).toBeDefined();
    });

    it('Step 4.2: Frontline client submits queued mutations and reconciles with server authority', async () => {
      const deviceId = 'DEV-ASHA-HAVELI-042';
      const actorId = uuidv4();
      const patientId = uuidv4();
      const caseId = uuidv4();
      const timestamp = new Date().toISOString();
      const opId1 = uuidv4();
      const opId2 = uuidv4();

      const payload1 = { fullName: 'Priya Shinde', age: 26, gender: 'FEMALE' };
      const payload2 = { notes: 'Post-natal checkup completed' };

      const sig1 = SyncCrypto.generateSignature({
        operationId: opId1,
        deviceId,
        sequenceNumber: 1,
        entityId: patientId,
        clientTimestamp: timestamp,
        payload: payload1,
      });

      const sig2 = SyncCrypto.generateSignature({
        operationId: opId2,
        deviceId,
        sequenceNumber: 2,
        entityId: caseId,
        clientTimestamp: timestamp,
        payload: payload2,
      });

      const batchRes = await request(syncApp)
        .post('/api/v1/sync/batch')
        .send({
          deviceId,
          operations: [
            {
              operationId: opId1,
              deviceId,
              sequenceNumber: 1,
              actorId,
              actorRole: 'ASHA',
              entityType: 'PATIENT',
              entityId: patientId,
              action: 'CREATE',
              payload: payload1,
              clientTimestamp: timestamp,
              hmacSignature: sig1,
            },
            {
              operationId: opId2,
              deviceId,
              sequenceNumber: 2,
              actorId,
              actorRole: 'ASHA',
              entityType: 'CASE',
              entityId: caseId,
              action: 'UPDATE',
              payload: payload2,
              clientTimestamp: timestamp,
              hmacSignature: sig2,
            },
          ],
        })
        .expect(200);

      expect(batchRes.body.success).toBe(true);
      expect(batchRes.body.data.totalReceived).toBe(2);
      expect(batchRes.body.data.operations.length).toBe(2);
      expect(batchRes.body.data.operations[0].status).toBe('COMMITTED');
      expect(batchRes.body.data.operations[1].status).toBe('COMMITTED');
    });

    it('Step 4.3: Strict Idempotency is enforced when duplicate batch is resubmitted', async () => {
      const deviceId = 'DEV-ASHA-HAVELI-042';
      const actorId = uuidv4();
      const entityId = uuidv4();
      const timestamp = new Date().toISOString();
      const opId = uuidv4();
      const payload = { test: 'Idempotency verification' };

      const sig = SyncCrypto.generateSignature({
        operationId: opId,
        deviceId,
        sequenceNumber: 3,
        entityId,
        clientTimestamp: timestamp,
        payload,
      });

      const op = {
        operationId: opId,
        deviceId,
        sequenceNumber: 3,
        actorId,
        actorRole: 'ASHA',
        entityType: 'CASE' as const,
        entityId,
        action: 'UPDATE' as const,
        payload,
        clientTimestamp: timestamp,
        hmacSignature: sig,
      };

      // First submission
      const firstRes = await request(syncApp)
        .post('/api/v1/sync/batch')
        .send({ deviceId, operations: [op] })
        .expect(200);

      expect(firstRes.body.data.operations[0].status).toBe('COMMITTED');

      // Duplicate submission
      const dupRes = await request(syncApp)
        .post('/api/v1/sync/batch')
        .send({ deviceId, operations: [op] })
        .expect(200);

      expect(dupRes.body.data.duplicateCount).toBe(1);
      expect(dupRes.body.data.operations[0].reconciliationResolution).toBe('IDEMPOTENT_NOOP');
    });
  });

});
