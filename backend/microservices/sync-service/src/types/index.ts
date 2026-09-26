import { z } from 'zod';

export type SyncStatus = 'COMMITTED' | 'DUPLICATE_IGNORED' | 'CONFLICT_RESOLVED' | 'REJECTED';

export type ReconciliationResolution = 
  | 'CLIENT_MUTATION_APPLIED'
  | 'SERVER_AUTHORITY_PREVAILS'
  | 'IDEMPOTENT_NOOP'
  | 'INVALID_SIGNATURE';

export type EntityType = 'PATIENT' | 'CASE' | 'INTAKE' | 'FOLLOWUP_TASK' | 'VITAL_SIGN';

export interface SyncOperation {
  id: string;
  operationId: string;
  deviceId: string;
  sequenceNumber: number;
  actorId: string;
  actorRole: string;
  entityType: EntityType;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'APPEND';
  clientTimestamp: string;
  serverReceivedAt: string;
  status: SyncStatus;
  reconciliationResolution?: ReconciliationResolution | null;
  reconciliationNotes?: string | null;
  payload: Record<string, any>;
  hmacSignature: string;
}

export interface OfflineRulePackage {
  id: string;
  versionTag: string;
  rulesDefinition: Record<string, any>;
  packageHash: string;
  packageSignature: string;
  publishedAt: string;
}

export interface DeviceSyncState {
  deviceId: string;
  lastSyncedSequence: number;
  lastSyncedAt: string;
}

// Zod Validation Schemas
export const SyncOperationSchema = z.object({
  operationId: z.string().uuid(),
  deviceId: z.string().min(2),
  sequenceNumber: z.number().int().nonnegative(),
  actorId: z.string().uuid(),
  actorRole: z.string().min(1),
  entityType: z.enum(['PATIENT', 'CASE', 'INTAKE', 'FOLLOWUP_TASK', 'VITAL_SIGN']),
  entityId: z.string().uuid(),
  action: z.enum(['CREATE', 'UPDATE', 'APPEND']),
  clientTimestamp: z.string().datetime(),
  payload: z.record(z.any()),
  hmacSignature: z.string().min(10)
});

export const BatchSyncRequestSchema = z.object({
  deviceId: z.string().min(2),
  operations: z.array(SyncOperationSchema).min(1, 'Batch must contain at least one sync operation')
});
