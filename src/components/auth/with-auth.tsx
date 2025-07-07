'use client';

import { ComponentType } from 'react';
import { RouteGuard } from './route-guard';
import { ROUTES, USER_ROLES } from '@/constants';

interface WithAuthOptions {
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
  requireAuth?: boolean;
}

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <RouteGuard {...options}>
        <Component {...props} />
      </RouteGuard>
    );
  };

  AuthenticatedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;

  return AuthenticatedComponent;
}

// Specific HOCs for different roles
export const withStudentAuth = <P extends object>(
  Component: ComponentType<P>
) =>
  withAuth(Component, {
    requiredRoles: [USER_ROLES.STUDENT],
    fallbackPath: ROUTES.LOGIN,
  });

export const withTeacherAuth = <P extends object>(
  Component: ComponentType<P>
) =>
  withAuth(Component, {
    requiredRoles: [USER_ROLES.TEACHER],
    fallbackPath: ROUTES.LOGIN,
  });

export const withAdminAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, {
    requiredRoles: [USER_ROLES.ADMIN],
    fallbackPath: ROUTES.FORBIDDEN,
  });
