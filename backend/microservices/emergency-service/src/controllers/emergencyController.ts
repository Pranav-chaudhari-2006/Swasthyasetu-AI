import { Request, Response } from 'express';
import { EmergencyService } from '../services/emergencyService';
import {
  DispatchEmergencySchema,
  UpdateEmergencyStatusSchema,
  EmergencyTelemetrySchema,
  RedirectEmergencySchema,
  CompleteHandoffSchema
} from '../types';

export class EmergencyController {
  public static async dispatch(req: Request, res: Response): Promise<void> {
    try {
      const validated = DispatchEmergencySchema.parse(req.body);
      const event = await EmergencyService.dispatchEmergency(validated);
      res.status(201).json({ success: true, data: event });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const details = await EmergencyService.getEventDetails(id);
      if (!details) {
        res.status(404).json({ success: false, error: 'Emergency event not found' });
        return;
      }
      res.status(200).json({ success: true, data: details });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getByCaseId(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const event = await EmergencyService.getCaseEmergency(caseId);
      if (!event) {
        res.status(404).json({ success: false, error: 'No emergency event associated with this case' });
        return;
      }
      res.status(200).json({ success: true, data: event });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getFacilityActive(req: Request, res: Response): Promise<void> {
    try {
      const { facilityId } = req.params;
      const events = await EmergencyService.getFacilityActiveEmergencies(facilityId);
      res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = UpdateEmergencyStatusSchema.parse(req.body);
      const updated = await EmergencyService.updateStatus(
        id,
        validated.status,
        validated.actorId,
        validated.actorRole,
        {
          estimatedArrivalMinutes: validated.estimatedArrivalMinutes,
          notes: validated.notes
        }
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async addTelemetry(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = EmergencyTelemetrySchema.parse(req.body);
      const updated = await EmergencyService.recordTelemetry(id, validated);
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async redirect(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = RedirectEmergencySchema.parse(req.body);
      const updated = await EmergencyService.redirectEmergency(
        id,
        validated.newFacilityId,
        validated.actorId,
        validated.actorRole,
        validated.reason
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async completeHandoff(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = CompleteHandoffSchema.parse(req.body);
      const updated = await EmergencyService.completeHandoff(
        id,
        validated.receivingPhysicianId,
        validated.handoffNotes,
        validated.vitalsOnArrival
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
