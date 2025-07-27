import { useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { RBACSystem, AccessContext } from '@/lib/auth/rbac';

export function useRBAC() {
  const { user, isAuthenticated } = useAuth();

  const createAccessContext = useCallback(
    (additionalContext?: Partial<AccessContext>): AccessContext => {
      return {
        user: {
          id: user?.id || '',
          userType: user?.userType || '',
          organizationId: user?.organizationId,
          departmentId: user?.departmentId,
          metadata: user?.metadata,
        },
        environment: {
          timestamp: new Date(),
          sessionId: user?.sessionId,
          ...additionalContext?.environment,
        },
        ...additionalContext,
      };
    },
    [user]
  );

  const hasPermission = useCallback(
    (permissionId: string, context?: Partial<AccessContext>): boolean => {
      if (!isAuthenticated || !user?.id) return false;

      const accessContext = createAccessContext(context);
      return RBACSystem.hasPermission(user.id, permissionId, accessContext);
    },
    [isAuthenticated, user?.id, createAccessContext]
  );

  const hasAnyPermission = useCallback(
    (permissionIds: string[], context?: Partial<AccessContext>): boolean => {
      if (!isAuthenticated || !user?.id) return false;

      const accessContext = createAccessContext(context);
      return RBACSystem.hasAnyPermission(user.id, permissionIds, accessContext);
    },
    [isAuthenticated, user?.id, createAccessContext]
  );

  const hasAllPermissions = useCallback(
    (permissionIds: string[], context?: Partial<AccessContext>): boolean => {
      if (!isAuthenticated || !user?.id) return false;

      const accessContext = createAccessContext(context);
      return RBACSystem.hasAllPermissions(
        user.id,
        permissionIds,
        accessContext
      );
    },
    [isAuthenticated, user?.id, createAccessContext]
  );

  const hasRole = useCallback(
    (roleId: string): boolean => {
      if (!isAuthenticated || !user?.id) return false;
      return RBACSystem.hasRole(user.id, roleId);
    },
    [isAuthenticated, user?.id]
  );

  const hasAnyRole = useCallback(
    (roleIds: string[]): boolean => {
      if (!isAuthenticated || !user?.id) return false;
      return RBACSystem.hasAnyRole(user.id, roleIds);
    },
    [isAuthenticated, user?.id]
  );

  const canAccessResource = useCallback(
    (
      resource: string,
      action: string,
      context?: Partial<AccessContext>
    ): boolean => {
      if (!isAuthenticated || !user?.id) return false;

      const accessContext = createAccessContext(context);
      return RBACSystem.canAccessResource(
        user.id,
        resource,
        action,
        accessContext
      );
    },
    [isAuthenticated, user?.id, createAccessContext]
  );

  const hasRoleHierarchy = useCallback(
    (requiredLevel: number): boolean => {
      if (!isAuthenticated || !user?.id) return false;
      return RBACSystem.hasRoleHierarchy(user.id, requiredLevel);
    },
    [isAuthenticated, user?.id]
  );

  const userRoles = useMemo(() => {
    if (!isAuthenticated || !user?.id) return [];
    return RBACSystem.getUserRoles(user.id);
  }, [isAuthenticated, user?.id]);

  const userPermissions = useMemo(() => {
    if (!isAuthenticated || !user?.id) return [];
    return RBACSystem.getUserPermissions(user.id);
  }, [isAuthenticated, user?.id]);

  const getAccessReport = useCallback(() => {
    if (!isAuthenticated || !user?.id) return null;
    return RBACSystem.generateAccessReport(user.id);
  }, [isAuthenticated, user?.id]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    hasRole,
    hasAnyRole,
    hasRoleHierarchy,

    canAccessResource,

    userRoles,
    userPermissions,

    createAccessContext,
    getAccessReport,

    isStudent: hasRole('student'),
    isTeacher: hasRole('teacher'),
    isAdmin: hasRole('admin'),
    canManageUsers: hasPermission('user.manage_roles'),
    canCreateCourses: hasPermission('course.create'),
    canGradeAssessments: hasPermission('assessment.grade'),
  };
}

export function usePermissionCheck(
  permissionId: string,
  context?: Partial<AccessContext>
) {
  const { hasPermission } = useRBAC();
  return hasPermission(permissionId, context);
}

export function useRoleCheck(roleId: string) {
  const { hasRole } = useRBAC();
  return hasRole(roleId);
}

export function useResourceAccess(
  resource: string,
  action: string,
  context?: Partial<AccessContext>
) {
  const { canAccessResource } = useRBAC();
  return canAccessResource(resource, action, context);
}
