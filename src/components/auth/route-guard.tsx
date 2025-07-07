'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES, USER_ROLES } from '@/constants';
import { PermissionChecker } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

export function RouteGuard({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = ROUTES.LOGIN,
  requireAuth = true,
}: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const redirectUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
      return;
    }

    // Check role and permission requirements
    if (isAuthenticated && user) {
      const permissionChecker = new PermissionChecker(
        user.permissions || [],
        user.roles || [user.userType]
      );

      // Check required roles
      if (
        requiredRoles.length > 0 &&
        !permissionChecker.hasAnyRole(requiredRoles)
      ) {
        router.replace(fallbackPath);
        return;
      }

      // Check required permissions
      if (
        requiredPermissions.length > 0 &&
        !permissionChecker.hasAnyPermission(requiredPermissions)
      ) {
        router.replace(fallbackPath);
        return;
      }
    }
  }, [
    isAuthenticated,
    user,
    isLoading,
    isInitialized,
    pathname,
    router,
    requiredRoles,
    requiredPermissions,
    fallbackPath,
    requireAuth,
  ]);

  // Show loading while checking authentication
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Don't render children if requirements are not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (isAuthenticated && user) {
    const permissionChecker = new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );

    if (
      requiredRoles.length > 0 &&
      !permissionChecker.hasAnyRole(requiredRoles)
    ) {
      return null;
    }

    if (
      requiredPermissions.length > 0 &&
      !permissionChecker.hasAnyPermission(requiredPermissions)
    ) {
      return null;
    }
  }

  return <>{children}</>;
}
