import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { CryptoService } from './cryptoService';
import {
  SyncOperation,
  SyncStatus,
  ReconciliationResolution,
  OfflineRulePackage,
  DeviceSyncState
} from '../types';

export class SyncService {
  /**
   * Processes a batch of offline client operations with HMAC validation,
   * idempotency checks, and deterministic conflict reconciliation.
   */
  public static async processBatch(
    deviceId: string,
    operations: Array<{
      operationId: string;
      deviceId: string;
      sequenceNumber: number;
      actorId: string;
      actorRole: string;
      entityType: 'PATIENT' | 'CASE' | 'INTAKE' | 'FOLLOWUP_TASK' | 'VITAL_SIGN';
      entityId: string;
      action: 'CREATE' | 'UPDATE' | 'APPEND';
      clientTimestamp: string;
      payload: Record<string, any>;
      hmacSignature: string;
    }>
  ): Promise<{
    deviceId: string;
    totalReceived: number;
    committedCount: number;
    duplicateCount: number;
    conflictCount: number;
    rejectedCount: number;
    operations: SyncOperation[];
  }> {
    // Sort operations by sequence number to ensure monotonic processing
    const sorted = [...operations].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    const results: SyncOperation[] = [];

    let committedCount = 0;
    let duplicateCount = 0;
    let conflictCount = 0;
    let rejectedCount = 0;
    let maxSequence = 0;

    for (const op of sorted) {
      const now = new Date().toISOString();

      // 1. Cryptographic HMAC Signature Verification
      const isSignatureValid = CryptoService.verifySignature({
        operationId: op.operationId,
        deviceId: op.deviceId,
        sequenceNumber: op.sequenceNumber,
        entityId: op.entityId,
        clientTimestamp: op.clientTimestamp,
        payload: op.payload,
        hmacSignature: op.hmacSignature
      });

      if (!isSignatureValid) {
        rejectedCount++;
        const rejectedOp: SyncOperation = {
          id: uuidv4(),
          ...op,
          serverReceivedAt: now,
          status: 'REJECTED',
          reconciliationResolution: 'INVALID_SIGNATURE',
          reconciliationNotes: 'Cryptographic signature mismatch. Mutation rejected.'
        };
        await db.saveOperation(rejectedOp);
        results.push(rejectedOp);
        continue;
      }

      // 2. Idempotency Check
      const existing = await db.getOperationById(op.operationId);
      if (existing) {
        duplicateCount++;
        results.push({
          ...existing,
          reconciliationResolution: 'IDEMPOTENT_NOOP',
          reconciliationNotes: 'Operation already processed previously. Replay acknowledged idempotently.'
        });
        continue;
      }

      // 3. Deterministic Conflict Reconciliation
      // Rule: Server clinical authority prevails if client mutation modifies an entity flagged closed/locked
      let status: SyncStatus = 'COMMITTED';
      let resolution: ReconciliationResolution = 'CLIENT_MUTATION_APPLIED';
      let notes = 'Offline mutation verified and applied cleanly.';

      if (op.payload?.serverCaseClosed || op.payload?.isClinicalStateLocked) {
        status = 'CONFLICT_RESOLVED';
        resolution = 'SERVER_AUTHORITY_PREVAILS';
        notes = 'Entity state locked by server clinical assessment. Client update reconciled under server authority.';
        conflictCount++;
      } else {
        committedCount++;
      }

      const syncOp: SyncOperation = {
        id: uuidv4(),
        operationId: op.operationId,
        deviceId: op.deviceId,
        sequenceNumber: op.sequenceNumber,
        actorId: op.actorId,
        actorRole: op.actorRole,
        entityType: op.entityType,
        entityId: op.entityId,
        action: op.action,
        clientTimestamp: op.clientTimestamp,
        serverReceivedAt: now,
        status,
        reconciliationResolution: resolution,
        reconciliationNotes: notes,
        payload: op.payload,
        hmacSignature: op.hmacSignature
      };

      await db.saveOperation(syncOp);
      results.push(syncOp);
      maxSequence = Math.max(maxSequence, op.sequenceNumber);
    }

    // Update device sync sequence state
    if (maxSequence > 0) {
      await db.updateDeviceState(deviceId, maxSequence);
    }

    return {
      deviceId,
      totalReceived: operations.length,
      committedCount,
      duplicateCount,
      conflictCount,
      rejectedCount,
      operations: results
    };
  }

  /**
   * Distribute cryptographically signed offline rules package
   */
  public static async publishOfflineRules(versionTag: string, rules: Record<string, any>): Promise<OfflineRulePackage> {
    const { hash, signature } = CryptoService.createSignedRulePackage(versionTag, rules);
    const id = uuidv4();
    const pkg: OfflineRulePackage = {
      id,
      versionTag,
      rulesDefinition: rules,
      packageHash: hash,
      packageSignature: signature,
      publishedAt: new Date().toISOString()
    };
    return await db.saveRulePackage(pkg);
  }

  public static async getLatestRulesPackage(): Promise<OfflineRulePackage | null> {
    return await db.getLatestRulePackage();
  }

  public static async getDeviceStatus(deviceId: string): Promise<DeviceSyncState | null> {
    return await db.getDeviceState(deviceId);
  }

  public static async getAuditTrail(filters?: { deviceId?: string; actorId?: string }): Promise<SyncOperation[]> {
    return await db.getAuditTrail(filters);
  }
}
