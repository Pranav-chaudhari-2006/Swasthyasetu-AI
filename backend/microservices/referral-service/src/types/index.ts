import { z } from 'zod';

export type ReferralState = 
  | 'ISSUED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'TREATED'
  | 'ADMITTED'
  | 'DISCHARGED'
  | 'CLOSED';

export type ReferralPathway = 'ROUTINE' | 'SAME_DAY' | 'EMERGENCY';

export interface Referral {
  id: string;
  referralCode: string;
  caseId: string;
  patientId: string;
  sourceFacilityId?: string | null;
  originatingActorId: string;
  originatingActorRole: string;
  destinationFacilityId: string;
  pathway: ReferralPathway;
  requiredCapabilities: string[];
  clinicalSummary: string;
  currentState: ReferralState;
  qrTokenHash: string;
  transportDetails?: Record<string, any> | null;
  declineReason?: string | null;
  emergencyBypass: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferralStateTransition {
  id: string;
  referralId: string;
  fromState: ReferralState;
  toState: ReferralState;
  actorId: string;
  actorRole: string;
  facilityId?: string | null;
  reason?: string | null;
  metadata?: Record<string, any>;
  transitionedAt: string;
}

export interface QRTokenPayload {
  referralId: string;
  referralCode: string;
  patientId: string;
  caseId: string;
  destinationFacilityId: string;
  pathway: ReferralPathway;
  issuedAt: number;
  nonce: string;
}

export interface CreateReferralInput {
  caseId: string;
  patientId: string;
  sourceFacilityId?: string;
  originatingActorId: string;
  originatingActorRole: string;
  destinationFacilityId: string;
  pathway: ReferralPathway;
  requiredCapabilities: string[];
  clinicalSummary: string;
  emergencyBypass?: boolean;
}

export interface TransitionStateInput {
  referralId: string;
  toState: ReferralState;
  actorId: string;
  actorRole: string;
  facilityId?: string;
  reason?: string;
  metadata?: Record<string, any>;
  transportDetails?: Record<string, any>;
}

// Zod Schemas for Runtime Validation
export const CreateReferralSchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  sourceFacilityId: z.string().uuid().optional(),
  originatingActorId: z.string().uuid(),
  originatingActorRole: z.string().min(1),
  destinationFacilityId: z.string().uuid(),
  pathway: z.enum(['ROUTINE', 'SAME_DAY', 'EMERGENCY']),
  requiredCapabilities: z.array(z.string()).default([]),
  clinicalSummary: z.string().min(3),
  emergencyBypass: z.boolean().optional().default(false)
});

export const AcceptReferralSchema = z.object({
  staffId: z.string().uuid(),
  staffRole: z.string().min(1).default('FACILITY_COORDINATOR'),
  facilityId: z.string().uuid(),
  notes: z.string().optional()
});

export const DeclineReferralSchema = z.object({
  staffId: z.string().uuid(),
  staffRole: z.string().min(1).default('FACILITY_COORDINATOR'),
  facilityId: z.string().uuid(),
  reason: z.string().min(5, 'Decline reason must be at least 5 characters'),
  alternativeFacilitySuggestions: z.array(z.string().uuid()).optional()
});

export const EnRouteReferralSchema = z.object({
  actorId: z.string().uuid(),
  actorRole: z.string().min(1),
  transportMode: z.enum(['AMBULANCE_108', 'PRIVATE_VEHICLE', 'PUBLIC_TRANSPORT', 'WALKING', 'OTHER']),
  estimatedArrivalMinutes: z.number().int().positive().optional(),
  driverContact: z.string().optional(),
  vehicleNumber: z.string().optional()
});

export const VerifyArrivalSchema = z.object({
  qrToken: z.string().min(10),
  scannerFacilityId: z.string().uuid(),
  scannerStaffId: z.string().uuid(),
  scannerStaffRole: z.string().min(1).default('TRIAGE_NURSE'),
  triageNotes: z.string().optional()
});

export const CloseReferralSchema = z.object({
  staffId: z.string().uuid(),
  staffRole: z.string().min(1),
  facilityId: z.string().uuid(),
  outcome: z.enum(['TREATED', 'ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'REFERRED_HIGHER', 'ABSCONDED', 'DECEASED']),
  dischargeSummary: z.string().min(5)
});
