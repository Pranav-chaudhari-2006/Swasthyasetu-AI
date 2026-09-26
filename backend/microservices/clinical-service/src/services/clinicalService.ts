import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import {
  CLINICAL_ROLES,
  PHARMACY_ROLES,
  LAB_ROLES,
  ClinicalAssessment,
  Prescription,
  PrescriptionItem,
  MedicineInventory,
  DiagnosticOrder,
  HospitalAdmission,
  StockStatus
} from '../types';

export class ClinicalService {
  /**
   * Helper to ensure only authorized medical clinicians author diagnoses and prescriptions
   */
  public static validateClinicianRole(role: string): void {
    if (!CLINICAL_ROLES.includes(role as any)) {
      throw new Error(`Unauthorized: Role '${role}' is not authorized to author clinical assessments or prescriptions.`);
    }
  }

  /**
   * Helper to ensure only authorized pharmacy/dispensing personnel dispense medicines
   */
  public static validatePharmacyRole(role: string): void {
    if (!PHARMACY_ROLES.includes(role as any)) {
      throw new Error(`Unauthorized: Role '${role}' is not authorized to dispense medicines.`);
    }
  }

  /**
   * Helper to ensure only authorized lab personnel attach diagnostic results
   */
  public static validateLabRole(role: string): void {
    if (!LAB_ROLES.includes(role as any)) {
      throw new Error(`Unauthorized: Role '${role}' is not authorized to record diagnostic laboratory results.`);
    }
  }

  // 1. Clinical Assessments
  public static async createAssessment(input: {
    caseId: string;
    patientId: string;
    clinicianId: string;
    clinicianRole: string;
    facilityId: string;
    chiefComplaint: string;
    physicalFindings?: Record<string, any>;
    differentialDiagnosis?: string[];
    finalDiagnosis: string;
    clinicalNotes?: string;
  }): Promise<ClinicalAssessment> {
    this.validateClinicianRole(input.clinicianRole);

    const id = uuidv4();
    const now = new Date().toISOString();

    const assessment: ClinicalAssessment = {
      id,
      caseId: input.caseId,
      patientId: input.patientId,
      clinicianId: input.clinicianId,
      clinicianRole: input.clinicianRole,
      facilityId: input.facilityId,
      chiefComplaint: input.chiefComplaint,
      physicalFindings: input.physicalFindings || {},
      differentialDiagnosis: input.differentialDiagnosis || [],
      finalDiagnosis: input.finalDiagnosis,
      clinicalNotes: input.clinicalNotes || null,
      createdAt: now,
      updatedAt: now
    };

    return await db.createAssessment(assessment);
  }

  public static async getAssessmentsByCase(caseId: string): Promise<ClinicalAssessment[]> {
    return await db.getAssessmentsByCaseId(caseId);
  }

  // 2. Prescriptions
  public static async createPrescription(input: {
    caseId: string;
    patientId: string;
    assessmentId?: string;
    clinicianId: string;
    clinicianRole: string;
    facilityId: string;
    instructions?: string;
    items: Array<{
      medicineName: string;
      dosage: string;
      frequency: string;
      durationDays: number;
      quantity: number;
    }>;
  }): Promise<Prescription> {
    this.validateClinicianRole(input.clinicianRole);

    const prescriptionId = uuidv4();
    const now = new Date().toISOString();

    const items: PrescriptionItem[] = input.items.map(item => ({
      id: uuidv4(),
      prescriptionId,
      medicineName: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      durationDays: item.durationDays,
      quantity: item.quantity,
      isDispensed: false,
      dispensedAt: null,
      dispensedById: null
    }));

    const prescription: Prescription = {
      id: prescriptionId,
      caseId: input.caseId,
      patientId: input.patientId,
      assessmentId: input.assessmentId || null,
      clinicianId: input.clinicianId,
      clinicianRole: input.clinicianRole,
      facilityId: input.facilityId,
      instructions: input.instructions || null,
      items,
      createdAt: now
    };

    return await db.createPrescription(prescription);
  }

  public static async getPrescriptionsByCase(caseId: string): Promise<Prescription[]> {
    return await db.getPrescriptionsByCaseId(caseId);
  }

  // 3. Medicine Inventory & Dispensing
  public static async updateInventory(input: {
    facilityId: string;
    medicineName: string;
    stockCount: number;
    unit?: string;
  }): Promise<MedicineInventory> {
    const now = new Date().toISOString();
    const stockStatus: StockStatus = input.stockCount === 0 
      ? 'OUT_OF_STOCK' 
      : input.stockCount < 20 
        ? 'LOW_STOCK' 
        : 'IN_STOCK';

    const existing = await db.getInventoryItem(input.facilityId, input.medicineName);
    const id = existing?.id || uuidv4();

    const inv: MedicineInventory = {
      id,
      facilityId: input.facilityId,
      medicineName: input.medicineName,
      stockCount: input.stockCount,
      stockStatus,
      unit: input.unit || 'tablets',
      lastVerifiedAt: now
    };

    return await db.upsertInventory(inv);
  }

