import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { db } from '../db';
import { NotificationService } from '../services/notificationService';

const app = createApp();

describe('MS-9: Follow-Up & Notification Service Test Suite', () => {
  const caseId = uuidv4();
  const patientId = uuidv4();
  const ashaId = uuidv4();
  const dhoId = uuidv4();

  beforeAll(async () => {
    await db.init();
  });

  beforeEach(async () => {
    await db.clear();
  });

  describe('1. Task Creation & Frontline Assignment Queue', () => {
    it('should create follow-up task and populate frontline worker queue', async () => {
      const res = await request(app)
        .post('/api/v1/followup/tasks')
        .send({
          caseId,
          patientId,
          assignedAshaId: ashaId,
          dueDate: '2026-10-05',
          taskType: 'HOME_VISIT',
          priority: 'ROUTINE',
          instructions: 'Check post-op surgical wound and verify medication adherence'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.escalationLevel).toBe(0);

      // Verify worker queue query
      const queueRes = await request(app).get(`/api/v1/followup/frontline/${ashaId}`);
      expect(queueRes.status).toBe(200);
      expect(queueRes.body.count).toBe(1);
      expect(queueRes.body.data[0].id).toBe(res.body.data.id);
    });

    it('should reject invalid due date format', async () => {
      const res = await request(app)
        .post('/api/v1/followup/tasks')
        .send({
          caseId,
          patientId,
          dueDate: '05-10-2026', // wrong format
          taskType: 'HOME_VISIT',
          instructions: 'Visit'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('2. Home Visit Completion with Vitals Observation', () => {
    it('should mark task completed and record frontline worker vitals and notes', async () => {
      const createRes = await request(app)
        .post('/api/v1/followup/tasks')
        .send({
          caseId,
          patientId,
          assignedAshaId: ashaId,
          dueDate: '2026-10-02',
          taskType: 'MEDICATION_ADHERENCE',
          instructions: 'Verify hypertension medication adherence'
        });
      const taskId = createRes.body.data.id;

      const completeRes = await request(app)
        .post(`/api/v1/followup/tasks/${taskId}/complete`)
        .send({
          completedBy: ashaId,
          completedByRole: 'ASHA',
          completionNotes: 'Patient visited at home. Regular with medication. No headaches or dizziness reported.',
          vitalsObserved: { bp: '124/82', hr: 74, spo2: 98 }
        });

      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe('COMPLETED');
      expect(completeRes.body.data.completedBy).toBe(ashaId);
      expect(completeRes.body.data.vitalsObserved.bp).toBe('124/82');
      expect(completeRes.body.data.completedAt).toBeDefined();
    });
  });

  describe('3. Deterministic Overdue & Escalation Engine', () => {
    it('should escalate overdue tasks through Level 1, Level 2, and Level 3 (ESCALATED_DHO)', async () => {
      // Task 1: 1 day overdue, ROUTINE -> Level 1 OVERDUE
      await request(app)
        .post('/api/v1/followup/tasks')
        .send({
          caseId: uuidv4(),
          patientId,
          assignedAshaId: ashaId,
          dueDate: '2026-09-25',
          taskType: 'GENERAL_REASSESSMENT',
          priority: 'ROUTINE',
          instructions: 'Routine blood pressure check'
        });

      // Task 2: 4 days overdue, ROUTINE -> Level 2 OVERDUE (MO Escalation)
      await request(app)
        .post('/api/v1/followup/tasks')
        .send({
          caseId: uuidv4(),
          patientId,
          assignedAshaId: ashaId,
          dueDate: '2026-09-22',
          taskType: 'MEDICATION_ADHERENCE',
          priority: 'ROUTINE',
          instructions: 'Antibiotic course adherence'
        });

      // Task 3: 8 days overdue OR CRITICAL 3 days overdue -> Level 3 ESCALATED_DHO
      await request(app)
        .post('/api/v1/followup/tasks')
        .send({
          caseId: uuidv4(),
          patientId,
          assignedAshaId: ashaId,
          dueDate: '2026-09-18',
          taskType: 'SUTURE_REMOVAL',
          priority: 'CRITICAL',
          instructions: 'Critical surgical wound check and suture removal'
        });

      // Run escalation evaluation with reference date 2026-09-26
      const cronRes = await request(app)
        .post('/api/v1/followup/cron/check-escalations')
        .send({ referenceDate: '2026-09-26T12:00:00Z' });

      expect(cronRes.status).toBe(200);
      expect(cronRes.body.data.evaluatedCount).toBe(3);
      expect(cronRes.body.data.escalatedCount).toBe(3);

      const tasks = cronRes.body.data.tasksEscalated;
      const l1 = tasks.find((t: any) => t.dueDate === '2026-09-25');
      const l2 = tasks.find((t: any) => t.dueDate === '2026-09-22');
      const l3 = tasks.find((t: any) => t.dueDate === '2026-09-18');

      expect(l1.status).toBe('OVERDUE');
      expect(l1.escalationLevel).toBe(1);

      expect(l2.status).toBe('OVERDUE');
      expect(l2.escalationLevel).toBe(2);

      expect(l3.status).toBe('ESCALATED_DHO');
      expect(l3.escalationLevel).toBe(3);
    });
  });

  describe('4. Privacy-Preserving Notification Engine', () => {
    it('should sanitize sensitive stigmatizing medical diagnosis terms in notification bodies', async () => {
      const res = await request(app)
        .post('/api/v1/followup/notifications/dispatch')
        .send({
          recipientUserId: patientId,
          channel: 'SMS',
          title: 'Prescription Refill',
          messageSafeBody: 'Reminder: Pick up your monthly Tuberculosis and HIV medications from the clinic'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messageSafeBody).not.toContain('HIV');
      expect(res.body.data.messageSafeBody).not.toContain('Tuberculosis');
      expect(res.body.data.messageSafeBody).toContain('SwasthyaSetu Alert');
    });

    it('should allow benign non-sensitive messages through unaltered', async () => {
      const res = await request(app)
        .post('/api/v1/followup/notifications/dispatch')
        .send({
          recipientUserId: patientId,
          channel: 'WEBPUSH',
          title: 'Health Visit Reminder',
          messageSafeBody: 'Your scheduled follow-up consultation is tomorrow at 10:00 AM at primary health center.'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.messageSafeBody).toBe(
        'Your scheduled follow-up consultation is tomorrow at 10:00 AM at primary health center.'
      );
    });
  });
});
