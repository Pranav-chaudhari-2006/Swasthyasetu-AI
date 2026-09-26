import { Router } from 'express';
import { ClinicalController } from '../controllers/clinicalController';

const router = Router();

// Assessments
router.post('/clinical/assessments', ClinicalController.createAssessment);
router.get('/clinical/assessments/case/:caseId', ClinicalController.getAssessmentsByCase);

// Prescriptions
router.post('/clinical/prescriptions', ClinicalController.createPrescription);
router.get('/clinical/prescriptions/case/:caseId', ClinicalController.getPrescriptionsByCase);

// Inventory & Dispensing
router.post('/clinical/inventory', ClinicalController.updateInventory);
router.get('/clinical/inventory/facility/:facilityId', ClinicalController.getFacilityInventory);
router.post('/clinical/medicines/dispense', ClinicalController.dispense);

// Diagnostics
router.post('/clinical/diagnostics/order', ClinicalController.createDiagnosticOrder);
router.get('/clinical/diagnostics/case/:caseId', ClinicalController.getDiagnosticsByCase);
router.put('/clinical/diagnostics/:id/result', ClinicalController.attachDiagnosticResult);
router.put('/clinical/diagnostics/:id/review', ClinicalController.reviewDiagnosticOrder);

// Admissions & Discharges
router.post('/clinical/admissions', ClinicalController.admitPatient);
router.get('/clinical/admissions/case/:caseId', ClinicalController.getAdmissionsByCase);
router.post('/clinical/admissions/:id/discharge', ClinicalController.dischargePatient);

export { router as clinicalRoutes };
