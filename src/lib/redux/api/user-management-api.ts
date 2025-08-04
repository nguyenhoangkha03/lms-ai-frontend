import { baseApi } from '@/lib/api/base-api';
import {
  BulkOperation,
  Permission,
  Role,
  SecurityEventsQueryParams,
  TeacherApplication,
  TeacherApplicationsQueryParams,
  User,
  UserAnalytics,
  UserSecurityEvent,
  UsersQueryParams,
} from '@/lib/types/user-management';

export const userManagementApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query<
      { users: User[]; total: number; totalPages: number },
      UsersQueryParams
    >({
      query: params => ({
        url: '/users',
        params,
      }),
      providesTags: ['Users'],
    }),

    getUserById: builder.query<User, string>({
      query: id => `/users/${id}`,
      providesTags: ['Users'],
    }),

    updateUser: builder.mutation<User, { id: string; data: Partial<User> }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    deleteUser: builder.mutation<void, string>({
      query: id => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    activateUser: builder.mutation<User, string>({
      query: id => ({
        url: `/users/${id}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
    }),

    // Deactivate user account
    deactivateUser: builder.mutation<User, string>({
      query: id => ({
        url: `/users/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
    }),

    // Suspend user account
    suspendUser: builder.mutation<
      User,
      { id: string; reason?: string; duration?: number }
    >({
      query: ({ id, reason, duration }) => ({
        url: `/users/${id}/suspend`,
        method: 'PATCH',
        body: { reason, duration },
      }),
      invalidatesTags: ['Users'],
    }),

    // Manually verify user email
    verifyUserEmail: builder.mutation<User, string>({
      query: id => ({
        url: `/users/${id}/verify-email`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Users'],
    }),

    // ========== ROLE & PERMISSION MANAGEMENT ==========

    // Get user permissions
    getUserPermissions: builder.query<Permission[], string>({
      query: id => `/users/${id}/permissions`,
      providesTags: ['UserPermissions'],
    }),

    // Assign permissions to user
    assignPermissions: builder.mutation<
      void,
      { id: string; permissionIds: string[] }
    >({
      query: ({ id, permissionIds }) => ({
        url: `/users/${id}/permissions`,
        method: 'POST',
        body: { permissionIds },
      }),
      invalidatesTags: ['UserPermissions'],
    }),

    // Assign roles to user
    assignRoles: builder.mutation<void, { id: string; roleIds: string[] }>({
      query: ({ id, roleIds }) => ({
        url: `/users/${id}/roles`,
        method: 'POST',
        body: { roleIds },
      }),
      invalidatesTags: ['Users', 'UserPermissions'],
    }),

    // Remove roles from user
    removeRoles: builder.mutation<void, { id: string; roleIds: string[] }>({
      query: ({ id, roleIds }) => ({
        url: `/users/${id}/roles`,
        method: 'DELETE',
        body: { roleIds },
      }),
      invalidatesTags: ['Users', 'UserPermissions'],
    }),

    // Get all roles
    getRoles: builder.query<Role[], void>({
      query: () => '/auth/roles',
      providesTags: ['Roles'],
    }),

    // Get all permissions
    getPermissions: builder.query<Permission[], void>({
      query: () => '/auth/permissions',
      providesTags: ['Permissions'],
    }),

    // ========== TEACHER APPLICATION MANAGEMENT ==========

    // Get teacher applications
    getTeacherApplications: builder.query<
      { applications: TeacherApplication[]; total: number; totalPages: number },
      TeacherApplicationsQueryParams
    >({
      query: params => ({
        url: '/auth/teacher-applications',
        params,
      }),
      providesTags: ['TeacherApplications'],
    }),

    // Get teacher application by ID
    getTeacherApplicationById: builder.query<TeacherApplication, string>({
      query: id => `/auth/teacher-applications/${id}`,
      providesTags: ['TeacherApplications'],
    }),

    // Review teacher application
    reviewTeacherApplication: builder.mutation<
      TeacherApplication,
      {
        id: string;
        status: 'approved' | 'rejected' | 'resubmission_required';
        rejectionReason?: string;
        feedback?: string;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/auth/teacher-applications/${id}/review`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TeacherApplications'],
    }),

    // Approve teacher application
    approveTeacherApplication: builder.mutation<TeacherApplication, string>({
      query: id => ({
        url: `/auth/teacher-applications/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['TeacherApplications', 'Users'],
    }),

    // Reject teacher application
    rejectTeacherApplication: builder.mutation<
      TeacherApplication,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/auth/teacher-applications/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['TeacherApplications'],
    }),

    // ========== BULK OPERATIONS ==========

    // Bulk delete users
    bulkDeleteUsers: builder.mutation<BulkOperation, { userIds: string[] }>({
      query: ({ userIds }) => ({
        url: '/users/bulk',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: ['Users'],
    }),

    // Bulk update user status
    bulkUpdateUserStatus: builder.mutation<
      BulkOperation,
      { userIds: string[]; status: string }
    >({
      query: ({ userIds, status }) => ({
        url: '/users/bulk/status',
        method: 'PATCH',
        body: { userIds, status },
      }),
      invalidatesTags: ['Users'],
    }),

    // Bulk assign roles
    bulkAssignRoles: builder.mutation<
      BulkOperation,
      { userIds: string[]; roleIds: string[] }
    >({
      query: ({ userIds, roleIds }) => ({
        url: '/users/bulk/roles',
        method: 'POST',
        body: { userIds, roleIds },
      }),
      invalidatesTags: ['Users', 'UserPermissions'],
    }),

    // Get bulk operation status
    getBulkOperationStatus: builder.query<BulkOperation, string>({
      query: id => `/users/bulk-operations/${id}`,
      providesTags: ['BulkOperations'],
    }),

    exportUsers: builder.mutation<{ downloadUrl: string }, UsersQueryParams>({
      query: params => ({
        url: '/users/export',
        method: 'GET',
        params,
      }),
    }),

    importUsers: builder.mutation<
      { imported: number; failed: number; errors: string[] },
      FormData
    >({
      query: formData => ({
        url: '/users/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Users'],
    }),

    getUserStats: builder.query<UserAnalytics, void>({
      query: () => '/users/stats',
      providesTags: ['UserAnalytics'],
    }),

    getSecurityEvents: builder.query<
      { events: UserSecurityEvent[]; total: number; totalPages: number },
      SecurityEventsQueryParams
    >({
      query: params => ({
        url: '/users/security-events',
        params,
      }),
      providesTags: ['SecurityEvents'],
    }),

    resolveSecurityEvent: builder.mutation<
      UserSecurityEvent,
      { id: string; resolution?: string }
    >({
      query: ({ id, resolution }) => ({
        url: `/users/security-events/${id}/resolve`,
        method: 'PATCH',
        body: { resolution },
      }),
      invalidatesTags: ['SecurityEvents'],
    }),

    getUserActivityLogs: builder.query<
      { logs: any[]; total: number; totalPages: number },
      { userId: string; page?: number; limit?: number }
    >({
      query: ({ userId, page = 1, limit = 20 }) => ({
        url: `/users/${userId}/activity-logs`,
        params: { page, limit },
      }),
      providesTags: ['UserActivityLogs'],
    }),
  }),
});

// Export hooks
export const {
  // User management hooks
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useSuspendUserMutation,
  useVerifyUserEmailMutation,

  // Role & permission hooks
  useGetUserPermissionsQuery,
  useAssignPermissionsMutation,
  useAssignRolesMutation,
  useRemoveRolesMutation,
  useGetRolesQuery,
  useGetPermissionsQuery,

  // Teacher application hooks
  useGetTeacherApplicationsQuery,
  useGetTeacherApplicationByIdQuery,
  useReviewTeacherApplicationMutation,
  useApproveTeacherApplicationMutation,
  useRejectTeacherApplicationMutation,

  // Bulk operations hooks
  useBulkDeleteUsersMutation,
  useBulkUpdateUserStatusMutation,
  useBulkAssignRolesMutation,
  useGetBulkOperationStatusQuery,

  // Import/export hooks
  useExportUsersMutation,
  useImportUsersMutation,

  // Analytics hooks
  useGetUserStatsQuery,

  // Security monitoring hooks
  useGetSecurityEventsQuery,
  useResolveSecurityEventMutation,
  useGetUserActivityLogsQuery,
} = userManagementApi;
