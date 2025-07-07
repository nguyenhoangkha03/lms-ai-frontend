import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG, ROUTES, USER_ROLES } from '@/constants';

// Define protected routes for each role with granular control
const protectedRoutes = {
  [USER_ROLES.STUDENT]: [
    '/student',
    '/courses/*/lessons/*', // Student can access lesson player
    '/assessments/*/take', // Student can take assessments
  ],
  [USER_ROLES.TEACHER]: [
    '/teacher',
    '/courses/create',
    '/courses/*/edit',
    '/assessments/create',
    '/live-sessions',
  ],
  [USER_ROLES.ADMIN]: ['/admin', '/admin/*'],
  // Shared protected routes (any authenticated user)
  shared: ['/profile', '/settings', '/chat', '/notifications'],
};

const publicRoutes = [
  '/',
  '/about',
  '/features',
  '/pricing',
  '/contact',
  '/courses', // Public course catalog
  '/courses/*', // Public course details (but not lessons)
  '/search',
  '/help',
  '/terms',
  '/privacy',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/maintenance',
  '/404',
  '/403',
  '/500',
];

// API routes that don't need authentication
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/auth/refresh',
  '/api/courses', // Public course listing
  '/api/categories', // Public categories
  '/api/search', // Public search
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_CONFIG.tokenKey)?.value;
  const userRole = request.cookies.get('user_role')?.value;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/webhook') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    return handleApiRoutes(request, pathname, token, userRole);
  }

  // Handle page routes
  return handlePageRoutes(request, pathname, token, userRole);
}

function handleApiRoutes(
  request: NextRequest,
  pathname: string,
  token?: string,
  userRole?: string
): NextResponse {
  // Check if API route is public
  const isPublicApiRoute = publicApiRoutes.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '.*');
      return new RegExp(`^${pattern}`).test(pathname);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  // Require authentication for protected API routes
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify token validity (basic check)
  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Check role-based API access
  if (userRole && !hasApiAccess(pathname, userRole)) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

function handlePageRoutes(
  request: NextRequest,
  pathname: string,
  token?: string,
  userRole?: string
): NextResponse {
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => {
    if (route.includes('*')) {
      // Handle wildcard routes
      const pattern = route.replace('*', '.*');
      return new RegExp(`^${pattern}`).test(pathname);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Allow access to public routes
  if (isPublicRoute) {
    // Redirect authenticated users away from auth pages
    if (token && isAuthPage(pathname)) {
      const dashboardRoute = getDashboardRoute(userRole);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
    return NextResponse.next();
  }

  // Check if route requires authentication
  const requiresAuth = isProtectedRoute(pathname);

  if (requiresAuth && !token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token validity
  if (token && !isValidToken(token)) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('reason', 'token_expired');

    const response = NextResponse.redirect(loginUrl);
    // Clear invalid token
    response.cookies.delete(AUTH_CONFIG.tokenKey);
    response.cookies.delete('user_role');

    return response;
  }

  // Check role-based access
  if (token && userRole && !hasRouteAccess(pathname, userRole)) {
    // Redirect to appropriate dashboard or forbidden page
    if (isUserDashboardRoute(pathname, userRole)) {
      const dashboardRoute = getDashboardRoute(userRole);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    } else {
      return NextResponse.redirect(new URL(ROUTES.FORBIDDEN, request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();

  // Add security headers for authenticated routes
  if (token) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  return response;
}

function isValidToken(token: string): boolean {
  try {
    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if token is expired
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    return payload.exp > currentTime;
  } catch {
    return false;
  }
}

function isAuthPage(pathname: string): boolean {
  const authPages = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];
  return authPages.includes(pathname);
}

function isProtectedRoute(pathname: string): boolean {
  const allProtectedRoutes = [
    ...protectedRoutes[USER_ROLES.STUDENT],
    ...protectedRoutes[USER_ROLES.TEACHER],
    ...protectedRoutes[USER_ROLES.ADMIN],
    ...protectedRoutes.shared,
  ];

  return allProtectedRoutes.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function hasRouteAccess(pathname: string, userRole: string): boolean {
  // Check shared routes first
  const hasSharedAccess = protectedRoutes.shared.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (hasSharedAccess) return true;

  // Check role-specific routes
  const roleRoutes = protectedRoutes[userRole as keyof typeof protectedRoutes];
  if (!roleRoutes) return false;

  return roleRoutes.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '[^/]+');
      return new RegExp(`^${pattern}$`).test(pathname);
    }
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

function hasApiAccess(pathname: string, userRole: string): boolean {
  // Admin has access to all API routes
  if (userRole === USER_ROLES.ADMIN) return true;

  // Define API access rules
  const apiAccessRules = {
    [USER_ROLES.STUDENT]: [
      '/api/courses',
      '/api/lessons',
      '/api/assessments',
      '/api/progress',
      '/api/chat',
      '/api/notifications',
      '/api/user/profile',
      '/api/user/preferences',
      '/api/enrollments',
      '/api/ai/recommendations',
      '/api/ai/chatbot',
    ],
    [USER_ROLES.TEACHER]: [
      '/api/courses',
      '/api/lessons',
      '/api/assessments',
      '/api/progress',
      '/api/chat',
      '/api/notifications',
      '/api/user/profile',
      '/api/user/preferences',
      '/api/teacher/*',
      '/api/students',
      '/api/analytics',
      '/api/video-sessions',
      '/api/ai/*',
    ],
  };

  const allowedRoutes =
    apiAccessRules[userRole as keyof typeof apiAccessRules] || [];

  return allowedRoutes.some(route => {
    if (route.includes('*')) {
      const pattern = route.replace('*', '.*');
      return new RegExp(`^${pattern}`).test(pathname);
    }
    return pathname.startsWith(route);
  });
}

function isUserDashboardRoute(pathname: string, userRole: string): boolean {
  const dashboardRoutes = {
    [USER_ROLES.STUDENT]: '/student',
    [USER_ROLES.TEACHER]: '/teacher',
    [USER_ROLES.ADMIN]: '/admin',
  };

  const userDashboard =
    dashboardRoutes[userRole as keyof typeof dashboardRoutes];
  return userDashboard && pathname.startsWith(userDashboard);
}

function getDashboardRoute(userRole?: string): string {
  switch (userRole) {
    case USER_ROLES.STUDENT:
      return ROUTES.STUDENT.DASHBOARD;
    case USER_ROLES.TEACHER:
      return ROUTES.TEACHER.DASHBOARD;
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN.DASHBOARD;
    default:
      return ROUTES.LOGIN;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
