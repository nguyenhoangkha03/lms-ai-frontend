'use client';

import React from 'react';
import { useRBAC } from '@/hooks/use-rbac';
import { AccessContext } from '@/lib/auth/rbac';

interface ConditionalRenderProps {
  children: React.ReactNode;
  condition: 'permission' | 'role' | 'resource' | 'hierarchy';
  value: string | string[] | number;
  context?: Partial<AccessContext>;
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function ConditionalRender({
  children,
  condition,
  value,
  context,
  requireAll = false,
  fallback = null,
}: ConditionalRenderProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canAccessResource,
    hasRoleHierarchy,
  } = useRBAC();

  let shouldRender = false;

  switch (condition) {
    case 'permission':
      if (Array.isArray(value)) {
        shouldRender = requireAll
          ? hasAllPermissions(value, context)
          : hasAnyPermission(value, context);
      } else {
        shouldRender = hasPermission(value as string, context);
      }
      break;
    case 'role':
      if (Array.isArray(value)) {
        shouldRender = requireAll
          ? value.every(role => hasRole(role))
          : hasAnyRole(value);
      } else {
        shouldRender = hasRole(value as string);
      }
      break;
    case 'resource':
      if (typeof value === 'string' && value.includes(':')) {
        const [resource, action] = value.split(':');
        shouldRender = canAccessResource(resource, action, context);
      }
      break;
    case 'hierarchy':
      if (typeof value === 'number') {
        shouldRender = hasRoleHierarchy(value);
      }
      break;
  }

  return shouldRender ? <>{children}</> : <>{fallback}</>;
}
