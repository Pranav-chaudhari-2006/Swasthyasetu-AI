import { Router } from 'express';
import { FollowUpController } from '../controllers/followupController';

const router = Router();

// Follow-Up Tasks
router.post('/followup/tasks', FollowUpController.createTask);
router.get('/followup/tasks/:id', FollowUpController.getTaskById);
router.get('/followup/frontline/:workerId', FollowUpController.getFrontlineQueue);
router.get('/followup/patient/:patientId', FollowUpController.getPatientTasks);
router.post('/followup/tasks/:id/complete', FollowUpController.completeTask);

// Automated Escalations
router.post('/followup/cron/check-escalations', FollowUpController.triggerEscalations);

// Privacy-Safe Notifications
router.post('/followup/notifications/dispatch', FollowUpController.dispatchNotification);
router.get('/followup/notifications/recipient/:userId', FollowUpController.getUserNotifications);

export { router as followupRoutes };
