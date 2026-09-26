import { Pool } from 'pg';
import { config } from '../config';
import { SafetyAssessment } from '../types';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  private assessments: Map<string, SafetyAssessment> = new Map();

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
        console.warn('[Safety DB] PostgreSQL pool error (fallback active):', err.message);
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

  async saveAssessment(assessment: SafetyAssessment): Promise<SafetyAssessment> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          `INSERT INTO safety_assessments (id, case_id, rule_set_version, triaged_pathway, triggered_rule_ids, clinical_rationale, recommended_capabilities, is_emergency_bypass, input_facts_snapshot, evaluated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            assessment.id,
            assessment.caseId,
            assessment.ruleSetVersion,
            assessment.triagedPathway,
            JSON.stringify(assessment.triggeredRuleIds),
            assessment.clinicalRationale,
            JSON.stringify(assessment.recommendedCapabilities),
            assessment.isEmergencyBypass,
            JSON.stringify(assessment.inputFactsSnapshot),
            assessment.evaluatedAt,
          ]
        );
        return this.mapAssessmentRow(res.rows[0]);
      } catch {
        // fallback
      }
    }

    this.assessments.set(assessment.id, assessment);
    return assessment;
  }

  async findAssessmentByCaseId(caseId: string): Promise<SafetyAssessment | null> {
    if (this.isConnected && this.pool) {
      try {
        const res = await this.pool.query(
          'SELECT * FROM safety_assessments WHERE case_id = $1 ORDER BY evaluated_at DESC LIMIT 1',
          [caseId]
        );
        if (res.rows.length === 0) return null;
        return this.mapAssessmentRow(res.rows[0]);
      } catch {
        // fallback
      }
    }
    for (const a of this.assessments.values()) {
      if (a.caseId === caseId) return a;
    }
    return null;
  }

  private mapAssessmentRow(row: any): SafetyAssessment {
    return {
      id: row.id,
      caseId: row.case_id,
      ruleSetVersion: row.rule_set_version,
      triagedPathway: row.triaged_pathway,
      triggeredRuleIds: typeof row.triggered_rule_ids === 'string' ? JSON.parse(row.triggered_rule_ids) : row.triggered_rule_ids,
      clinicalRationale: row.clinical_rationale,
      recommendedCapabilities: typeof row.recommended_capabilities === 'string' ? JSON.parse(row.recommended_capabilities) : row.recommended_capabilities,
      isEmergencyBypass: row.is_emergency_bypass,
      inputFactsSnapshot: typeof row.input_facts_snapshot === 'string' ? JSON.parse(row.input_facts_snapshot) : row.input_facts_snapshot,
      evaluatedAt: new Date(row.evaluated_at),
    };
  }

  clearMemory(): void {
    this.assessments.clear();
  }
}

export const db = new Database();
