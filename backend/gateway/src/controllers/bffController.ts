import { Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config';

export class BFFController {
  /**
   * Helper to execute resilient downstream requests with timeout and error fallback
   */
  private static async safeGet<T>(url: string, headers: any, fallback: T): Promise<T> {
    try {
      const res = await axios.get(url, { headers, timeout: 3000 });
      return res.data?.data !== undefined ? res.data.data : res.data;
    } catch (err) {
      return fallback;
    }
  }

  /**
   * Patient PWA unified dashboard aggregator
   */
  public static async getPatientDashboard(req: Request, res: Response): Promise<void> {
    const { patientId } = req.params;
    const forwardHeaders = {
      'x-correlation-id': req.headers['x-correlation-id'],
      authorization: req.headers['authorization']
    };

    try {
      const [patient, cases, referrals, followups] = await Promise.all([
        BFFController.safeGet(`${config.services.patientCase}/api/v1/patients/${patientId}`, forwardHeaders, null),
        BFFController.safeGet(`${config.services.patientCase}/api/v1/patients/${patientId}/cases`, forwardHeaders, []),
        BFFController.safeGet(`${config.services.referral}/api/v1/referrals/patient/${patientId}`, forwardHeaders, []),
        BFFController.safeGet(`${config.services.followup}/api/v1/followup/patient/${patientId}`, forwardHeaders, [])
      ]);

      res.status(200).json({
        success: true,
        data: {
          patientId,
          profile: patient,
          cases,
          activeReferrals: referrals,
          scheduledFollowUps: followups,
          aggregatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Frontline ASHA Portal unified dashboard aggregator
   */
  public static async getFrontlineDashboard(req: Request, res: Response): Promise<void> {
    const { workerId } = req.params;
    const forwardHeaders = {
      'x-correlation-id': req.headers['x-correlation-id'],
      authorization: req.headers['authorization']
    };

    try {
      const [assignedTasks, syncState] = await Promise.all([
        BFFController.safeGet(`${config.services.followup}/api/v1/followup/frontline/${workerId}`, forwardHeaders, []),
        BFFController.safeGet(`${config.services.sync}/api/v1/sync/device/${workerId}/status`, forwardHeaders, null)
      ]);

      res.status(200).json({
        success: true,
        data: {
          workerId,
          pendingTasksCount: Array.isArray(assignedTasks) ? assignedTasks.length : 0,
          assignedTasks,
          syncStatus: syncState,
          aggregatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Facility / Hospital Command Dashboard aggregator
   */
  public static async getFacilityDashboard(req: Request, res: Response): Promise<void> {
    const { facilityId } = req.params;
    const forwardHeaders = {
      'x-correlation-id': req.headers['x-correlation-id'],
      authorization: req.headers['authorization']
    };

    try {
      const [facility, referralInbox, activeEmergencies, inventory] = await Promise.all([
        BFFController.safeGet(`${config.services.facility}/api/v1/facilities/${facilityId}`, forwardHeaders, null),
        BFFController.safeGet(`${config.services.referral}/api/v1/referrals/facility/${facilityId}/inbox`, forwardHeaders, []),
        BFFController.safeGet(`${config.services.emergency}/api/v1/emergency/facility/${facilityId}/active`, forwardHeaders, []),
        BFFController.safeGet(`${config.services.clinical}/api/v1/clinical/inventory/facility/${facilityId}`, forwardHeaders, [])
      ]);

      res.status(200).json({
        success: true,
        data: {
          facilityId,
          facility,
          referralInbox,
          activeEmergencies,
          inventoryStatus: inventory,
          aggregatedAt: new Date().toISOString()
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
