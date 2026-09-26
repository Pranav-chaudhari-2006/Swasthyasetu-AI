import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { otpService } from './otp.service';
import { tokenService } from './token.service';
import { auditService } from './audit.service';
import { AuthResponse, TokenPayload, UserRole } from '../types';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  /**
   * Request OTP for patient login or registration
   */
  async requestPatientOTP(
    phone: string,
    correlationId = uuidv4(),
    ipAddress?: string
  ): Promise<{ challengeId: string; plainOtp: string; expiresInMinutes: number }> {
    const result = await otpService.createChallenge(phone, 'PATIENT_LOGIN');

    await auditService.logEvent({
      actorId: phone,
      role: 'PATIENT',
      action: 'AUTH_OTP_REQUESTED',
      resourceType: 'OTPChallenge',
      resourceId: result.challengeId,
      ipAddress,
      correlationId,
    });

    return result;
  }

  /**
   * Verify patient OTP and issue auth tokens
   */
  async verifyPatientOTP(params: {
    challengeId: string;
    phone: string;
    otp: string;
    deviceInfo?: Record<string, unknown>;
    correlationId?: string;
    ipAddress?: string;
  }): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    const correlationId = params.correlationId || uuidv4();

    const verification = await otpService.verifyChallenge(
      params.challengeId,
      params.phone,
      params.otp
    );

    if (!verification.success) {
      await auditService.logEvent({
        actorId: params.phone,
        role: 'PATIENT',
        action: 'AUTH_OTP_FAILED',
        resourceType: 'OTPChallenge',
        resourceId: params.challengeId,
        payloadAfter: { error: verification.error },
        ipAddress: params.ipAddress,
        correlationId,
      });
      return { success: false, error: verification.error };
    }

    // Find or create Patient User
    let user = await db.findUserByPhone(params.phone);
    let isNewUser = false;

    if (!user) {
      user = await db.createUser({
        phone: params.phone,
        role: 'PATIENT',
      });
      isNewUser = true;
    }

    // Create session and tokens
    const { refreshToken, session } = await tokenService.createSession(
      user.id,
      params.deviceInfo
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
      phone: user.phone,
      sessionId: session.id,
    };

    const accessToken = tokenService.generateAccessToken(tokenPayload);

    await auditService.logEvent({
      actorId: user.id,
      role: user.role,
      action: isNewUser ? 'PATIENT_REGISTERED' : 'PATIENT_LOGIN_SUCCESS',
      resourceType: 'User',
      resourceId: user.id,
      payloadAfter: { isNewUser, sessionId: session.id },
      ipAddress: params.ipAddress,
      correlationId,
    });

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes in seconds
        user: {
          id: user.id,
          role: user.role,
          phone: user.phone,
        },
      },
    };
  }

  /**
   * Staff login with Email/Phone and Password
   */
  async loginStaff(params: {
    emailOrPhone: string;
    password: string;
    deviceInfo?: Record<string, unknown>;
    correlationId?: string;
    ipAddress?: string;
  }): Promise<{ success: boolean; data?: AuthResponse; error?: string }> {
    const correlationId = params.correlationId || uuidv4();

    let user = await db.findUserByEmail(params.emailOrPhone);
    if (!user) {
      user = await db.findUserByPhone(params.emailOrPhone);
    }

    if (!user || !user.passwordHash) {
      await auditService.logEvent({
        actorId: params.emailOrPhone,
        role: 'UNKNOWN',
        action: 'STAFF_LOGIN_FAILED',
        resourceType: 'User',
        payloadAfter: { reason: 'USER_NOT_FOUND' },
        ipAddress: params.ipAddress,
        correlationId,
      });
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    if (!user.isActive) {
      return { success: false, error: 'ACCOUNT_DEACTIVATED' };
    }

    const isMatch = await bcrypt.compare(params.password, user.passwordHash);
    if (!isMatch) {
      await auditService.logEvent({
        actorId: user.id,
        role: user.role,
        action: 'STAFF_LOGIN_FAILED',
        resourceType: 'User',
        resourceId: user.id,
        payloadAfter: { reason: 'PASSWORD_MISMATCH' },
        ipAddress: params.ipAddress,
        correlationId,
      });
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const staffProfile = await db.findStaffByUserId(user.id);

    const { refreshToken, session } = await tokenService.createSession(
      user.id,
      params.deviceInfo
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      facilityId: staffProfile?.facilityId,
      district: staffProfile?.district,
      sessionId: session.id,
    };

    const accessToken = tokenService.generateAccessToken(tokenPayload);

    await auditService.logEvent({
      actorId: user.id,
      role: user.role,
      scopeFacilityId: staffProfile?.facilityId,
      scopeDistrict: staffProfile?.district,
      action: 'STAFF_LOGIN_SUCCESS',
      resourceType: 'User',
      resourceId: user.id,
      payloadAfter: { sessionId: session.id },
      ipAddress: params.ipAddress,
      correlationId,
    });

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        expiresIn: 900,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          phone: user.phone,
        },
        staffProfile: staffProfile || undefined,
      },
    };
  }

  /**
   * Seed/Register staff account (for initial bootstrap & facility provisioning)
   */
  async registerStaff(params: {
    email: string;
    phone: string;
    password: string;
    role: UserRole;
    fullName: string;
    designation: string;
    facilityId?: string;
    district?: string;
    state?: string;
    licenseNumber?: string;
    correlationId?: string;
  }): Promise<AuthResponse> {
    const correlationId = params.correlationId || uuidv4();
    const passwordHash = await bcrypt.hash(params.password, config.BCRYPT_SALT_ROUNDS);

    const user = await db.createUser({
      email: params.email,
      phone: params.phone,
      passwordHash,
      role: params.role,
    });

    const staffProfile = await db.createStaffProfile({
      userId: user.id,
      fullName: params.fullName,
      designation: params.designation,
      facilityId: params.facilityId,
      district: params.district,
      state: params.state,
      licenseNumber: params.licenseNumber,
    });

    const { refreshToken, session } = await tokenService.createSession(user.id);

    const tokenPayload: TokenPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      facilityId: staffProfile.facilityId,
      district: staffProfile.district,
      sessionId: session.id,
    };

    const accessToken = tokenService.generateAccessToken(tokenPayload);

    await auditService.logEvent({
      actorId: user.id,
      role: user.role,
      scopeFacilityId: staffProfile.facilityId,
      scopeDistrict: staffProfile.district,
      action: 'STAFF_PROVISIONED',
      resourceType: 'StaffProfile',
      resourceId: staffProfile.id,
      payloadAfter: { role: user.role, facilityId: staffProfile.facilityId },
      correlationId,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
        phone: user.phone,
      },
      staffProfile,
    };
  }

  /**
   * Refresh JWT token pair
   */
  async refreshToken(
    refreshToken: string,
    correlationId = uuidv4()
  ): Promise<{ success: boolean; accessToken?: string; refreshToken?: string; error?: string }> {
    const result = await tokenService.rotateRefreshToken(refreshToken);
    if (!result) {
      await auditService.logEvent({
        actorId: 'ANONYMOUS',
        role: 'UNKNOWN',
        action: 'TOKEN_REFRESH_FAILED',
        resourceType: 'UserSession',
        payloadAfter: { reason: 'INVALID_OR_REVOKED_REFRESH_TOKEN' },
        correlationId,
      });
      return { success: false, error: 'INVALID_REFRESH_TOKEN' };
    }

    return {
      success: true,
      accessToken: result.newAccessToken,
      refreshToken: result.newRefreshToken,
    };
  }

  /**
   * Logout user and revoke active session
   */
  async logout(
    tokenPayload: TokenPayload,
    correlationId = uuidv4()
  ): Promise<{ success: boolean }> {
    if (tokenPayload.sessionId) {
      await tokenService.revokeSession(tokenPayload.sessionId);
    }

    await auditService.logEvent({
      actorId: tokenPayload.userId,
      role: tokenPayload.role,
      action: 'USER_LOGOUT',
      resourceType: 'UserSession',
      resourceId: tokenPayload.sessionId,
      correlationId,
    });

    return { success: true };
  }
}

export const authService = new AuthService();
