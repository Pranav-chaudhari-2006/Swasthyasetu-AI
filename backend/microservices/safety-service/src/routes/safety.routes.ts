import { Router } from 'express';
import { safetyController } from '../controllers/safety.controller';

const router = Router();

router.post('/evaluate', (req, res) => safetyController.evaluateTriage(req, res));
router.get('/case/:caseId', (req, res) => safetyController.getCaseAssessment(req, res));
router.get('/rules/info', (req, res) => safetyController.getRulesInfo(req, res));

export default router;
