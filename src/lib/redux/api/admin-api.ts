import { baseApi } from '@/lib/api/base-api';
import {
  TeacherApplication,
  TeacherApplicationQuery,
  ApprovalDecision,
} from '@/lib/types';

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
    getTeacherApplications: builder.query<TeacherApplicationsResponse, TeacherApplicationQuery>({
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

    // Document verification for admin
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
} = adminApi;