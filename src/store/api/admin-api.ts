import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type {
  User,
  Course,
  SystemSetting,
  AuditLog,
  PaginatedResponse,
} from '@/types';

export const adminApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // User management
    getUsers: builder.query<
      PaginatedResponse<User>,
      {
        page?: number;
        limit?: number;
        search?: string;
        role?: string;
        status?: string;
      }
    >({
      query: params => ({
        url: API_ENDPOINTS.ADMIN.USERS,
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: id => API_ENDPOINTS.ADMIN.USER_DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUserStatus: builder.mutation<User, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `${API_ENDPOINTS.ADMIN.USER_DETAIL(id)}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'User',
      ],
    }),

    // Course management
    getAdminCourses: builder.query<
      PaginatedResponse<Course>,
      {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
      }
    >({
      query: params => ({
        url: API_ENDPOINTS.ADMIN.COURSES,
        params,
      }),
      providesTags: ['Course'],
    }),

    approveCourse: builder.mutation<
      Course,
      { id: string; approved: boolean; notes?: string }
    >({
      query: ({ id, approved, notes }) => ({
        url: `${API_ENDPOINTS.ADMIN.COURSES}/${id}/approve`,
        method: 'PUT',
        body: { approved, notes },
      }),
      invalidatesTags: ['Course'],
    }),

    // System settings
    getSystemSettings: builder.query<SystemSetting[], void>({
      query: () => API_ENDPOINTS.ADMIN.SETTINGS,
      providesTags: ['System'],
    }),

    updateSystemSetting: builder.mutation<
      SystemSetting,
      { id: string; value: string }
    >({
      query: ({ id, value }) => ({
        url: `${API_ENDPOINTS.ADMIN.SETTINGS}/${id}`,
        method: 'PUT',
        body: { value },
      }),
      invalidatesTags: ['System'],
    }),

    // Audit logs
    getAuditLogs: builder.query<
      PaginatedResponse<AuditLog>,
      {
        page?: number;
        limit?: number;
        action?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: params => ({
        url: API_ENDPOINTS.ADMIN.AUDIT_LOGS,
        params,
      }),
      providesTags: ['System'],
    }),

    // Analytics
    getAdminAnalytics: builder.query<any, { period?: string }>({
      query: params => ({
        url: API_ENDPOINTS.ADMIN.ANALYTICS,
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useGetAdminCoursesQuery,
  useApproveCourseMutation,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
  useGetAuditLogsQuery,
  useGetAdminAnalyticsQuery,
} = adminApi;
