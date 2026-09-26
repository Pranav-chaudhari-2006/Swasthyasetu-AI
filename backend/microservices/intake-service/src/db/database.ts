import { Pool } from 'pg';
import { config } from '../config';
import { IntakeSession, IntakeMessage, StructuredIntakeFacts, IntakeStatus, MessageSenderType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  private sessions: Map<string, IntakeSession> = new Map();
  private messages: Map<string, IntakeMessage[]> = new Map(); // sessionId -> messages[]
  private structuredFacts: Map<string, StructuredIntakeFacts> = new Map(); // sessionId -> facts

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
        console.warn('[Intake DB] PostgreSQL pool error (fallback active):', err.message);
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

  // --- Session Operations ---
  async createSession(data: {
    caseId: string;
    patientId: string;
    operatedBy?: string;
    languageCode?: string;
  }): Promise<IntakeSession> {
    const session: IntakeSession = {
      id: uuidv4(),
      caseId: data.caseId,
      patientId: data.patientId,
      operatedBy: data.operatedBy,
      languageCode: data.languageCode || 'hi',
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO intake_sessions (id, case_id, patient_id, operated_by, language_code, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            session.id,
            session.caseId,
            session.patientId,
            session.operatedBy,
            session.languageCode,
            session.status,
            session.createdAt,
            session.updatedAt,
          ]
        );
        return this.mapSessionRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.sessions.set(session.id, session);
    return session;
  }

  async findSessionById(id: string): Promise<IntakeSession | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query('SELECT * FROM intake_sessions WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return this.mapSessionRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.sessions.get(id) || null;
  }

  async updateSessionStatus(id: string, status: IntakeStatus): Promise<IntakeSession | null> {
    const existing = await this.findSessionById(id);
    if (!existing) return null;

    existing.status = status;
    existing.updatedAt = new Date();

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'UPDATE intake_sessions SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *',
          [status, existing.updatedAt, id]
        );
        return this.mapSessionRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.sessions.set(id, existing);
    return existing;
  }

  // --- Message Operations ---
  async addMessage(data: {
    sessionId: string;
    senderType: MessageSenderType;
    rawContent: string;
    translatedContent?: string;
    audioUrl?: string;
    languageCode?: string;
  }): Promise<IntakeMessage> {
    const message: IntakeMessage = {
      id: uuidv4(),
      sessionId: data.sessionId,
      senderType: data.senderType,
      rawContent: data.rawContent,
      translatedContent: data.translatedContent,
      audioUrl: data.audioUrl,
      languageCode: data.languageCode || 'hi',
      createdAt: new Date(),
    };

    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO intake_messages (id, session_id, sender_type, raw_content, translated_content, audio_url, language_code, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [
            message.id,
            message.sessionId,
            message.senderType,
            message.rawContent,
            message.translatedContent,
            message.audioUrl,
            message.languageCode,
            message.createdAt,
          ]
        );
        return this.mapMessageRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    const list = this.messages.get(data.sessionId) || [];
    list.push(message);
    this.messages.set(data.sessionId, list);
    return message;
  }

  async getMessagesBySessionId(sessionId: string): Promise<IntakeMessage[]> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT * FROM intake_messages WHERE session_id = $1 ORDER BY created_at ASC',
          [sessionId]
        );
        return res.rows.map((r) => this.mapMessageRow(r));
      } catch {
        // fallback
      }
    }
    const list = this.messages.get(sessionId) || [];
    return [...list].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // --- Structured Facts Operations ---
  async saveStructuredFacts(facts: StructuredIntakeFacts): Promise<StructuredIntakeFacts> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO structured_intake_facts (id, session_id, case_id, patient_id, chief_symptoms, reported_red_flags, existing_medical_conditions, current_medications, extracted_vital_signs, clarification_status, model_version, confidence_score, is_ai_generated, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (session_id) DO UPDATE
           SET chief_symptoms = EXCLUDED.chief_symptoms, reported_red_flags = EXCLUDED.reported_red_flags, existing_medical_conditions = EXCLUDED.existing_medical_conditions, current_medications = EXCLUDED.current_medications, extracted_vital_signs = EXCLUDED.extracted_vital_signs, clarification_status = EXCLUDED.clarification_status, confidence_score = EXCLUDED.confidence_score
           RETURNING *`,
          [
            facts.id,
            facts.sessionId,
            facts.caseId,
            facts.patientId,
            JSON.stringify(facts.chiefSymptoms),
            JSON.stringify(facts.reportedRedFlags),
            JSON.stringify(facts.existingMedicalConditions || []),
            JSON.stringify(facts.currentMedications || []),
            JSON.stringify(facts.extractedVitalSigns || {}),
            facts.clarificationStatus,
            facts.modelVersion,
            facts.confidenceScore,
            facts.isAiGenerated,
            facts.createdAt,
          ]
        );
        return this.mapFactsRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.structuredFacts.set(facts.sessionId, facts);
    return facts;
  }

  async getStructuredFactsBySessionId(sessionId: string): Promise<StructuredIntakeFacts | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT * FROM structured_intake_facts WHERE session_id = $1',
          [sessionId]
        );
        if (res.rows.length === 0) return null;
        return this.mapFactsRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    return this.structuredFacts.get(sessionId) || null;
  }

  // Row Mappers
  private mapSessionRow(row: any): IntakeSession {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      operatedBy: row.operated_by || undefined,
      languageCode: row.language_code,
      status: row.status as IntakeStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapMessageRow(row: any): IntakeMessage {
    return {
      id: row.id,
      sessionId: row.session_id,
      senderType: row.sender_type as MessageSenderType,
      rawContent: row.raw_content,
      translatedContent: row.translated_content || undefined,
      audioUrl: row.audio_url || undefined,
      languageCode: row.language_code,
      createdAt: new Date(row.created_at),
    };
  }

  private mapFactsRow(row: any): StructuredIntakeFacts {
    return {
      id: row.id,
      sessionId: row.session_id,
      caseId: row.case_id,
      patientId: row.patient_id,
      chiefSymptoms: typeof row.chief_symptoms === 'string' ? JSON.parse(row.chief_symptoms) : row.chief_symptoms,
      reportedRedFlags: typeof row.reported_red_flags === 'string' ? JSON.parse(row.reported_red_flags) : row.reported_red_flags,
      existingMedicalConditions: typeof row.existing_medical_conditions === 'string' ? JSON.parse(row.existing_medical_conditions) : row.existing_medical_conditions,
      currentMedications: typeof row.current_medications === 'string' ? JSON.parse(row.current_medications) : row.current_medications,
      extractedVitalSigns: typeof row.extracted_vital_signs === 'string' ? JSON.parse(row.extracted_vital_signs) : row.extracted_vital_signs,
      clarificationStatus: row.clarification_status,
      modelVersion: row.model_version,
      confidenceScore: parseFloat(row.confidence_score),
      isAiGenerated: true,
      createdAt: new Date(row.created_at),
    };
  }

  clearMemory(): void {
    this.sessions.clear();
    this.messages.clear();
    this.structuredFacts.clear();
  }
}

export const db = new Database();
