import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { auditController } from '../controllers/audit.controller';
import { authenticateToken, requirePermission, requireRoles } from '../middlewares/auth.middleware';

const router = Router();

// Public Authentication Endpoints
router.post('/patient/otp/request', (req, res) => authController.requestPatientOTP(req, res));
router.post('/patient/otp/verify', (req, res) => authController.verifyPatientOTP(req, res));
router.post('/staff/login', (req, res) => authController.loginStaff(req, res));
router.post('/token/refresh', (req, res) => authController.refreshToken(req, res));

// Staff Provisioning (Admin bootstrap / Facility Admin / District Officer)
router.post('/staff/register', (req, res) => authController.registerStaff(req, res));

// Authenticated Endpoints
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));
router.get('/profile', authenticateToken, (req, res) => authController.getProfile(req, res));

// Audit Endpoints
router.get(
  '/audit/logs',
  authenticateToken,
  requirePermission('AUDIT_VIEW'),
  (req, res) => auditController.getAuditTrail(req, res)
);

router.post('/audit/internal-log', (req, res) => auditController.recordExternalAudit(req, res));

export default router;
