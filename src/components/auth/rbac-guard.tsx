'use client';

import React from 'react';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessContext } from '@/lib/auth/rbac';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock } from 'lucide-react';

interface RBACGuardProps {
  children: React.ReactNode;
  permissions?: string[];
  roles?: string[];
  resource?: string;
  action?: string;
  requireAll?: boolean;
  context?: Partial<AccessContext>;
  fallback?: React.ReactNode;
  showFallback?: boolean;
  hierarchyLevel?: number;
}

export function RBACGuard({
  children,
  permissions = [],
  roles = [],
  resource,
  action,
  requireAll = false,
  context,
  fallback,
  showFallback = true,
  hierarchyLevel,
}: RBACGuardProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource,
    hasRoleHierarchy,
  } = useRBAC();

  let hasAccess = true;

  // Check permissions
  if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && hasAllPermissions(permissions, context);
    } else {
      hasAccess = hasAccess && hasAnyPermission(permissions, context);
    }
  }

  // Check roles
  if (roles.length > 0) {
    if (requireAll) {
      hasAccess = hasAccess && roles.every(role => hasRole(role));
    } else {
      hasAccess = hasAccess && hasAnyRole(roles);
    }
  }

  // Check resource access
  if (resource && action) {
    hasAccess = hasAccess && canAccessResource(resource, action, context);
  }

  // Check hierarchy level
  if (hierarchyLevel !== undefined) {
    hasAccess = hasAccess && hasRoleHierarchy(hierarchyLevel);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <Card className="border-destructive/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">
              Access Restricted
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have the necessary permissions to access this content.
          </p>
          {permissions.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Required permissions: {permissions.join(', ')}
            </p>
          )}
          {roles.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              Required roles: {roles.join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
