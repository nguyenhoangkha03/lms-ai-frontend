import { baseApi } from '@/lib/api/base-api';
import {
  TeacherApplication,
  TeacherApplicationQuery,
  ApprovalDecision,
  UserProfile,
  StudentProfile,
  TeacherProfile,
} from '@/lib/types';
import { Role } from './role-api';
import { Permission } from './permission-api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  profile?: TeacherProfile;
  userType: 'student' | 'teacher' | 'admin';
  status:
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'banned'
    | 'deleted';
  avatarUrl?: string;
  coverUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  failedLoginAttempts: number;
  lockedUntil?: string | null;
  preferredLanguage?: string;
  timezone?: string;
  preferences?: Record<string, any>;
  metadata?: string;
  passwordChangedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Relationships
  userProfile?: any;
  studentProfile?: any;
  teacherProfile?: any;
  socials?: any[];
  roles?: Role[];
  permissions?: Permission[];

  // Virtual properties
  fullName?: string;
  isLocked?: boolean;
  isActive?: boolean;
  canLogin?: boolean;
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
  username?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  userType?: 'student' | 'teacher' | 'admin';
  status?: 'pending' | 'active' | 'inactive' | 'suspended';
  preferredLanguage?: string;
  timezone?: string;
  metadata?: string;
  temporaryPassword?: string;
  sendWelcomeEmail?: boolean;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  username?: string;
  phone?: string;
  userType?: 'student' | 'teacher' | 'admin';
  status?:
    | 'pending'
    | 'active'
    | 'inactive'
    | 'suspended'
    | 'banned'
    | 'deleted';
  avatarUrl?: string;
  coverUrl?: string;
  preferredLanguage?: string;
  timezone?: string;
  preferences?: Record<string, any>;
  metadata?: string;
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

interface CourseQueryParams {
  status?: 'draft' | 'published' | 'archived' | 'pending_review';
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'enrollments';
  sortOrder?: 'ASC' | 'DESC';
}

