import { Response } from 'express';
import { auditService } from '../services/audit.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class AuditController {
  async getAuditTrail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const actorId = req.query.actorId as string | undefined;
      const correlationId = req.query.correlationId as string | undefined;
      const action = req.query.action as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const logs = await auditService.getAuditTrail({
        actorId,
        correlationId,
        action,
        limit,
      });

      res.status(200).json({
        success: true,
        count: logs.length,
        logs,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async recordExternalAudit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        actorId,
        role,
        scopeFacilityId,
        scopeDistrict,
        action,
        resourceType,
        resourceId,
        payloadBefore,
        payloadAfter,
      } = req.body;

      if (!actorId || !action || !resourceType) {
        res.status(400).json({ error: 'Missing required audit parameters' });
        return;
      }

      const log = await auditService.logEvent({
        actorId,
        role: role || 'SYSTEM',
        scopeFacilityId,
        scopeDistrict,
        action,
        resourceType,
        resourceId,
        payloadBefore,
        payloadAfter,
        ipAddress: req.ip,
        correlationId: req.correlationId || req.body.correlationId,
      });

      res.status(201).json({
        success: true,
        auditLogId: log.id,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }
}

export const auditController = new AuditController();
