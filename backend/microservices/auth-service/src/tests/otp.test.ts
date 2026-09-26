import { otpService } from '../services/otp.service';
import { db } from '../db/database';

describe('MS-1: OTP Service Unit Tests', () => {
  beforeEach(() => {
    db.clearMemory();
  });

  it('should generate a 6-digit numeric OTP and challenge record', async () => {
    const result = await otpService.createChallenge('+919876543210', 'PATIENT_LOGIN');
    expect(result.challengeId).toBeDefined();
    expect(result.plainOtp).toHaveLength(6);
    expect(/^\d{6}$/.test(result.plainOtp)).toBe(true);
    expect(result.expiresInMinutes).toBe(5);
  });

  it('should successfully verify a valid OTP', async () => {
    const phone = '+919876543210';
    const challenge = await otpService.createChallenge(phone, 'PATIENT_LOGIN');
    const verification = await otpService.verifyChallenge(
      challenge.challengeId,
      phone,
      challenge.plainOtp
    );

    expect(verification.success).toBe(true);
    expect(verification.challenge?.isConsumed).toBe(true);
  });

  it('should reject already consumed OTP', async () => {
    const phone = '+919876543210';
    const challenge = await otpService.createChallenge(phone, 'PATIENT_LOGIN');
    await otpService.verifyChallenge(challenge.challengeId, phone, challenge.plainOtp);

    // Second attempt
    const secondAttempt = await otpService.verifyChallenge(
      challenge.challengeId,
      phone,
      challenge.plainOtp
    );
    expect(secondAttempt.success).toBe(false);
    expect(secondAttempt.error).toBe('CHALLENGE_ALREADY_USED');
  });

  it('should reject invalid OTP and increment attempt count', async () => {
    const phone = '+919876543210';
    const challenge = await otpService.createChallenge(phone, 'PATIENT_LOGIN');

    const result = await otpService.verifyChallenge(challenge.challengeId, phone, '000000');
    expect(result.success).toBe(false);
    expect(result.error).toBe('INVALID_OTP');

    const stored = await db.findOTPChallengeById(challenge.challengeId);
    expect(stored?.attemptCount).toBe(1);
  });

  it('should lock out after 3 failed OTP attempts', async () => {
    const phone = '+919876543210';
    const challenge = await otpService.createChallenge(phone, 'PATIENT_LOGIN');

    await otpService.verifyChallenge(challenge.challengeId, phone, '111111');
    await otpService.verifyChallenge(challenge.challengeId, phone, '222222');
    await otpService.verifyChallenge(challenge.challengeId, phone, '333333');

    // 4th attempt with correct OTP should still fail due to max attempts exceeded
    const fourthAttempt = await otpService.verifyChallenge(
      challenge.challengeId,
      phone,
      challenge.plainOtp
    );
    expect(fourthAttempt.success).toBe(false);
    expect(fourthAttempt.error).toBe('MAX_ATTEMPTS_EXCEEDED');
  });

  it('should reject if phone number does not match challenge', async () => {
    const challenge = await otpService.createChallenge('+919876543210', 'PATIENT_LOGIN');
    const result = await otpService.verifyChallenge(
      challenge.challengeId,
      '+919999999999',
      challenge.plainOtp
    );
    expect(result.success).toBe(false);
    expect(result.error).toBe('PHONE_MISMATCH');
  });
});
