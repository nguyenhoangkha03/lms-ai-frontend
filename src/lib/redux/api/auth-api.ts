import { baseApi } from '@/lib/api/base-api';
import {
  ApiResponse,
  ForgotPasswordFormData,
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  User,
} from '@/lib/types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  twoFactorRequired?: boolean;
  twoFactorToken?: string | null;
}

interface TwoFactorResponse {
  qrCodeUrl: string;
  backupCodes: string[];
  secret: string;
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, LoginFormData>({
      query: credentials => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    register: builder.mutation<AuthResponse, RegisterFormData>({
      query: userData => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) =>
        response.data!,
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    logoutAll: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout-all',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    refreshToken: builder.mutation<
      { accessToken: string },
      { refreshToken: string }
    >({
      query: ({ refreshToken }) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response: ApiResponse<{ accessToken: string }>) =>
        response.data!,
    }),

    forgotPassword: builder.mutation<
      { message: string },
      ForgotPasswordFormData
    >({
      query: data => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordFormData>(
      {
        query: data => ({
          url: '/auth/reset-password',
          method: 'POST',
          body: data,
        }),
        transformResponse: (response: ApiResponse<{ message: string }>) =>
          response.data!,
      }
    ),

    changePassword: builder.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: data => ({
        url: '/auth/change-password',
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
    }),

    resendVerification: builder.mutation<
      { message: string },
      { email: string }
    >({
      query: data => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
    }),

    verifyEmail: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: `/auth/verify-email/${token}`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    generate2FA: builder.mutation<TwoFactorResponse, void>({
      query: () => ({
        url: '/auth/2fa/generate',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<TwoFactorResponse>) =>
        response.data!,
    }),

    enable2FA: builder.mutation<
      { backupCodes: string[] },
      { verificationCode: string }
    >({
      query: data => ({
        url: '/auth/2fa/enable',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ backupCodes: string[] }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    disable2FA: builder.mutation<
      { message: string },
      { verificationCode: string }
    >({
      query: data => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    generateBackupCodes: builder.mutation<{ backupCodes: string[] }, void>({
      query: () => ({
        url: '/auth/2fa/backup-codes',
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ backupCodes: string[] }>) =>
        response.data!,
    }),

    login2FA: builder.mutation<
      AuthResponse,
      { token: string; verificationCode: string }
    >({
      query: data => ({
        url: '/auth/login/2fa',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    linkOAuth: builder.mutation<
      { message: string },
      { provider: string; code: string }
    >({
      query: data => ({
        url: '/auth/link-oauth',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['User'],
    }),

    getProfile: builder.query<User, void>({
      query: () => '/auth/profile',
      transformResponse: (response: ApiResponse<User>) => response.data!,
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<User, ProfileUpdateData>({
      query: data => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data!,
      invalidatesTags: ['User'],
    }),

    checkAuth: builder.query<{ isAuthenticated: boolean; user?: User }, void>({
      query: () => '/auth/check-auth',
      transformResponse: (
        response: ApiResponse<{ isAuthenticated: boolean; user?: User }>
      ) => response.data!,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLogoutAllMutation,
  useRefreshTokenMutation,

  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,

  useResendVerificationMutation,
  useVerifyEmailMutation,

  useGenerate2FAMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
  useGenerateBackupCodesMutation,
  useLogin2FAMutation,

  useLinkOAuthMutation,

  useGetProfileQuery,
  useUpdateProfileMutation,

  useCheckAuthQuery,
} = authApi;
