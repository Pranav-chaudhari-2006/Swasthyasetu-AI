import { Router } from 'express';
import { intakeController } from '../controllers/intake.controller';

const router = Router();

router.post('/sessions', (req, res) => intakeController.startSession(req, res));
router.post('/sessions/:id/messages', (req, res) => intakeController.processMessage(req, res));
router.get('/sessions/:id/facts', (req, res) => intakeController.getStructuredFacts(req, res));
router.get('/sessions/:id/messages', (req, res) => intakeController.getSessionMessages(req, res));

export default router;
