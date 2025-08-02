import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // javascript object signing and encryption
import { ROUTES, USER_ROLES } from '@/lib/constants/constants';

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'my-secret-key'
);

interface RouteConfig {
  path: string;
  allowedRoles: string[];
  requiresAuth: boolean;
  isPublic?: boolean;
}

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

  //   { path: '/student', allowedRoles: [USER_ROLES.STUDENT], requiresAuth: true },
  //   {
  //     path: '/student/dashboard',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/student/courses',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/student/assignments',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/student/grades',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/student/progress',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/student/ai-tutor',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/student/recommendations',
  //     allowedRoles: [USER_ROLES.STUDENT],
  //     requiresAuth: true,
  //   },

  //   { path: '/teacher', allowedRoles: [USER_ROLES.TEACHER], requiresAuth: true },
  //   {
  //     path: '/teacher/dashboard',
  //     allowedRoles: [USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/teacher/courses',
  //     allowedRoles: [USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/teacher/students',
  //     allowedRoles: [USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/teacher/assessments',
  //     allowedRoles: [USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/teacher/grading',
  //     allowedRoles: [USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },
  //   {
  //     path: '/teacher/analytics',
  //     allowedRoles: [USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },

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

  {
    path: '/learn',
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
    requiresAuth: true,
  },
  //   {
  //     path: '/chat',
  //     allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
  //     requiresAuth: true,
  //   },
  {
    path: '/video',
    allowedRoles: [USER_ROLES.STUDENT, USER_ROLES.TEACHER],
    requiresAuth: true,
  },
];

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
  let config = routeConfigs.find(route => route.path === pathname);
  if (config) return config;

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
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  const routeConfig = findRouteConfig(pathname);

  if (!routeConfig) {
    return NextResponse.next();
  }

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

  if (routeConfig.isPublic) {
    const response = NextResponse.next();
    if (isAuthenticated) {
      response.headers.set('x-user-id', userId);
      response.headers.set('x-user-role', userRole);
    }
    return response;
  }

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

  if (routeConfig.requiresAuth) {
    if (!isAuthenticated) {
      const loginUrl = new URL(ROUTES.LOGIN, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (
      routeConfig.allowedRoles.length > 0 &&
      !routeConfig.allowedRoles.includes(userRole)
    ) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    const response = NextResponse.next();
    response.headers.set('x-user-id', userId);
    response.headers.set('x-user-role', userRole);
    response.headers.set('x-user-authenticated', 'true');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
