import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { NotificationService } from './notificationService';
import {
  FollowUpTask,
  TaskType,
  TaskPriority,
  TaskStatus
} from '../types';

export class FollowUpService {
  /**
   * Create a new structured follow-up task
   */
  public static async createTask(input: {
    caseId: string;
    patientId: string;
    assignedAshaId?: string;
    dueDate: string; // YYYY-MM-DD
    taskType: TaskType;
    priority?: TaskPriority;
    instructions: string;
  }): Promise<FollowUpTask> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const task: FollowUpTask = {
      id,
      caseId: input.caseId,
      patientId: input.patientId,
      assignedAshaId: input.assignedAshaId || null,
      dueDate: input.dueDate,
      taskType: input.taskType,
      priority: input.priority || 'ROUTINE',
      instructions: input.instructions,
      status: 'PENDING',
      escalationLevel: 0,
      completedAt: null,
      completedBy: null,
      completionNotes: null,
      vitalsObserved: null,
      createdAt: now,
      updatedAt: now
    };

    const saved = await db.createTask(task);

    // Notify assigned ASHA worker if assigned
    if (saved.assignedAshaId) {
      await NotificationService.dispatchNotification({
        recipientUserId: saved.assignedAshaId,
        channel: 'IN_APP',
        title: 'New Follow-Up Visit Assigned',
        messageBody: `You have a new follow-up task due on ${saved.dueDate} for patient care continuity.`
      });
    }

    return saved;
  }

  /**
   * Complete follow-up task with home visit notes, vital signs, and worker attribution
   */
  public static async completeTask(
    taskId: string,
    completedBy: string,
    completionNotes: string,
    vitalsObserved?: Record<string, any>
  ): Promise<FollowUpTask> {
    const task = await db.getTaskById(taskId);
    if (!task) throw new Error(`Follow-up task ${taskId} not found`);

    if (task.status === 'COMPLETED') {
      return task; // Idempotent
    }

    const now = new Date().toISOString();
    return await db.updateTask(taskId, {
      status: 'COMPLETED',
      completedAt: now,
      completedBy,
      completionNotes,
      vitalsObserved: vitalsObserved || null
    });
  }

  /**
   * Deterministic Escalation Evaluation Engine
   * Evaluates overdue tasks, increments escalation levels, and triggers alerts
   */
  public static async evaluateEscalations(referenceDateStr?: string): Promise<{
    evaluatedCount: number;
    escalatedCount: number;
    tasksEscalated: FollowUpTask[];
  }> {
    const now = referenceDateStr ? new Date(referenceDateStr) : new Date();
    const todayStr = now.toISOString().split('T')[0];

    const pendingTasks = await db.getAllPendingTasks();
    const tasksEscalated: FollowUpTask[] = [];

    for (const task of pendingTasks) {
      const due = new Date(task.dueDate);
      const diffTime = now.getTime() - due.getTime();
      const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (daysOverdue > 0) {
        let newStatus: TaskStatus = 'OVERDUE';
        let newLevel = 1;

        // Level 3 / DHO Escalation: >= 7 days overdue OR critical overdue >= 2 days
        if (daysOverdue >= 7 || (task.priority === 'CRITICAL' && daysOverdue >= 2)) {
          newStatus = 'ESCALATED_DHO';
          newLevel = 3;
        } 
        // Level 2 / MO Escalation: >= 3 days overdue OR high priority overdue >= 1 day
        else if (daysOverdue >= 3 || (task.priority === 'HIGH' && daysOverdue >= 1)) {
          newStatus = 'OVERDUE';
          newLevel = 2;
        }

        if (newLevel > task.escalationLevel || task.status !== newStatus) {
          const updated = await db.updateTask(task.id, {
            status: newStatus,
            escalationLevel: newLevel
          });
          tasksEscalated.push(updated);

          // Trigger escalation alert notification
          if (task.assignedAshaId) {
            await NotificationService.dispatchNotification({
              recipientUserId: task.assignedAshaId,
              channel: 'SMS',
              title: 'URGENT: Overdue Follow-Up Escalation',
              messageBody: `SwasthyaSetu Alert: Follow-up visit due on ${task.dueDate} is now overdue (Escalation Level ${newLevel}). Please perform visit immediately.`
            });
          }
        }
      }
    }

    return {
      evaluatedCount: pendingTasks.length,
      escalatedCount: tasksEscalated.length,
      tasksEscalated
    };
  }

  public static async getTaskDetails(id: string): Promise<FollowUpTask | null> {
    return await db.getTaskById(id);
  }

  public static async getFrontlineQueue(workerId: string): Promise<FollowUpTask[]> {
    return await db.getTasksByWorker(workerId);
  }

  public static async getPatientTasks(patientId: string): Promise<FollowUpTask[]> {
    return await db.getTasksByPatient(patientId);
  }
}
