import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  User,
} from '@/types';

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface MessageResponse {
  message: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Login
    // mutation Đây là một hành động ghi dữ liệu (POST) — khác với query dùng để lấy dữ liệu (GET)
    login: builder.mutation<AuthResponse, LoginFormData>({
      query: credentials => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Register
    register: builder.mutation<AuthResponse, RegisterFormData>({
      query: userData => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout
    logout: builder.mutation<MessageResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Refresh token
    refreshToken: builder.mutation<
      Pick<AuthResponse, 'token' | 'refreshToken'>,
      { refreshToken: string }
    >({
      query: ({ refreshToken }) => ({
        url: API_ENDPOINTS.AUTH.REFRESH,
        method: 'POST',
        body: { refreshToken },
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation<MessageResponse, ForgotPasswordFormData>({
      query: data => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body: data,
      }),
    }),

    // Reset password
    resetPassword: builder.mutation<MessageResponse, ResetPasswordFormData>({
      query: data => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: 'POST',
        body: data,
      }),
    }),

    // Verify email
    verifyEmail: builder.mutation<MessageResponse, { token: string }>({
      query: ({ token }) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        method: 'POST',
        body: { token },
      }),
    }),

    // Resend verification email
    resendVerification: builder.mutation<MessageResponse, { email: string }>({
      query: ({ email }) => ({
        url: API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        method: 'POST',
        body: { email },
      }),
    }),

    // Get current user
    getCurrentUser: builder.query<User, void>({
      query: () => API_ENDPOINTS.USERS.PROFILE,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetCurrentUserQuery,
} = authApi;