interface AdminCourse {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived' | 'pending_review';
  category: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  enrollments: number;
  rating: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseListResponse {
  success: boolean;
  message: string;
  courses: AdminCourse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CourseStatsResponse {
  success: boolean;
  message: string;
  stats: {
    total: number;
    published: number;
    draft: number;
    pendingReview: number;
    archived: number;
    totalEnrollments: number;
    averageRating: number;
    recentActivity: any[];
  };
}

interface BulkCourseActionRequest {
  courseIds: string[];
  action: 'publish' | 'archive' | 'delete' | 'category_change';
  data?: any;
}

interface BulkCourseActionResponse {
  success: boolean;
  message: string;
  results: {
    successful: string[];
    failed: { id: string; error: string }[];
  };
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

    getUserById: builder.query<User, string>({
      query: userId => `/admin/users/${userId}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        user: User;
      }) => response.user,
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

    // User Status Management
    activateUser: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: userId => ({
        url: `/admin/users/${userId}/activate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        'User',
        'UserStats',
      ],
    }),

    deactivateUser: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: userId => ({
        url: `/admin/users/${userId}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        'User',
        'UserStats',
      ],
    }),

    suspendUser: builder.mutation<
      { success: boolean; message: string },
      { userId: string; reason?: string }
    >({
      query: ({ userId, reason }) => ({
        url: `/admin/users/${userId}/suspend`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
        'UserStats',
      ],
    }),

    verifyUserEmail: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: userId => ({
        url: `/admin/users/${userId}/verify-email`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // Role & Permission Management
    assignUserRoles: builder.mutation<
      { success: boolean; message: string },
      { userId: string; roleIds: string[] }
    >({
      query: ({ userId, roleIds }) => ({
        url: `/admin/users/${userId}/roles`,
        method: 'POST',
        body: { roleIds },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    removeUserRoles: builder.mutation<
      { success: boolean; message: string },
      { userId: string; roleIds: string[] }
    >({
      query: ({ userId, roleIds }) => ({
        url: `/admin/users/${userId}/roles`,
        method: 'DELETE',
        body: { roleIds },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    assignUserPermissions: builder.mutation<
      { success: boolean; message: string },
      { userId: string; permissionIds: string[] }
    >({
      query: ({ userId, permissionIds }) => ({
        url: `/admin/users/${userId}/permissions`,
        method: 'POST',
        body: { permissionIds },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    getUserPermissions: builder.query<
      { success: boolean; message: string; permissions: Permission[] },
      string
    >({
      query: userId => `/admin/users/${userId}/permissions`,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // File Upload
    uploadUserAvatar: builder.mutation<
      { success: boolean; message: string; avatarUrl: string },
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/admin/users/${userId}/avatar`,
          method: 'POST',
          body: formData,
          // Explicitly don't set Content-Type to let browser handle multipart boundary
          headers: {},
        };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    uploadUserCover: builder.mutation<
      { success: boolean; message: string; coverUrl: string },
      { userId: string; file: File }
    >({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/admin/users/${userId}/cover`,
          method: 'POST',
          body: formData,
          // Explicitly don't set Content-Type to let browser handle multipart boundary
          headers: {},
        };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // Bulk Operations
    bulkUpdateUserStatus: builder.mutation<
      { success: boolean; message: string; results: any[] },
      { userIds: string[]; status: string }
    >({
      query: ({ userIds, status }) => ({
        url: '/admin/users/bulk/status',
        method: 'PATCH',
        body: { userIds, status },
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    bulkAssignUserRoles: builder.mutation<
      { success: boolean; message: string; results: any[] },
      { userIds: string[]; roleIds: string[] }
    >({
      query: ({ userIds, roleIds }) => ({
        url: '/admin/users/bulk/roles',
        method: 'POST',
        body: { userIds, roleIds },
      }),
      invalidatesTags: ['User'],
    }),

    bulkDeleteUsers: builder.mutation<
      { success: boolean; message: string; results: any[] },
      { userIds: string[] }
    >({
      query: ({ userIds }) => ({
        url: '/admin/users/bulk',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    // Import/Export
    importUsers: builder.mutation<
      { success: boolean; message: string; results: any },
      { users: any[]; options?: any }
    >({
      query: ({ users, options }) => ({
        url: '/admin/users/import',
        method: 'POST',
        body: { users, options },
      }),
      invalidatesTags: ['User', 'UserStats'],
    }),

    exportUsers: builder.query<
      { content: string; filename: string; mimeType: string },
      UserQueryParams
    >({
      query: params => ({
        url: '/admin/users/export',
        params,
      }),
    }),

    // Course Management endpoints
    getAdminCourses: builder.query<CourseListResponse, CourseQueryParams>({
      query: params => ({
        url: '/admin/courses',
        params,
      }),
      providesTags: ['Courses'],
      transformResponse: (response: any) => {
        console.log('response', response);
        return response;
      },
    }),

    getCourseStats: builder.query<CourseStatsResponse, void>({
      query: () => '/admin/courses/stats',
      providesTags: ['CourseStatistics'],
    }),

    updateCourseStatus: builder.mutation<
      { success: boolean; message: string },
      { courseId: string; status: string; notes?: string }
    >({
      query: ({ courseId, status, notes }) => ({
        url: `/admin/courses/${courseId}/status`,
        method: 'PUT',
        body: { status, notes },
      }),
      invalidatesTags: ['Courses', 'CourseStatistics'],
    }),

    bulkCourseActions: builder.mutation<
      BulkCourseActionResponse,
      BulkCourseActionRequest
    >({
      query: body => ({
        url: '/admin/courses/bulk-actions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Courses', 'CourseStatistics'],
    }),

    deleteAdminCourse: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: courseId => ({
        url: `/admin/courses/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Courses', 'CourseStatistics'],
    }),

    // System monitoring endpoints
    getSystemHealth: builder.query<
      { success: boolean; message: string; health: any },
      void
    >({
      query: () => '/admin/health',
      providesTags: ['SystemHealth'],
    }),

    getSystemMetrics: builder.query<
      { success: boolean; message: string; metrics: any },
      void
    >({
      query: () => '/admin/metrics',
      providesTags: ['SystemMetrics'],
    }),

    getBusinessMetrics: builder.query<
      { success: boolean; message: string; metrics: any },
      void
    >({
      query: () => '/admin/business-metrics',
      providesTags: ['BusinessMetrics'],
    }),

    getSystemAlerts: builder.query<
      { success: boolean; message: string; alerts: any[] },
      void
    >({
      query: () => '/admin/alerts',
      providesTags: ['SystemAlerts'],
    }),

    // ==================== CATEGORIES MANAGEMENT ==================== //

    getCategories: builder.query<
      {
        success: boolean;
        message: string;
        data?: any[];
        categories?: any[];
        total?: number;
        totalPages?: number;
        meta?: any;
      },
      {
        parentId?: string;
        level?: number;
        isActive?: boolean;
        showInMenu?: boolean;
        isFeatured?: boolean;
        search?: string;
        includeChildren?: boolean;
        includeCourses?: boolean;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
      }
    >({
      query: params => ({
        url: '/categories',
        params,
      }),
      providesTags: ['Categories'],
    }),

    getCategoryTree: builder.query<
      { success: boolean; message: string; tree: any[] },
      void
    >({
      query: () => '/categories/tree',
      providesTags: ['Categories'],
    }),

    getCategoryById: builder.query<
      { success: boolean; message: string; category: any },
      string
    >({
      query: id => `/categories/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Categories', id }],
    }),

    createCategory: builder.mutation<
      { success: boolean; message: string; category: any },
      {
        name: string;
        slug: string;
        description?: string;
        parentId?: string;
        iconUrl?: string;
        color?: string;
        orderIndex?: number;
        isActive?: boolean;
        showInMenu?: boolean;
        isFeatured?: boolean;
        seoMeta?: {
          title?: string;
          description?: string;
          keywords?: string[];
        };
        settings?: Record<string, any>;
        metadata?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<
      { success: boolean; message: string; category: any },
      {
        id: string;
        data: {
          name?: string;
          slug?: string;
          description?: string;
          parentId?: string;
          iconUrl?: string;
          color?: string;
          orderIndex?: number;
          isActive?: boolean;
          showInMenu?: boolean;
          isFeatured?: boolean;
          seoMeta?: {
            title?: string;
            description?: string;
            keywords?: string[];
          };
          settings?: Record<string, any>;
          metadata?: Record<string, any>;
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    deleteCategory: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: id => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    reorderCategory: builder.mutation<
      { success: boolean; message: string; category: any },
      {
        id: string;
        newParentId?: string;
        orderIndex: number;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/categories/${id}/reorder`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    getCategoryStats: builder.query<
      {
        success: boolean;
        message: string;
        stats: {
          totalCourses: number;
          activeCourses: number;
          totalEnrollments: number;
          subcategories: number;
        };
      },
      string
    >({
      query: id => `/categories/${id}/stats`,
      providesTags: (_result, _error, id) => [
        { type: 'Categories', id: `${id}-stats` },
      ],
    }),

    // ==================== PROFILE MANAGEMENT ====================

    // Get user profile by ID (Admin only)
    getUserProfile: builder.query<UserProfile | null, string>({
      query: userId => `/admin/users/${userId}/profile`,
      providesTags: (result, error, userId) => [
        { type: 'User', id: `profile-${userId}` },
      ],
    }),

    // Get student profile by user ID (Admin only)
    getStudentProfile: builder.query<StudentProfile | null, string>({
      query: userId => `/admin/users/${userId}/student-profile`,
      providesTags: (result, error, userId) => [
        { type: 'User', id: `student-${userId}` },
      ],
    }),

    // Get teacher profile by user ID (Admin only)
    getTeacherProfile: builder.query<TeacherProfile | null, string>({
      query: userId => `/admin/users/${userId}/teacher-profile`,
      providesTags: (result, error, userId) => [
        { type: 'User', id: `teacher-${userId}` },
      ],
    }),

    // Update user profile by ID (Admin only)
    updateUserProfile: builder.mutation<
      UserProfile,
      { userId: string; data: Partial<UserProfile> }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/profile`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `profile-${userId}` },
        { type: 'User', id: userId },
      ],
    }),

    // Update student profile by user ID (Admin only)
    updateStudentProfile: builder.mutation<
      StudentProfile,
      { userId: string; data: Partial<StudentProfile> }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/student-profile`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `student-${userId}` },
        { type: 'User', id: userId },
      ],
    }),

