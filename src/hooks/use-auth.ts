import { useCallback, useEffect } from 'react';
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

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegistering }] =
    useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  const { refetch: checkAuth } = useCheckAuthQuery(undefined, {
    skip: !auth.token,
  });

  const login = useCallback(
    async (credentials: LoginFormData) => {
      try {
        dispatch(loginStart());
        const result = await loginMutation(credentials).unwrap();

        if ('twoFactorRequired' in result) {
          dispatch(login2FARequired(result.twoFactorToken!));
          return { requiresTwoFactor: true, token: result.twoFactorToken };
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
        if (logoutAll) {
          await logoutMutation().unwrap();
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        dispatch(logout());
        toast.success('Logged out successfully');
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

      dispatch(refreshTokenSuccess({ token: result.accessToken }));
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

    const handleActivity = () => updateActivity();

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
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
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || isLoggingIn || isRegistering,
    error: auth.error,
    permissions: auth.permissions,
    twoFactorRequired: auth.twoFactorRequired,

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
