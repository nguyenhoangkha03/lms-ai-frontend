import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { RBACSystem } from './rbac';

/**
 * Hook to sync user roles with RBAC system
 */
export function useRBACSync() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Sync user roles from auth context to RBAC system
      const userRoles = user.roles; // Base role from user type

      // Add additional roles if they exist in user object
      if (user.roles && Array.isArray(user.roles)) {
        userRoles.push(...user.roles);
      }

      RBACSystem.setUserRoles(user.id, userRoles);
    }
  }, [isAuthenticated, user]);
}

/**
 * Initialize RBAC system with user data
 */
export function initializeRBAC(userData: any) {
  if (userData?.id) {
    const roles = [userData.userType];
    if (userData.roles) {
      roles.push(...userData.roles);
    }
    RBACSystem.setUserRoles(userData.id, roles);
  }
}
