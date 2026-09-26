import { Request, Response } from 'express';
import { z } from 'zod';
import { safetyEngineService } from '../services/safety-engine.service';

const evaluateTriageSchema = z.object({
  caseId: z.string().min(1),
  patientId: z.string().min(1),
  chiefSymptoms: z.array(
    z.object({
      symptomName: z.string().min(1),
      onsetDuration: z.string().min(1),
      severityScore: z.number().min(1).max(10),
      bodySite: z.string().optional(),
    })
  ),
  reportedRedFlags: z.array(z.string()).default([]),
  existingMedicalConditions: z.array(z.string()).optional(),
  vitalSigns: z
    .object({
      systolicBP: z.number().optional(),
      diastolicBP: z.number().optional(),
      pulseRate: z.number().optional(),
      temperatureF: z.number().optional(),
      spo2Percentage: z.number().optional(),
    })
    .optional(),
  patientAge: z.number().optional(),
  patientGender: z.string().optional(),
});

export class SafetyController {
  async evaluateTriage(req: Request, res: Response): Promise<void> {
    const parse = evaluateTriageSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const assessment = await safetyEngineService.evaluateTriage(parse.data);
      res.status(200).json({
        success: true,
        assessment,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getCaseAssessment(req: Request, res: Response): Promise<void> {
    const { caseId } = req.params;
    try {
      const assessment = await safetyEngineService.getAssessmentByCaseId(caseId);
      if (!assessment) {
        res.status(404).json({ error: 'ASSESSMENT_NOT_FOUND' });
        return;
      }
      res.status(200).json({ success: true, assessment });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getRulesInfo(req: Request, res: Response): Promise<void> {
    const info = safetyEngineService.getActiveRuleSetInfo();
    res.status(200).json({ success: true, ruleSet: info });
  }
}

export const safetyController = new SafetyController();
