import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  courseId: string;
  courseName: string;
  dueDate: string;
  maxScore: number;
  submissionType: 'file' | 'text' | 'both';
  allowLateSubmissions: boolean;
  lateSubmissionPenalty?: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  resources?: string[];
  rubric?: AssignmentRubric[];
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRubric {
  id: string;
  criterion: string;
  maxScore: number;
  description: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'late' | 'missing';
  score?: number;
  feedback?: string;
  isLate: boolean;
  submissionType: 'file' | 'text' | 'both';
  files?: SubmissionFile[];
  textSubmission?: string;
  rubricScores?: RubricScore[];
  gradeHistory: GradeHistory[];
}

export interface SubmissionFile {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface RubricScore {
  criterionId: string;
  score: number;
}

export interface GradeHistory {
  gradedAt: string;
  gradedBy: string;
  score: number;
  feedback: string;
}

export interface AssignmentStatistics {
  totalAssignments: number;
  activeAssignments: number;
  draftAssignments: number;
  completedAssignments: number;
  totalSubmissions: number;
  pendingGrading: number;
  gradedSubmissions: number;
  averageGradingTime: number; // minutes
  averageScore: number;
  submissionTrends: {
    date: string;
    submissions: number;
  }[];
  gradingWorkload: {
    courseId: string;
    courseName: string;
    pendingCount: number;
  }[];
}

export interface CreateAssignmentRequest {
  courseId: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  submissionType: 'file' | 'text' | 'both';
  allowLateSubmissions: boolean;
  lateSubmissionPenalty?: number;
  resources?: string[];
  rubric?: Omit<AssignmentRubric, 'id'>[];
}

export interface UpdateAssignmentRequest extends Partial<CreateAssignmentRequest> {
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

export interface GradeSubmissionRequest {
  score: number;
  feedback: string;
  rubricScores?: RubricScore[];
}

export interface BulkGradeRequest {
  submissions: {
    submissionId: string;
    score: number;
    feedback: string;
  }[];
}

// ==================== API ENDPOINTS ====================

export const teacherAssignmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all assignments for teacher
    getTeacherAssignments: builder.query<
      Assignment[],
      {
        courseId?: string;
        status?: string;
        limit?: number;
        offset?: number;
      }
    >({
      query: ({ courseId, status, limit = 20, offset = 0 }) => ({
        url: '/teacher/assignments',
        params: { courseId, status, limit, offset },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assignment[];
        pagination: { total: number; limit: number; offset: number };
      }) => response.data,
      providesTags: ['TeacherAssignments'],
    }),

    // Get assignment by ID
    getAssignmentById: builder.query<Assignment, string>({
      query: (assignmentId) => `/teacher/assignments/${assignmentId}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assignment;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'TeacherAssignments', id }],
    }),

    // Create new assignment
    createAssignment: builder.mutation<Assignment, CreateAssignmentRequest>({
      query: (assignmentData) => ({
        url: '/teacher/assignments',
        method: 'POST',
        body: assignmentData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assignment;
      }) => response.data,
      invalidatesTags: ['TeacherAssignments'],
    }),

    // Update assignment
    updateAssignment: builder.mutation<
      Assignment,
      { id: string; updates: UpdateAssignmentRequest }
    >({
      query: ({ id, updates }) => ({
        url: `/teacher/assignments/${id}`,
        method: 'PUT',
        body: updates,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assignment;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'TeacherAssignments',
        { type: 'TeacherAssignments', id },
      ],
    }),

    // Delete assignment
    deleteAssignment: builder.mutation<void, string>({
      query: (assignmentId) => ({
        url: `/teacher/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TeacherAssignments'],
    }),

    // Get assignment submissions
    getAssignmentSubmissions: builder.query<
      AssignmentSubmission[],
      { assignmentId: string; status?: string }
    >({
      query: ({ assignmentId, status }) => ({
        url: `/teacher/assignments/${assignmentId}/submissions`,
        params: { status },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AssignmentSubmission[];
      }) => response.data,
      providesTags: (result, error, { assignmentId }) => [
        { type: 'AssignmentSubmissions', id: assignmentId },
      ],
    }),

