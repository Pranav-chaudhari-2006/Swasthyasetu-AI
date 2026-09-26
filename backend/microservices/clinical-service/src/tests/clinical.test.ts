import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { db } from '../db';

const app = createApp();

describe('MS-8: Clinical Workflow, Medicine & Diagnostic Service Test Suite', () => {
  const caseId = uuidv4();
  const patientId = uuidv4();
  const facilityId = uuidv4();
  const doctorId = uuidv4();
  const ashaId = uuidv4();
  const pharmacistId = uuidv4();
  const labTechId = uuidv4();

  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  describe('1. Clinical Assessments & Diagnosis Role Protection', () => {
    it('should allow authorized Medical Officer to record clinical assessment and definitive diagnosis', async () => {
      const res = await request(app)
        .post('/api/v1/clinical/assessments')
        .send({
          caseId,
          patientId,
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER',
          facilityId,
          chiefComplaint: 'High grade fever with rigors for 4 days',
          physicalFindings: { tempF: 103.2, bp: '110/70', hr: 98, spleenPalpable: true },
          differentialDiagnosis: ['Vivax Malaria', 'Falciparum Malaria', 'Dengue Fever'],
          finalDiagnosis: 'Plasmodium Vivax Malaria (Slide Positive)',
          clinicalNotes: 'Patient started on oral Chloroquine and Primaquine regimen.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.finalDiagnosis).toBe('Plasmodium Vivax Malaria (Slide Positive)');
    });

    it('should strictly reject unauthorized roles (e.g. ASHA or Patient) with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/clinical/assessments')
        .send({
          caseId,
          patientId,
          clinicianId: ashaId,
          clinicianRole: 'ASHA',
          facilityId,
          chiefComplaint: 'Fever',
          finalDiagnosis: 'Malaria'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('not authorized');
    });
  });

  describe('2. Authorized Prescriptions & Role Validation', () => {
    it('should allow authorized clinician to create multi-item prescription', async () => {
      const res = await request(app)
        .post('/api/v1/clinical/prescriptions')
        .send({
          caseId,
          patientId,
          clinicianId: doctorId,
          clinicianRole: 'SPECIALIST',
          facilityId,
          instructions: 'Take medicines after meals with full glass of water',
          items: [
            {
              medicineName: 'Paracetamol 650mg',
              dosage: '650mg',
              frequency: 'TDS (Thrice daily)',
              durationDays: 3,
              quantity: 9
            },
            {
              medicineName: 'Chloroquine 250mg',
              dosage: '250mg',
              frequency: 'OD (Once daily)',
              durationDays: 3,
              quantity: 6
            }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(2);
      expect(res.body.data.items[0].isDispensed).toBe(false);
    });

    it('should reject prescription creation from non-clinical personnel', async () => {
      const res = await request(app)
        .post('/api/v1/clinical/prescriptions')
        .send({
          caseId,
          patientId,
          clinicianId: ashaId,
          clinicianRole: 'ASHA',
          facilityId,
          items: [{ medicineName: 'Paracetamol', dosage: '500mg', frequency: 'OD', durationDays: 1, quantity: 1 }]
        });

      expect(res.status).toBe(403);
    });
  });

  describe('3. Real Medicine Inventory & Transactional Pharmacy Dispensing', () => {
    it('should update stock inventory and deduct transactionally upon pharmacist dispensing', async () => {
      // 1. Stock initial inventory
      await request(app)
        .post('/api/v1/clinical/inventory')
        .send({
          facilityId,
          medicineName: 'Amoxicillin 500mg',
          stockCount: 100,
          unit: 'capsules'
        });

      // 2. Create Prescription
      const presRes = await request(app)
        .post('/api/v1/clinical/prescriptions')
        .send({
          caseId,
          patientId,
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER',
          facilityId,
          items: [
            {
              medicineName: 'Amoxicillin 500mg',
              dosage: '500mg',
              frequency: 'TDS',
              durationDays: 5,
              quantity: 15
            }
          ]
        });
      const prescriptionId = presRes.body.data.id;
      const itemId = presRes.body.data.items[0].id;

      // 3. Dispense by Pharmacist
      const dispenseRes = await request(app)
        .post('/api/v1/clinical/medicines/dispense')
        .send({
          prescriptionId,
          facilityId,
          dispensedById: pharmacistId,
          dispensedByRole: 'PHARMACIST',
          items: [{ itemId, quantity: 15 }]
        });

      expect(dispenseRes.status).toBe(200);
      expect(dispenseRes.body.success).toBe(true);
      expect(dispenseRes.body.data.items[0].isDispensed).toBe(true);

      // 4. Verify inventory deducted (100 - 15 = 85)
      const invRes = await request(app).get(`/api/v1/clinical/inventory/facility/${facilityId}`);
      expect(invRes.status).toBe(200);
      const amox = invRes.body.data.find((i: any) => i.medicineName === 'Amoxicillin 500mg');
      expect(amox.stockCount).toBe(85);
      expect(amox.stockStatus).toBe('IN_STOCK');
    });

    it('should flag insufficient stock warning without crashing or creating negative balance', async () => {
      await request(app)
        .post('/api/v1/clinical/inventory')
        .send({
          facilityId,
          medicineName: 'Azithromycin 500mg',
          stockCount: 5
        });

      const presRes = await request(app)
        .post('/api/v1/clinical/prescriptions')
        .send({
          caseId,
          patientId,
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER',
          facilityId,
          items: [{ medicineName: 'Azithromycin 500mg', dosage: '500mg', frequency: 'OD', durationDays: 10, quantity: 10 }]
        });
      const prescriptionId = presRes.body.data.id;
      const itemId = presRes.body.data.items[0].id;

      const dispenseRes = await request(app)
        .post('/api/v1/clinical/medicines/dispense')
        .send({
          prescriptionId,
          facilityId,
          dispensedById: pharmacistId,
          dispensedByRole: 'PHARMACIST',
          items: [{ itemId, quantity: 10 }]
        });

      expect(dispenseRes.status).toBe(200);
      expect(dispenseRes.body.warnings.length).toBeGreaterThan(0);
      expect(dispenseRes.body.warnings[0]).toContain('Insufficient stock');
    });
  });

  describe('4. Diagnostic Laboratory Order Lifecycle', () => {
    it('should complete diagnostic workflow: ORDERED -> RESULT_ATTACHED -> CLINICIAN_REVIEWED', async () => {
      // 1. Order Test
      const orderRes = await request(app)
        .post('/api/v1/clinical/diagnostics/order')
        .send({
          caseId,
          patientId,
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER',
          facilityId,
          testName: 'Complete Blood Count (CBC) with Platelet Count'
        });
      expect(orderRes.status).toBe(201);
      const orderId = orderRes.body.data.id;
      expect(orderRes.body.data.status).toBe('ORDERED');

      // 2. Lab Tech attaches results
      const resultRes = await request(app)
        .put(`/api/v1/clinical/diagnostics/${orderId}/result`)
        .send({
          labTechId,
          labTechRole: 'LAB_TECH',
          resultData: { hb: 13.5, wbc: 8200, platelets: 195000, esr: 12 },
          resultFileUrl: 'https://storage.swasthyasetu.gov.in/lab/cbc-101.pdf'
        });
      expect(resultRes.status).toBe(200);
      expect(resultRes.body.data.status).toBe('RESULT_ATTACHED');
      expect(resultRes.body.data.resultData.platelets).toBe(195000);

      // 3. Clinician reviews result
      const reviewRes = await request(app)
        .put(`/api/v1/clinical/diagnostics/${orderId}/review`)
        .send({
          clinicianId: doctorId,
          clinicianRole: 'MEDICAL_OFFICER'
        });
      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.data.status).toBe('CLINICIAN_REVIEWED');
      expect(reviewRes.body.data.reviewedByClinicianId).toBe(doctorId);
    });
  });

  describe('5. Inpatient Hospital Admission & Structured Discharge', () => {
    it('should manage inpatient admission and structured discharge summary', async () => {
      // 1. Admit
      const admitRes = await request(app)
        .post('/api/v1/clinical/admissions')
        .send({
          caseId,
          patientId,
          facilityId,
          admittedBy: doctorId,
          clinicianRole: 'SURGEON',
          wardBed: 'General Surgical Ward - Bed 14'
        });
      expect(admitRes.status).toBe(201);
      const admissionId = admitRes.body.data.id;
      expect(admitRes.body.data.status).toBe('ADMITTED');

      // 2. Discharge
      const dischargeRes = await request(app)
        .post(`/api/v1/clinical/admissions/${admissionId}/discharge`)
        .send({
          dischargedBy: doctorId,
          clinicianRole: 'SURGEON',
          dischargeSummary: 'Post-operative recovery satisfactory. Surgical wound clean and healing without signs of infection.',
          followUpInstructions: 'Suture removal in 7 days at local PHC. Avoid heavy lifting for 3 weeks.'
        });
      expect(dischargeRes.status).toBe(200);
      expect(dischargeRes.body.data.status).toBe('DISCHARGED');
      expect(dischargeRes.body.data.dischargedAt).toBeDefined();
    });
  });
});
