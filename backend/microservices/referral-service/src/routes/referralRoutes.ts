import { Router } from 'express';
import { ReferralController } from '../controllers/referralController';

const router = Router();

// Create & Query referrals
router.post('/referrals', ReferralController.create);
router.get('/referrals/:id', ReferralController.getById);
router.get('/referrals/facility/:facilityId/inbox', ReferralController.getInbox);
router.get('/referrals/patient/:patientId', ReferralController.getPatientReferrals);
router.get('/referrals/case/:caseId', ReferralController.getCaseReferrals);

// Lifecycle Transitions
router.post('/referrals/:id/accept', ReferralController.accept);
router.post('/referrals/:id/decline', ReferralController.decline);
router.post('/referrals/:id/en-route', ReferralController.markEnRoute);
router.post('/referrals/verify-arrival', ReferralController.verifyArrival);
router.post('/referrals/:id/outcome', ReferralController.updateOutcome);
router.post('/referrals/:id/reroute', ReferralController.reroute);

export { router as referralRoutes };