    // Grade submission
    gradeSubmission: builder.mutation<
      AssignmentSubmission,
      {
        assignmentId: string;
        submissionId: string;
        gradeData: GradeSubmissionRequest;
      }
    >({
      query: ({ assignmentId, submissionId, gradeData }) => ({
        url: `/teacher/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        method: 'POST',
        body: gradeData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AssignmentSubmission;
      }) => response.data,
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'AssignmentSubmissions', id: assignmentId },
        'TeacherAssignments',
      ],
    }),

    // Bulk grade submissions
    bulkGradeSubmissions: builder.mutation<
      { gradedCount: number },
      { assignmentId: string; gradeData: BulkGradeRequest }
    >({
      query: ({ assignmentId, gradeData }) => ({
        url: `/teacher/assignments/${assignmentId}/bulk-grade`,
        method: 'POST',
        body: gradeData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { gradedCount: number };
      }) => response.data,
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'AssignmentSubmissions', id: assignmentId },
        'TeacherAssignments',
      ],
    }),

    // Get assignment statistics
    getAssignmentStatistics: builder.query<AssignmentStatistics, void>({
      query: () => '/teacher/assignments/statistics/overview',
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AssignmentStatistics;
      }) => response.data,
      providesTags: ['AssignmentStatistics'],
    }),

    // Duplicate assignment
    duplicateAssignment: builder.mutation<Assignment, string>({
      query: (assignmentId) => ({
        url: `/teacher/assignments/${assignmentId}/duplicate`,
        method: 'POST',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assignment;
      }) => response.data,
      invalidatesTags: ['TeacherAssignments'],
    }),

    // Publish assignment (change from draft to active)
    publishAssignment: builder.mutation<Assignment, string>({
      query: (assignmentId) => ({
        url: `/teacher/assignments/${assignmentId}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assignment;
      }) => response.data,
      invalidatesTags: (result, error, assignmentId) => [
        'TeacherAssignments',
        { type: 'TeacherAssignments', id: assignmentId },
      ],
    }),

    // Get grading queue (pending submissions across all assignments)
    getGradingQueue: builder.query<
      AssignmentSubmission[],
      {
        courseId?: string;
        priority?: 'due_soon' | 'overdue' | 'newest';
        limit?: number;
      }
    >({
      query: ({ courseId, priority, limit = 20 }) => ({
        url: '/teacher/assignments/grading-queue',
        params: { courseId, priority, limit },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AssignmentSubmission[];
      }) => response.data,
      providesTags: ['GradingQueue'],
    }),

    // Export assignment data
    exportAssignmentData: builder.mutation<
      { downloadUrl: string },
      {
        assignmentId: string;
        format: 'csv' | 'xlsx' | 'pdf';
        includeSubmissions?: boolean;
      }
    >({
      query: ({ assignmentId, format, includeSubmissions = true }) => ({
        url: `/teacher/assignments/${assignmentId}/export`,
        method: 'POST',
        body: { format, includeSubmissions },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { downloadUrl: string };
      }) => response.data,
    }),

    // Get assignment analytics
    getAssignmentAnalytics: builder.query<
      {
        submissionRate: number;
        averageScore: number;
        scoreDistribution: { range: string; count: number }[];
        submissionTimeline: { date: string; count: number }[];
        topPerformers: { studentName: string; score: number }[];
        strugglingStudents: { studentName: string; score: number }[];
      },
      string
    >({
      query: (assignmentId) => `/teacher/assignments/${assignmentId}/analytics`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: (result, error, id) => [
        { type: 'AssignmentAnalytics', id },
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetTeacherAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetAssignmentSubmissionsQuery,
  useGradeSubmissionMutation,
  useBulkGradeSubmissionsMutation,
  useGetAssignmentStatisticsQuery,
  useDuplicateAssignmentMutation,
  usePublishAssignmentMutation,
  useGetGradingQueueQuery,
  useExportAssignmentDataMutation,
  useGetAssignmentAnalyticsQuery,
} = teacherAssignmentsApi;