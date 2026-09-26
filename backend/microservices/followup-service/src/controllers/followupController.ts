import { Request, Response } from 'express';
import { FollowUpService } from '../services/followupService';
import { NotificationService } from '../services/notificationService';
import {
  CreateFollowUpTaskSchema,
  CompleteFollowUpTaskSchema,
  DispatchNotificationSchema
} from '../types';

export class FollowUpController {
  // Tasks
  public static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const validated = CreateFollowUpTaskSchema.parse(req.body);
      const task = await FollowUpService.createTask(validated);
      res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const task = await FollowUpService.getTaskDetails(id);
      if (!task) {
        res.status(404).json({ success: false, error: 'Follow-up task not found' });
        return;
      }
      res.status(200).json({ success: true, data: task });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getFrontlineQueue(req: Request, res: Response): Promise<void> {
    try {
      const { workerId } = req.params;
      const tasks = await FollowUpService.getFrontlineQueue(workerId);
      res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getPatientTasks(req: Request, res: Response): Promise<void> {
    try {
      const { patientId } = req.params;
      const tasks = await FollowUpService.getPatientTasks(patientId);
      res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async completeTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validated = CompleteFollowUpTaskSchema.parse(req.body);
      const updated = await FollowUpService.completeTask(
        id,
        validated.completedBy,
        validated.completionNotes,
        validated.vitalsObserved
      );
      res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async triggerEscalations(req: Request, res: Response): Promise<void> {
    try {
      const { referenceDate } = req.body;
      const result = await FollowUpService.evaluateEscalations(referenceDate);
      res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Notifications
  public static async dispatchNotification(req: Request, res: Response): Promise<void> {
    try {
      const validated = DispatchNotificationSchema.parse(req.body);
      const record = await NotificationService.dispatchNotification({
        recipientUserId: validated.recipientUserId,
        channel: validated.channel,
        title: validated.title,
        messageBody: validated.messageSafeBody,
        metadata: validated.metadata
      });
      res.status(201).json({ success: true, data: record });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const notifs = await NotificationService.getUserNotifications(userId);
      res.status(200).json({ success: true, count: notifs.length, data: notifs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
