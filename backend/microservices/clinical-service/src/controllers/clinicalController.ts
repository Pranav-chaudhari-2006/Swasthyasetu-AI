import { Request, Response } from 'express';
import { ClinicalService } from '../services/clinicalService';
import {
  CreateAssessmentSchema,
  CreatePrescriptionSchema,
  UpdateInventorySchema,
  DispenseMedicinesSchema,
  CreateDiagnosticOrderSchema,
  AttachDiagnosticResultSchema,
  ReviewDiagnosticOrderSchema,
  AdmitPatientSchema,
  DischargePatientSchema
} from '../types';

export class ClinicalController {
  // Assessments
  public static async createAssessment(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateAssessmentSchema.parse(req.body);
      const assessment = await ClinicalService.createAssessment(validated);
      res.status(201).json({ success: true, data: assessment });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async getAssessmentsByCase(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const assessments = await ClinicalService.getAssessmentsByCase(caseId);
      res.status(200).json({ success: true, count: assessments.length, data: assessments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Prescriptions
  public static async createPrescription(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreatePrescriptionSchema.parse(req.body);
      const prescription = await ClinicalService.createPrescription(validated);
      res.status(201).json({ success: true, data: prescription });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async getPrescriptionsByCase(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const prescriptions = await ClinicalService.getPrescriptionsByCase(caseId);
      res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Inventory & Dispensing
  public static async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      const validated = UpdateInventorySchema.parse(req.body);
      const inv = await ClinicalService.updateInventory(validated);
      res.status(200).json({ success: true, data: inv });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getFacilityInventory(req: Request, res: Response): Promise<void> {
    try {
      const { facilityId } = req.params;
      const inv = await ClinicalService.getFacilityInventory(facilityId);
      res.status(200).json({ success: true, count: inv.length, data: inv });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async dispense(req: Request, res: Response): Promise<void> {
    try {
      const validated = DispenseMedicinesSchema.parse(req.body);
      const result = await ClinicalService.dispensePrescription(validated);
      res.status(200).json({
        success: result.success,
        warnings: result.warnings,
        data: result.updatedPrescription
      });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  // Diagnostics
  public static async createDiagnosticOrder(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateDiagnosticOrderSchema.parse(req.body);
      const order = await ClinicalService.createDiagnosticOrder(validated);
      res.status(201).json({ success: true, data: order });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async attachDiagnosticResult(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = AttachDiagnosticResultSchema.parse(req.body);
      const updated = await ClinicalService.attachDiagnosticResult(
        id,
        validated.labTechId,
        validated.labTechRole,
        validated.resultData,
        validated.resultFileUrl
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async reviewDiagnosticOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = ReviewDiagnosticOrderSchema.parse(req.body);
      const updated = await ClinicalService.reviewDiagnosticOrder(
        id,
        validated.clinicianId,
        validated.clinicianRole
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async getDiagnosticsByCase(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const orders = await ClinicalService.getDiagnosticsByCase(caseId);
      res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Admissions
  public static async admitPatient(req: Request, res: Response): Promise<void> {
    try {
      const validated = AdmitPatientSchema.parse(req.body);
      const admission = await ClinicalService.admitPatient(validated);
      res.status(201).json({ success: true, data: admission });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async dischargePatient(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = DischargePatientSchema.parse(req.body);
      const updated = await ClinicalService.dischargePatient(
        id,
        validated.dischargedBy,
        validated.clinicianRole,
        validated.dischargeSummary,
        validated.followUpInstructions
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      const status = err.message.includes('Unauthorized') ? 403 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  }

  public static async getAdmissionsByCase(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const admissions = await ClinicalService.getAdmissionsByCase(caseId);
      res.status(200).json({ success: true, count: admissions.length, data: admissions });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
