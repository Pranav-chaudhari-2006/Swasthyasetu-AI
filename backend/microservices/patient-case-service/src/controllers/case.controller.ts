import { Request, Response } from 'express';
import { z } from 'zod';
import { caseService } from '../services/case.service';
import { timelineService } from '../services/timeline.service';
import { CaseStatus, TimelineEventType } from '../types';

const openCaseSchema = z.object({
  patientId: z.string().uuid(),
  operatedBy: z.string().optional(),
  actorRole: z.string().optional(),
  chiefComplaintSummary: z.string().min(3),
});

const updateCaseStatusSchema = z.object({
  status: z.enum([
    'CREATED',
    'INTAKE_IN_PROGRESS',
    'TRIAGED',
    'ROUTED',
    'REFERRAL_ISSUED',
    'EN_ROUTE',
    'ARRIVED',
    'UNDER_CARE',
    'DISCHARGED',
    'CLOSED',
    'CANCELLED',
  ]),
  assignedPathway: z.enum(['ROUTINE', 'SAME_DAY', 'EMERGENCY']).optional(),
  primaryFacilityId: z.string().optional(),
  outcome: z.string().optional(),
  actorId: z.string().min(1),
  actorRole: z.string().min(1),
  eventReason: z.string().optional(),
});

const appendTimelineEventSchema = z.object({
  eventType: z.string().min(2),
  actorId: z.string().min(1),
  actorRole: z.string().min(1),
  facilityId: z.string().optional(),
  eventData: z.record(z.unknown()).optional(),
});

export class CaseController {
  async openCase(req: Request, res: Response): Promise<void> {
    const parse = openCaseSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const newCase = await caseService.openCase(parse.data);
      res.status(201).json({ success: true, case: newCase });
    } catch (err: any) {
      res.status(400).json({ error: 'CASE_CREATION_FAILED', message: err.message });
    }
  }

  async getCase(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const caseDetails = await caseService.getCaseDetails(id);
      if (!caseDetails) {
        res.status(404).json({ error: 'CASE_NOT_FOUND' });
        return;
      }
      res.status(200).json({ success: true, case: caseDetails });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async listPatientCases(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    try {
      const cases = await caseService.listCasesByPatient(patientId);
      res.status(200).json({ success: true, count: cases.length, cases });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async updateCaseStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const parse = updateCaseStatusSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const updated = await caseService.updateCaseStatus(id, {
        ...parse.data,
        status: parse.data.status as CaseStatus,
      });

      if (!updated) {
        res.status(404).json({ error: 'CASE_NOT_FOUND' });
        return;
      }

      res.status(200).json({ success: true, case: updated });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getTimeline(req: Request, res: Response): Promise<void> {
    const { id: caseId } = req.params;
    try {
      const timeline = await timelineService.getCaseTimeline(caseId);
      res.status(200).json({ success: true, count: timeline.length, timeline });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async appendTimelineEvent(req: Request, res: Response): Promise<void> {
    const { id: caseId } = req.params;
    const parse = appendTimelineEventSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const event = await timelineService.recordEvent({
        caseId,
        eventType: parse.data.eventType as TimelineEventType,
        actorId: parse.data.actorId,
        actorRole: parse.data.actorRole,
        facilityId: parse.data.facilityId,
        eventData: parse.data.eventData,
      });
      res.status(201).json({ success: true, event });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

export const caseController = new CaseController();
