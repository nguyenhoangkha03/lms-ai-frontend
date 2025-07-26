import { NextRequest } from 'next/server';

export class AuthMiddlewareUtils {
  private static readonly RATE_LIMIT_ATTEMPTS = 5;
  private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000;
  private static rateLimitStore = new Map<
    string,
    { attempts: number; resetTime: number }
  >();

  static isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(ip);

    if (!record) {
      return false;
    }

    if (now > record.resetTime) {
      this.rateLimitStore.delete(ip);
      return false;
    }

    return record.attempts >= this.RATE_LIMIT_ATTEMPTS;
  }

  static recordFailedAttempt(ip: string): void {
    const now = Date.now();
    const record = this.rateLimitStore.get(ip);

    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(ip, {
        attempts: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW,
      });
    } else {
      record.attempts++;
    }
  }

  static clearFailedAttempts(ip: string): void {
    this.rateLimitStore.delete(ip);
  }

  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    if (realIP) {
      return realIP;
    }

    return request.ip || '127.0.0.1';
  }

  static requiresFreshSession(
    lastActivity: string,
    maxAge: number = 30 * 60 * 1000
  ): boolean {
    if (!lastActivity) return true;

    const lastActivityTime = new Date(lastActivity).getTime();
    const now = Date.now();

    return now - lastActivityTime > maxAge;
  }

  static isTrustedDevice(request: NextRequest, userId: string): boolean {
    const deviceFingerprint = this.generateDeviceFingerprint(request);
    const trustedDevices = this.getTrustedDevices(userId);

    return trustedDevices.includes(deviceFingerprint);
  }

  private static generateDeviceFingerprint(request: NextRequest): string {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';

    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return hash.toString(36);
  }

  private static getTrustedDevices(userId: string): string[] {
    return [];
  }

  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }

  static logSecurityEvent(event: {
    type:
      | 'login'
      | 'logout'
      | 'failed_login'
      | 'unauthorized_access'
      | 'token_refresh';
    userId?: string;
    ip: string;
    userAgent: string;
    path: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }): void {
    console.log('Security Event:', {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });
    if (event.type === 'unauthorized_access') {
      this.triggerSecurityAlert(event);
    }
  }

  private static triggerSecurityAlert(event: any): void {
    console.warn('SECURITY ALERT:', event);
  }
}
