import crypto from 'crypto';

const SECRET = process.env.REPORT_SECRET || 'default_dev_secret';

export function signReport(payload: object): string {
  const data = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(data);
  return hmac.digest('hex');
}

export function verifyReport(payload: string, sig: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(payload);
    const expectedSig = hmac.digest('hex');
    
    const expectedBuffer = Buffer.from(expectedSig, 'hex');
    const actualBuffer = Buffer.from(sig, 'hex');
    
    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (e) {
    return false;
  }
}
