'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface WithAuthOptions {
  allowedRoles?: string[];
  requiredPermissions?: string[];
  requireMfa?: boolean;
  requireFreshSession?: boolean;
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}
