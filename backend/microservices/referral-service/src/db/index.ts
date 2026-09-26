import { Pool } from 'pg';
import { config } from '../config';
import { Referral, ReferralStateTransition, ReferralState, ReferralPathway } from '../types';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory persistent fallback repository
  private inMemoryReferrals: Map<string, Referral> = new Map();
  private inMemoryTransitions: ReferralStateTransition[] = [];

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

  async createReferral(referral: Referral, initialTransition: ReferralStateTransition): Promise<Referral> {
    if (this.isConnected && this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const insertRefQuery = `
          INSERT INTO referrals (
            id, referral_code, case_id, patient_id, source_facility_id,
            originating_actor_id, originating_actor_role, destination_facility_id,
            pathway, required_capabilities, clinical_summary, current_state,
            qr_token_hash, transport_details, decline_reason, emergency_bypass,
            created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *;
        `;
        await client.query(insertRefQuery, [
          referral.id,
          referral.referralCode,
          referral.caseId,
          referral.patientId,
          referral.sourceFacilityId || null,
          referral.originatingActorId,
          referral.originatingActorRole,
          referral.destinationFacilityId,
          referral.pathway,
          JSON.stringify(referral.requiredCapabilities),
          referral.clinicalSummary,
          referral.currentState,
          referral.qrTokenHash,
          referral.transportDetails ? JSON.stringify(referral.transportDetails) : null,
          referral.declineReason || null,
          referral.emergencyBypass,
          referral.createdAt,
          referral.updatedAt
        ]);

        const insertTransQuery = `
          INSERT INTO referral_state_transitions (
            id, referral_id, from_state, to_state, actor_id, actor_role, facility_id, reason, metadata, transitioned_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `;
        await client.query(insertTransQuery, [
          initialTransition.id,
          initialTransition.referralId,
          initialTransition.fromState,
          initialTransition.toState,
          initialTransition.actorId,
          initialTransition.actorRole,
          initialTransition.facilityId || null,
          initialTransition.reason || null,
          JSON.stringify(initialTransition.metadata || {}),
          initialTransition.transitionedAt
        ]);

        await client.query('COMMIT');
        return referral;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    // In-memory store fallback
    this.inMemoryReferrals.set(referral.id, { ...referral });
    this.inMemoryTransitions.push({ ...initialTransition });
    return referral;
  }

  async getReferralById(id: string): Promise<Referral | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM referrals WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToReferral(res.rows[0]);
    }
    const found = this.inMemoryReferrals.get(id);
    return found ? { ...found } : null;
  }

  async getReferralByCode(code: string): Promise<Referral | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM referrals WHERE referral_code = $1', [code]);
      if (res.rows.length === 0) return null;
      return this.mapRowToReferral(res.rows[0]);
    }
    for (const ref of this.inMemoryReferrals.values()) {
      if (ref.referralCode === code) return { ...ref };
    }
    return null;
  }

  async getReferralsByPatientId(patientId: string): Promise<Referral[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM referrals WHERE patient_id = $1 ORDER BY created_at DESC', [patientId]);
      return res.rows.map(r => this.mapRowToReferral(r));
    }
    return Array.from(this.inMemoryReferrals.values())
      .filter(r => r.patientId === patientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getReferralsByCaseId(caseId: string): Promise<Referral[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM referrals WHERE case_id = $1 ORDER BY created_at DESC', [caseId]);
      return res.rows.map(r => this.mapRowToReferral(r));
    }
    return Array.from(this.inMemoryReferrals.values())
      .filter(r => r.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getFacilityInbox(
    facilityId: string,
    filters?: { state?: ReferralState; pathway?: ReferralPathway }
  ): Promise<Referral[]> {
    if (this.isConnected && this.pool) {
      let query = 'SELECT * FROM referrals WHERE destination_facility_id = $1';
      const params: any[] = [facilityId];
      if (filters?.state) {
        params.push(filters.state);
        query += ` AND current_state = $${params.length}`;
      }
      if (filters?.pathway) {
        params.push(filters.pathway);
        query += ` AND pathway = $${params.length}`;
      }
      query += ' ORDER BY created_at DESC';
      const res = await this.pool.query(query, params);
      return res.rows.map(r => this.mapRowToReferral(r));
    }

    return Array.from(this.inMemoryReferrals.values())
      .filter(r => {
        if (r.destinationFacilityId !== facilityId) return false;
        if (filters?.state && r.currentState !== filters.state) return false;
        if (filters?.pathway && r.pathway !== filters.pathway) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateReferralState(
    referralId: string,
    nextState: ReferralState,
    transition: ReferralStateTransition,
    updates?: Partial<Referral>
  ): Promise<Referral> {
    const now = new Date().toISOString();
    if (this.isConnected && this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        
        // Row-level lock to prevent concurrent double-transitions
        const lockRes = await client.query('SELECT * FROM referrals WHERE id = $1 FOR UPDATE', [referralId]);
        if (lockRes.rows.length === 0) {
          throw new Error(`Referral ${referralId} not found`);
        }

        const updateFields: string[] = ['current_state = $2', 'updated_at = $3'];
        const updateParams: any[] = [referralId, nextState, now];

        if (updates?.declineReason !== undefined) {
          updateParams.push(updates.declineReason);
          updateFields.push(`decline_reason = $${updateParams.length}`);
        }
        if (updates?.transportDetails !== undefined) {
          updateParams.push(JSON.stringify(updates.transportDetails));
          updateFields.push(`transport_details = $${updateParams.length}`);
        }
        if (updates?.destinationFacilityId !== undefined) {
          updateParams.push(updates.destinationFacilityId);
          updateFields.push(`destination_facility_id = $${updateParams.length}`);
        }

        const updateQuery = `
          UPDATE referrals
          SET ${updateFields.join(', ')}
          WHERE id = $1
          RETURNING *;
        `;
        const updatedRes = await client.query(updateQuery, updateParams);

        const insertTransQuery = `
          INSERT INTO referral_state_transitions (
            id, referral_id, from_state, to_state, actor_id, actor_role, facility_id, reason, metadata, transitioned_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `;
        await client.query(insertTransQuery, [
          transition.id,
          transition.referralId,
          transition.fromState,
          transition.toState,
          transition.actorId,
          transition.actorRole,
          transition.facilityId || null,
          transition.reason || null,
          JSON.stringify(transition.metadata || {}),
          transition.transitionedAt
        ]);

        await client.query('COMMIT');
        return this.mapRowToReferral(updatedRes.rows[0]);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    const existing = this.inMemoryReferrals.get(referralId);
    if (!existing) throw new Error(`Referral ${referralId} not found`);

    const updated: Referral = {
      ...existing,
      ...updates,
      currentState: nextState,
      updatedAt: now
    };
    this.inMemoryReferrals.set(referralId, updated);
    this.inMemoryTransitions.push(transition);
    return updated;
  }

  async getTransitionsByReferralId(referralId: string): Promise<ReferralStateTransition[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM referral_state_transitions WHERE referral_id = $1 ORDER BY transitioned_at ASC',
        [referralId]
      );
      return res.rows.map(r => ({
        id: r.id,
        referralId: r.referral_id,
        fromState: r.from_state,
        toState: r.to_state,
        actorId: r.actor_id,
        actorRole: r.actor_role,
        facilityId: r.facility_id,
        reason: r.reason,
        metadata: r.metadata ? (typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata) : {},
        transitionedAt: r.transitioned_at
      }));
    }

    return this.inMemoryTransitions
      .filter(t => t.referralId === referralId)
      .sort((a, b) => new Date(a.transitionedAt).getTime() - new Date(b.transitionedAt).getTime());
  }

  async clear(): Promise<void> {
    this.inMemoryReferrals.clear();
    this.inMemoryTransitions = [];
  }

  private mapRowToReferral(row: any): Referral {
    return {
      id: row.id,
      referralCode: row.referral_code,
      caseId: row.case_id,
      patientId: row.patient_id,
      sourceFacilityId: row.source_facility_id,
      originatingActorId: row.originating_actor_id,
      originatingActorRole: row.originating_actor_role,
      destinationFacilityId: row.destination_facility_id,
      pathway: row.pathway,
      requiredCapabilities: typeof row.required_capabilities === 'string' ? JSON.parse(row.required_capabilities) : row.required_capabilities,
      clinicalSummary: row.clinical_summary,
      currentState: row.current_state,
      qrTokenHash: row.qr_token_hash,
      transportDetails: row.transport_details ? (typeof row.transport_details === 'string' ? JSON.parse(row.transport_details) : row.transport_details) : null,
      declineReason: row.decline_reason,
      emergencyBypass: Boolean(row.emergency_bypass),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const db = new Database();
