import { patientService } from '../services/patient.service';
import { caseService } from '../services/case.service';
import { db } from '../db/database';
import { v4 as uuidv4 } from 'uuid';

describe('MS-3: Patient Registry & Operator Attribution Unit Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('should generate durable SwasthyaSetu Patient ID in correct format', () => {
    const code = patientService.generateDurablePatientCode();
    expect(code).toMatch(/^SS-PAT-\d{4}-[A-F0-9]{6}$/);
  });

  it('should register patient with demographics and query by ID / Code', async () => {
    const patient = await patientService.registerPatient({
      fullName: 'Sunita Devi',
      age: 28,
      gender: 'FEMALE',
      phone: '+919876543210',
      district: 'Amethi',
      state: 'Uttar Pradesh',
      preferredLanguage: 'hi',
    });

    expect(patient.id).toBeDefined();
    expect(patient.durablePatientCode).toBeDefined();
    expect(patient.fullName).toBe('Sunita Devi');

    const byId = await patientService.getPatientById(patient.id);
    expect(byId?.fullName).toBe('Sunita Devi');

    const byCode = await patientService.getPatientByCode(patient.durablePatientCode);
    expect(byCode?.id).toBe(patient.id);
  });

  it('should link caregiver and maintain relationship record', async () => {
    const patient = await patientService.registerPatient({
      fullName: 'Rohan Kumar (Minor)',
      age: 6,
      gender: 'MALE',
      district: 'Amethi',
      state: 'Uttar Pradesh',
    });

    const motherUserId = uuidv4();
    const link = await patientService.linkCaregiver({
      patientId: patient.id,
      caregiverUserId: motherUserId,
      relationshipType: 'MOTHER',
    });

    expect(link.patientId).toBe(patient.id);
    expect(link.caregiverUserId).toBe(motherUserId);
    expect(link.isAuthorized).toBe(true);

    const list = await patientService.getCaregivers(patient.id);
    expect(list.length).toBe(1);
    expect(list[0].relationshipType).toBe('MOTHER');
  });

  it('should strictly isolate operated_by (ASHA worker) from patient_id in assisted workflows', async () => {
    const ashaUserId = uuidv4();

    const patient = await patientService.registerPatient({
      fullName: 'Ganga Ram',
      age: 62,
      gender: 'MALE',
      district: 'Amethi',
      state: 'Uttar Pradesh',
    });

    const newCase = await caseService.openCase({
      patientId: patient.id,
      operatedBy: ashaUserId,
      actorRole: 'ASHA',
      chiefComplaintSummary: 'Severe chest tightness and breathing difficulty for 2 hours',
    });

    // Provenance Check: patient_id is the subject of care, operated_by is the frontline ASHA worker
    expect(newCase.patientId).toBe(patient.id);
    expect(newCase.operatedBy).toBe(ashaUserId);
    expect(newCase.patientId).not.toBe(newCase.operatedBy);

    const details = await caseService.getCaseDetails(newCase.id);
    expect(details?.timeline[0].eventType).toBe('CASE_CREATED');
    expect(details?.timeline[0].actorId).toBe(ashaUserId);
    expect(details?.timeline[0].actorRole).toBe('ASHA');
    expect(details?.timeline[0].eventData.mode).toBe('ASSISTED');
  });
});
