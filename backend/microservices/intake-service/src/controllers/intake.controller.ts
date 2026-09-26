import { Request, Response } from 'express';
import { z } from 'zod';
import { intakeService } from '../services/intake.service';
import { MessageSenderType } from '../types';

const startSessionSchema = z.object({
  caseId: z.string().min(1),
  patientId: z.string().min(1),
  operatedBy: z.string().optional(),
  languageCode: z.string().default('hi'),
});

const processMessageSchema = z.object({
  senderType: z.enum(['PATIENT', 'ASHA', 'SYSTEM_AI', 'CLINICIAN']).default('PATIENT'),
  rawText: z.string().optional(),
  audioBase64: z.string().optional(),
  languageCode: z.string().optional(),
}).refine((data) => data.rawText || data.audioBase64, {
  message: 'Either rawText or audioBase64 must be provided',
});

export class IntakeController {
  async startSession(req: Request, res: Response): Promise<void> {
    const parse = startSessionSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const session = await intakeService.startSession(parse.data);
      res.status(201).json({ success: true, session });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async processMessage(req: Request, res: Response): Promise<void> {
    const { id: sessionId } = req.params;
    const parse = processMessageSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const result = await intakeService.processMessage({
        sessionId,
        senderType: parse.data.senderType as MessageSenderType,
        rawText: parse.data.rawText,
        audioBase64: parse.data.audioBase64,
        languageCode: parse.data.languageCode,
      });

      res.status(200).json({
        success: true,
        message: result.message,
        facts: result.facts,
        clarifications: result.clarifications,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getStructuredFacts(req: Request, res: Response): Promise<void> {
    const { id: sessionId } = req.params;
    try {
      const facts = await intakeService.getStructuredFacts(sessionId);
      if (!facts) {
        res.status(404).json({ error: 'FACTS_NOT_FOUND' });
        return;
      }
      res.status(200).json({ success: true, facts });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getSessionMessages(req: Request, res: Response): Promise<void> {
    const { id: sessionId } = req.params;
    try {
      const messages = await intakeService.getSessionMessages(sessionId);
      res.status(200).json({ success: true, count: messages.length, messages });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

export const intakeController = new IntakeController();