  public static async getFacilityInventory(facilityId: string): Promise<MedicineInventory[]> {
    return await db.getFacilityInventory(facilityId);
  }

  public static async dispensePrescription(input: {
    prescriptionId: string;
    facilityId: string;
    dispensedById: string;
    dispensedByRole: string;
    items: Array<{ itemId: string; quantity: number }>;
  }): Promise<{ success: boolean; warnings: string[]; updatedPrescription: Prescription }> {
    this.validatePharmacyRole(input.dispensedByRole);

    return await db.dispensePrescriptionItems(
      input.prescriptionId,
      input.items,
      input.facilityId,
      input.dispensedById
    );
  }

  // 4. Diagnostic Orders & Results
  public static async createDiagnosticOrder(input: {
    caseId: string;
    patientId: string;
    clinicianId: string;
    clinicianRole: string;
    facilityId: string;
    testName: string;
  }): Promise<DiagnosticOrder> {
    this.validateClinicianRole(input.clinicianRole);

    const id = uuidv4();
    const now = new Date().toISOString();

    const order: DiagnosticOrder = {
      id,
      caseId: input.caseId,
      patientId: input.patientId,
      clinicianId: input.clinicianId,
      facilityId: input.facilityId,
      testName: input.testName,
      status: 'ORDERED',
      resultData: null,
      resultFileUrl: null,
      labTechId: null,
      reviewedByClinicianId: null,
      orderedAt: now,
      sampleCollectedAt: null,
      completedAt: null,
      reviewedAt: null
    };

    return await db.createDiagnosticOrder(order);
  }

  public static async attachDiagnosticResult(
    orderId: string,
    labTechId: string,
    labTechRole: string,
    resultData: Record<string, any>,
    resultFileUrl?: string
  ): Promise<DiagnosticOrder> {
    this.validateLabRole(labTechRole);

    const now = new Date().toISOString();
    return await db.updateDiagnosticOrder(orderId, {
      status: 'RESULT_ATTACHED',
      resultData,
      resultFileUrl: resultFileUrl || null,
      labTechId,
      completedAt: now
    });
  }

  public static async reviewDiagnosticOrder(
    orderId: string,
    clinicianId: string,
    clinicianRole: string
  ): Promise<DiagnosticOrder> {
    this.validateClinicianRole(clinicianRole);

    const now = new Date().toISOString();
    return await db.updateDiagnosticOrder(orderId, {
      status: 'CLINICIAN_REVIEWED',
      reviewedByClinicianId: clinicianId,
      reviewedAt: now
    });
  }

  public static async getDiagnosticsByCase(caseId: string): Promise<DiagnosticOrder[]> {
    return await db.getDiagnosticsByCaseId(caseId);
  }

  // 5. Inpatient Hospital Admissions
  public static async admitPatient(input: {
    caseId: string;
    patientId: string;
    facilityId: string;
    admittedBy: string;
    clinicianRole: string;
    wardBed: string;
  }): Promise<HospitalAdmission> {
    this.validateClinicianRole(input.clinicianRole);

    const id = uuidv4();
    const now = new Date().toISOString();

    const admission: HospitalAdmission = {
      id,
      caseId: input.caseId,
      patientId: input.patientId,
      facilityId: input.facilityId,
      admittedBy: input.admittedBy,
      wardBed: input.wardBed,
      status: 'ADMITTED',
      admittedAt: now,
      dischargedAt: null,
      dischargeSummary: null,
      followUpInstructions: null,
      dischargedBy: null
    };

    return await db.createAdmission(admission);
  }

  public static async dischargePatient(
    admissionId: string,
    dischargedBy: string,
    clinicianRole: string,
    dischargeSummary: string,
    followUpInstructions: string
  ): Promise<HospitalAdmission> {
    this.validateClinicianRole(clinicianRole);

    const now = new Date().toISOString();
    return await db.updateAdmission(admissionId, {
      status: 'DISCHARGED',
      dischargedAt: now,
      dischargeSummary,
      followUpInstructions,
      dischargedBy
    });
  }

  public static async getAdmissionsByCase(caseId: string): Promise<HospitalAdmission[]> {
    return await db.getAdmissionsByCaseId(caseId);
  }
}
