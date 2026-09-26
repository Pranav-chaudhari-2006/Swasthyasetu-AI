import { z } from 'zod';

export const CLINICAL_ROLES = [
  'MEDICAL_OFFICER',
  'SPECIALIST',
  'SURGEON',
  'EMERGENCY_PHYSICIAN',
  'DOCTOR',
  'CLINICIAN',
  'RESIDENT_PHYSICIAN',
  'FACILITY_ADMIN'
] as const;

export const PHARMACY_ROLES = [
  'PHARMACIST',
  'NURSE',
  'FACILITY_ADMIN',
  'MEDICAL_OFFICER',
  'DOCTOR'
] as const;

export const LAB_ROLES = [
  'LAB_TECH',
  'PATHOLOGIST',
  'RADIOLOGIST',
  'FACILITY_ADMIN',
  'MEDICAL_OFFICER',
  'DOCTOR'
] as const;

export type DiagnosticStatus = 'ORDERED' | 'SAMPLE_COLLECTED' | 'RESULT_ATTACHED' | 'CLINICIAN_REVIEWED' | 'CANCELLED';
export type AdmissionStatus = 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ClinicalAssessment {
  id: string;
  caseId: string;
  patientId: string;
  clinicianId: string;
  clinicianRole: string;
  facilityId: string;
  chiefComplaint: string;
  physicalFindings: Record<string, any>;
  differentialDiagnosis: string[];
  finalDiagnosis: string;
  clinicalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  quantity: number;
  isDispensed: boolean;
  dispensedAt?: string | null;
  dispensedById?: string | null;
}

export interface Prescription {
  id: string;
  caseId: string;
  patientId: string;
  assessmentId?: string | null;
  clinicianId: string;
  clinicianRole: string;
  facilityId: string;
  instructions?: string | null;
  items: PrescriptionItem[];
  createdAt: string;
}

export interface MedicineInventory {
  id: string;
  facilityId: string;
  medicineName: string;
  stockCount: number;
  stockStatus: StockStatus;
  unit: string;
  lastVerifiedAt: string;
}

export interface DiagnosticOrder {
  id: string;
  caseId: string;
  patientId: string;
  clinicianId: string;
  facilityId: string;
  testName: string;
  status: DiagnosticStatus;
  resultData?: Record<string, any> | null;
  resultFileUrl?: string | null;
  labTechId?: string | null;
  reviewedByClinicianId?: string | null;
  orderedAt: string;
  sampleCollectedAt?: string | null;
  completedAt?: string | null;
  reviewedAt?: string | null;
}

export interface HospitalAdmission {
  id: string;
  caseId: string;
  patientId: string;
  facilityId: string;
  admittedBy: string;
  wardBed: string;
  status: AdmissionStatus;
  admittedAt: string;
  dischargedAt?: string | null;
  dischargeSummary?: string | null;
  followUpInstructions?: string | null;
  dischargedBy?: string | null;
}

// Zod Validation Schemas
export const CreateAssessmentSchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  clinicianRole: z.string().min(1),
  facilityId: z.string().uuid(),
  chiefComplaint: z.string().min(3),
  physicalFindings: z.record(z.any()).default({}),
  differentialDiagnosis: z.array(z.string()).default([]),
  finalDiagnosis: z.string().min(3, 'Final diagnosis is required and must be at least 3 characters'),
  clinicalNotes: z.string().optional()
});

export const PrescriptionItemInputSchema = z.object({
  medicineName: z.string().min(2),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  durationDays: z.number().int().positive(),
  quantity: z.number().int().positive()
});

export const CreatePrescriptionSchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  assessmentId: z.string().uuid().optional(),
  clinicianId: z.string().uuid(),
  clinicianRole: z.string().min(1),
  facilityId: z.string().uuid(),
  instructions: z.string().optional(),
  items: z.array(PrescriptionItemInputSchema).min(1, 'Prescription must contain at least one medicine item')
});

export const UpdateInventorySchema = z.object({
  facilityId: z.string().uuid(),
  medicineName: z.string().min(2),
  stockCount: z.number().int().nonnegative(),
  unit: z.string().default('tablets')
});

export const DispenseMedicinesSchema = z.object({
  prescriptionId: z.string().uuid(),
  facilityId: z.string().uuid(),
  dispensedById: z.string().uuid(),
  dispensedByRole: z.string().min(1),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1)
});

export const CreateDiagnosticOrderSchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  clinicianRole: z.string().min(1),
  facilityId: z.string().uuid(),
  testName: z.string().min(2)
});

export const AttachDiagnosticResultSchema = z.object({
  labTechId: z.string().uuid(),
  labTechRole: z.string().min(1),
  resultData: z.record(z.any()),
  resultFileUrl: z.string().url().optional()
});

export const ReviewDiagnosticOrderSchema = z.object({
  clinicianId: z.string().uuid(),
  clinicianRole: z.string().min(1)
});

export const AdmitPatientSchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  facilityId: z.string().uuid(),
  admittedBy: z.string().uuid(),
  clinicianRole: z.string().min(1),
  wardBed: z.string().min(2)
});

export const DischargePatientSchema = z.object({
  dischargedBy: z.string().uuid(),
  clinicianRole: z.string().min(1),
  dischargeSummary: z.string().min(5, 'Discharge summary must be at least 5 characters'),
  followUpInstructions: z.string().min(5, 'Follow-up instructions must be at least 5 characters')
});
