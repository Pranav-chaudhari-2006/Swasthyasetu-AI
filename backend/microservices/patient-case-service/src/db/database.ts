import { Pool } from 'pg';
import { config } from '../config';
import { Patient, CaregiverLink, PatientCase, CaseTimelineEvent, Gender, CaseStatus, TimelineEventType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory backing store for standalone test execution & fallback
  private patients: Map<string, Patient> = new Map();
  private caregiverLinks: Map<string, CaregiverLink[]> = new Map(); // patientId -> links[]
  private cases: Map<string, PatientCase> = new Map();
  private timelineEvents: Map<string, CaseTimelineEvent[]> = new Map(); // caseId -> events[]

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
        console.warn('[Patient-Case DB] PostgreSQL pool error (fallback active):', err.message);
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

  // --- Patient Operations ---
  async createPatient(data: {
    durablePatientCode: string;
    primaryUserId?: string;
    fullName: string;
    dateOfBirth?: string;
    age?: number;
    gender: Gender;
    phone?: string;
    address?: string;
    district: string;
    state: string;
    preferredLanguage?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    abhaId?: string;
  }): Promise<Patient> {
    const patient: Patient = {
      id: uuidv4(),
      durablePatientCode: data.durablePatientCode,
      primaryUserId: data.primaryUserId,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      district: data.district,
      state: data.state,
      preferredLanguage: data.preferredLanguage || 'hi',
      emergencyContactName: data.emergencyContactName,
      emergencyContactPhone: data.emergencyContactPhone,
      abhaId: data.abhaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO patients (id, durable_patient_code, primary_user_id, full_name, date_of_birth, age, gender, phone, address, district, state, preferred_language, emergency_contact_name, emergency_contact_phone, abha_id, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
          [
            patient.id,
            patient.durablePatientCode,
            patient.primaryUserId,
            patient.fullName,
            patient.dateOfBirth,
            patient.age,
            patient.gender,
            patient.phone,
            patient.address,
            patient.district,
            patient.state,
            patient.preferredLanguage,
            patient.emergencyContactName,
            patient.emergencyContactPhone,
            patient.abhaId,
            patient.createdAt,
            patient.updatedAt,
          ]
        );
        return this.mapPatientRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.patients.set(patient.id, patient);
    return patient;
  }

  async findPatientById(id: string): Promise<Patient | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM patients WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapPatientRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.patients.get(id) || null;
  }

  async findPatientByCode(code: string): Promise<Patient | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM patients WHERE durable_patient_code = $1', [code]);
        if (res.rows.length === 0) return null;
        return this.mapPatientRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    for (const p of this.patients.values()) {
      if (p.durablePatientCode === code) return p;
    }
    return null;
  }

  async findPatientByUserId(userId: string): Promise<Patient | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM patients WHERE primary_user_id = $1', [userId]);
        if (res.rows.length === 0) return null;
        return this.mapPatientRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    for (const p of this.patients.values()) {
      if (p.primaryUserId === userId) return p;
    }
    return null;
  }

  // --- Caregiver Links ---
  async linkCaregiver(data: {
    patientId: string;
    caregiverUserId: string;
    relationshipType: string;
  }): Promise<CaregiverLink> {
    const link: CaregiverLink = {
      id: uuidv4(),
      patientId: data.patientId,
      caregiverUserId: data.caregiverUserId,
      relationshipType: data.relationshipType,
      isAuthorized: true,
      createdAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO caregiver_links (id, patient_id, caregiver_user_id, relationship_type, is_authorized, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (patient_id, caregiver_user_id) DO UPDATE SET relationship_type = EXCLUDED.relationship_type, is_authorized = TRUE
           RETURNING *`,
          [link.id, link.patientId, link.caregiverUserId, link.relationshipType, link.isAuthorized, link.createdAt]
        );
        return this.mapCaregiverRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    const links = this.caregiverLinks.get(data.patientId) || [];
    links.push(link);
    this.caregiverLinks.set(data.patientId, links);
    return link;
  }

  async getCaregiversForPatient(patientId: string): Promise<CaregiverLink[]> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM caregiver_links WHERE patient_id = $1', [patientId]);
        return res.rows.map((r) => this.mapCaregiverRow(r));
      } catch {
        // fallback
      }
    }
    return this.caregiverLinks.get(patientId) || [];
  }

  // --- Patient Case Operations ---
  async createCase(data: {
    caseNumber: string;
    patientId: string;
    operatedBy?: string;
    chiefComplaintSummary?: string;
  }): Promise<PatientCase> {
    const patientCase: PatientCase = {
      id: uuidv4(),
      caseNumber: data.caseNumber,
      patientId: data.patientId,
      operatedBy: data.operatedBy,
      openedAt: new Date(),
      status: 'CREATED',
      chiefComplaintSummary: data.chiefComplaintSummary,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO patient_cases (id, case_number, patient_id, operated_by, opened_at, status, chief_complaint_summary, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
          [
            patientCase.id,
            patientCase.caseNumber,
            patientCase.patientId,
            patientCase.operatedBy,
            patientCase.openedAt,
            patientCase.status,
            patientCase.chiefComplaintSummary,
            patientCase.createdAt,
            patientCase.updatedAt,
          ]
        );
        return this.mapCaseRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.cases.set(patientCase.id, patientCase);
    return patientCase;
  }

  async findCaseById(id: string): Promise<PatientCase | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM patient_cases WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapCaseRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.cases.get(id) || null;
  }

  async listCasesByPatientId(patientId: string): Promise<PatientCase[]> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT * FROM patient_cases WHERE patient_id = $1 ORDER BY opened_at DESC',
          [patientId]
        );
        return res.rows.map((r) => this.mapCaseRow(r));
      } catch {
        // fallback
      }
    }
    return Array.from(this.cases.values())
      .filter((c) => c.patientId === patientId)
      .sort((a, b) => b.openedAt.getTime() - a.openedAt.getTime());
  }

  async updateCaseStatus(
    id: string,
    updates: {
      status: CaseStatus;
      assignedPathway?: 'ROUTINE' | 'SAME_DAY' | 'EMERGENCY';
      primaryFacilityId?: string;
      outcome?: string;
      closedAt?: Date;
    }
  ): Promise<PatientCase | null> {
    const existing = await this.findCaseById(id);
    if (!existing) return null;

    existing.status = updates.status;
    if (updates.assignedPathway) existing.assignedPathway = updates.assignedPathway;
    if (updates.primaryFacilityId) existing.primaryFacilityId = updates.primaryFacilityId;
    if (updates.outcome) existing.outcome = updates.outcome;
    if (updates.closedAt) existing.closedAt = updates.closedAt;
    existing.updatedAt = new Date();

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `UPDATE patient_cases
           SET status = $1, assigned_pathway = $2, primary_facility_id = $3, outcome = $4, closed_at = $5, updated_at = $6
           WHERE id = $7 RETURNING *`,
          [
            existing.status,
            existing.assignedPathway,
            existing.primaryFacilityId,
            existing.outcome,
            existing.closedAt,
            existing.updatedAt,
            id,
          ]
        );
        return this.mapCaseRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.cases.set(id, existing);
    return existing;
  }

  // --- Timeline Events ---
  async addTimelineEvent(data: {
    caseId: string;
    eventType: TimelineEventType;
    actorId: string;
    actorRole: string;
    facilityId?: string;
    eventData?: Record<string, unknown>;
  }): Promise<CaseTimelineEvent> {
    const event: CaseTimelineEvent = {
      id: uuidv4(),
      caseId: data.caseId,
      eventType: data.eventType,
      actorId: data.actorId,
      actorRole: data.actorRole,
      facilityId: data.facilityId,
      eventData: data.eventData || {},
      occurredAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO case_timeline_events (id, case_id, event_type, actor_id, actor_role, facility_id, event_data, occurred_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            event.id,
            event.caseId,
            event.eventType,
            event.actorId,
            event.actorRole,
            event.facilityId,
            JSON.stringify(event.eventData),
            event.occurredAt,
          ]
        );
        return this.mapTimelineRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    const currentEvents = this.timelineEvents.get(data.caseId) || [];
    currentEvents.push(event);
    this.timelineEvents.set(data.caseId, currentEvents);
    return event;
  }

  async getTimelineForCase(caseId: string): Promise<CaseTimelineEvent[]> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT * FROM case_timeline_events WHERE case_id = $1 ORDER BY occurred_at ASC',
          [caseId]
        );
        return res.rows.map((r) => this.mapTimelineRow(r));
      } catch {
        // fallback
      }
    }
    const list = this.timelineEvents.get(caseId) || [];
    return [...list].sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }

  // Row Mappers
  private mapPatientRow(row: any): Patient {
    return {
      id: row.id,
      durablePatientCode: row.durable_patient_code,
      primaryUserId: row.primary_user_id || undefined,
      fullName: row.full_name,
      dateOfBirth: row.date_of_birth || undefined,
      age: row.age != null ? parseInt(row.age, 10) : undefined,
      gender: row.gender as Gender,
      phone: row.phone || undefined,
      address: row.address || undefined,
      district: row.district,
      state: row.state,
      preferredLanguage: row.preferred_language,
      emergencyContactName: row.emergency_contact_name || undefined,
      emergencyContactPhone: row.emergency_contact_phone || undefined,
      abhaId: row.abha_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapCaregiverRow(row: any): CaregiverLink {
    return {
      id: row.id,
      patientId: row.patient_id,
      caregiverUserId: row.caregiver_user_id,
      relationshipType: row.relationship_type,
      isAuthorized: row.is_authorized,
      createdAt: new Date(row.created_at),
    };
  }

  private mapCaseRow(row: any): PatientCase {
    return {
      id: row.id,
      caseNumber: row.case_number,
      patientId: row.patient_id,
      operatedBy: row.operated_by || undefined,
      openedAt: new Date(row.opened_at),
      closedAt: row.closed_at ? new Date(row.closed_at) : undefined,
      status: row.status as CaseStatus,
      chiefComplaintSummary: row.chief_complaint_summary || undefined,
      assignedPathway: row.assigned_pathway || undefined,
      primaryFacilityId: row.primary_facility_id || undefined,
      outcome: row.outcome || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapTimelineRow(row: any): CaseTimelineEvent {
    return {
      id: row.id,
      caseId: row.case_id,
      eventType: row.event_type as TimelineEventType,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      facilityId: row.facility_id || undefined,
      eventData: typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data,
      occurredAt: new Date(row.occurred_at),
    };
  }

  clearMemory(): void {
    this.patients.clear();
    this.caregiverLinks.clear();
    this.cases.clear();
    this.timelineEvents.clear();
  }
}

export const db = new Database();
