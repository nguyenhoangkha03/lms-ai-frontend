'use client';

import React from 'react';
import { RoleGuard } from '@/components/auth/role-guard';

interface WithRoleOptions {
  allowedRoles: string[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithRoleOptions
) {
  const RoleRestrictedComponent = (props: P) => {
    return (
      <RoleGuard {...options}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };

  RoleRestrictedComponent.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name})`;

  return RoleRestrictedComponent;
}
