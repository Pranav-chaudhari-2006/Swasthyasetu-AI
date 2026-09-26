import crypto from 'crypto';
import { config } from '../config';

export class CryptoService {
  private static readonly SECRET = config.syncHmacSecret;

  /**
   * Generates HMAC-SHA256 signature for client mutation payloads
   */
  public static generateSignature(data: {
    operationId: string;
    deviceId: string;
    sequenceNumber: number;
    entityId: string;
    clientTimestamp: string;
    payload: Record<string, any>;
  }): string {
    const rawString = `${data.operationId}:${data.deviceId}:${data.sequenceNumber}:${data.entityId}:${data.clientTimestamp}:${JSON.stringify(data.payload)}`;
    return crypto.createHmac('sha256', this.SECRET).update(rawString).digest('hex');
  }

  /**
   * Verifies HMAC signature of incoming operation
   */
  public static verifySignature(data: {
    operationId: string;
    deviceId: string;
    sequenceNumber: number;
    entityId: string;
    clientTimestamp: string;
    payload: Record<string, any>;
    hmacSignature: string;
  }): boolean {
    const expected = this.generateSignature(data);
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(data.hmacSignature);

    if (expectedBuf.length !== actualBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  /**
   * Creates a signed offline rule package
   */
  public static createSignedRulePackage(versionTag: string, rules: Record<string, any>): {
    hash: string;
    signature: string;
  } {
    const jsonStr = JSON.stringify(rules);
    const hash = crypto.createHash('sha256').update(jsonStr).digest('hex');
    const signature = crypto.createHmac('sha256', this.SECRET).update(`${versionTag}:${hash}`).digest('hex');
    return { hash, signature };
  }
}
