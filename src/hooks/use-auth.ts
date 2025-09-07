import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  login2FARequired,
  logout,
  updateLastActivity,
  sessionExpired,
  setError,
  clearError,
  refreshTokenSuccess,
} from '@/lib/redux/slices/auth-slice';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useCheckAuthQuery,
} from '@/lib/redux/api/auth-api';
import { tokenManager } from '@/lib/api/client';
import type { LoginFormData, RegisterFormData } from '@/lib/types';
import { toast } from 'sonner';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  
  // Fix SSR/Client hydration mismatch
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] =
    useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  const { refetch: checkAuth } = useCheckAuthQuery(undefined, {
    skip: !auth.accessToken,
  });

  const login = useCallback(
    async (credentials: LoginFormData) => {
      try {
        dispatch(loginStart());
        const result = await loginMutation(credentials).unwrap();

        if ('twoFactorRequired' in result) {
          dispatch(login2FARequired(result.twoFactorToken!));
          return {
            requiresTwoFactor: true,
            twoFactorToken: result.twoFactorToken,
          };
        }

        dispatch(loginSuccess(result));
        toast.success('Login successful!');
        return { success: true };
      } catch (error: any) {
        const message = error.message || 'Login failed';
        dispatch(loginFailure(message));
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [dispatch, loginMutation]
  );

  const register = useCallback(
    async (userData: RegisterFormData) => {
      try {
        const result = await registerMutation(userData).unwrap();
        dispatch(loginSuccess(result));
        toast.success('Registration successful!');
        return { success: true };
      } catch (error: any) {
        const message = error.message || 'Registration failed';
        toast.error(message);
        return { success: false, error: message };
      }
    },
    [dispatch, registerMutation]
  );

  const handleLogout = useCallback(
    async (logoutAll = false) => {
      try {
        console.log('🚪 Starting logout process...');
        
        // Call backend logout API  
        await logoutMutation().unwrap();
        console.log('✅ Backend logout successful');
      } catch (error) {
        console.error('❌ Logout API error:', error);
        // Continue with logout even if API fails
      } finally {
        // Always clear local state and cookies
        console.log('🧹 Clearing local auth state...');
        dispatch(logout());
        
        // Show success message
        toast.success('Logged out successfully');
        
        // Force redirect to login page
        console.log('🔄 Redirecting to login...');
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    },
    [dispatch, logoutMutation]
  );

  const refreshToken = useCallback(async () => {
    const refreshTokenValue = tokenManager.getRefreshToken();
    if (!refreshTokenValue) {
      dispatch(sessionExpired());
      return false;
    }

    try {
      const result = await refreshTokenMutation({
        refreshToken: refreshTokenValue,
      }).unwrap();

      dispatch(
        refreshTokenSuccess({
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          refreshToken: result.refreshToken,
        })
      );
      return true;
    } catch (error) {
      dispatch(sessionExpired());
      return false;
    }
  }, [dispatch, refreshTokenMutation]);

  const updateActivity = useCallback(() => {
    if (auth.isAuthenticated) {
      dispatch(updateLastActivity());
    }
  }, [dispatch, auth.isAuthenticated]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setAuthError = useCallback(
    (error: string) => {
      dispatch(setError(error));
    },
    [dispatch]
  );

  const hasRole = useCallback(
    (role: string) => {
      return auth.user?.userType === role;
    },
    [auth.user?.userType]
  );

  const hasPermission = useCallback(
    (permission: string) => {
      return auth.permissions.includes(permission);
    },
    [auth.permissions]
  );

  useEffect(() => {
    if (!auth.isAuthenticated) return;

    let lastUpdate = 0;
    const THROTTLE_MS = 30000; // Throttle to max once per 30 seconds

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > THROTTLE_MS) {
        lastUpdate = now;
        updateActivity();
      }
    };

    // Remove mousemove to prevent constant re-renders on hover
    const events = [
      'mousedown',
      'keypress', 
      'scroll',
      'touchstart',
      'click', // Add click as alternative to mousemove
    ];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    const interval = setInterval(updateActivity, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(interval);
    };
  }, [auth.isAuthenticated, updateActivity]);

  useEffect(() => {
    if (!auth.sessionExpiry || !auth.isAuthenticated) return;
    const expiryTime = new Date(auth.sessionExpiry).getTime();
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    console.log('jjjjj', timeUntilExpiry);
    if (timeUntilExpiry <= 0) {
      dispatch(sessionExpired());
      return;
    }
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000;
    if (refreshTime > 0) {
      const refreshTimeout = setTimeout(() => {
        refreshToken();
      }, refreshTime);
      return () => clearTimeout(refreshTimeout);
    }
    const refreshTimeout = setTimeout(() => {
      refreshToken();
    }, refreshTime);
    return () => clearTimeout(refreshTimeout);
  }, [auth.sessionExpiry, auth.isAuthenticated, refreshToken, dispatch]);

  return {
    user: isClient ? auth.user : null, // Prevent SSR/hydration mismatch
    isAuthenticated: isClient ? auth.isAuthenticated : false,
    isLoading: auth.isLoading || isLoggingIn || isRegistering || !isClient,
    error: auth.error,
    permissions: auth.permissions,
    twoFactorRequired: auth.twoFactorEnabled,

    login,
    register,
    logout: handleLogout,
    refreshToken,
    updateActivity,
    clearError: clearAuthError,
    setError: setAuthError,
    checkAuth,

    hasRole,
    hasPermission,
    isStudent: hasRole('student'),
    isTeacher: hasRole('teacher'),
    isAdmin: hasRole('admin'),
  };
};
