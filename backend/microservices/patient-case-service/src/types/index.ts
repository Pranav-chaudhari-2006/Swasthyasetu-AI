export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type CaseStatus =
  | 'CREATED'
  | 'INTAKE_IN_PROGRESS'
  | 'TRIAGED'
  | 'ROUTED'
  | 'REFERRAL_ISSUED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'UNDER_CARE'
  | 'DISCHARGED'
  | 'CLOSED'
  | 'CANCELLED';

export type TimelineEventType =
  | 'CASE_CREATED'
  | 'INTAKE_SUBMITTED'
  | 'SAFETY_TRIAGED'
  | 'FACILITY_ROUTED'
  | 'REFERRAL_ISSUED'
  | 'REFERRAL_ACCEPTED'
  | 'REFERRAL_DECLINED'
  | 'PATIENT_EN_ROUTE'
  | 'PATIENT_ARRIVED'
  | 'CLINICAL_ASSESSMENT_RECORDED'
  | 'PRESCRIPTION_CREATED'
  | 'MEDICINE_DISPENSED'
  | 'DIAGNOSTIC_ORDERED'
  | 'DIAGNOSTIC_RESULT_AVAILABLE'
  | 'PATIENT_ADMITTED'
  | 'PATIENT_DISCHARGED'
  | 'FOLLOWUP_SCHEDULED'
  | 'FOLLOWUP_COMPLETED'
  | 'CASE_CLOSED';

export interface Patient {
  id: string;
  durablePatientCode: string;
  primaryUserId?: string;
  fullName: string;
  dateOfBirth?: string; // YYYY-MM-DD
  age?: number;
  gender: Gender;
  phone?: string;
  address?: string;
  district: string;
  state: string;
  preferredLanguage: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  abhaId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaregiverLink {
  id: string;
  patientId: string;
  caregiverUserId: string;
  relationshipType: string;
  isAuthorized: boolean;
  createdAt: Date;
}

export interface PatientCase {
  id: string;
  caseNumber: string;
  patientId: string;
  operatedBy?: string; // Frontline worker user ID if assisted
  openedAt: Date;
  closedAt?: Date;
  status: CaseStatus;
  chiefComplaintSummary?: string;
  assignedPathway?: 'ROUTINE' | 'SAME_DAY' | 'EMERGENCY';
  primaryFacilityId?: string;
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseTimelineEvent {
  id: string;
  caseId: string;
  eventType: TimelineEventType;
  actorId: string;
  actorRole: string;
  facilityId?: string;
  eventData: Record<string, unknown>;
  occurredAt: Date;
}

export interface PatientCaseDetails extends PatientCase {
  patient: Patient;
  timeline: CaseTimelineEvent[];
}
