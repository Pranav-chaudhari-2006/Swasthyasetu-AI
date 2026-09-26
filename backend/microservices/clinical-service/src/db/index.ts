import { Pool } from 'pg';
import { config } from '../config';
import {
  ClinicalAssessment,
  Prescription,
  PrescriptionItem,
  MedicineInventory,
  DiagnosticOrder,
  HospitalAdmission,
  StockStatus
} from '../types';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory persistent stores
  private inMemoryAssessments: Map<string, ClinicalAssessment> = new Map();
  private inMemoryPrescriptions: Map<string, Prescription> = new Map();
  private inMemoryInventory: Map<string, MedicineInventory> = new Map(); // key: `${facilityId}:${medicineName.toLowerCase()}`
  private inMemoryDiagnostics: Map<string, DiagnosticOrder> = new Map();
  private inMemoryAdmissions: Map<string, HospitalAdmission> = new Map();

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

  // Clinical Assessments
  async createAssessment(assessment: ClinicalAssessment): Promise<ClinicalAssessment> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO clinical_assessments (
          id, case_id, patient_id, clinician_id, clinician_role,
          facility_id, chief_complaint, physical_findings, differential_diagnosis,
          final_diagnosis, clinical_notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        assessment.id,
        assessment.caseId,
        assessment.patientId,
        assessment.clinicianId,
        assessment.clinicianRole,
        assessment.facilityId,
        assessment.chiefComplaint,
        JSON.stringify(assessment.physicalFindings),
        assessment.differentialDiagnosis,
        assessment.finalDiagnosis,
        assessment.clinicalNotes || null,
        assessment.createdAt,
        assessment.updatedAt
      ]);
      return this.mapRowToAssessment(res.rows[0]);
    }
    this.inMemoryAssessments.set(assessment.id, { ...assessment });
    return assessment;
  }

  async getAssessmentById(id: string): Promise<ClinicalAssessment | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM clinical_assessments WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToAssessment(res.rows[0]);
    }
    const found = this.inMemoryAssessments.get(id);
    return found ? { ...found } : null;
  }

  async getAssessmentsByCaseId(caseId: string): Promise<ClinicalAssessment[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM clinical_assessments WHERE case_id = $1 ORDER BY created_at DESC',
        [caseId]
      );
      return res.rows.map(r => this.mapRowToAssessment(r));
    }
    return Array.from(this.inMemoryAssessments.values())
      .filter(a => a.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Prescriptions
  async createPrescription(prescription: Prescription): Promise<Prescription> {
    if (this.isConnected && this.pool) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        const presQuery = `
          INSERT INTO prescriptions (id, case_id, patient_id, assessment_id, clinician_id, clinician_role, facility_id, instructions, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `;
        await client.query(presQuery, [
          prescription.id,
          prescription.caseId,
          prescription.patientId,
          prescription.assessmentId || null,
          prescription.clinicianId,
          prescription.clinicianRole,
          prescription.facilityId,
          prescription.instructions || null,
          prescription.createdAt
        ]);

        for (const item of prescription.items) {
          const itemQuery = `
            INSERT INTO prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration_days, quantity, is_dispensed, dispensed_at, dispensed_by_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
          `;
          await client.query(itemQuery, [
            item.id,
            item.prescriptionId,
            item.medicineName,
            item.dosage,
            item.frequency,
            item.durationDays,
            item.quantity,
            item.isDispensed,
            item.dispensedAt || null,
            item.dispensedById || null
          ]);
        }
        await client.query('COMMIT');
        return prescription;
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    this.inMemoryPrescriptions.set(prescription.id, {
      ...prescription,
      items: prescription.items.map(i => ({ ...i }))
    });
    return prescription;
  }

  async getPrescriptionById(id: string): Promise<Prescription | null> {
    if (this.isConnected && this.pool) {
      const presRes = await this.pool.query('SELECT * FROM prescriptions WHERE id = $1', [id]);
      if (presRes.rows.length === 0) return null;
      const itemsRes = await this.pool.query('SELECT * FROM prescription_items WHERE prescription_id = $1', [id]);
      return this.mapRowToPrescription(presRes.rows[0], itemsRes.rows);
    }
    const found = this.inMemoryPrescriptions.get(id);
    return found ? { ...found, items: found.items.map(i => ({ ...i })) } : null;
  }

  async getPrescriptionsByCaseId(caseId: string): Promise<Prescription[]> {
    if (this.isConnected && this.pool) {
      const presRes = await this.pool.query('SELECT * FROM prescriptions WHERE case_id = $1 ORDER BY created_at DESC', [caseId]);
      const prescriptions: Prescription[] = [];
      for (const row of presRes.rows) {
        const itemsRes = await this.pool.query('SELECT * FROM prescription_items WHERE prescription_id = $1', [row.id]);
        prescriptions.push(this.mapRowToPrescription(row, itemsRes.rows));
      }
      return prescriptions;
    }
    return Array.from(this.inMemoryPrescriptions.values())
      .filter(p => p.caseId === caseId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Inventory & Dispensing
  async upsertInventory(inv: MedicineInventory): Promise<MedicineInventory> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO medicine_inventory (id, facility_id, medicine_name, stock_count, stock_status, unit, last_verified_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (facility_id, medicine_name) DO UPDATE
        SET stock_count = EXCLUDED.stock_count,
            stock_status = EXCLUDED.stock_status,
            unit = EXCLUDED.unit,
            last_verified_at = EXCLUDED.last_verified_at
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        inv.id,
        inv.facilityId,
        inv.medicineName,
        inv.stockCount,
        inv.stockStatus,
        inv.unit,
        inv.lastVerifiedAt
      ]);
      return this.mapRowToInventory(res.rows[0]);
    }

    const key = `${inv.facilityId}:${inv.medicineName.toLowerCase()}`;
    this.inMemoryInventory.set(key, { ...inv });
    return inv;
  }

  async getInventoryItem(facilityId: string, medicineName: string): Promise<MedicineInventory | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM medicine_inventory WHERE facility_id = $1 AND LOWER(medicine_name) = LOWER($2)',
        [facilityId, medicineName]
      );
      if (res.rows.length === 0) return null;
      return this.mapRowToInventory(res.rows[0]);
    }
    const key = `${facilityId}:${medicineName.toLowerCase()}`;
    const found = this.inMemoryInventory.get(key);
    return found ? { ...found } : null;
  }

  async getFacilityInventory(facilityId: string): Promise<MedicineInventory[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM medicine_inventory WHERE facility_id = $1 ORDER BY medicine_name ASC',
        [facilityId]
      );
      return res.rows.map(r => this.mapRowToInventory(r));
    }
    return Array.from(this.inMemoryInventory.values())
      .filter(i => i.facilityId === facilityId)
      .sort((a, b) => a.medicineName.localeCompare(b.medicineName));
  }

  async dispensePrescriptionItems(
    prescriptionId: string,
    dispenseList: Array<{ itemId: string; quantity: number }>,
    facilityId: string,
    dispensedById: string
  ): Promise<{ success: boolean; warnings: string[]; updatedPrescription: Prescription }> {
    const warnings: string[] = [];
    const now = new Date().toISOString();

    const prescription = await this.getPrescriptionById(prescriptionId);
    if (!prescription) throw new Error(`Prescription ${prescriptionId} not found`);

    for (const req of dispenseList) {
      const item = prescription.items.find(i => i.id === req.itemId);
      if (!item) {
        warnings.push(`Item ID ${req.itemId} not part of prescription`);
        continue;
      }
      if (item.isDispensed) {
        warnings.push(`Item ${item.medicineName} is already dispensed`);
        continue;
      }

      const inv = await this.getInventoryItem(facilityId, item.medicineName);
      if (!inv || inv.stockCount < req.quantity) {
        warnings.push(`Insufficient stock for ${item.medicineName}. Requested: ${req.quantity}, Available: ${inv?.stockCount || 0}`);
        continue;
      }

      // Deduct inventory
      const newStock = inv.stockCount - req.quantity;
      const newStatus: StockStatus = newStock === 0 ? 'OUT_OF_STOCK' : newStock < 20 ? 'LOW_STOCK' : 'IN_STOCK';
      await this.upsertInventory({
        ...inv,
        stockCount: newStock,
        stockStatus: newStatus,
        lastVerifiedAt: now
      });

      // Mark item dispensed
      item.isDispensed = true;
      item.dispensedAt = now;
      item.dispensedById = dispensedById;
    }

    if (this.isConnected && this.pool) {
      for (const item of prescription.items) {
        if (item.isDispensed) {
          await this.pool.query(
            'UPDATE prescription_items SET is_dispensed = true, dispensed_at = $2, dispensed_by_id = $3 WHERE id = $1',
            [item.id, item.dispensedAt, item.dispensedById]
          );
        }
      }
    } else {
      this.inMemoryPrescriptions.set(prescriptionId, prescription);
    }

    return { success: true, warnings, updatedPrescription: prescription };
  }

  // Diagnostic Orders
  async createDiagnosticOrder(order: DiagnosticOrder): Promise<DiagnosticOrder> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO diagnostic_orders (
          id, case_id, patient_id, clinician_id, facility_id, test_name,
          status, result_data, result_file_url, lab_tech_id, reviewed_by_clinician_id,
          ordered_at, sample_collected_at, completed_at, reviewed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        order.id,
        order.caseId,
        order.patientId,
        order.clinicianId,
        order.facilityId,
        order.testName,
        order.status,
        order.resultData ? JSON.stringify(order.resultData) : null,
        order.resultFileUrl || null,
        order.labTechId || null,
        order.reviewedByClinicianId || null,
        order.orderedAt,
        order.sampleCollectedAt || null,
        order.completedAt || null,
        order.reviewedAt || null
      ]);
      return this.mapRowToDiagnostic(res.rows[0]);
    }
    this.inMemoryDiagnostics.set(order.id, { ...order });
    return order;
  }

  async getDiagnosticOrderById(id: string): Promise<DiagnosticOrder | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM diagnostic_orders WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToDiagnostic(res.rows[0]);
    }
    const found = this.inMemoryDiagnostics.get(id);
    return found ? { ...found } : null;
  }

  async getDiagnosticsByCaseId(caseId: string): Promise<DiagnosticOrder[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM diagnostic_orders WHERE case_id = $1 ORDER BY ordered_at DESC', [caseId]);
      return res.rows.map(r => this.mapRowToDiagnostic(r));
    }
    return Array.from(this.inMemoryDiagnostics.values())
      .filter(d => d.caseId === caseId)
      .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
  }

  async updateDiagnosticOrder(id: string, updates: Partial<DiagnosticOrder>): Promise<DiagnosticOrder> {
    const existing = await this.getDiagnosticOrderById(id);
    if (!existing) throw new Error(`Diagnostic order ${id} not found`);

    const updated = { ...existing, ...updates };
    if (this.isConnected && this.pool) {
      const query = `
        UPDATE diagnostic_orders
        SET status = $2,
            result_data = $3,
            result_file_url = $4,
            lab_tech_id = $5,
            reviewed_by_clinician_id = $6,
            sample_collected_at = $7,
            completed_at = $8,
            reviewed_at = $9
        WHERE id = $1
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        id,
        updated.status,
        updated.resultData ? JSON.stringify(updated.resultData) : null,
        updated.resultFileUrl || null,
        updated.labTechId || null,
        updated.reviewedByClinicianId || null,
        updated.sampleCollectedAt || null,
        updated.completedAt || null,
        updated.reviewedAt || null
      ]);
      return this.mapRowToDiagnostic(res.rows[0]);
    }

    this.inMemoryDiagnostics.set(id, updated);
    return updated;
  }

  // Hospital Admissions
  async createAdmission(adm: HospitalAdmission): Promise<HospitalAdmission> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO hospital_admissions (
          id, case_id, patient_id, facility_id, admitted_by, ward_bed, status,
          admitted_at, discharged_at, discharge_summary, follow_up_instructions, discharged_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        adm.id,
        adm.caseId,
        adm.patientId,
        adm.facilityId,
        adm.admittedBy,
        adm.wardBed,
        adm.status,
        adm.admittedAt,
        adm.dischargedAt || null,
        adm.dischargeSummary || null,
        adm.followUpInstructions || null,
        adm.dischargedBy || null
      ]);
      return this.mapRowToAdmission(res.rows[0]);
    }
    this.inMemoryAdmissions.set(adm.id, { ...adm });
    return adm;
  }

  async getAdmissionById(id: string): Promise<HospitalAdmission | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM hospital_admissions WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToAdmission(res.rows[0]);
    }
    const found = this.inMemoryAdmissions.get(id);
    return found ? { ...found } : null;
  }

  async getAdmissionsByCaseId(caseId: string): Promise<HospitalAdmission[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM hospital_admissions WHERE case_id = $1 ORDER BY admitted_at DESC', [caseId]);
      return res.rows.map(r => this.mapRowToAdmission(r));
    }
    return Array.from(this.inMemoryAdmissions.values())
      .filter(a => a.caseId === caseId)
      .sort((a, b) => new Date(b.admittedAt).getTime() - new Date(a.admittedAt).getTime());
  }

  async updateAdmission(id: string, updates: Partial<HospitalAdmission>): Promise<HospitalAdmission> {
    const existing = await this.getAdmissionById(id);
    if (!existing) throw new Error(`Hospital admission ${id} not found`);

    const updated = { ...existing, ...updates };
    if (this.isConnected && this.pool) {
      const query = `
        UPDATE hospital_admissions
        SET status = $2,
            discharged_at = $3,
            discharge_summary = $4,
            follow_up_instructions = $5,
            discharged_by = $6
        WHERE id = $1
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        id,
        updated.status,
        updated.dischargedAt || null,
        updated.dischargeSummary || null,
        updated.followUpInstructions || null,
        updated.dischargedBy || null
      ]);
      return this.mapRowToAdmission(res.rows[0]);
    }
    this.inMemoryAdmissions.set(id, updated);
    return updated;
  }

  async clear(): Promise<void> {
    this.inMemoryAssessments.clear();
    this.inMemoryPrescriptions.clear();
    this.inMemoryInventory.clear();
    this.inMemoryDiagnostics.clear();
    this.inMemoryAdmissions.clear();
  }

  private mapRowToAssessment(row: any): ClinicalAssessment {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      clinicianId: row.clinician_id,
      clinicianRole: row.clinician_role,
      facilityId: row.facility_id,
      chiefComplaint: row.chief_complaint,
      physicalFindings: typeof row.physical_findings === 'string' ? JSON.parse(row.physical_findings) : row.physical_findings,
      differentialDiagnosis: row.differential_diagnosis || [],
      finalDiagnosis: row.final_diagnosis,
      clinicalNotes: row.clinical_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToPrescription(row: any, itemRows: any[]): Prescription {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      assessmentId: row.assessment_id,
      clinicianId: row.clinician_id,
      clinicianRole: row.clinician_role,
      facilityId: row.facility_id,
      instructions: row.instructions,
      createdAt: row.created_at,
      items: itemRows.map(i => ({
        id: i.id,
        prescriptionId: i.prescription_id,
        medicineName: i.medicine_name,
        dosage: i.dosage,
        frequency: i.frequency,
        durationDays: i.duration_days,
        quantity: i.quantity,
        isDispensed: Boolean(i.is_dispensed),
        dispensedAt: i.dispensed_at,
        dispensedById: i.dispensed_by_id
      }))
    };
  }

  private mapRowToInventory(row: any): MedicineInventory {
    return {
      id: row.id,
      facilityId: row.facility_id,
      medicineName: row.medicine_name,
      stockCount: parseInt(row.stock_count, 10),
      stockStatus: row.stock_status,
      unit: row.unit,
      lastVerifiedAt: row.last_verified_at
    };
  }

  private mapRowToDiagnostic(row: any): DiagnosticOrder {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      clinicianId: row.clinician_id,
      facilityId: row.facility_id,
      testName: row.test_name,
      status: row.status,
      resultData: row.result_data ? (typeof row.result_data === 'string' ? JSON.parse(row.result_data) : row.result_data) : null,
      resultFileUrl: row.result_file_url,
      labTechId: row.lab_tech_id,
      reviewedByClinicianId: row.reviewed_by_clinician_id,
      orderedAt: row.ordered_at,
      sampleCollectedAt: row.sample_collected_at,
      completedAt: row.completed_at,
      reviewedAt: row.reviewed_at
    };
  }

  private mapRowToAdmission(row: any): HospitalAdmission {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      facilityId: row.facility_id,
      admittedBy: row.admitted_by,
      wardBed: row.ward_bed,
      status: row.status,
      admittedAt: row.admitted_at,
      dischargedAt: row.discharged_at,
      dischargeSummary: row.discharge_summary,
      followUpInstructions: row.follow_up_instructions,
      dischargedBy: row.discharged_by
    };
  }
}

export const db = new Database();
