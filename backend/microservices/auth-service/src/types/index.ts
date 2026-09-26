export type UserRole =
  | 'PATIENT'
  | 'CAREGIVER'
  | 'ASHA'
  | 'ANM'
  | 'MPW'
  | 'CHO'
  | 'MEDICAL_OFFICER'
  | 'SPECIALIST'
  | 'FACILITY_ADMIN'
  | 'DISTRICT_OFFICER';

export type Permission =
  | 'INTAKE_DIRECT_SUBMIT'
  | 'INTAKE_ASSISTED_SUBMIT'
  | 'CASE_READ_OWN'
  | 'CASE_READ_ASSIGNED'
  | 'CASE_READ_FACILITY'
  | 'CASE_READ_DISTRICT'
  | 'SAFETY_EVALUATE'
  | 'FACILITY_READ'
  | 'FACILITY_WRITE_CONFIG'
  | 'REFERRAL_CREATE'
  | 'REFERRAL_ACCEPT_DECLINE'
  | 'REFERRAL_SCAN_ARRIVAL'
  | 'EMERGENCY_TRIGGER'
  | 'CLINICAL_ASSESS'
  | 'CLINICAL_PRESCRIBE'
  | 'CLINICAL_ADMIT_DISCHARGE'
  | 'MEDICINE_DISPENSE'
  | 'MEDICINE_STOCK_UPDATE'
  | 'DIAGNOSTIC_ORDER'
  | 'DIAGNOSTIC_RESULT_ATTACH'
  | 'FOLLOWUP_COMPLETE_SELF'
  | 'FOLLOWUP_COMPLETE_WORKER'
  | 'DISTRICT_VIEW_METRICS'
  | 'AUDIT_VIEW';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffProfile {
  id: string;
  userId: string;
  fullName: string;
  designation: string;
  facilityId?: string;
  district?: string;
  state?: string;
  licenseNumber?: string;
  createdAt: Date;
}

export interface OTPChallenge {
  id: string;
  phone: string;
  otpCodeHash: string;
  purpose: 'PATIENT_LOGIN' | 'PATIENT_REGISTRATION';
  expiresAt: Date;
  isConsumed: boolean;
  attemptCount: number;
  createdAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  deviceInfo?: Record<string, unknown>;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  role: UserRole | string;
  scopeFacilityId?: string;
  scopeDistrict?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  payloadBefore?: Record<string, unknown>;
  payloadAfter?: Record<string, unknown>;
  ipAddress?: string;
  correlationId: string;
  createdAt: Date;
}

export interface TokenPayload {
  userId: string;
  role: UserRole;
  phone?: string;
  email?: string;
  facilityId?: string;
  district?: string;
  sessionId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    role: UserRole;
    phone?: string;
    email?: string;
  };
  staffProfile?: StaffProfile;
  patientId?: string;
}
