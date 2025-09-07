import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { ROUTES, USER_ROLES } from '@/lib/constants/constants';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

interface RouteConfig {
  path: string;
  allowedRoles: string[];
  requiresAuth: boolean;
  isPublic?: boolean;
}

// Performance and security headers
const performanceHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// Route configurations
const routeConfigs: RouteConfig[] = [
  { path: '/', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/about', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/features', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/pricing', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/contact', allowedRoles: [], requiresAuth: false, isPublic: true },
  { path: '/courses', allowedRoles: [], requiresAuth: false, isPublic: true },

  { path: '/login', allowedRoles: [], requiresAuth: false },
  { path: '/register', allowedRoles: [], requiresAuth: false },
  { path: '/forgot-password', allowedRoles: [], requiresAuth: false },
  { path: '/reset-password', allowedRoles: [], requiresAuth: false },
  { path: '/verify-email', allowedRoles: [], requiresAuth: false },

  {
    path: '/student',
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
  {
    path: '/student/ai-chat',
    allowedRoles: [USER_ROLES.STUDENT],
    requiresAuth: true,
  },

  {
    path: '/teacher',
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

  { path: '/admin', allowedRoles: [USER_ROLES.ADMIN], requiresAuth: true },
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
  {
    path: '/admin/teacher-applications',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/security',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/ai-management',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/ml-management',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/content',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/communication',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/financial',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/system',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/monitoring',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/privacy-compliance',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/assessments',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/file-management',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/notification-management',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/system-configuration',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/cache-database-management',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },
  {
    path: '/admin/backup-maintenance',
    allowedRoles: [USER_ROLES.ADMIN],
    requiresAuth: true,
  },

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

// Cache control headers for different asset types
const getCacheHeaders = (pathname: string) => {
  // Static assets - long cache
  if (
    pathname.includes('/_next/static') ||
    pathname.includes('/images') ||
    pathname.includes('/icons') ||
    pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2|ttf|eot)$/)
  ) {
    return {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, max-age=31536000',
    };
  }

  // API routes - short cache with stale-while-revalidate
  if (pathname.startsWith('/api/')) {
    return {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      'CDN-Cache-Control': 'public, max-age=300',
    };
  }

  // Dynamic pages - moderate cache
  return {
    'Cache-Control': 'public, max-age=0, stale-while-revalidate=60',
    'CDN-Cache-Control': 'public, max-age=60',
  };
};

// Compression settings
const getCompressionHeaders = (userAgent: string) => {
  const headers: Record<string, string> = {};

  // Enable Brotli compression for supported browsers
  if (
    userAgent.includes('Chrome') ||
    userAgent.includes('Firefox') ||
    userAgent.includes('Safari')
  ) {
    headers['Accept-Encoding'] = 'br, gzip, deflate';
  }

  return headers;
};

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const rateLimit = (
  ip: string,
  limit: number = 100,
  windowMs: number = 60000
) => {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / windowMs)}`;

  const current = rateLimitStore.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  };
  current.count++;

  rateLimitStore.set(key, current);

  // Cleanup old entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }

  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    resetTime: current.resetTime,
  };
};

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

  // Find the most specific matching route (longest path that matches)
  let bestMatch: RouteConfig | null = null;
  let bestMatchLength = 0;

  for (const route of routeConfigs) {
    // Convert route pattern to regex
    const pattern = route.path.replace(/\[.*?\]/g, '[^/]+');
    const regex = new RegExp(`^${pattern}(/.*)?$`);

    if (regex.test(pathname) && route.path.length > bestMatchLength) {
      bestMatch = route;
      bestMatchLength = route.path.length;
    }
  }

  return bestMatch;
}

function getRedirectUrl(
  userRole: string | null,
  requestedPath: string
): string {
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

  return `${ROUTES.LOGIN}?redirect=${encodeURIComponent(requestedPath)}`;
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';
  const ip =
    request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Skip middleware for certain paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('/sw.js') ||
    pathname.includes('/manifest.json')
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const limit = rateLimit(ip.toString(), 100, 60000); // 100 requests per minute

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', limit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', limit.resetTime.toString());

    if (!limit.allowed) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            (limit.resetTime - Date.now()) / 1000
          ).toString(),
        },
      });
    }
  }

  const routeConfig = findRouteConfig(pathname);

  if (!routeConfig) {
    const response = NextResponse.next();

    // Add performance headers
    Object.entries(performanceHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add cache headers
    const cacheHeaders = getCacheHeaders(pathname);
    Object.entries(cacheHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }

  // Try multiple sources for token (cookies first, then headers)
  const cookieToken = request.cookies.get('access-token')?.value;
  const legacyCookieToken = request.cookies.get('auth_token')?.value;
  const headerToken = request.headers
    .get('authorization')
    ?.replace('Bearer ', '');

  const authToken = cookieToken || legacyCookieToken || headerToken;

  let userPayload: any = null;

  if (authToken) {
    userPayload = await verifyToken(authToken);
  }

  const isAuthenticated = !!userPayload;
  const userRole = userPayload?.userType || null;
  const userId = userPayload?.sub || userPayload?.id || null;

  // Create response
  let response: NextResponse;

  if (routeConfig.isPublic) {
    response = NextResponse.next();
    if (isAuthenticated) {
      response.headers.set('x-user-id', userId);
      response.headers.set('x-user-role', userRole);
    }
  } else if (
    ['/login', '/register', '/forgot-password', '/reset-password'].includes(
      pathname
    )
  ) {
    if (isAuthenticated) {
      const redirectUrl = getRedirectUrl(userRole, pathname);
      response = NextResponse.redirect(new URL(redirectUrl, request.url));
    } else {
      response = NextResponse.next();
    }
  } else if (routeConfig.requiresAuth) {
    if (!isAuthenticated) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      response = NextResponse.redirect(loginUrl);
    } else if (
      routeConfig.allowedRoles.length > 0 &&
      !routeConfig.allowedRoles.includes(userRole)
    ) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      response = NextResponse.redirect(unauthorizedUrl);
    } else {
      response = NextResponse.next();
      response.headers.set('x-user-id', userId);
      response.headers.set('x-user-role', userRole);
      response.headers.set('x-user-authenticated', 'true');

      // If token found in cookies but potentially not in localStorage, hint client to sync
      if (cookieToken && !headerToken) {
        response.headers.set(
          'x-token-sync',
          cookieToken.substring(0, 20) + '...'
        );
        response.headers.set('x-refresh-token-available', 'true');
      }
    }
  } else {
    response = NextResponse.next();
  }

  // Add performance headers to all responses
  Object.entries(performanceHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add cache headers
  const cacheHeaders = getCacheHeaders(pathname);
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add compression headers
  const compressionHeaders = getCompressionHeaders(userAgent);
  Object.entries(compressionHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add preload hints for critical resources on key pages
  if (pathname === '/' || pathname === '/dashboard') {
    response.headers.set(
      'Link',
      [
        '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
        '</images/logo.png>; rel=preload; as=image',
        '</_next/static/css/app.css>; rel=preload; as=style',
      ].join(', ')
    );
  }

  // Add Early Hints for better performance on homepage
  if (pathname === '/') {
    const existingLink = response.headers.get('Link') || '';
    const prefetchLinks = [
      '</api/v1/courses>; rel=prefetch',
      '</dashboard>; rel=prefetch',
    ].join(', ');

    response.headers.set(
      'Link',
      existingLink ? `${existingLink}, ${prefetchLinks}` : prefetchLinks
    );
  }

  // Performance timing
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    '/api/:path*',
  ],
};
