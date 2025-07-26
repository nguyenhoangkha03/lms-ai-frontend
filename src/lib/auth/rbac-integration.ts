import { useEffect } from 'react';
import { RBACSystem } from './rbac';

export function useRBACSync(
  user: { id: string; roles?: string[] } | null,
  isAuthenticated: boolean
) {
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const roles = Array.isArray(user.roles) ? user.roles : [];
      RBACSystem.setUserRoles(user.id, roles);
    }
  }, [isAuthenticated, user]);
}

export function initializeRBAC(userData: any) {
  if (userData?.id) {
    const roles = [userData.userType];
    if (userData.roles) {
      roles.push(...userData.roles);
    }
    RBACSystem.setUserRoles(userData.id, roles);
  }
}
