export type UserRole = 'PATIENT' | 'ASHA' | 'ANM' | 'DOCTOR' | 'NURSE' | 'PHARMACIST' | 'DHO' | 'ADMIN';

export type TriageCategory = 'ROUTINE' | 'SAME_DAY' | 'EMERGENCY';

export type ReferralStatus = 'ISSUED' | 'ACKNOWLEDGED' | 'IN_TRANSIT' | 'ARRIVED' | 'ACCEPTED' | 'DECLINED' | 'REROUTED' | 'CLOSED';

export type EmergencySeverity = 'YELLOW' | 'ORANGE' | 'RED';

export interface Patient {
  id: string;
  national_health_id: string;
  phone_hash: string;
  display_name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  village_block: string;
  district: string;
  created_at: string;
}

export interface CaseRecord {
  id: string;
  patient_id: string;
  case_number: string;
  originating_worker_id?: string;
  chief_complaint: string;
  status: 'OPEN' | 'REFERRED' | 'CLINICAL_REVIEW' | 'CLOSED';
  created_at: string;
}

export interface IntakeMessage {
  id: string;
  sender: 'PATIENT' | 'AI' | 'ASHA';
  text: string;
  timestamp: string;
}

export interface StructuredIntake {
  id: string;
  case_id: string;
  raw_transcript: string;
  detected_language: string;
  structured_symptoms: {
    chief_complaint: string;
    duration_days: number;
    severity_score: number;
    associated_symptoms: string[];
    is_fever_present: boolean;
    is_chest_pain_present: boolean;
    is_dyspnea_present: boolean;
  };
  vitals?: {
    systolic_bp?: number;
    diastolic_bp?: number;
    heart_rate?: number;
    spo2_percent?: number;
    temperature_f?: number;
  };
  is_ai_generated: boolean;
  created_at: string;
}

export interface SafetyAssessment {
  id: string;
  intake_id: string;
  case_id: string;
  category: TriageCategory;
  urgency_score: number;
  red_flags_detected: string[];
  matched_protocol_code: string;
  recommended_facility_tier: string;
  requires_immediate_ambulance: boolean;
  assessed_at: string;
}

export interface Referral {
  id: string;
  case_id: string;
  patient_id: string;
  originating_facility_id: string;
  target_facility_id: string;
  target_facility_name?: string;
  triage_category: TriageCategory;
  urgency_score: number;
  status: ReferralStatus;
  clinical_summary: string;
  hmac_qr_token: string;
  expires_at: string;
  created_at: string;
  arrival_timestamp?: string;
}

export interface EmergencyDispatch {
  id: string;
  case_id: string;
  patient_id: string;
  source_location: string;
  target_facility_id: string;
  target_facility_name: string;
  ambulance_call_sign: string;
  severity: EmergencySeverity;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'ON_SCENE' | 'TRANSPORTING' | 'HANDED_OFF';
  current_lat: number;
  current_lon: number;
  eta_minutes: number;
  vitals_stream: {
    heart_rate: number;
    spo2: number;
    blood_pressure: string;
    recorded_at: string;
  };
  created_at: string;
}

export interface ClinicalAssessment {
  id: string;
  case_id: string;
  doctor_id: string;
  facility_id: string;
  clinical_notes: string;
  confirmed_diagnosis: string;
  icd10_code?: string;
  assessment_type: 'OUTPATIENT' | 'INPATIENT' | 'EMERGENCY';
  created_at: string;
}

export interface PrescriptionItem {
  id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration_days: number;
  instructions: string;
  status: 'PRESCRIBED' | 'DISPENSED' | 'COMPLETED';
}

export interface LabOrder {
  id: string;
  test_name: string;
  urgency: 'ROUTINE' | 'STAT';
  status: 'ORDERED' | 'SAMPLE_COLLECTED' | 'RESULT_READY';
  results?: string;
}

export interface FollowUpTask {
  id: string;
  case_id: string;
  patient_id: string;
  assigned_worker_id: string;
  task_type: 'HOME_VISIT' | 'MEDICATION_ADHERENCE' | 'SUTURE_REMOVAL' | 'VACCINATION' | 'TELE_CONSULT';
  priority: 'ROUTINE' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'OVERDUE' | 'ESCALATED_DHO' | 'COMPLETED';
  due_date: string;
  instructions: string;
  escalation_level: number;
  completed_at?: string;
  visit_vitals?: {
    systolic_bp?: number;
    diastolic_bp?: number;
    heart_rate?: number;
    spo2?: number;
  };
}

export interface Facility {
  id: string;
  name: string;
  facility_tier: 'PHC' | 'CHC' | 'DISTRICT_HOSPITAL' | 'TERTIARY_HOSPITAL';
  district: string;
  beds_total: number;
  beds_available: number;
  icu_available: number;
  oxygen_cylinders: number;
  blood_units: number;
  is_operational: boolean;
}

export interface OfflineMutation {
  id: string;
  entity_type: 'INTAKE' | 'VITALS' | 'FOLLOWUP_VISIT';
  action: 'CREATE' | 'UPDATE';
  payload: any;
  client_timestamp: string;
  status: 'QUEUED' | 'SYNCED' | 'ERROR';
}
