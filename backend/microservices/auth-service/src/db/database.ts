import { Pool } from 'pg';
import { config } from '../config';
import { User, StaffProfile, OTPChallenge, UserSession, AuditLogEntry, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory backing store for robust fallback & fast unit test execution
  private users: Map<string, User> = new Map();
  private staffProfiles: Map<string, StaffProfile> = new Map();
  private otpChallenges: Map<string, OTPChallenge> = new Map();
  private userSessions: Map<string, UserSession> = new Map();
  private auditLogs: AuditLogEntry[] = [];

  constructor() {
    try {
      this.pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: config.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.pool.on('error', (err) => {
        console.warn('[Database] PostgreSQL connection pool error (fallback active):', err.message);
        this.isConnected = false;
      });
    } catch {
      this.isConnected = false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isConnected = true;
      return true;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  // --- Users Operations ---
  async findUserById(id: string): Promise<User | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapUserRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.users.get(id) || null;
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
        if (res.rows.length === 0) return null;
        return this.mapUserRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    for (const user of this.users.values()) {
      if (user.phone === phone) return user;
    }
    return null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (res.rows.length === 0) return null;
        return this.mapUserRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async createUser(userData: {
    phone?: string;
    email?: string;
    passwordHash?: string;
    role: UserRole;
  }): Promise<User> {
    const user: User = {
      id: uuidv4(),
      phone: userData.phone,
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO users (id, phone, email, password_hash, role, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            user.id,
            user.phone,
            user.email,
            user.passwordHash,
            user.role,
            user.isActive,
            user.createdAt,
            user.updatedAt,
          ]
        );
        return this.mapUserRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.users.set(user.id, user);
    return user;
  }

  // --- Staff Profile Operations ---
  async findStaffByUserId(userId: string): Promise<StaffProfile | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM staff_profiles WHERE user_id = $1', [userId]);
        if (res.rows.length === 0) return null;
        return this.mapStaffRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.staffProfiles.get(userId) || null;
  }

  async createStaffProfile(staffData: {
    userId: string;
    fullName: string;
    designation: string;
    facilityId?: string;
    district?: string;
    state?: string;
    licenseNumber?: string;
  }): Promise<StaffProfile> {
    const profile: StaffProfile = {
      id: uuidv4(),
      userId: staffData.userId,
      fullName: staffData.fullName,
      designation: staffData.designation,
      facilityId: staffData.facilityId,
      district: staffData.district,
      state: staffData.state,
      licenseNumber: staffData.licenseNumber,
      createdAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO staff_profiles (id, user_id, full_name, designation, facility_id, district, state, license_number, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            profile.id,
            profile.userId,
            profile.fullName,
            profile.designation,
            profile.facilityId,
            profile.district,
            profile.state,
            profile.licenseNumber,
            profile.createdAt,
          ]
        );
        return this.mapStaffRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.staffProfiles.set(profile.userId, profile);
    return profile;
  }

  // --- OTP Challenge Operations ---
  async createOTPChallenge(challenge: {
    phone: string;
    otpCodeHash: string;
    purpose: 'PATIENT_LOGIN' | 'PATIENT_REGISTRATION';
    expiresAt: Date;
  }): Promise<OTPChallenge> {
    const record: OTPChallenge = {
      id: uuidv4(),
      phone: challenge.phone,
      otpCodeHash: challenge.otpCodeHash,
      purpose: challenge.purpose,
      expiresAt: challenge.expiresAt,
      isConsumed: false,
      attemptCount: 0,
      createdAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO otp_challenges (id, phone, otp_code_hash, purpose, expires_at, is_consumed, attempt_count, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            record.id,
            record.phone,
            record.otpCodeHash,
            record.purpose,
            record.expiresAt,
            record.isConsumed,
            record.attemptCount,
            record.createdAt,
          ]
        );
        return this.mapOTPRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.otpChallenges.set(record.id, record);
    return record;
  }

  async findOTPChallengeById(id: string): Promise<OTPChallenge | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM otp_challenges WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapOTPRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.otpChallenges.get(id) || null;
  }

  async updateOTPChallenge(
    id: string,
    updates: { attemptCount?: number; isConsumed?: boolean }
  ): Promise<OTPChallenge | null> {
    const existing = await this.findOTPChallengeById(id);
    if (!existing) return null;

    if (updates.attemptCount !== undefined) existing.attemptCount = updates.attemptCount;
    if (updates.isConsumed !== undefined) existing.isConsumed = updates.isConsumed;

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `UPDATE otp_challenges SET attempt_count = $1, is_consumed = $2 WHERE id = $3 RETURNING *`,
          [existing.attemptCount, existing.isConsumed, id]
        );
        return this.mapOTPRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.otpChallenges.set(id, existing);
    return existing;
  }

  // --- Session Operations ---
  async createSession(sessionData: {
    userId: string;
    refreshTokenHash: string;
    deviceInfo?: Record<string, unknown>;
    expiresAt: Date;
  }): Promise<UserSession> {
    const session: UserSession = {
      id: uuidv4(),
      userId: sessionData.userId,
      refreshTokenHash: sessionData.refreshTokenHash,
      deviceInfo: sessionData.deviceInfo,
      expiresAt: sessionData.expiresAt,
      isRevoked: false,
      createdAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO user_sessions (id, user_id, refresh_token_hash, device_info, expires_at, is_revoked, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [
            session.id,
            session.userId,
            session.refreshTokenHash,
            JSON.stringify(session.deviceInfo || {}),
            session.expiresAt,
            session.isRevoked,
            session.createdAt,
          ]
        );
        return this.mapSessionRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.userSessions.set(session.id, session);
    return session;
  }

  async findSessionById(id: string): Promise<UserSession | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM user_sessions WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapSessionRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.userSessions.get(id) || null;
  }

  async revokeSession(id: string): Promise<boolean> {
    const session = await this.findSessionById(id);
    if (!session) return false;
    session.isRevoked = true;

    if (this.isConnected && this.pool) {
      try {
        await this.pool.query('UPDATE user_sessions SET is_revoked = TRUE WHERE id = $1', [id]);
        return true;
      } catch {
        // fallback
      }
    }

    this.userSessions.set(id, session);
    return true;
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    if (this.isConnected && this.pool) {
      try {
        await this.pool.query('UPDATE user_sessions SET is_revoked = TRUE WHERE user_id = $1', [userId]);
      } catch {
        // fallback
      }
    }

    for (const session of this.userSessions.values()) {
      if (session.userId === userId) {
        session.isRevoked = true;
      }
    }
  }

  // --- Audit Log Operations ---
  async createAuditLog(entry: {
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
    const log: AuditLogEntry = {
      id: uuidv4(),
      actorId: entry.actorId,
      role: entry.role,
      scopeFacilityId: entry.scopeFacilityId,
      scopeDistrict: entry.scopeDistrict,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      payloadBefore: entry.payloadBefore,
      payloadAfter: entry.payloadAfter,
      ipAddress: entry.ipAddress,
      correlationId: entry.correlationId,
      createdAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO audit_logs (id, actor_id, role, scope_facility_id, scope_district, action, resource_type, resource_id, payload_before, payload_after, ip_address, correlation_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
          [
            log.id,
            log.actorId,
            log.role,
            log.scopeFacilityId,
            log.scopeDistrict,
            log.action,
            log.resourceType,
            log.resourceId,
            JSON.stringify(log.payloadBefore || null),
            JSON.stringify(log.payloadAfter || null),
            log.ipAddress,
            log.correlationId,
            log.createdAt,
          ]
        );
        return this.mapAuditRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.auditLogs.push(log);
    return log;
  }

  async queryAuditLogs(filter: {
    actorId?: string;
    correlationId?: string;
    action?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    if (this.isConnected && this.pool) {
      try {
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params: unknown[] = [];
        if (filter.actorId) {
          params.push(filter.actorId);
          query += ` AND actor_id = $${params.length}`;
        }
        if (filter.correlationId) {
          params.push(filter.correlationId);
          query += ` AND correlation_id = $${params.length}`;
        }
        if (filter.action) {
          params.push(filter.action);
          query += ` AND action = $${params.length}`;
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(filter.limit || 50);

        const res = await this.pool.query(query, params);
        return res.rows.map((row) => this.mapAuditRow(row));
      } catch {
        // fallback
      }
    }

    let results = [...this.auditLogs];
    if (filter.actorId) results = results.filter((l) => l.actorId === filter.actorId);
    if (filter.correlationId) results = results.filter((l) => l.correlationId === filter.correlationId);
    if (filter.action) results = results.filter((l) => l.action === filter.action);
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return results.slice(0, filter.limit || 50);
  }

  // Row Mappers
  private mapUserRow(row: any): User {
    return {
      id: row.id,
      phone: row.phone || undefined,
      email: row.email || undefined,
      passwordHash: row.password_hash || undefined,
      role: row.role as UserRole,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapStaffRow(row: any): StaffProfile {
    return {
      id: row.id,
      userId: row.user_id,
      fullName: row.full_name,
      designation: row.designation,
      facilityId: row.facility_id || undefined,
      district: row.district || undefined,
      state: row.state || undefined,
      licenseNumber: row.license_number || undefined,
      createdAt: new Date(row.created_at),
    };
  }

  private mapOTPRow(row: any): OTPChallenge {
    return {
      id: row.id,
      phone: row.phone,
      otpCodeHash: row.otp_code_hash,
      purpose: row.purpose,
      expiresAt: new Date(row.expires_at),
      isConsumed: row.is_consumed,
      attemptCount: row.attempt_count,
      createdAt: new Date(row.created_at),
    };
  }

  private mapSessionRow(row: any): UserSession {
    return {
      id: row.id,
      userId: row.user_id,
      refreshTokenHash: row.refresh_token_hash,
      deviceInfo: typeof row.device_info === 'string' ? JSON.parse(row.device_info) : row.device_info,
      expiresAt: new Date(row.expires_at),
      isRevoked: row.is_revoked,
      createdAt: new Date(row.created_at),
    };
  }

  private mapAuditRow(row: any): AuditLogEntry {
    return {
      id: row.id,
      actorId: row.actor_id,
      role: row.role,
      scopeFacilityId: row.scope_facility_id || undefined,
      scopeDistrict: row.scope_district || undefined,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id || undefined,
      payloadBefore: typeof row.payload_before === 'string' ? JSON.parse(row.payload_before) : row.payload_before,
      payloadAfter: typeof row.payload_after === 'string' ? JSON.parse(row.payload_after) : row.payload_after,
      ipAddress: row.ip_address || undefined,
      correlationId: row.correlation_id,
      createdAt: new Date(row.created_at),
    };
  }

  // Clear memory (for testing isolation)
  clearMemory(): void {
    this.users.clear();
    this.staffProfiles.clear();
    this.otpChallenges.clear();
    this.userSessions.clear();
    this.auditLogs = [];
  }
}

export const db = new Database();
