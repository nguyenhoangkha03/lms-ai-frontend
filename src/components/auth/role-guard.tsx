'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  showFallback = true,
}: RoleGuardProps) {
  const { user, hasRole } = useAuth();

  const hasRequiredRole = allowedRoles.some(role => hasRole(role));

  if (!hasRequiredRole) {
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
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">
              Access Restricted
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            This content is restricted to users with the following roles:{' '}
            <span className="font-medium">{allowedRoles.join(', ')}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Your current role:{' '}
            <span className="font-medium">{user?.userType || 'Unknown'}</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
