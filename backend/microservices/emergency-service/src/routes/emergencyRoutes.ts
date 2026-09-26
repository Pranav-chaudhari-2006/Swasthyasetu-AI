import { Router } from 'express';
import { EmergencyController } from '../controllers/emergencyController';

const router = Router();

// Emergency Dispatch & Retrieval
router.post('/emergency/dispatch', EmergencyController.dispatch);
router.get('/emergency/:id', EmergencyController.getById);
router.get('/emergency/case/:caseId', EmergencyController.getByCaseId);
router.get('/emergency/facility/:facilityId/active', EmergencyController.getFacilityActive);

// Operational Telemetry & State Transitions
router.put('/emergency/:id/status', EmergencyController.updateStatus);
router.post('/emergency/:id/telemetry', EmergencyController.addTelemetry);
router.post('/emergency/:id/redirect', EmergencyController.redirect);
router.post('/emergency/:id/handoff', EmergencyController.completeHandoff);

export { router as emergencyRoutes };
