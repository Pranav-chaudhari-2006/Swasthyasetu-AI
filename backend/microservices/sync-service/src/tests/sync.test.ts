import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import { createApp } from '../app';
import { db } from '../db';
import { CryptoService } from '../services/cryptoService';
import { SyncService } from '../services/syncService';

const app = createApp();

describe('MS-10: Offline Sync & Cryptographic Reconciliation Test Suite', () => {
  const deviceId = 'ASHA-TAB-MH12-984';
  const actorId = uuidv4();
  const patientId = uuidv4();
  const caseId = uuidv4();

  beforeAll(async () => {
    await db.init();
    await SyncService.publishOfflineRules('v1.2.0-deterministic-pilot', {
      rules: [{ id: 'RULE-01', description: 'Offline safety rule' }]
    });
  });

  beforeEach(async () => {
    await db.clear();
  });

  describe('1. Batch Synchronization & HMAC Verification', () => {
    it('should ingest and commit valid batch of offline mutations', async () => {
      const op1Id = uuidv4();
      const op1Timestamp = '2026-09-26T10:00:00.000Z';
      const op1Payload = { fullName: 'Savitri Devi', age: 34, gender: 'FEMALE' };
      const sig1 = CryptoService.generateSignature({
        operationId: op1Id,
        deviceId,
        sequenceNumber: 1,
        entityId: patientId,
        clientTimestamp: op1Timestamp,
        payload: op1Payload
      });

      const op2Id = uuidv4();
      const op2Timestamp = '2026-09-26T10:05:00.000Z';
      const op2Payload = { chiefComplaint: 'Persistent cough for 2 weeks' };
      const sig2 = CryptoService.generateSignature({
        operationId: op2Id,
        deviceId,
        sequenceNumber: 2,
        entityId: caseId,
        clientTimestamp: op2Timestamp,
        payload: op2Payload
      });

      const res = await request(app)
        .post('/api/v1/sync/batch')
        .send({
          deviceId,
          operations: [
            {
              operationId: op1Id,
              deviceId,
              sequenceNumber: 1,
              actorId,
              actorRole: 'ASHA',
              entityType: 'PATIENT',
              entityId: patientId,
              action: 'CREATE',
              clientTimestamp: op1Timestamp,
              payload: op1Payload,
              hmacSignature: sig1
            },
            {
              operationId: op2Id,
              deviceId,
              sequenceNumber: 2,
              actorId,
              actorRole: 'ASHA',
              entityType: 'CASE',
              entityId: caseId,
              action: 'CREATE',
              clientTimestamp: op2Timestamp,
              payload: op2Payload,
              hmacSignature: sig2
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.committedCount).toBe(2);
      expect(res.body.data.duplicateCount).toBe(0);
      expect(res.body.data.rejectedCount).toBe(0);
    });

    it('should reject mutations with tampered or invalid HMAC signatures', async () => {
      const opId = uuidv4();
      const timestamp = '2026-09-26T10:00:00.000Z';
      const payload = { test: 'tampered' };

      const res = await request(app)
        .post('/api/v1/sync/batch')
        .send({
          deviceId,
          operations: [
            {
              operationId: opId,
              deviceId,
              sequenceNumber: 1,
              actorId,
              actorRole: 'ASHA',
              entityType: 'PATIENT',
              entityId: patientId,
              action: 'CREATE',
              clientTimestamp: timestamp,
              payload,
              hmacSignature: 'invalid_tampered_signature_string_0000000000'
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.rejectedCount).toBe(1);
      expect(res.body.data.operations[0].status).toBe('REJECTED');
      expect(res.body.data.operations[0].reconciliationResolution).toBe('INVALID_SIGNATURE');
    });
  });

  describe('2. Idempotency Protection Across Repeated Submissions', () => {
    it('should cleanly ignore identical batch resubmissions without duplicate mutations', async () => {
      const opId = uuidv4();
      const timestamp = '2026-09-26T11:00:00.000Z';
      const payload = { systolicBP: 120, diastolicBP: 80 };
      const sig = CryptoService.generateSignature({
        operationId: opId,
        deviceId,
        sequenceNumber: 1,
        entityId: patientId,
        clientTimestamp: timestamp,
        payload
      });

      const batchPayload = {
        deviceId,
        operations: [
          {
            operationId: opId,
            deviceId,
            sequenceNumber: 1,
            actorId,
            actorRole: 'ASHA',
            entityType: 'VITAL_SIGN',
            entityId: patientId,
            action: 'APPEND',
            clientTimestamp: timestamp,
            payload,
            hmacSignature: sig
          }
        ]
      };

      // 1st transmission
      const res1 = await request(app).post('/api/v1/sync/batch').send(batchPayload);
      expect(res1.body.data.committedCount).toBe(1);
      expect(res1.body.data.duplicateCount).toBe(0);

      // 2nd transmission
      const res2 = await request(app).post('/api/v1/sync/batch').send(batchPayload);
      expect(res2.body.data.committedCount).toBe(0);
      expect(res2.body.data.duplicateCount).toBe(1);
      expect(res2.body.data.operations[0].reconciliationResolution).toBe('IDEMPOTENT_NOOP');

      // 3rd transmission
      const res3 = await request(app).post('/api/v1/sync/batch').send(batchPayload);
      expect(res3.body.data.committedCount).toBe(0);
      expect(res3.body.data.duplicateCount).toBe(1);
    });
  });

  describe('3. Deterministic Conflict Resolution (Server Authority)', () => {
    it('should reconcile conflicts when client attempts to modify a locked server entity', async () => {
      const opId = uuidv4();
      const timestamp = '2026-09-26T12:00:00.000Z';
      // Client operation modifying entity where server state has locked the case
      const payload = { isClinicalStateLocked: true, notes: 'Client attempting edit after discharge' };
      const sig = CryptoService.generateSignature({
        operationId: opId,
        deviceId,
        sequenceNumber: 5,
        entityId: caseId,
        clientTimestamp: timestamp,
        payload
      });

      const res = await request(app)
        .post('/api/v1/sync/batch')
        .send({
          deviceId,
          operations: [
            {
              operationId: opId,
              deviceId,
              sequenceNumber: 5,
              actorId,
              actorRole: 'ASHA',
              entityType: 'CASE',
              entityId: caseId,
              action: 'UPDATE',
              clientTimestamp: timestamp,
              payload,
              hmacSignature: sig
            }
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.data.conflictCount).toBe(1);
      expect(res.body.data.operations[0].status).toBe('CONFLICT_RESOLVED');
      expect(res.body.data.operations[0].reconciliationResolution).toBe('SERVER_AUTHORITY_PREVAILS');
    });
  });

  describe('4. Signed Offline Rule Distribution & Audit Trail', () => {
    it('should deliver cryptographically signed offline rule package', async () => {
      const res = await request(app).get('/api/v1/sync/rules/offline-package');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.versionTag).toBe('v1.2.0-deterministic-pilot');
      expect(res.body.data.packageHash).toBeDefined();
      expect(res.body.data.packageSignature).toBeDefined();
    });

    it('should return global sync audit trail', async () => {
      const opId = uuidv4();
      const timestamp = '2026-09-26T14:00:00.000Z';
      const payload = { status: 'Audit test' };
      const sig = CryptoService.generateSignature({
        operationId: opId,
        deviceId,
        sequenceNumber: 10,
        entityId: patientId,
        clientTimestamp: timestamp,
        payload
      });

      await request(app)
        .post('/api/v1/sync/batch')
        .send({
          deviceId,
          operations: [
            {
              operationId: opId,
              deviceId,
              sequenceNumber: 10,
              actorId,
              actorRole: 'ASHA',
              entityType: 'PATIENT',
              entityId: patientId,
              action: 'UPDATE',
              clientTimestamp: timestamp,
              payload,
              hmacSignature: sig
            }
          ]
        });

      const auditRes = await request(app).get(`/api/v1/sync/audit?deviceId=${deviceId}`);
      expect(auditRes.status).toBe(200);
      expect(auditRes.body.count).toBe(1);
      expect(auditRes.body.data[0].operationId).toBe(opId);
    });
  });
});
