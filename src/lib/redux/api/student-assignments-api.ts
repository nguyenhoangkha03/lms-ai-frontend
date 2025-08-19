import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  instructorName: string;
  status: 'draft' | 'published' | 'archived';
  dueDate?: string;
  maxPoints: number;
  requirements?: AssignmentRequirement[];
  rubric?: AssignmentRubric[];
  attachments?: AssignmentFile[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentRequirement {
  id: string;
  type: 'file_upload' | 'text_submission' | 'file_format' | 'word_limit';
  description: string;
  value?: string | number;
  required: boolean;
}

export interface AssignmentRubric {
  id: string;
  criterion: string;
  maxPoints: number;
  description: string;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  points: number;
  description: string;
}

export interface AssignmentFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: 'not_submitted' | 'submitted' | 'graded' | 'late' | 'missing';
  submittedAt?: string;
  textSubmission?: string;
  files?: SubmissionFile[];
  score?: number;
  feedback?: string;
  rubricScores?: RubricScore[];
  isLate: boolean;
  attemptNumber: number;
  gradedAt?: string;
  gradedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface RubricScore {
  rubricId: string;
  levelId: string;
  points: number;
  feedback?: string;
}

export interface StudentAssignmentStats {
  total: number;
  submitted: number;
  graded: number;
  late: number;
  missing: number;
  averageScore: number;
  completionRate: number;
}

export interface CreateSubmissionRequest {
  assignmentId: string;
  textSubmission?: string;
  files?: File[];
}

export interface UpdateSubmissionRequest {
  textSubmission?: string;
  files?: File[];
}

// ==================== API ENDPOINTS ====================

export const studentAssignmentsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get student's assignments
    getStudentAssignments: builder.query<
      {
        assignments: Assignment[];
        total: number;
        stats: StudentAssignmentStats;
      },
      {
        courseId?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/assignments/student',
        params,
      }),
      providesTags: ['Assignment'],
    }),

    // Get specific assignment for student
    getStudentAssignment: builder.query<
      Assignment & {
        submission?: AssignmentSubmission;
        canSubmit: boolean;
        timeRemaining?: number;
      },
      string
    >({
      query: assignmentId => `/assignments/${assignmentId}/student`,
      providesTags: (_result, _error, assignmentId) => [
        { type: 'Assignment', id: assignmentId },
        { type: 'Submission', id: assignmentId },
      ],
    }),

    // Get student's submission for assignment
    getSubmission: builder.query<AssignmentSubmission, string>({
      query: assignmentId => `/assignments/${assignmentId}/submission`,
      providesTags: (_result, _error, assignmentId) => [
        { type: 'Submission', id: assignmentId },
      ],
    }),

    // Create/submit assignment
    createSubmission: builder.mutation<
      AssignmentSubmission,
      CreateSubmissionRequest
    >({
      query: ({ assignmentId, ...data }) => {
        const formData = new FormData();
        
        if (data.textSubmission) {
          formData.append('textSubmission', data.textSubmission);
        }
        
        if (data.files) {
          data.files.forEach((file, index) => {
            formData.append(`files`, file);
          });
        }

        return {
          url: `/assignments/${assignmentId}/submit`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
        { type: 'Submission', id: assignmentId },
        'Assignment',
      ],
    }),

    // Update submission (before final submit)
    updateSubmission: builder.mutation<
      AssignmentSubmission,
      {
        assignmentId: string;
        data: UpdateSubmissionRequest;
      }
    >({
      query: ({ assignmentId, data }) => {
        const formData = new FormData();
        
        if (data.textSubmission) {
          formData.append('textSubmission', data.textSubmission);
        }
        
        if (data.files) {
          data.files.forEach((file, index) => {
            formData.append(`files`, file);
          });
        }

        return {
          url: `/assignments/${assignmentId}/submission`,
          method: 'PUT',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
        { type: 'Submission', id: assignmentId },
      ],
    }),

    // Delete submission file
    deleteSubmissionFile: builder.mutation<
      void,
      {
        assignmentId: string;
        fileId: string;
      }
    >({
      query: ({ assignmentId, fileId }) => ({
        url: `/assignments/${assignmentId}/submission/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        { type: 'Submission', id: assignmentId },
      ],
    }),

    // Get assignment submission history
    getSubmissionHistory: builder.query<
      AssignmentSubmission[],
      string
    >({
      query: assignmentId => `/assignments/${assignmentId}/submission/history`,
      providesTags: (_result, _error, assignmentId) => [
        { type: 'Submission', id: `${assignmentId}-history` },
      ],
    }),

    // Download assignment file
    downloadAssignmentFile: builder.mutation<
      Blob,
      {
        assignmentId: string;
        fileId: string;
      }
    >({
      query: ({ assignmentId, fileId }) => ({
        url: `/assignments/${assignmentId}/files/${fileId}/download`,
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    // Download submission file
    downloadSubmissionFile: builder.mutation<
      Blob,
      {
        assignmentId: string;
        fileId: string;
      }
    >({
      query: ({ assignmentId, fileId }) => ({
        url: `/assignments/${assignmentId}/submission/files/${fileId}/download`,
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    // Get assignment analytics for student
    getAssignmentAnalytics: builder.query<
      {
        timeSpent: number;
        submissionCount: number;
        averageScore: number;
        rankInClass?: number;
        classAverage?: number;
        completionTrend: Array<{
          date: string;
          submitted: number;
          total: number;
        }>;
      },
      {
        courseId?: string;
        timeRange?: 'week' | 'month' | 'semester';
      }
    >({
      query: params => ({
        url: '/assignments/student/analytics',
        params,
      }),
      providesTags: ['Assignment'],
    }),
  }),
});

export const {
  useGetStudentAssignmentsQuery,
  useGetStudentAssignmentQuery,
  useGetSubmissionQuery,
  useCreateSubmissionMutation,
  useUpdateSubmissionMutation,
  useDeleteSubmissionFileMutation,
  useGetSubmissionHistoryQuery,
  useDownloadAssignmentFileMutation,
  useDownloadSubmissionFileMutation,
  useGetAssignmentAnalyticsQuery,
} = studentAssignmentsApi;