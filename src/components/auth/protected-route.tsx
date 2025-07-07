'use client';

import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallback = <div>Access Denied</div>,
}: ProtectedRouteProps) {
  const { isAuthenticated, checkRole, checkPermission } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  if (requiredRole && !checkRole(requiredRole)) {
    return fallback;
  }

  if (requiredPermission && !checkPermission(requiredPermission)) {
    return fallback;
  }

  return <>{children}</>;
}
