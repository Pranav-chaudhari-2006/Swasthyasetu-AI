import crypto from 'crypto';
import { db } from '../db/database';
import { Patient, CaregiverLink, Gender } from '../types';

export class PatientService {
  /**
   * Generates a unique, durable SwasthyaSetu Patient ID (e.g. SS-PAT-2026-A8F29)
   */
  generateDurablePatientCode(): string {
    const year = new Date().getFullYear();
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SS-PAT-${year}-${randomHex}`;
  }

  async registerPatient(data: {
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
    const durablePatientCode = this.generateDurablePatientCode();
    return db.createPatient({
      ...data,
      durablePatientCode,
    });
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return db.findPatientById(id);
  }

  async getPatientByCode(code: string): Promise<Patient | null> {
    return db.findPatientByCode(code);
  }

  async getPatientByUserId(userId: string): Promise<Patient | null> {
    return db.findPatientByUserId(userId);
  }

  async linkCaregiver(data: {
    patientId: string;
    caregiverUserId: string;
    relationshipType: string;
  }): Promise<CaregiverLink> {
    return db.linkCaregiver(data);
  }

  async getCaregivers(patientId: string): Promise<CaregiverLink[]> {
    return db.getCaregiversForPatient(patientId);
  }
}

export const patientService = new PatientService();
