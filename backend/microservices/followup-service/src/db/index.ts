import { Pool } from 'pg';
import { config } from '../config';
import { FollowUpTask, NotificationRecord, TaskStatus } from '../types';

export class Database {
  private pool: Pool | null = null;
  private isConnected = false;

  // In-memory persistent stores
  private inMemoryTasks: Map<string, FollowUpTask> = new Map();
  private inMemoryNotifications: NotificationRecord[] = [];

  constructor() {
    if (process.env.NODE_ENV !== 'test' || process.env.DB_HOST) {
      try {
        this.pool = new Pool({
          host: config.database.host,
          port: config.database.port,
          user: config.database.user,
          password: config.database.password,
          database: config.database.database,
          connectionTimeoutMillis: 2000,
        });
      } catch (err) {
        this.pool = null;
      }
    }
  }

  async init(): Promise<void> {
    if (!this.pool) {
      this.isConnected = false;
      return;
    }
    try {
      const client = await this.pool.connect();
      this.isConnected = true;
      client.release();
    } catch (err) {
      this.isConnected = false;
    }
  }

  async createTask(task: FollowUpTask): Promise<FollowUpTask> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO followup_tasks (
          id, case_id, patient_id, assigned_asha_id, due_date,
          task_type, priority, instructions, status, escalation_level,
          completed_at, completed_by, completion_notes, vitals_observed,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        task.id,
        task.caseId,
        task.patientId,
        task.assignedAshaId || null,
        task.dueDate,
        task.taskType,
        task.priority,
        task.instructions,
        task.status,
        task.escalationLevel,
        task.completedAt || null,
        task.completedBy || null,
        task.completionNotes || null,
        task.vitalsObserved ? JSON.stringify(task.vitalsObserved) : null,
        task.createdAt,
        task.updatedAt
      ]);
      return this.mapRowToTask(res.rows[0]);
    }

    this.inMemoryTasks.set(task.id, { ...task });
    return task;
  }

  async getTaskById(id: string): Promise<FollowUpTask | null> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query('SELECT * FROM followup_tasks WHERE id = $1', [id]);
      if (res.rows.length === 0) return null;
      return this.mapRowToTask(res.rows[0]);
    }
    const found = this.inMemoryTasks.get(id);
    return found ? { ...found } : null;
  }

  async getTasksByWorker(workerId: string): Promise<FollowUpTask[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM followup_tasks WHERE assigned_asha_id = $1 ORDER BY due_date ASC',
        [workerId]
      );
      return res.rows.map(r => this.mapRowToTask(r));
    }
    return Array.from(this.inMemoryTasks.values())
      .filter(t => t.assignedAshaId === workerId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getTasksByPatient(patientId: string): Promise<FollowUpTask[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM followup_tasks WHERE patient_id = $1 ORDER BY due_date ASC',
        [patientId]
      );
      return res.rows.map(r => this.mapRowToTask(r));
    }
    return Array.from(this.inMemoryTasks.values())
      .filter(t => t.patientId === patientId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async getAllPendingTasks(): Promise<FollowUpTask[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        "SELECT * FROM followup_tasks WHERE status IN ('PENDING', 'IN_PROGRESS', 'OVERDUE')"
      );
      return res.rows.map(r => this.mapRowToTask(r));
    }
    return Array.from(this.inMemoryTasks.values())
      .filter(t => ['PENDING', 'IN_PROGRESS', 'OVERDUE'].includes(t.status));
  }

  async updateTask(id: string, updates: Partial<FollowUpTask>): Promise<FollowUpTask> {
    const existing = await this.getTaskById(id);
    if (!existing) throw new Error(`Follow-up task ${id} not found`);

    const now = new Date().toISOString();
    const updated: FollowUpTask = { ...existing, ...updates, updatedAt: now };

    if (this.isConnected && this.pool) {
      const query = `
        UPDATE followup_tasks
        SET status = $2,
            escalation_level = $3,
            completed_at = $4,
            completed_by = $5,
            completion_notes = $6,
            vitals_observed = $7,
            updated_at = $8
        WHERE id = $1
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        id,
        updated.status,
        updated.escalationLevel,
        updated.completedAt || null,
        updated.completedBy || null,
        updated.completionNotes || null,
        updated.vitalsObserved ? JSON.stringify(updated.vitalsObserved) : null,
        updated.updatedAt
      ]);
      return this.mapRowToTask(res.rows[0]);
    }

    this.inMemoryTasks.set(id, updated);
    return updated;
  }

  // Notifications
  async createNotification(notif: NotificationRecord): Promise<NotificationRecord> {
    if (this.isConnected && this.pool) {
      const query = `
        INSERT INTO notifications (id, recipient_user_id, channel, title, message_safe_body, status, metadata, sent_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const res = await this.pool.query(query, [
        notif.id,
        notif.recipientUserId,
        notif.channel,
        notif.title,
        notif.messageSafeBody,
        notif.status,
        JSON.stringify(notif.metadata || {}),
        notif.sentAt
      ]);
      return this.mapRowToNotification(res.rows[0]);
    }

    this.inMemoryNotifications.push({ ...notif });
    return notif;
  }

  async getNotificationsByUser(userId: string): Promise<NotificationRecord[]> {
    if (this.isConnected && this.pool) {
      const res = await this.pool.query(
        'SELECT * FROM notifications WHERE recipient_user_id = $1 ORDER BY sent_at DESC',
        [userId]
      );
      return res.rows.map(r => this.mapRowToNotification(r));
    }
    return this.inMemoryNotifications
      .filter(n => n.recipientUserId === userId)
      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  async clear(): Promise<void> {
    this.inMemoryTasks.clear();
    this.inMemoryNotifications = [];
  }

  private mapRowToTask(row: any): FollowUpTask {
    return {
      id: row.id,
      caseId: row.case_id,
      patientId: row.patient_id,
      assignedAshaId: row.assigned_asha_id,
      dueDate: typeof row.due_date === 'string' ? row.due_date.split('T')[0] : row.due_date.toISOString().split('T')[0],
      taskType: row.task_type,
      priority: row.priority,
      instructions: row.instructions,
      status: row.status,
      escalationLevel: parseInt(row.escalation_level, 10),
      completedAt: row.completed_at,
      completedBy: row.completed_by,
      completionNotes: row.completion_notes,
      vitalsObserved: row.vitals_observed ? (typeof row.vitals_observed === 'string' ? JSON.parse(row.vitals_observed) : row.vitals_observed) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapRowToNotification(row: any): NotificationRecord {
    return {
      id: row.id,
      recipientUserId: row.recipient_user_id,
      channel: row.channel,
      title: row.title,
      messageSafeBody: row.message_safe_body,
      status: row.status,
      metadata: row.metadata ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata) : {},
      sentAt: row.sent_at
    };
  }
}

export const db = new Database();
