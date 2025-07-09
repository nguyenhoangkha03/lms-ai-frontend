import { useAuth } from './use-auth';
import { PermissionChecker } from '@/lib/auth/permissions';
import { useMemo } from 'react';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const permissionChecker = useMemo(() => {
    if (!isAuthenticated || !user) {
      return new PermissionChecker();
    }

    return new PermissionChecker(
      user.permissions || [],
      user.roles || [user.userType]
    );
  }, [user, isAuthenticated]);

  return {
    hasPermission: permissionChecker.hasPermission.bind(permissionChecker),
    hasAnyPermission:
      permissionChecker.hasAnyPermission.bind(permissionChecker),
    hasAllPermissions:
      permissionChecker.hasAllPermissions.bind(permissionChecker),
    hasRole: permissionChecker.hasRole.bind(permissionChecker),
    hasAnyRole: permissionChecker.hasAnyRole.bind(permissionChecker),
    canAccess: permissionChecker.canAccess.bind(permissionChecker),
    canCreate: permissionChecker.canCreate.bind(permissionChecker),
    canRead: permissionChecker.canRead.bind(permissionChecker),
    canUpdate: permissionChecker.canUpdate.bind(permissionChecker),
    canDelete: permissionChecker.canDelete.bind(permissionChecker),
    isAdmin: permissionChecker.isAdmin.bind(permissionChecker),
    isTeacher: permissionChecker.isTeacher.bind(permissionChecker),
    isStudent: permissionChecker.isStudent.bind(permissionChecker),
  };
};
