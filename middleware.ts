import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // FORCE override all security headers that might block media
  response.headers.delete('permissions-policy');
  response.headers.delete('Permissions-Policy');
  response.headers.delete('feature-policy');
  response.headers.delete('Feature-Policy');
  
  // Set permissive permissions policy
  response.headers.set(
    'Permissions-Policy', 
    'camera=*, microphone=*, display-capture=*, screen-wake-lock=*, geolocation=()'
  );
  
  // Allow same origin frames
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  
  console.log(`Middleware applied to: ${request.nextUrl.pathname}`);
  console.log('Permissions-Policy set to: camera=*, microphone=*');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};