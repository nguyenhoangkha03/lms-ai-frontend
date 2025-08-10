import { baseApi } from '@/lib/api/base-api';
import {
  TeacherApplication,
  TeacherApplicationQuery,
  ApprovalDecision,
} from '@/lib/types';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: any;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UserStatsResponse {
  total: {
    all: number;
    students: number;
    teachers: number;
    admins: number;
  };
  active: {
    all: number;
    students: number;
    teachers: number;
    admins: number;
  };
  newThisMonth: number;
  growth: {
    monthly: number;
    weekly: number;
  };
}

interface CreateAdminUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  temporaryPassword?: string;
  sendWelcomeEmail?: boolean;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

interface UserQueryParams {
  userType?: 'student' | 'teacher' | 'admin';
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'email' | 'firstName' | 'lastName' | 'lastLoginAt';
  sortOrder?: 'ASC' | 'DESC';
}

interface TeacherApplicationsResponse {
  success: boolean;
  message: string;
  applications: TeacherApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TeacherApplicationResponse {
  success: boolean;
  message: string;
  application: TeacherApplication;
}

interface ApprovalStatsResponse {
  success: boolean;
  message: string;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    underReview: number;
    total: number;
    recentApprovals: number;
    averageProcessingTime: number;
  };
}

interface BulkApprovalResponse {
  success: boolean;
  message: string;
  result: {
    successful: string[];
    failed: { id: string; error: string }[];
  };
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTeacherApplications: builder.query<
      TeacherApplicationsResponse,
      TeacherApplicationQuery
    >({
      query: params => ({
        url: '/admin/teachers/applications',
        params,
      }),
      providesTags: ['TeacherApplications'],
    }),

    getTeacherApplication: builder.query<TeacherApplicationResponse, string>({
      query: applicationId => `/admin/teachers/applications/${applicationId}`,
      providesTags: (result, error, applicationId) => [
        { type: 'TeacherApplications', id: applicationId },
      ],
    }),

    approveTeacher: builder.mutation<
      { success: boolean; message: string },
      { applicationId: string; approval: ApprovalDecision }
    >({
      query: ({ applicationId, approval }) => ({
        url: `/admin/teachers/applications/${applicationId}/approve`,
        method: 'POST',
        body: approval,
      }),
      invalidatesTags: ['TeacherApplications'],
    }),

    requestMoreInfo: builder.mutation<
      { success: boolean; message: string },
      {
        applicationId: string;
        request: {
          message: string;
          requiredDocuments?: string[];
          dueDate?: Date;
        };
      }
    >({
      query: ({ applicationId, request }) => ({
        url: `/admin/teachers/applications/${applicationId}/request-info`,
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['TeacherApplications'],
    }),

    bulkApproveTeachers: builder.mutation<
      BulkApprovalResponse,
      {
        applicationIds: string[];
        approval: ApprovalDecision;
      }
    >({
      query: ({ applicationIds, approval }) => ({
        url: '/admin/teachers/applications/bulk-approve',
        method: 'POST',
        body: {
          applicationIds,
          approval,
        },
      }),
      invalidatesTags: ['TeacherApplications'],
    }),

    getApprovalStats: builder.query<ApprovalStatsResponse, void>({
      query: () => '/admin/teachers/stats',
      providesTags: ['ApprovalStats'],
    }),

    getDashboardOverview: builder.query<
      {
        success: boolean;
        message: string;
        overview: {
          teacherApplications: any;
          recentActivity: any[];
          systemHealth: {
            status: string;
            uptime: number;
            memory: any;
          };
        };
      },
      void
    >({
      query: () => '/admin/dashboard/overview',
      providesTags: ['DashboardOverview'],
    }),

    verifyDocument: builder.mutation<
      { success: boolean; message: string },
      {
        documentId: string;
        isApproved: boolean;
        notes?: string;
      }
    >({
      query: ({ documentId, isApproved, notes }) => ({
        url: `/upload/admin/document/${documentId}/verify`,
        method: 'POST',
        body: {
          isApproved,
          notes,
        },
      }),
      invalidatesTags: ['TeacherDocuments', 'TeacherApplications'],
    }),

    getPendingDocuments: builder.query<
      {
        success: boolean;
        message: string;
        documents: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/upload/admin/documents/pending',
        params: { page, limit },
      }),
      providesTags: ['PendingDocuments'],
    }),

    getUsers: builder.query<
      { success: boolean; message: string } & UserListResponse,
      UserQueryParams
    >({
      query: params => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserStats: builder.query<
      { success: boolean; message: string; stats: UserStatsResponse },
      void
    >({
      query: () => '/admin/users/stats',
      providesTags: ['UserStats'],
    }),

    getUserById: builder.query<
      { success: boolean; message: string; user: User },
      string
    >({
      query: userId => `/admin/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    createAdminUser: builder.mutation<
      {
        success: boolean;
        message: string;
        user: User;
        temporaryPassword?: string;
      },
      CreateAdminUserDto
    >({
      query: userData => ({
        url: '/admin/users/create-admin',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    updateUser: builder.mutation<
      { success: boolean; message: string; user: User },
      { userId: string; userData: UpdateUserDto }
    >({
      query: ({ userId, userData }) => ({
        url: `/admin/users/${userId}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
        'UserStats',
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean; message: string }, string>(
      {
        query: userId => ({
          url: `/admin/users/${userId}`,
          method: 'DELETE',
        }),
        invalidatesTags: (result, error, userId) => [
          { type: 'User', id: userId },
          'User',
          'UserStats',
        ],
      }
    ),

    resetUserPassword: builder.mutation<
      { success: boolean; message: string; temporaryPassword?: string },
      { userId: string; sendEmail?: boolean }
    >({
      query: ({ userId, sendEmail = true }) => ({
        url: `/admin/users/${userId}/reset-password`,
        method: 'POST',
        body: { sendEmail },
      }),
    }),

    impersonateUser: builder.mutation<
      { success: boolean; message: string; accessToken: string; user: User },
      string
    >({
      query: userId => ({
        url: `/admin/users/${userId}/impersonate`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetTeacherApplicationsQuery,
  useGetTeacherApplicationQuery,
  useApproveTeacherMutation,
  useRequestMoreInfoMutation,
  useBulkApproveTeachersMutation,
  useGetApprovalStatsQuery,
  useGetDashboardOverviewQuery,
  useVerifyDocumentMutation,
  useGetPendingDocumentsQuery,

  // User Management hooks
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetUserByIdQuery,
  useCreateAdminUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useImpersonateUserMutation,
} = adminApi;
