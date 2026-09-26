import crypto from 'crypto';
import QRCode from 'qrcode';
import { config } from '../config';
import { QRTokenPayload, ReferralPathway } from '../types';

export class QRService {
  private static readonly SECRET = config.qrHmacSecret;

  /**
   * Generates a tamper-proof signed QR payload string and QR code image
   */
  public static async generateQR(data: {
    referralId: string;
    referralCode: string;
    patientId: string;
    caseId: string;
    destinationFacilityId: string;
    pathway: ReferralPathway;
  }): Promise<{ token: string; tokenHash: string; qrDataUrl: string }> {
    const payload: QRTokenPayload = {
      referralId: data.referralId,
      referralCode: data.referralCode,
      patientId: data.patientId,
      caseId: data.caseId,
      destinationFacilityId: data.destinationFacilityId,
      pathway: data.pathway,
      issuedAt: Date.now(),
      nonce: crypto.randomBytes(8).toString('hex')
    };

    const payloadString = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.SECRET)
      .update(payloadString)
      .digest('base64url');

    const token = `${payloadString}.${signature}`;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6
    });

    return { token, tokenHash, qrDataUrl };
  }

  /**
   * Verifies the authenticity and signature of a QR token
   */
  public static verifyQRToken(token: string): { isValid: boolean; payload?: QRTokenPayload; error?: string } {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) {
        return { isValid: false, error: 'Malformed QR token structure' };
      }

      const [payloadString, signature] = parts;
      const expectedSignature = crypto
        .createHmac('sha256', this.SECRET)
        .update(payloadString)
        .digest('base64url');

      const sigBuf = Buffer.from(signature);
      const expectedSigBuf = Buffer.from(expectedSignature);

      if (sigBuf.length !== expectedSigBuf.length || !crypto.timingSafeEqual(sigBuf, expectedSigBuf)) {
        return { isValid: false, error: 'Cryptographic signature mismatch. Possible token tampering.' };
      }

      const rawJson = Buffer.from(payloadString, 'base64url').toString('utf-8');
      const payload: QRTokenPayload = JSON.parse(rawJson);

      return { isValid: true, payload };
    } catch (err: any) {
      return { isValid: false, error: `QR Token decoding error: ${err.message}` };
    }
  }
}
