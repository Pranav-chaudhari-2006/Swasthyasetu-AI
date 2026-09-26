import { Router } from 'express';
import { SyncController } from '../controllers/syncController';

const router = Router();

// Sync Endpoints
router.post('/sync/batch', SyncController.processBatch);
router.get('/sync/rules/offline-package', SyncController.getOfflineRules);
router.get('/sync/device/:deviceId/status', SyncController.getDeviceStatus);
router.get('/sync/audit', SyncController.getAuditTrail);

export { router as syncRoutes };
