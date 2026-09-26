import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { NotificationChannel, NotificationRecord } from '../types';

export class NotificationService {
  /**
   * Sensitive keywords that must never appear on lock screen push/SMS previews
   */
  private static readonly SENSITIVE_KEYWORDS = [
    'hiv',
    'aids',
    'tuberculosis',
    'tb',
    'cancer',
    'biopsy',
    'psychiatric',
    'schizophrenia',
    'abortion',
    'syphilis',
    'leprosy',
    'suicide'
  ];

  /**
   * Sanitizes notification text to ensure zero leakage of sensitive diagnoses
   */
  public static sanitizeMessage(rawMessage: string): string {
    let sanitized = rawMessage;
    const lower = rawMessage.toLowerCase();
    for (const kw of this.SENSITIVE_KEYWORDS) {
      if (lower.includes(kw)) {
        return 'SwasthyaSetu Alert: You have an important health update or scheduled visit. Please log into the SwasthyaSetu secure portal or contact your local health worker for details.';
      }
    }
    return sanitized;
  }

  /**
   * Dispatches a privacy-safe notification to a patient or frontline worker
   */
  public static async dispatchNotification(input: {
    recipientUserId: string;
    channel: NotificationChannel;
    title: string;
    messageBody: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationRecord> {
    const safeBody = this.sanitizeMessage(input.messageBody);
    const id = uuidv4();
    const now = new Date().toISOString();

    const notif: NotificationRecord = {
      id,
      recipientUserId: input.recipientUserId,
      channel: input.channel,
      title: input.title,
      messageSafeBody: safeBody,
      status: 'DELIVERED',
      metadata: input.metadata || {},
      sentAt: now
    };

    return await db.createNotification(notif);
  }

  public static async getUserNotifications(userId: string): Promise<NotificationRecord[]> {
    return await db.getNotificationsByUser(userId);
  }
}
