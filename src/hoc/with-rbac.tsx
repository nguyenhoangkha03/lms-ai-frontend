'use client';

import React from 'react';
import { RBACGuard } from '@/components/auth/rbac-guard';
import { AccessContext } from '@/lib/auth/rbac';

interface WithRBACOptions {
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

export function withRBAC<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithRBACOptions = {}
) {
  const RBACProtectedComponent = (props: P) => {
    return (
      <RBACGuard {...options}>
        <WrappedComponent {...props} />
      </RBACGuard>
    );
  };

  RBACProtectedComponent.displayName = `withRBAC(${WrappedComponent.displayName || WrappedComponent.name})`;

  return RBACProtectedComponent;
}
