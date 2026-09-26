import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db/database';
import { config } from '../config';
import { OTPChallenge } from '../types';

export class OTPService {
  /**
   * Generates a secure numeric OTP of specified length (default 6 digits)
   */
  generateNumericOTP(length = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const randomInt = crypto.randomInt(min, max + 1);
    return randomInt.toString();
  }

  /**
   * Creates a new OTP challenge and stores the hash in the database
   */
  async createChallenge(
    phone: string,
    purpose: 'PATIENT_LOGIN' | 'PATIENT_REGISTRATION' = 'PATIENT_LOGIN'
  ): Promise<{ challengeId: string; plainOtp: string; expiresInMinutes: number }> {
    const plainOtp = this.generateNumericOTP();
    const otpHash = await bcrypt.hash(plainOtp, config.BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + config.OTP_TTL_MINUTES * 60 * 1000);

    const challenge = await db.createOTPChallenge({
      phone,
      otpCodeHash: otpHash,
      purpose,
      expiresAt,
    });

    return {
      challengeId: challenge.id,
      plainOtp, // For delivery via SMS service / sandbox display
      expiresInMinutes: config.OTP_TTL_MINUTES,
    };
  }

  /**
   * Verifies an OTP challenge with brute-force attempt limits and expiration checks
   */
  async verifyChallenge(
    challengeId: string,
    phone: string,
    plainOtp: string
  ): Promise<{ success: boolean; error?: string; challenge?: OTPChallenge }> {
    const challenge = await db.findOTPChallengeById(challengeId);

    if (!challenge) {
      return { success: false, error: 'CHALLENGE_NOT_FOUND' };
    }

    if (challenge.phone !== phone) {
      return { success: false, error: 'PHONE_MISMATCH' };
    }

    if (challenge.isConsumed) {
      return { success: false, error: 'CHALLENGE_ALREADY_USED' };
    }

    if (new Date() > challenge.expiresAt) {
      return { success: false, error: 'OTP_EXPIRED' };
    }

    if (challenge.attemptCount >= config.MAX_OTP_ATTEMPTS) {
      return { success: false, error: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    const isMatch = await bcrypt.compare(plainOtp, challenge.otpCodeHash);

    if (!isMatch) {
      await db.updateOTPChallenge(challengeId, {
        attemptCount: challenge.attemptCount + 1,
      });
      return { success: false, error: 'INVALID_OTP' };
    }

    // Mark as consumed on success
    const updated = await db.updateOTPChallenge(challengeId, { isConsumed: true });
    return { success: true, challenge: updated || challenge };
  }
}

export const otpService = new OTPService();
