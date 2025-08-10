import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface TeacherSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
  courseName: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  submittedAt: string;
  dueDate: string;
  status: 'pending_review' | 'in_review' | 'graded' | 'needs_revision';
  isLate: boolean;
  attempt: number;
  maxAttempts: number;
  files: {
    name: string;
    size: string;
    type: string;
  }[];
  textSubmission?: string;
  currentGrade?: number;
  maxScore: number;
  gradingStatus: 'not_graded' | 'in_progress' | 'graded';
  aiCheck?: {
    plagiarismScore: number;
    qualityScore: number;
    completenessScore: number;
  };
}

export interface SubmissionFilters {
  courseId?: string;
  assignmentId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SubmissionsResponse {
  submissions: TeacherSubmission[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// ==================== API ENDPOINTS ====================

export const teacherSubmissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all submissions for teacher across all assignments
    getAllTeacherSubmissions: builder.query<
      SubmissionsResponse,
      SubmissionFilters
    >({
      query: ({ courseId, assignmentId, status, limit = 20, offset = 0 }) => ({
        url: '/teacher/submissions',
        params: { courseId, assignmentId, status, limit, offset },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherSubmission[];
        pagination: { total: number; limit: number; offset: number };
      }) => ({
        submissions: response.data,
        pagination: response.pagination,
      }),
      providesTags: ['TeacherSubmissions'],
    }),

    // Get submissions for specific assignment
    getAssignmentSubmissions: builder.query<
      TeacherSubmission[],
      { assignmentId: string; status?: string }
    >({
      query: ({ assignmentId, status }) => ({
        url: `/teacher/assignments/${assignmentId}/submissions`,
        params: { status },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherSubmission[];
      }) => response.data,
      providesTags: (result, error, { assignmentId }) => [
        { type: 'TeacherSubmissions', id: assignmentId },
      ],
    }),

    // Grade a submission
    gradeSubmission: builder.mutation<
      any,
      {
        assignmentId: string;
        submissionId: string;
        gradeData: {
          score: number;
          feedback: string;
          rubricScores?: { criterionId: string; score: number }[];
        };
      }
    >({
      query: ({ assignmentId, submissionId, gradeData }) => ({
        url: `/teacher/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        method: 'POST',
        body: gradeData,
      }),
      invalidatesTags: ['TeacherSubmissions'],
    }),

    // Bulk grade submissions
    bulkGradeSubmissions: builder.mutation<
      { gradedCount: number },
      {
        assignmentId: string;
        submissions: {
          submissionId: string;
          score: number;
          feedback: string;
        }[];
      }
    >({
      query: ({ assignmentId, submissions }) => ({
        url: `/teacher/assignments/${assignmentId}/bulk-grade`,
        method: 'POST',
        body: { submissions },
      }),
      invalidatesTags: ['TeacherSubmissions'],
    }),

    // Get submission statistics
    getSubmissionStatistics: builder.query<
      {
        total: number;
        pendingReview: number;
        inReview: number;
        graded: number;
        needsRevision: number;
        lateSubmissions: number;
      },
      void
    >({
      query: () => ({
        url: '/teacher/submissions/statistics',
      }),
      transformResponse: (response: {
        success: boolean;
        data: any;
      }) => response.data,
      providesTags: ['TeacherSubmissions'],
    }),
  }),
});

// Export hooks
export const {
  useGetAllTeacherSubmissionsQuery,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
  useBulkGradeSubmissionsMutation,
  useGetSubmissionStatisticsQuery,
} = teacherSubmissionsApi;