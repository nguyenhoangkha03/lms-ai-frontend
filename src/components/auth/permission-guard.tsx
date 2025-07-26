'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  permissions: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback,
  showFallback = true,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission } = useAuth();

  const hasRequiredPermissions = requireAll
    ? permissions.every(permission => hasPermission(permission))
    : hasAnyPermission(permissions);

  if (!hasRequiredPermissions) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showFallback) {
      return null;
    }

    return (
      <Card className="border-muted-foreground/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-muted-foreground">
              Insufficient Permissions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {requireAll ? 'All of the following' : 'One of the following'}{' '}
            permissions required:{' '}
            <span className="font-medium">{permissions.join(', ')}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
