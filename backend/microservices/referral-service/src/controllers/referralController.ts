import { Request, Response } from 'express';
import { ReferralService } from '../services/referralService';
import {
  CreateReferralSchema,
  AcceptReferralSchema,
  DeclineReferralSchema,
  EnRouteReferralSchema,
  VerifyArrivalSchema,
  CloseReferralSchema
} from '../types';

export class ReferralController {
  public static async create(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateReferralSchema.parse(req.body);
      const result = await ReferralService.createReferral(validated);
      res.status(201).json({
        success: true,
        data: result.referral,
        qrCodeUrl: result.qrDataUrl,
        qrToken: result.qrToken
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const details = await ReferralService.getReferralDetails(id);
      if (!details) {
        res.status(404).json({ success: false, error: 'Referral not found' });
        return;
      }
      res.status(200).json({ success: true, data: details });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getInbox(req: Request, res: Response): Promise<void> {
    try {
      const { facilityId } = req.params;
      const { state, pathway } = req.query;
      const inbox = await ReferralService.getFacilityInbox(
        facilityId,
        {
          state: state as any,
          pathway: pathway as any
        }
      );
      res.status(200).json({ success: true, count: inbox.length, data: inbox });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getPatientReferrals(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const referrals = await ReferralService.getPatientReferrals(patientId);
      res.status(200).json({ success: true, count: referrals.length, data: referrals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getCaseReferrals(req: Request, res: Response): Promise<void> {
    try {
      const { caseId } = req.params;
      const referrals = await ReferralService.getCaseReferrals(caseId);
      res.status(200).json({ success: true, count: referrals.length, data: referrals });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async accept(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = AcceptReferralSchema.parse(req.body);
      const updated = await ReferralService.acceptReferral(
        id,
        validated.staffId,
        validated.staffRole,
        validated.facilityId,
        validated.notes
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async decline(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = DeclineReferralSchema.parse(req.body);
      const updated = await ReferralService.declineReferral(
        id,
        validated.staffId,
        validated.staffRole,
        validated.facilityId,
        validated.reason,
        validated.alternativeFacilitySuggestions
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async markEnRoute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = EnRouteReferralSchema.parse(req.body);
      const updated = await ReferralService.markEnRoute(
        id,
        validated.actorId,
        validated.actorRole,
        {
          transportMode: validated.transportMode,
          estimatedArrivalMinutes: validated.estimatedArrivalMinutes,
          driverContact: validated.driverContact,
          vehicleNumber: validated.vehicleNumber
        }
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async verifyArrival(req: Request, res: Response): Promise<void> {
    try {
      const validated = VerifyArrivalSchema.parse(req.body);
      const result = await ReferralService.verifyArrival(
        validated.qrToken,
        validated.scannerFacilityId,
        validated.scannerStaffId,
        validated.scannerStaffRole,
        validated.triageNotes
      );
      res.status(200).json({
        success: true,
        arrivalConfirmed: result.arrivalConfirmed,
        data: result.referral
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async updateOutcome(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { targetState, staffId, staffRole, facilityId, outcome, dischargeSummary, notes } = req.body;
      if (!['TREATED', 'ADMITTED', 'DISCHARGED', 'CLOSED'].includes(targetState)) {
        res.status(400).json({ success: false, error: `Invalid target state: ${targetState}` });
        return;
      }
      const updated = await ReferralService.updateOutcome(
        id,
        targetState,
        staffId,
        staffRole || 'CLINICIAN',
        facilityId,
        { outcome, dischargeSummary, notes }
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async reroute(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newDestinationFacilityId, actorId, actorRole, reason } = req.body;
      if (!newDestinationFacilityId || !actorId || !reason) {
        res.status(400).json({ success: false, error: 'newDestinationFacilityId, actorId, and reason are required' });
        return;
      }
      const result = await ReferralService.rerouteReferral(
        id,
        newDestinationFacilityId,
        actorId,
        actorRole || 'SYSTEM_ROUTER',
        reason
      );
      res.status(200).json({
        success: true,
        data: result.referral,
        qrCodeUrl: result.qrDataUrl,
        qrToken: result.qrToken
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
