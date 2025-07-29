'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/lib/constants/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
  requireMfa?: boolean;
  requireFreshSession?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  requireMfa = false,
  requireFreshSession = false,
  fallback,
  redirectTo,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isAuthenticated,
    isLoading,
    user,
    hasRole,
    hasPermission,
    hasAnyPermission,
    isMfaEnabled,
    requiresReauth,
    canAccessResource,
  } = useAuth();

  const [authCheck, setAuthCheck] = useState<{
    passed: boolean;
    reason?: string;
    action?: 'login' | 'unauthorized' | 'mfa' | 'reauth';
  }>({ passed: false });

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (!isAuthenticated) {
      setAuthCheck({
        passed: false,
        reason: 'Authentication required',
        action: 'login',
      });
      return;
    }

    // Check role authorization
    if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some(role => hasRole(role));
      if (!hasRequiredRole) {
        setAuthCheck({
          passed: false,
          reason: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          action: 'unauthorized',
        });
        return;
      }
    }

    // Check permission authorization
    if (requiredPermissions.length > 0) {
      const hasRequiredPermission = hasAnyPermission(requiredPermissions);
      if (!hasRequiredPermission) {
        setAuthCheck({
          passed: false,
          reason: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
          action: 'unauthorized',
        });
        return;
      }
    }

    // Check MFA requirement
    if (requireMfa && !isMfaEnabled) {
      setAuthCheck({
        passed: false,
        reason: 'Multi-factor authentication required',
        action: 'mfa',
      });
      return;
    }

    // Check session freshness
    if (requireFreshSession && requiresReauth) {
      setAuthCheck({
        passed: false,
        reason: 'Recent authentication required for this action',
        action: 'reauth',
      });
      return;
    }

    // All checks passed
    setAuthCheck({ passed: true });
  }, [
    isLoading,
    isAuthenticated,
    allowedRoles,
    requiredPermissions,
    requireMfa,
    requireFreshSession,
    hasRole,
    hasAnyPermission,
    isMfaEnabled,
    requiresReauth,
  ]);

  // Handle redirects
  useEffect(() => {
    if (authCheck.passed || isLoading) return;

    const handleRedirect = () => {
      switch (authCheck.action) {
        case 'login':
          const loginUrl =
            redirectTo ||
            `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
          router.push(loginUrl);
          break;
        case 'unauthorized':
          router.push('/unauthorized');
          break;
        case 'mfa':
          router.push(
            `/auth/setup-2fa?redirect=${encodeURIComponent(pathname)}`
          );
          break;
        case 'reauth':
          router.push(`/auth/reauth?redirect=${encodeURIComponent(pathname)}`);
          break;
        default:
          router.push(ROUTES.HOME);
      }
    };

    // Small delay to prevent flashing
    const timer = setTimeout(handleRedirect, 100);
    return () => clearTimeout(timer);
  }, [authCheck, isLoading, router, pathname, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Verifying access..." />
      </div>
    );
  }

  // Show fallback or error message while redirecting
  if (!authCheck.passed) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <Shield className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Access Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {authCheck.reason || 'Verifying your access permissions...'}
            </p>
            <LoadingSpinner size="sm" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
