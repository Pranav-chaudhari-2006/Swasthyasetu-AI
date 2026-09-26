import { Request, Response } from 'express';
import { z } from 'zod';
import { patientService } from '../services/patient.service';
import { Gender } from '../types';

const createPatientSchema = z.object({
  primaryUserId: z.string().optional(),
  fullName: z.string().min(2),
  dateOfBirth: z.string().optional(),
  age: z.number().int().positive().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
  address: z.string().optional(),
  district: z.string().min(2),
  state: z.string().min(2),
  preferredLanguage: z.string().default('hi'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  abhaId: z.string().optional(),
});

const linkCaregiverSchema = z.object({
  caregiverUserId: z.string().min(1),
  relationshipType: z.string().min(2),
});

export class PatientController {
  async registerPatient(req: Request, res: Response): Promise<void> {
    const parse = createPatientSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const patient = await patientService.registerPatient({
        ...parse.data,
        gender: parse.data.gender as Gender,
      });
      res.status(201).json({ success: true, patient });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getPatient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const patient = await patientService.getPatientById(id);
      if (!patient) {
        res.status(404).json({ error: 'PATIENT_NOT_FOUND' });
        return;
      }
      res.status(200).json({ success: true, patient });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getPatientByCode(req: Request, res: Response): Promise<void> {
    const { code } = req.params;
    try {
      const patient = await patientService.getPatientByCode(code);
      if (!patient) {
        res.status(404).json({ error: 'PATIENT_NOT_FOUND' });
        return;
      }
      res.status(200).json({ success: true, patient });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async linkCaregiver(req: Request, res: Response): Promise<void> {
    const { id: patientId } = req.params;
    const parse = linkCaregiverSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const link = await patientService.linkCaregiver({
        patientId,
        ...parse.data,
      });
      res.status(201).json({ success: true, link });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getCaregivers(req: Request, res: Response): Promise<void> {
    const { id: patientId } = req.params;
    try {
      const caregivers = await patientService.getCaregivers(patientId);
      res.status(200).json({ success: true, count: caregivers.length, caregivers });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

export const patientController = new PatientController();
