import { Pool } from 'pg';
import { config } from '../config';
import { SyncOperation, OfflineRulePackage, DeviceSyncState } from '../types';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory fallback stores
  private inMemoryOperations: Map<string, SyncOperation> = new Map(); // key: operationId
  private inMemoryDeviceStates: Map<string, DeviceSyncState> = new Map();
  private inMemoryRulePackages: Map<string, OfflineRulePackage> = new Map();

  constructor() {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_HOST) {
      try {
        this.pool = new Pool({
          host: config.database.host,
          port: config.database.port,
          user: config.database.user,
          password: config.database.password,
          database: config.database.database,
          connectionTimeoutMillis: 2000,
        });
      } catch (err) {
        this.pool = null;
      }
    }
  }

  async init(): Promise<void> {
    if (!this.pool) {
      this.isConnected = false;
      return;
    }
    try {
      const client = await this.pool.connect();
      this.isConnected = true;
      client.release();
    } catch (err) {
      this.isConnected = false;
    }
  }

  async getOperationById(operationId: string): Promise<SyncOperation | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM sync_operations WHERE operation_id = $1', [operationId]);
      if (res.rows.length === 0) return null;
      return this.mapRowToOperation(res.rows[0]);
    }
    const found = this.inMemoryOperations.get(operationId);
    return found ? { ...found } : null;
  }

  async saveOperation(op: SyncOperation): Promise<SyncOperation> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO sync_operations (
          id, operation_id, device_id, sequence_number, actor_id, actor_role,
          entity_type, entity_id, action, client_timestamp, server_received_at,
          status, reconciliation_resolution, reconciliation_notes, payload, hmac_signature
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        op.id,
        op.operationId,
        op.deviceId,
        op.sequenceNumber,
        op.actorId,
        op.actorRole,
        op.entityType,
        op.entityId,
        op.action,
        op.clientTimestamp,
        op.serverReceivedAt,
        op.status,
        op.reconciliationResolution || null,
        op.reconciliationNotes || null,
        JSON.stringify(op.payload),
        op.hmacSignature
      ]);
      return this.mapRowToOperation(res.rows[0]);
    }

    this.inMemoryOperations.set(op.operationId, { ...op });
    return op;
  }

  async getDeviceState(deviceId: string): Promise<DeviceSyncState | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM device_sync_states WHERE device_id = $1', [deviceId]);
      if (res.rows.length === 0) return null;
      return {
        deviceId: res.rows[0].device_id,
        lastSyncedSequence: parseInt(res.rows[0].last_synced_sequence, 10),
        lastSyncedAt: res.rows[0].last_synced_at
      };
    }
    const found = this.inMemoryDeviceStates.get(deviceId);
    return found ? { ...found } : null;
  }

  async updateDeviceState(deviceId: string, sequenceNumber: number): Promise<DeviceSyncState> {
    const now = new Date().toISOString();
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO device_sync_states (device_id, last_synced_sequence, last_synced_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (device_id) DO UPDATE
        SET last_synced_sequence = GREATEST(device_sync_states.last_synced_sequence, EXCLUDED.last_synced_sequence),
            last_synced_at = EXCLUDED.last_synced_at
        RETURNING *;
      `;
      const res = await this.pool.query(query, [deviceId, sequenceNumber, now]);
      return {
        deviceId: res.rows[0].device_id,
        lastSyncedSequence: parseInt(res.rows[0].last_synced_sequence, 10),
        lastSyncedAt: res.rows[0].last_synced_at
      };
    }

    const current = this.inMemoryDeviceStates.get(deviceId);
    const updated: DeviceSyncState = {
      deviceId,
      lastSyncedSequence: current ? Math.max(current.lastSyncedSequence, sequenceNumber) : sequenceNumber,
      lastSyncedAt: now
    };
    this.inMemoryDeviceStates.set(deviceId, updated);
    return updated;
  }

  async saveRulePackage(pkg: OfflineRulePackage): Promise<OfflineRulePackage> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO offline_rule_packages (id, version_tag, rules_definition, package_hash, package_signature, published_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        pkg.id,
        pkg.versionTag,
        JSON.stringify(pkg.rulesDefinition),
        pkg.packageHash,
        pkg.packageSignature,
        pkg.publishedAt
      ]);
      return this.mapRowToPackage(res.rows[0]);
    }
    this.inMemoryRulePackages.set(pkg.versionTag, { ...pkg });
    return pkg;
  }

  async getLatestRulePackage(): Promise<OfflineRulePackage | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM offline_rule_packages ORDER BY published_at DESC LIMIT 1');
      if (res.rows.length === 0) return null;
      return this.mapRowToPackage(res.rows[0]);
    }
    const pkgs = Array.from(this.inMemoryRulePackages.values())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return pkgs.length > 0 ? { ...pkgs[0] } : null;
  }

  async getAuditTrail(filters?: { deviceId?: string; actorId?: string }): Promise<SyncOperation[]> {
    if (this.isConnected && this.pool) {
      let query = 'SELECT * FROM sync_operations WHERE 1=1';
      const params: any[] = [];
      if (filters?.deviceId) {
        params.push(filters.deviceId);
        query += ` AND device_id = $${params.length}`;
      }
      if (filters?.actorId) {
        params.push(filters.actorId);
        query += ` AND actor_id = $${params.length}`;
      }
      query += ' ORDER BY server_received_at DESC';
      const res = await this.pool.query(query, params);
      return res.rows.map(r => this.mapRowToOperation(r));
    }

    return Array.from(this.inMemoryOperations.values())
      .filter(o => {
        if (filters?.deviceId && o.deviceId !== filters.deviceId) return false;
        if (filters?.actorId && o.actorId !== filters.actorId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.serverReceivedAt).getTime() - new Date(a.serverReceivedAt).getTime());
  }

  async clear(): Promise<void> {
    this.inMemoryOperations.clear();
    this.inMemoryDeviceStates.clear();
  }

  private mapRowToOperation(row: any): SyncOperation {
    return {
      id: row.id,
      operationId: row.operation_id,
      deviceId: row.device_id,
      sequenceNumber: parseInt(row.sequence_number, 10),
      actorId: row.actor_id,
      actorRole: row.actor_role,
      entityType: row.entity_type,
      entityId: row.entity_id,
      action: row.action,
      clientTimestamp: row.client_timestamp,
      serverReceivedAt: row.server_received_at,
      status: row.status,
      reconciliationResolution: row.reconciliation_resolution,
      reconciliationNotes: row.reconciliation_notes,
      payload: typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
      hmacSignature: row.hmac_signature
    };
  }

  private mapRowToPackage(row: any): OfflineRulePackage {
    return {
      id: row.id,
      versionTag: row.version_tag,
      rulesDefinition: typeof row.rules_definition === 'string' ? JSON.parse(row.rules_definition) : row.rules_definition,
      packageHash: row.package_hash,
      packageSignature: row.package_signature,
      publishedAt: row.published_at
    };
  }
}

export const db = new Database();
