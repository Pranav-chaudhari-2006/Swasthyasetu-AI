import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { config } from '../config';
import { db } from '../db/database';
import { TokenPayload, UserSession } from '../types';

export class TokenService {
  /**
   * Generates a signed short-lived JWT access token
   */
  generateAccessToken(payload: TokenPayload): string {
    const signOptions: SignOptions = {
      expiresIn: (config.ACCESS_TOKEN_TTL as any) || '15m',
      algorithm: 'HS256',
    };
    return jwt.sign(payload, config.JWT_ACCESS_SECRET, signOptions);
  }

  /**
   * Verifies a JWT access token
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, config.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generates an opaque cryptographic refresh token and records an active session
   */
  async createSession(
    userId: string,
    deviceInfo?: Record<string, unknown>
  ): Promise<{ refreshToken: string; session: UserSession }> {
    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = await bcrypt.hash(rawRefreshToken, config.BCRYPT_SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + config.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const session = await db.createSession({
      userId,
      refreshTokenHash,
      deviceInfo,
      expiresAt,
    });

    // We return a compound token combining sessionId and secret token: `${sessionId}.${rawRefreshToken}`
    const compoundRefreshToken = `${session.id}.${rawRefreshToken}`;
    return { refreshToken: compoundRefreshToken, session };
  }

  /**
   * Verifies and rotates a refresh token
   */
  async rotateRefreshToken(
    compoundRefreshToken: string
  ): Promise<{ newAccessToken: string; newRefreshToken: string; userId: string } | null> {
    const parts = compoundRefreshToken.split('.');
    if (parts.length !== 2) return null;

    const [sessionId, rawToken] = parts;
    const session = await db.findSessionById(sessionId);

    if (!session || session.isRevoked || new Date() > session.expiresAt) {
      return null;
    }

    const isMatch = await bcrypt.compare(rawToken, session.refreshTokenHash);
    if (!isMatch) {
      // Possible token theft -> revoke session immediately
      await db.revokeSession(sessionId);
      return null;
    }

    const user = await db.findUserById(session.userId);
    if (!user || !user.isActive) return null;

    const staffProfile = await db.findStaffByUserId(user.id);

    // Revoke old session and issue new session (rotation)
    await db.revokeSession(sessionId);
    const { refreshToken: newRefreshToken, session: newSession } = await this.createSession(
      user.id,
      session.deviceInfo
    );

    const payload: TokenPayload = {
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      facilityId: staffProfile?.facilityId,
      district: staffProfile?.district,
      sessionId: newSession.id,
    };

    const newAccessToken = this.generateAccessToken(payload);
    return { newAccessToken, newRefreshToken, userId: user.id };
  }

  /**
   * Revokes an active session
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    return db.revokeSession(sessionId);
  }

  /**
   * Revokes all sessions for a specific user
   */
  async revokeAllUserSessions(userId: string): Promise<void> {
    return db.revokeAllUserSessions(userId);
  }
}

export const tokenService = new TokenService();
