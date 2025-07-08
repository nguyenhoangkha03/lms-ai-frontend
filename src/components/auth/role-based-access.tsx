'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PermissionChecker } from '@/lib/auth/permissions';
import { USER_ROLES } from '@/constants';

interface RoleBasedAccessProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles/permissions
}

export function RoleBasedAccess({
  children,
  roles = [],
  permissions = [],
  fallback = null,
  requireAll = false,
}: RoleBasedAccessProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{fallback}</>;
  }

  const permissionChecker = new PermissionChecker(
    user.permissions || [],
    user.roles || [user.userType]
  );

  // Check roles
  let hasRoleAccess = true;
  if (roles.length > 0) {
    hasRoleAccess = requireAll
      ? roles.every(role => permissionChecker.hasRole(role))
      : roles.some(role => permissionChecker.hasRole(role));
  }

  // Check permissions
  let hasPermissionAccess = true;
  if (permissions.length > 0) {
    hasPermissionAccess = requireAll
      ? permissionChecker.hasAllPermissions(permissions)
      : permissionChecker.hasAnyPermission(permissions);
  }

  if (hasRoleAccess && hasPermissionAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Convenience components for specific roles
export const StudentOnly = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <RoleBasedAccess roles={[USER_ROLES.STUDENT]} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const TeacherOnly = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <RoleBasedAccess roles={[USER_ROLES.TEACHER]} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const AdminOnly = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <RoleBasedAccess roles={[USER_ROLES.ADMIN]} fallback={fallback}>
    {children}
  </RoleBasedAccess>
);

export const TeacherOrAdmin = ({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => (
  <RoleBasedAccess
    roles={[USER_ROLES.TEACHER, USER_ROLES.ADMIN]}
    fallback={fallback}
  >
    {children}
  </RoleBasedAccess>
);
