import { Request, Response } from 'express';
import { SyncService } from '../services/syncService';
import { BatchSyncRequestSchema } from '../types';

export class SyncController {
  public static async processBatch(req: Request, res: Response): Promise<void> {
    try {
      const validated = BatchSyncRequestSchema.parse(req.body);
      const result = await SyncService.processBatch(validated.deviceId, validated.operations);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getOfflineRules(req: Request, res: Response): Promise<void> {
    try {
      const pkg = await SyncService.getLatestRulesPackage();
      if (!pkg) {
        res.status(404).json({ success: false, error: 'No active offline rule package found' });
        return;
      }
      res.status(200).json({ success: true, data: pkg });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getDeviceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId } = req.params;
      const state = await SyncService.getDeviceStatus(deviceId);
      if (!state) {
        res.status(200).json({ success: true, data: { deviceId, lastSyncedSequence: 0, lastSyncedAt: null } });
        return;
      }
      res.status(200).json({ success: true, data: state });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getAuditTrail(req: Request, res: Response): Promise<void> {
    try {
      const { deviceId, actorId } = req.query;
      const trail = await SyncService.getAuditTrail({
        deviceId: deviceId as string,
        actorId: actorId as string
      });
      res.status(200).json({ success: true, count: trail.length, data: trail });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
