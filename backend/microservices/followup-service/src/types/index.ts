import { z } from 'zod';

export type TaskType = 
  | 'HOME_VISIT'
  | 'MEDICATION_ADHERENCE'
  | 'SUTURE_REMOVAL'
  | 'VACCINATION'
  | 'TELE_CONSULT'
  | 'GENERAL_REASSESSMENT';

export type TaskPriority = 'ROUTINE' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'ESCALATED_DHO'
  | 'CANCELLED';

export type NotificationChannel = 'IN_APP' | 'SMS' | 'WEBPUSH';

export interface FollowUpTask {
  id: string;
  caseId: string;
  patientId: string;
  assignedAshaId?: string | null;
  dueDate: string; // YYYY-MM-DD
  taskType: TaskType;
  priority: TaskPriority;
  instructions: string;
  status: TaskStatus;
  escalationLevel: number;
  completedAt?: string | null;
  completedBy?: string | null;
  completionNotes?: string | null;
  vitalsObserved?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  recipientUserId: string;
  channel: NotificationChannel;
  title: string;
  messageSafeBody: string;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'READ';
  metadata?: Record<string, any>;
  sentAt: string;
}

// Zod Validation Schemas
export const CreateFollowUpTaskSchema = z.object({
  caseId: z.string().uuid(),
  patientId: z.string().uuid(),
  assignedAshaId: z.string().uuid().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be formatted YYYY-MM-DD'),
  taskType: z.enum([
    'HOME_VISIT',
    'MEDICATION_ADHERENCE',
    'SUTURE_REMOVAL',
    'VACCINATION',
    'TELE_CONSULT',
    'GENERAL_REASSESSMENT'
  ]),
  priority: z.enum(['ROUTINE', 'HIGH', 'CRITICAL']).default('ROUTINE'),
  instructions: z.string().min(3)
});

export const CompleteFollowUpTaskSchema = z.object({
  completedBy: z.string().uuid(),
  completedByRole: z.string().min(1),
  completionNotes: z.string().min(5, 'Completion notes must be at least 5 characters'),
  vitalsObserved: z.record(z.any()).optional()
});

export const DispatchNotificationSchema = z.object({
  recipientUserId: z.string().uuid(),
  channel: z.enum(['IN_APP', 'SMS', 'WEBPUSH']),
  title: z.string().min(2),
  messageSafeBody: z.string().min(5),
  metadata: z.record(z.any()).optional()
});
