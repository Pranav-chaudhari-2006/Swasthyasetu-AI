import { db } from '../db/database';
import { AuditLogEntry, UserRole } from '../types';

export class AuditService {
  /**
   * Records an immutable audit log entry for security and domain events
   */
  async logEvent(params: {
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
  }): Promise<AuditLogEntry> {
    return db.createAuditLog(params);
  }

  /**
   * Queries audit logs with filtering
   */
  async getAuditTrail(filter: {
    actorId?: string;
    correlationId?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    return db.queryAuditLogs(filter);
  }
}

export const auditService = new AuditService();
