import { useRouter } from 'next/router';
import { useAppDispatch } from './use-app-dispatch';
import { useAppSelector } from './use-app-selector';
import {
  useForgotPasswordMutation,
  useGetCurrentUserQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResendVerificationMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} from '@/store/api/auth-api';
import { useToast } from './use-toast';
import { useCallback, useEffect } from 'react';
import {
  incrementLoginAttempts,
  initializeAuth,
  resetLoginAttempts,
  setCredentials,
  setError,
  setLoading,
  setTwoFactorRequired,
  updateLastActivity,
} from '@/store/slices/auth';
import { LoginFormData } from '@/lib/validations';
import { AUTH_CONFIG, ROUTES } from '@/constants';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  //   const { toast } = useToast();

  const auth = useAppSelector(state => state.auth);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [registerMutation] = useRegisterMutation();
  const [forgotPasswordMutation] = useForgotPasswordMutation();
  const [resetPasswordMutation] = useResetPasswordMutation();
  const [verifyEmailMutation] = useVerifyEmailMutation();
  const [resendVerificationMutation] = useResendVerificationMutation();

  const { data: currentUser, isLoading: isLoadingUser } =
    useGetCurrentUserQuery(undefined, {
      skip: !auth.isAuthenticated || !auth.token,
    });

  useEffect(() => {
    if (!auth.isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, auth.isInitialized]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const interval = setInterval(() => {
        dispatch(updateLastActivity());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [auth.isAuthenticated, dispatch]);

  const login = useCallback(
    async (credentials: LoginFormData) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        // Check if account is locked
        if (auth.isLocked && auth.lockUntil && Date.now() < auth.lockUntil) {
          const remainingTime = Math.ceil(
            (auth.lockUntil - Date.now()) / 60000
          );
          throw new Error(
            `Account is locked. Try again in ${remainingTime} minutes.`
          );
        }

        const response = await loginMutation(credentials).unwrap();

        // Reset login attempts on successful login
        dispatch(resetLoginAttempts());

        // Check if 2FA is required
        if (response.requireTwoFactor) {
          dispatch(setTwoFactorRequired(true));
          return { requireTwoFactor: true };
        }

        const tokenManager = TokenManager.getInstance();

        // Set credentials in store
        dispatch(
          setCredentials({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            permissions: response.permissions || [],
            roles: response.roles || [response.user.userType],
          })
        );

        // Store tokens
        tokenManager.setTokens(response.token, response.refreshToken);

        // Store user role in cookie for middleware
        document.cookie = `user_role=${response.user.userType}; path=/; max-age=${AUTH_CONFIG.cookieMaxAge}`;

        toast({
          type: 'success',
          message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        });

        // Redirect based on user role
        const redirectPath = getRedirectPath(
          response.user.userType,
          credentials.redirectPath
        );
        router.push(redirectPath);

        return response;
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || error.message || 'Login failed';

        // Increment login attempts on failure
        dispatch(incrementLoginAttempts());
        dispatch(setError(errorMessage));

        toast({
          type: 'error',
          message: errorMessage,
        });

        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, auth.isLocked, auth.lockUntil, loginMutation, toast, router]
  );

  const register = useCallback(
    async (userData: RegisterFormData) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));

        const response = await registerMutation(userData).unwrap();

        // Auto-login after successful registration
        if (response.user && response.token) {
          const tokenManager = TokenManager.getInstance();

          dispatch(
            setCredentials({
              user: response.user,
              token: response.token,
              refreshToken: response.refreshToken,
              permissions: response.permissions || [],
              roles: response.roles || [response.user.userType],
            })
          );

          tokenManager.setTokens(response.token, response.refreshToken);

          document.cookie = `user_role=${response.user.userType}; path=/; max-age=${AUTH_CONFIG.cookieMaxAge}`;

          toast({
            type: 'success',
            message: SUCCESS_MESSAGES.REGISTER_SUCCESS,
          });

          // Redirect to appropriate dashboard
          const redirectPath = getRedirectPath(response.user.userType);
          router.push(redirectPath);
        } else {
          // Registration successful but needs email verification
          toast({
            type: 'info',
            message:
              'Registration successful! Please check your email to verify your account.',
          });

          router.push(ROUTES.VERIFY_EMAIL);
        }

        return response;
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Registration failed';
        dispatch(setError(errorMessage));

        toast({
          type: 'error',
          message: errorMessage,
        });

        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, registerMutation, toast, router]
  );

  // Enhanced logout function
  const logoutUser = useCallback(async () => {
    try {
      // Call logout API if authenticated
      if (auth.isAuthenticated) {
        await logoutMutation().unwrap();
      }
    } catch (error) {
      // Ignore logout API errors
      console.warn('Logout API error:', error);
    } finally {
      // Clear all app state
      dispatch(logout());
      dispatch(clearProfile());
      dispatch(clearToasts());
      dispatch(closeAllModals());

      // Clear tokens
      const tokenManager = TokenManager.getInstance();
      tokenManager.clearTokens();

      toast({
        type: 'success',
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
      });

      // Redirect to login
      router.push('/login');
    }
  }, [auth.isAuthenticated, dispatch, logoutMutation, toast, router]);

  // Forgot password function
  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        dispatch(setLoading(true));
        await forgotPasswordMutation({ email }).unwrap();

        toast({
          type: 'success',
          message: 'Password reset email sent! Check your inbox.',
        });
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || 'Failed to send reset email';
        toast({
          type: 'error',
          message: errorMessage,
        });
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, forgotPasswordMutation, toast]
  );

  // Reset password function
  const resetPassword = useCallback(
    async (token: string, password: string) => {
      try {
        dispatch(setLoading(true));
        await resetPasswordMutation({
          token,
          password,
          confirmPassword: password,
        }).unwrap();

        toast({
          type: 'success',
          message:
            'Password reset successful! You can now login with your new password.',
        });

        router.push(ROUTES.LOGIN);
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Failed to reset password';
        toast({
          type: 'error',
          message: errorMessage,
        });
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, resetPasswordMutation, toast, router]
  );

  // Verify email function
  const verifyEmail = useCallback(
    async (token: string) => {
      try {
        dispatch(setLoading(true));
        await verifyEmailMutation({ token }).unwrap();

        toast({
          type: 'success',
          message: 'Email verified successfully!',
        });

        router.push(ROUTES.LOGIN);
      } catch (error: any) {
        const errorMessage = error?.data?.message || 'Failed to verify email';
        toast({
          type: 'error',
          message: errorMessage,
        });
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, verifyEmailMutation, toast, router]
  );

  // Resend verification email
  const resendVerification = useCallback(
    async (email: string) => {
      try {
        dispatch(setLoading(true));
        await resendVerificationMutation({ email }).unwrap();

        toast({
          type: 'success',
          message: 'Verification email sent!',
        });
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || 'Failed to send verification email';
        toast({
          type: 'error',
          message: errorMessage,
        });
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, resendVerificationMutation, toast]
  );

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      await dispatch(refreshAuthToken()).unwrap();
    } catch (error) {
      // If refresh fails, logout user
      logoutUser();
      throw error;
    }
  }, [dispatch, logoutUser]);

  // Update user data function
  const updateUserData = useCallback(
    (userData: Partial<User>) => {
      if (auth.user) {
        dispatch(
          setCredentials({
            user: { ...auth.user, ...userData },
            token: auth.token!,
            refreshToken: auth.refreshToken!,
            permissions: auth.permissions,
            roles: auth.roles,
          })
        );
      }
    },
    [
      auth.user,
      auth.token,
      auth.refreshToken,
      auth.permissions,
      auth.roles,
      dispatch,
    ]
  );

  // Check permissions
  const checkPermission = useCallback(
    (permission: string) => {
      if (!auth.isAuthenticated || !auth.user) return false;

      const permissionChecker = new PermissionChecker(
        auth.permissions,
        auth.roles
      );

      return permissionChecker.hasPermission(permission);
    },
    [auth.isAuthenticated, auth.user, auth.permissions, auth.roles]
  );

  // Check role
  const checkRole = useCallback(
    (role: string) => {
      if (!auth.isAuthenticated || !auth.user) return false;

      const permissionChecker = new PermissionChecker(
        auth.permissions,
        auth.roles
      );

      return permissionChecker.hasRole(role);
    },
    [auth.isAuthenticated, auth.user, auth.permissions, auth.roles]
  );

  const isAuthenticated = auth.isAuthenticated && !!auth.token;
  const isLoading = auth.isLoading || isLoadingUser;

  return {
    // State
    user: auth.user,
    isAuthenticated,
    isLoading,
    error: auth.error,
    isInitialized: auth.isInitialized,
    twoFactorRequired: auth.twoFactorRequired,
    isLocked: auth.isLocked,
    loginAttempts: auth.loginAttempts,
    permissions: auth.permissions,
    roles: auth.roles,

    // Actions
    login,
    register,
    logout: logoutUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshToken,
    updateUser: updateUserData,

    // Permission checks
    checkPermission,
    checkRole,

    // Role helpers
    isAdmin: checkRole(USER_ROLES.ADMIN),
    isTeacher: checkRole(USER_ROLES.TEACHER),
    isStudent: checkRole(USER_ROLES.STUDENT),

    // Current user data
    currentUser,
  };
};

// Helper function to get redirect path based on user role
function getRedirectPath(userType: string, customRedirect?: string): string {
  if (customRedirect) {
    return customRedirect;
  }

  switch (userType) {
    case USER_ROLES.STUDENT:
      return ROUTES.STUDENT.DASHBOARD;
    case USER_ROLES.TEACHER:
      return ROUTES.TEACHER.DASHBOARD;
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN.DASHBOARD;
    default:
      return ROUTES.HOME;
  }
}
