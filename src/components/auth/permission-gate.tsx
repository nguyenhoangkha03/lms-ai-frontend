'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/auth/use-permissions';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PermissionGateProps {
  permissions?: string[];
  roles?: string[];
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
  requireAll?: boolean;
}

export function PermissionGate({
  permissions = [],
  roles = [],
  children,
  fallback,
  showFallback = false,
  requireAll = false,
}: PermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole } = usePermissions();

  // Check permissions
  let hasPermissionAccess = true;
  if (permissions.length > 0) {
    hasPermissionAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // Check roles
  let hasRoleAccess = true;
  if (roles.length > 0) {
    hasRoleAccess = hasAnyRole(roles);
  }

  const hasAccess = hasPermissionAccess && hasRoleAccess;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showFallback) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access this content.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
