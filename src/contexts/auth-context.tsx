'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  loginSuccess,
  logout,
  setLoading,
  updateUser,
  sessionExpired,
  refreshTokenSuccess,
  updateLastActivity,
} from '@/lib/redux/slices/auth-slice';
import {
  useCheckAuthQuery,
  useRefreshTokenMutation,
  useLogoutMutation,
} from '@/lib/redux/api/auth-api';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import { useRBACSync } from '@/lib/auth/rbac-integration';
import type { User } from '@/lib/types';
import { toast } from 'sonner';
import { clearAllAuthData } from '@/utils/clear-auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];

  sessionExpiry: string | null;
  lastActivity: string | null;
  isSessionActive: boolean;

  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;

  checkAuth: () => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  logout: (logoutAll?: boolean) => Promise<void>;
  updateUserData: (userData: Partial<User>) => void;

  updateActivity: () => void;
  isActivityTracked: boolean;

  requiresReauth: boolean;
  isMfaEnabled: boolean;
  canAccessResource: (resource: string, action?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  useRBACSync(auth.user, auth.isAuthenticated);

  const [isActivityTracked, setIsActivityTracked] = useState(false);
  const [requiresReauth, setRequiresReauth] = useState(false);

  const { refetch: checkAuthQuery } = useCheckAuthQuery(undefined, {
    skip: true, // Skip automatic execution, we'll manually trigger when needed
  });
  
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const [logoutMutation] = useLogoutMutation();

  const hasRole = useCallback(
    (role: string): boolean => {
      return auth.user?.userType === role;
    },
    [auth.user?.userType]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return auth.permissions.includes(permission);
    },
    [auth.permissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some(permission =>
        auth.permissions.includes(permission)
      );
    },
    [auth.permissions]
  );

  const canAccessResource = useCallback(
    (resource: string, action = 'read'): boolean => {
      if (!auth.isAuthenticated) return false;

      if (auth.user?.userType === 'admin') return true;

      const resourcePermissions: Record<string, Record<string, string[]>> = {
        courses: {
          read: ['student', 'teacher', 'admin'],
          write: ['teacher', 'admin'],
          delete: ['admin'],
          enroll: ['student'],
        },
        assessments: {
          read: ['student', 'teacher', 'admin'],
          write: ['teacher', 'admin'],
          take: ['student'],
          grade: ['teacher', 'admin'],
        },
        users: {
          read: ['teacher', 'admin'],
          write: ['admin'],
          delete: ['admin'],
        },
        analytics: {
          read: ['teacher', 'admin'],
          write: ['admin'],
        },
        settings: {
          read: ['admin'],
          write: ['admin'],
        },
      };

      const allowedRoles = resourcePermissions[resource]?.[action];
      return allowedRoles?.includes(auth.user?.userType || '') || false;
    },
    [auth.isAuthenticated, auth.user?.userType]
  );

  const checkAuth = useCallback(async (): Promise<boolean> => {
    // If we don't have any tokens, no point in checking auth
    const hasToken = AdvancedTokenManager.getAccessToken();
    if (!hasToken) {
      dispatch(logout());
      return false;
    }

    try {
      dispatch(setLoading(true));
      const result = await checkAuthQuery();

      if (result.data?.isAuthenticated && result.data?.user) {
        dispatch(
          loginSuccess({
            user: result.data.user,
            token: AdvancedTokenManager.getAccessToken() || '',
            refreshToken: AdvancedTokenManager.getRefreshToken() || '',
          })
        );
        return true;
      } else {
        dispatch(logout());
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch(logout());
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, checkAuthQuery]);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = AdvancedTokenManager.getRefreshToken();
    if (!refreshToken) {
      dispatch(sessionExpired());
      return false;
    }

    try {
      const result = await refreshTokenMutation({ refreshToken }).unwrap();
      dispatch(refreshTokenSuccess({ token: result.accessToken }));
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch(sessionExpired());
      return false;
    }
  }, [dispatch, refreshTokenMutation]);

  const handleLogout = useCallback(
    async (logoutAll = false): Promise<void> => {
      try {
        if (logoutAll) {
          await logoutMutation().unwrap();
        }
      } catch (error) {
        console.error('Logout API call failed:', error);
      } finally {
        dispatch(logout());
        setIsActivityTracked(false);
        setRequiresReauth(false);
        toast.success('Logged out successfully');
      }
    },
    [dispatch, logoutMutation]
  );

  const updateUserData = useCallback(
    (userData: Partial<User>) => {
      dispatch(updateUser(userData));
    },
    [dispatch]
  );

  const updateActivity = useCallback(() => {
    if (auth.isAuthenticated) {
      dispatch(updateLastActivity());
    }
  }, [dispatch, auth.isAuthenticated]);

  // DISABLED: Session expiry check - can cause infinite loops
  // useEffect(() => {
  //   if (!auth.sessionExpiry || !auth.isAuthenticated) return;
  //   ...
  // }, [auth.sessionExpiry, auth.isAuthenticated, dispatch, refreshSession]);

  // DISABLED: Activity tracking - can cause infinite loops
  // useEffect(() => {
  //   if (!auth.isAuthenticated) {
  //     setIsActivityTracked(false);
  //     return;
  //   }
  //   ...
  // }, [auth.isAuthenticated, isActivityTracked, updateActivity]);

  // DISABLED: Last activity check - can cause infinite loops
  // useEffect(() => {
  //   if (!auth.isAuthenticated || !auth.lastActivity) return;
  //   ...
  // }, [auth.isAuthenticated, auth.lastActivity]);

  // Debug current auth state
  useEffect(() => {
    const token = AdvancedTokenManager.getAccessToken();
    console.log('🔍 Auth Debug:', {
      isAuthenticated: auth.isAuthenticated,
      hasToken: !!token,
      user: auth.user?.email,
      token: token?.substring(0, 20) + '...' || 'none'
    });
    
    // If no token but still authenticated, force logout
    if (!token && auth.isAuthenticated) {
      console.log('❌ No token but authenticated, forcing logout');
      dispatch(logout());
    }
  }, [auth.isAuthenticated, auth.user, dispatch]);


  const contextValue: AuthContextType = {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    permissions: auth.permissions,

    sessionExpiry: auth.sessionExpiry,
    lastActivity: auth.lastActivity,
    isSessionActive: auth.isAuthenticated && !requiresReauth,

    isStudent: hasRole('student'),
    isTeacher: hasRole('teacher'),
    isAdmin: hasRole('admin'),
    hasRole,
    hasPermission,
    hasAnyPermission,

    checkAuth,
    refreshSession,
    logout: handleLogout,
    updateUserData,

    updateActivity,
    isActivityTracked,

    requiresReauth,
    isMfaEnabled: auth.user?.twoFactorEnabled || false,
    canAccessResource,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireRole(
  allowedRoles: string[],
  redirectTo = '/unauthorized'
) {
  const { user: _user, hasRole, isAuthenticated, isLoading } = useAuth();

  const hasRequiredRole = allowedRoles.some(role => hasRole(role));

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredRole) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, hasRequiredRole, redirectTo]);

  return { hasRequiredRole, isLoading };
}

export function useRequirePermission(
  permission: string,
  redirectTo = '/unauthorized'
) {
  const { hasPermission, isAuthenticated, isLoading } = useAuth();

  const hasRequiredPermission = hasPermission(permission);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !hasRequiredPermission) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, hasRequiredPermission, redirectTo]);

  return { hasRequiredPermission, isLoading };
}
