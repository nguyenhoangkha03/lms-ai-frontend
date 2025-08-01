import { baseApi } from '@/lib/api/base-api';
import {
  AIGradingRequest,
  AIGradingResponse,
  BulkGradingOperation,
  Feedback,
  Grade,
  Gradebook,
  GradebookData,
  GradebookStatistics,
  GradingStatistics,
  ManualGradingQueue,
  ManualGradingSubmission,
} from '@/lib/types/gradebook';

export const gradebookApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Gradebook Management
    createGradebook: builder.mutation<Gradebook, Partial<Gradebook>>({
      query: data => ({
        url: '/gradebook',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Gradebook'],
    }),

    getGradebook: builder.query<Gradebook, string>({
      query: id => `/gradebook/${id}`,
      providesTags: ['Gradebook'],
    }),

    getGradebooks: builder.query<
      { gradebooks: Gradebook[]; total: number },
      {
        search?: string;
        courseId?: string;
        status?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/gradebook',
        params,
      }),
      providesTags: ['Gradebook'],
    }),

    updateGradebook: builder.mutation<
      Gradebook,
      { id: string; data: Partial<Gradebook> }
    >({
      query: ({ id, data }) => ({
        url: `/gradebook/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Gradebook'],
    }),

    getGradebookData: builder.query<
      GradebookData,
      { id: string; filters?: any }
    >({
      query: ({ id, filters }) => ({
        url: `/gradebook/${id}/data`,
        params: filters,
      }),
      providesTags: ['Gradebook', 'Grade'],
    }),

    getGradebookSummary: builder.query<GradebookStatistics, string>({
      query: id => `/gradebook/${id}/summary`,
      providesTags: ['Gradebook'],
    }),

    calculateGrades: builder.mutation<void, string>({
      query: id => ({
        url: `/gradebook/${id}/calculate`,
        method: 'PUT',
      }),
      invalidatesTags: ['Gradebook', 'Grade'],
    }),

    exportGradebook: builder.mutation<
      Blob,
      { id: string; format: string; options?: any }
    >({
      query: ({ id, format, options }) => ({
        url: `/gradebook/${id}/export`,
        params: { format, ...options },
        responseHandler: (response: any) => response.blob(),
      }),
    }),

    // Grading Operations
    createGrade: builder.mutation<Grade, Partial<Grade>>({
      query: data => ({
        url: '/grading',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Grade', 'Gradebook'],
    }),

    getGrades: builder.query<
      { grades: Grade[]; total: number },
      {
        filters?: any;
        pagination?: { page: number; limit: number };
      }
    >({
      query: ({ filters, pagination }) => ({
        url: '/grading',
        params: { ...filters, ...pagination },
      }),
      providesTags: ['Grade'],
    }),

    getGrade: builder.query<Grade, string>({
      query: id => `/grading/${id}`,
      providesTags: ['Grade'],
    }),

    updateGrade: builder.mutation<Grade, { id: string; data: Partial<Grade> }>({
      query: ({ id, data }) => ({
        url: `/grading/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Grade', 'Gradebook'],
    }),

    deleteGrade: builder.mutation<void, string>({
      query: id => ({
        url: `/grading/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Grade', 'Gradebook'],
    }),

    publishGrade: builder.mutation<Grade, string>({
      query: id => ({
        url: `/grading/${id}/publish`,
        method: 'PUT',
      }),
      invalidatesTags: ['Grade'],
    }),

    unpublishGrade: builder.mutation<Grade, string>({
      query: id => ({
        url: `/grading/${id}/unpublish`,
        method: 'PUT',
      }),
      invalidatesTags: ['Grade'],
    }),

    // AI Grading
    aiGradeEssay: builder.mutation<AIGradingResponse, AIGradingRequest>({
      query: data => ({
        url: '/grading/ai-grade/essay',
        method: 'POST',
        body: data,
      }),
    }),

    autoGradeMultipleChoice: builder.mutation<
      void,
      { assessmentId: string; attemptIds: string[] }
    >({
      query: data => ({
        url: '/grading/auto-grade/multiple-choice',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Grade'],
    }),

    // Feedback Management
    addFeedback: builder.mutation<Feedback, Partial<Feedback>>({
      query: data => ({
        url: '/grading/feedback',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Grade'],
    }),

    getFeedback: builder.query<Feedback[], string>({
      query: gradeId => `/grading/${gradeId}/feedback`,
      providesTags: ['Grade'],
    }),

    rateFeedback: builder.mutation<Feedback, { id: string; rating: number }>({
      query: ({ id, rating }) => ({
        url: `/grading/feedback/${id}/rate`,
        method: 'PUT',
        body: { rating },
      }),
      invalidatesTags: ['Grade'],
    }),

    // Manual Grading Queue
    getManualGradingQueue: builder.query<ManualGradingQueue[], any>({
      query: filters => ({
        url: '/manual-grading/queue',
        params: filters,
      }),
      providesTags: ['ManualGrading'],
    }),

    getManualGradingSubmission: builder.query<ManualGradingSubmission, string>({
      query: attemptId => `/manual-grading/submission/${attemptId}`,
      providesTags: ['ManualGrading'],
    }),

    submitManualGrade: builder.mutation<
      void,
      {
        attemptId: string;
        grade: Partial<Grade>;
        feedback?: Feedback[];
      }
    >({
      query: ({ attemptId, grade, feedback }) => ({
        url: `/manual-grading/grade/${attemptId}`,
        method: 'POST',
        body: { grade, feedback },
      }),
      invalidatesTags: ['ManualGrading', 'Grade'],
    }),

    getManualGradingStatistics: builder.query<
      {
        totalPending: number;
        avgGradingTime: number;
        completionRate: number;
        byAssessment: any[];
      },
      void
    >({
      query: () => '/manual-grading/statistics',
      providesTags: ['ManualGrading'],
    }),

    // Bulk Operations
    bulkCreateGrades: builder.mutation<
      BulkGradingOperation,
      {
        grades: Partial<Grade>[];
        options?: any;
      }
    >({
      query: data => ({
        url: '/grading/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Grade', 'Gradebook'],
    }),

    // Analytics
    getGradingAnalytics: builder.query<GradingStatistics, string>({
      query: assessmentId => `/grading/analytics/assessment/${assessmentId}`,
      providesTags: ['Grade'],
    }),
  }),
});

export const {
  // Gradebook hooks
  useCreateGradebookMutation,
  useGetGradebookQuery,
  useGetGradebooksQuery,
  useUpdateGradebookMutation,
  useGetGradebookDataQuery,
  useGetGradebookSummaryQuery,
  useCalculateGradesMutation,
  useExportGradebookMutation,

  // Grading hooks
  useCreateGradeMutation,
  useGetGradesQuery,
  useGetGradeQuery,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  usePublishGradeMutation,
  useUnpublishGradeMutation,

  // AI Grading hooks
  useAiGradeEssayMutation,
  useAutoGradeMultipleChoiceMutation,

  // Feedback hooks
  useAddFeedbackMutation,
  useGetFeedbackQuery,
  useRateFeedbackMutation,

  // Manual Grading hooks
  useGetManualGradingQueueQuery,
  useGetManualGradingSubmissionQuery,
  useSubmitManualGradeMutation,
  useGetManualGradingStatisticsQuery,

  // Bulk operations hooks
  useBulkCreateGradesMutation,

  // Analytics hooks
  useGetGradingAnalyticsQuery,
} = gradebookApi;
