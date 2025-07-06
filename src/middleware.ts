import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { AUTH_CONFIG, ROUTES, USER_ROLES } from './constants';

const protectedRoutes = {
  [USER_ROLES.STUDENT]: ['/student'],
  [USER_ROLES.TEACHER]: ['/teacher'],
  [USER_ROLES.ADMIN]: ['/admin'],
};

const publicRoutes = [
  '/',
  '/about',
  '/features',
  '/pricing',
  '/contact',
  '/courses',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_CONFIG.tokenKey)?.value;
  const userRole = request.cookies.get('user_role')?.value;

  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (userRole) {
    const allowedRoutes =
      protectedRoutes[userRole as keyof typeof protectedRoutes];
    const hasAccess = allowedRoutes?.some(route => pathname.startsWith(route));

    if (!hasAccess) {
      const dashboardRoute = getDashboardRoute(userRole);
      return NextResponse.redirect(new URL(dashboardRoute, request.url));
    }
  }

  return NextResponse.next();
}

function getDashboardRoute(role: string): string {
  switch (role) {
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
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
