import { Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../types';

// Zod Validation Schemas
const requestOTPSchema = z.object({
  phone: z.string().min(10).max(15).regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
});

const verifyOTPSchema = z.object({
  challengeId: z.string().uuid('Invalid challenge ID'),
  phone: z.string().min(10).max(15),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  deviceInfo: z.record(z.unknown()).optional(),
});

const staffLoginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(6),
  deviceInfo: z.record(z.unknown()).optional(),
});

const registerStaffSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum([
    'ASHA',
    'ANM',
    'MPW',
    'CHO',
    'MEDICAL_OFFICER',
    'SPECIALIST',
    'FACILITY_ADMIN',
    'DISTRICT_OFFICER',
  ]),
  fullName: z.string().min(2),
  designation: z.string().min(2),
  facilityId: z.string().uuid().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  licenseNumber: z.string().optional(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(10),
});

export class AuthController {
  async requestPatientOTP(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = requestOTPSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const result = await authService.requestPatientOTP(
        parse.data.phone,
        req.correlationId,
        req.ip
      );

      res.status(200).json({
        success: true,
        challengeId: result.challengeId,
        expiresInMinutes: result.expiresInMinutes,
        message: 'OTP challenge generated successfully',
        // In dev / test environment, surface plain OTP for testing workflows
        plainOtpDevOnly: process.env.NODE_ENV !== 'production' ? result.plainOtp : undefined,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async verifyPatientOTP(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = verifyOTPSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const result = await authService.verifyPatientOTP({
        challengeId: parse.data.challengeId,
        phone: parse.data.phone,
        otp: parse.data.otp,
        deviceInfo: parse.data.deviceInfo,
        correlationId: req.correlationId,
        ipAddress: req.ip,
      });

      if (!result.success) {
        res.status(400).json({
          error: result.error || 'OTP_VERIFICATION_FAILED',
          correlationId: req.correlationId,
        });
        return;
      }

      res.status(200).json({
        success: true,
        ...result.data,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async loginStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = staffLoginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const result = await authService.loginStaff({
        emailOrPhone: parse.data.emailOrPhone,
        password: parse.data.password,
        deviceInfo: parse.data.deviceInfo,
        correlationId: req.correlationId,
        ipAddress: req.ip,
      });

      if (!result.success) {
        res.status(401).json({
          error: result.error || 'INVALID_CREDENTIALS',
          correlationId: req.correlationId,
        });
        return;
      }

      res.status(200).json({
        success: true,
        ...result.data,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async registerStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = registerStaffSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const result = await authService.registerStaff({
        ...parse.data,
        role: parse.data.role as UserRole,
        correlationId: req.correlationId,
      });

      res.status(201).json({
        success: true,
        ...result,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async refreshToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parse = refreshTokenSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'VALIDATION_ERROR', details: parse.error.format() });
      return;
    }

    try {
      const result = await authService.refreshToken(
        parse.data.refreshToken,
        req.correlationId
      );

      if (!result.success) {
        res.status(401).json({
          error: result.error || 'INVALID_REFRESH_TOKEN',
          correlationId: req.correlationId,
        });
        return;
      }

      res.status(200).json({
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    try {
      await authService.logout(req.user, req.correlationId);
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        correlationId: req.correlationId,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user,
      correlationId: req.correlationId,
    });
  }
}

export const authController = new AuthController();
