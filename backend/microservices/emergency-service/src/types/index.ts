import { z } from 'zod';

export type EmergencyStatus =
  | 'DISPATCHED'
  | 'EN_ROUTE_SCENE'
  | 'PATIENT_ONBOARD'
  | 'EN_ROUTE_ER'
  | 'ARRIVED_ER'
  | 'HANDOFF_COMPLETED'
  | 'CANCELLED';

export interface EmergencyRedirectRecord {
  previousFacilityId: string;
  newFacilityId: string;
  redirectedByActorId: string;
  redirectedByRole: string;
  reason: string;
  redirectedAt: string;
}

export interface LiveLocationTelemetry {
  latitude: number;
  longitude: number;
  speedKmh?: number;
  headingDeg?: number;
  lastUpdated: string;
}

export interface EmergencyEvent {
  id: string;
  caseId: string;
  patientId: string;
  triggeredByActorId: string;
  triggeredByActorRole: string;
  emergencyClassification: string;
  emergencyReason: string;
  patientLocationLat: number;
  patientLocationLng: number;
  allocatedFacilityId: string;
  transportMode: string;
  mems108Reference: string;
  driverName?: string | null;
  driverContact?: string | null;
  vehicleNumber?: string | null;
  status: EmergencyStatus;
  estimatedArrivalMinutes?: number | null;
  liveLocation?: LiveLocationTelemetry | null;
  redirectHistory: EmergencyRedirectRecord[];
  handoffNotes?: string | null;
  receivingPhysicianId?: string | null;
  createdAt: string;
  updatedAt: string;
  arrivedAt?: string | null;
  handoffCompletedAt?: string | null;
}

export interface EmergencyTelemetryLog {
  id: string;
  emergencyEventId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number | null;
  headingDeg?: number | null;
  recordedAt: string;
}

// Zod Validation Schemas
export const DispatchEmergencySchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  triggeredByActorId: z.string().uuid(),
  triggeredByActorRole: z.string().min(1),
  emergencyClassification: z.string().min(2),
  emergencyReason: z.string().min(3),
  patientLocationLat: z.number().min(-90).max(90),
  patientLocationLng: z.number().min(-180).max(180),
  allocatedFacilityId: z.string().uuid(),
  transportMode: z.string().default('AMBULANCE_108'),
  mems108Reference: z.string().optional(),
  driverName: z.string().optional(),
  driverContact: z.string().optional(),
  vehicleNumber: z.string().optional(),
  estimatedArrivalMinutes: z.number().int().positive().optional()
});

export const UpdateEmergencyStatusSchema = z.object({
  status: z.enum([
    'DISPATCHED',
    'EN_ROUTE_SCENE',
    'PATIENT_ONBOARD',
    'EN_ROUTE_ER',
    'ARRIVED_ER',
    'HANDOFF_COMPLETED',
    'CANCELLED'
  ]),
  actorId: z.string().uuid(),
  actorRole: z.string().min(1),
  estimatedArrivalMinutes: z.number().int().nonnegative().optional(),
  notes: z.string().optional()
});

export const EmergencyTelemetrySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).optional(),
  headingDeg: z.number().min(0).max(360).optional()
});

export const RedirectEmergencySchema = z.object({
  newFacilityId: z.string().uuid(),
  actorId: z.string().uuid(),
  actorRole: z.string().min(1),
  reason: z.string().min(5, 'Redirection reason must be at least 5 characters')
});

export const CompleteHandoffSchema = z.object({
  receivingPhysicianId: z.string().uuid(),
  receivingPhysicianRole: z.string().min(1).default('EMERGENCY_PHYSICIAN'),
  handoffNotes: z.string().min(5, 'Handoff clinical notes must be at least 5 characters'),
  vitalsOnArrival: z.record(z.any()).optional()
});
