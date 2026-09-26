import crypto from 'crypto';
import { db } from '../db/database';
import { timelineService } from './timeline.service';
import { patientService } from './patient.service';
import { PatientCase, CaseStatus, PatientCaseDetails } from '../types';

export class CaseService {
  /**
   * Generates a unique Case Number (e.g. CASE-20260926-C4B1)
   */
  generateCaseNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `CASE-${dateStr}-${randomHex}`;
  }

  /**
   * Opens a new case with strict operator attribution (operatedBy vs patientId)
   */
  async openCase(data: {
    patientId: string;
    operatedBy?: string; // e.g. ASHA worker user ID
    actorRole?: string;
    chiefComplaintSummary?: string;
  }): Promise<PatientCase> {
    const patient = await patientService.getPatientById(data.patientId);
    if (!patient) {
      throw new Error(`Patient with ID '${data.patientId}' does not exist`);
    }

    const caseNumber = this.generateCaseNumber();
    const newCase = await db.createCase({
      caseNumber,
      patientId: data.patientId,
      operatedBy: data.operatedBy,
      chiefComplaintSummary: data.chiefComplaintSummary,
    });

    // Record initial timeline event
    await timelineService.recordEvent({
      caseId: newCase.id,
      eventType: 'CASE_CREATED',
      actorId: data.operatedBy || data.patientId,
      actorRole: data.actorRole || (data.operatedBy ? 'ASHA' : 'PATIENT'),
      eventData: {
        caseNumber,
        chiefComplaint: data.chiefComplaintSummary,
        mode: data.operatedBy ? 'ASSISTED' : 'DIRECT',
      },
    });

    return newCase;
  }

  async getCaseById(id: string): Promise<PatientCase | null> {
    return db.findCaseById(id);
  }

  async getCaseDetails(id: string): Promise<PatientCaseDetails | null> {
    const patientCase = await db.findCaseById(id);
    if (!patientCase) return null;

    const patient = await patientService.getPatientById(patientCase.patientId);
    if (!patient) return null;

    const timeline = await timelineService.getCaseTimeline(id);
    return {
      ...patientCase,
      patient,
      timeline,
    };
  }

  async listCasesByPatient(patientId: string): Promise<PatientCase[]> {
    return db.listCasesByPatientId(patientId);
  }

  async updateCaseStatus(
    id: string,
    updates: {
      status: CaseStatus;
      assignedPathway?: 'ROUTINE' | 'SAME_DAY' | 'EMERGENCY';
      primaryFacilityId?: string;
      outcome?: string;
      actorId: string;
      actorRole: string;
      eventReason?: string;
    }
  ): Promise<PatientCase | null> {
    const isClosing = updates.status === 'CLOSED' || updates.status === 'CANCELLED';
    const updated = await db.updateCaseStatus(id, {
      status: updates.status,
      assignedPathway: updates.assignedPathway,
      primaryFacilityId: updates.primaryFacilityId,
      outcome: updates.outcome,
      closedAt: isClosing ? new Date() : undefined,
    });

    if (updated) {
      await timelineService.recordEvent({
        caseId: id,
        eventType: isClosing ? 'CASE_CLOSED' : 'SAFETY_TRIAGED',
        actorId: updates.actorId,
        actorRole: updates.actorRole,
        eventData: {
          previousStatus: updated.status,
          newStatus: updates.status,
          pathway: updates.assignedPathway,
          outcome: updates.outcome,
          reason: updates.eventReason,
        },
      });
    }

    return updated;
  }
}

export const caseService = new CaseService();