    // Update teacher profile by user ID (Admin only)
    updateTeacherProfile: builder.mutation<
      TeacherProfile,
      { userId: string; data: Partial<TeacherProfile> }
    >({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/teacher-profile`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: `teacher-${userId}` },
        { type: 'User', id: userId },
      ],
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

  // User Status Management hooks
  useActivateUserMutation,
  useDeactivateUserMutation,
  useSuspendUserMutation,
  useVerifyUserEmailMutation,

  // Role & Permission Management hooks
  useAssignUserRolesMutation,
  useRemoveUserRolesMutation,
  useAssignUserPermissionsMutation,
  useGetUserPermissionsQuery,

  // File Upload hooks
  useUploadUserAvatarMutation,
  useUploadUserCoverMutation,

  // Bulk Operations hooks
  useBulkUpdateUserStatusMutation,
  useBulkAssignUserRolesMutation,
  useBulkDeleteUsersMutation,

  // Import/Export hooks
  useImportUsersMutation,
  useExportUsersQuery,

  // Course Management hooks
  useGetAdminCoursesQuery,
  useGetCourseStatsQuery,
  useUpdateCourseStatusMutation,
  useBulkCourseActionsMutation,
  useDeleteAdminCourseMutation,

  // System monitoring hooks
  useGetSystemHealthQuery,
  useGetSystemMetricsQuery,
  useGetBusinessMetricsQuery,
  useGetSystemAlertsQuery,

  // Categories management hooks
  useGetCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoryMutation,
  useGetCategoryStatsQuery,

  // Profile management hooks
  useGetUserProfileQuery,
  useGetStudentProfileQuery,
  useGetTeacherProfileQuery,
  useUpdateUserProfileMutation,
  useUpdateStudentProfileMutation,
  useUpdateTeacherProfileMutation,
} = adminApi;
