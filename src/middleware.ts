import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ROUTES, USER_ROLES } from '@/lib/constants';

// JWT Secret (should be same as backend)
const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key'
);

// Route configuration
interface RouteConfig {
  path: string;
  allowedRoles: string[];
  requiresAuth: boolean;
  isPublic?: boolean;
}

const routeConfigs: RouteConfig[] = [
  // Public routes
  { path: '/', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/about', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/features', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/pricing', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/contact', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/courses', allowedRoles: [], requiresAuth: false, isPublic: true },

  // Auth routes (should redirect if already authenticated)
  { path: '/login', allowedRoles: [], requiresAuth: false },
  { path: '/register', allowedRoles: [], requiresAuth: false },
  { path: '/forgot-password', allowedRoles: [], requiresAuth: false },
  { path: '/reset-password', allowedRoles: [], requiresAuth: false },
  { path: '/verify-email', allowedRoles: [], requiresAuth: false },

  // Student routes
  { path: '/student', allowedRoles: [USER_ROLES.STUDENT], requiresAuth: true },
  {
    path: '/student/dashboard',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },
  {
    path: '/student/courses',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },
  {
    path: '/student/assignments',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },
  {
    path: '/student/grades',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },
  {
    path: '/student/progress',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },
  {
    path: '/student/ai-tutor',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },
  {
    path: '/student/recommendations',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },

  // Teacher routes
  { path: '/teacher', allowedRoles: [USER_ROLES.TEACHER], requiresAuth: true },
  {
    path: '/teacher/dashboard',
    allowedRoles: [USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/teacher/courses',
    allowedRoles: [USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/teacher/students',
    allowedRoles: [USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/teacher/assessments',
    allowedRoles: [USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/teacher/grading',
    allowedRoles: [USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/teacher/analytics',
    allowedRoles: [USER_ROLES.TEACHER],
    requiresAuth: true,
  },

  // Admin routes
  { path: '/admin', allowedRoles: [USER_ROLES.ADMIN], requiresAuth: true },
  {
    path: '/admin/dashboard',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/users',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/courses',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/analytics',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/settings',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },

  // Shared authenticated routes
  {
    path: '/learn',
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/chat',
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  {
    path: '/video',
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
    requiresAuth: true,
  },
];

// Helper functions
async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

function findRouteConfig(pathname: string): RouteConfig | null {
  // Exact match first
  let config = routeConfigs.find(route => route.path === pathname);
  if (config) return config;

  // Pattern matching for parameterized routes
  for (const route of routeConfigs) {
    const pattern = route.path.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}(/.*)?$`);
    if (regex.test(pathname)) {
      return route;
    }
  }

  return null;
}

function getRedirectUrl(
  userRole: string | null,
  requestedPath: string
): string {
  // If user is authenticated but accessing auth pages, redirect to appropriate dashboard
  if (['/login', '/register', '/forgot-password'].includes(requestedPath)) {
    switch (userRole) {
      case USER_ROLES.STUDENT:
        return ROUTES.STUDENT_DASHBOARD;
      case USER_ROLES.TEACHER:
        return ROUTES.TEACHER_DASHBOARD;
      case USER_ROLES.ADMIN:
        return ROUTES.ADMIN_DASHBOARD;
      default:
        return ROUTES.HOME;
    }
  }

  // If user needs authentication, redirect to login
  return `${ROUTES.LOGIN}?redirect=${encodeURIComponent(requestedPath)}`;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Get route configuration
  const routeConfig = findRouteConfig(pathname);

  // If no route config found, allow access (will be handled by 404)
  if (!routeConfig) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const authToken =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  let userPayload: any = null;

  if (authToken) {
    userPayload = await verifyToken(authToken);
  }

  const isAuthenticated = !!userPayload;
  const userRole = userPayload?.userType || null;
  const userId = userPayload?.sub || userPayload?.id || null;

  // Handle public routes
  if (routeConfig.isPublic) {
    // Add user info to headers for public routes that might need it
    const response = NextResponse.next();
    if (isAuthenticated) {
      response.headers.set('x-user-id', userId);
      response.headers.set('x-user-role', userRole);
    }
    return response;
  }

  // Handle auth pages when user is already authenticated
  if (
    ['/login', '/register', '/forgot-password', '/reset-password'].includes(
      pathname
    )
  ) {
    if (isAuthenticated) {
      const redirectUrl = getRedirectUrl(userRole, pathname);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (routeConfig.requiresAuth) {
    if (!isAuthenticated) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role authorization
    if (
      routeConfig.allowedRoles.length > 0 &&
      !routeConfig.allowedRoles.includes(userRole)
    ) {
      // Redirect to appropriate dashboard or unauthorized page
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // Add user info to request headers for server components
    const response = NextResponse.next();
    response.headers.set('x-user-id', userId);
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-authenticated', 'true');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

// src/lib/auth/middleware-utils.ts
export class AuthMiddlewareUtils {
  private static readonly RATE_LIMIT_ATTEMPTS = 5;
  private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private static rateLimitStore = new Map<
    string,
    { attempts: number; resetTime: number }
  >();

  /**
   * Check if IP address is rate limited for authentication attempts
   */
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

  /**
   * Record a failed authentication attempt
   */
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

  /**
   * Clear failed attempts for IP (on successful auth)
   */
  static clearFailedAttempts(ip: string): void {
    this.rateLimitStore.delete(ip);
  }

  /**
   * Get client IP address from request
   */
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

  /**
   * Validate session freshness for sensitive operations
   */
  static requiresFreshSession(
    lastActivity: string,
    maxAge: number = 30 * 60 * 1000
  ): boolean {
    if (!lastActivity) return true;

    const lastActivityTime = new Date(lastActivity).getTime();
    const now = Date.now();

    return now - lastActivityTime > maxAge;
  }

  /**
   * Check if user device is trusted
   */
  static isTrustedDevice(request: NextRequest, userId: string): boolean {
    const deviceFingerprint = this.generateDeviceFingerprint(request);
    const trustedDevices = this.getTrustedDevices(userId);

    return trustedDevices.includes(deviceFingerprint);
  }

  /**
   * Generate device fingerprint for device trust
   */
  private static generateDeviceFingerprint(request: NextRequest): string {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';

    const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;

    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return hash.toString(36);
  }

  /**
   * Get trusted devices for user (placeholder - should query database)
   */
  private static getTrustedDevices(userId: string): string[] {
    // In a real implementation, this would query the database
    // for user's trusted devices
    return [];
  }

  /**
   * Security headers for enhanced protection
   */
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

  /**
   * Audit logging for security events
   */
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
    // In production, send to logging service (e.g., CloudWatch, Datadog)
    console.log('Security Event:', {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    // For high-priority events, trigger alerts
    if (event.type === 'unauthorized_access') {
      this.triggerSecurityAlert(event);
    }
  }

  /**
   * Trigger security alerts for critical events
   */
  private static triggerSecurityAlert(event: any): void {
    // In production, integrate with alerting systems
    console.warn('SECURITY ALERT:', event);
  }
}
