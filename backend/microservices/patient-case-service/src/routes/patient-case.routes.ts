import { Router } from 'express';
import { patientController } from '../controllers/patient.controller';
import { caseController } from '../controllers/case.controller';

const router = Router();

// Patient Endpoints
router.post('/patients', (req, res) => patientController.registerPatient(req, res));
router.get('/patients/:id', (req, res) => patientController.getPatient(req, res));
router.get('/patients/code/:code', (req, res) => patientController.getPatientByCode(req, res));
router.post('/patients/:id/caregivers', (req, res) => patientController.linkCaregiver(req, res));
router.get('/patients/:id/caregivers', (req, res) => patientController.getCaregivers(req, res));

// Case Endpoints
router.post('/cases', (req, res) => caseController.openCase(req, res));
router.get('/cases/:id', (req, res) => caseController.getCase(req, res));
router.get('/cases/patient/:patientId', (req, res) => caseController.listPatientCases(req, res));
router.put('/cases/:id/status', (req, res) => caseController.updateCaseStatus(req, res));

// Timeline Endpoints
router.get('/cases/:id/timeline', (req, res) => caseController.getTimeline(req, res));
router.post('/cases/:id/timeline/events', (req, res) => caseController.appendTimelineEvent(req, res));

export default router;
