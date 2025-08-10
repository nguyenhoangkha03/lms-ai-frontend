import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface QuizQuestion {
  id?: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  timeLimit?: number; // in seconds
}

export interface GeneratedQuiz {
  id: string;
  title: string;
  description?: string;
  lessonId?: string;
  lessonTitle?: string;
  courseId?: string;
  courseName?: string;
  questions: QuizQuestion[];
  totalPoints: number;
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  allowMultipleAttempts: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'published';
  generatedBy: 'ai' | 'manual';
  reviewComments?: string;
  aiConfidenceScore?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface GenerateQuizRequest {
  lessonId: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  questionTypes: ('multiple_choice' | 'true_false' | 'short_answer' | 'essay')[];
  focusAreas?: string[];
  includeExplanations: boolean;
  timePerQuestion?: number; // in seconds
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  questions?: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  allowMultipleAttempts?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  showScoreImmediately?: boolean;
}

export interface ReviewQuizRequest {
  status: 'approved' | 'rejected';
  comments?: string;
}

export interface QuizQueryParams {
  lessonId?: string;
  courseId?: string;
  status?: 'draft' | 'under_review' | 'approved' | 'rejected' | 'published';
  generatedBy?: 'ai' | 'manual';
  createdBy?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface QuizStatistics {
  totalQuizzes: number;
  draftQuizzes: number;
  publishedQuizzes: number;
  averageScore: number;
  completionRate: number;
  aiGeneratedCount: number;
  manuallyCreatedCount: number;
  recentActivity: {
    date: string;
    quizzesCreated: number;
    quizzesCompleted: number;
    averageScore: number;
  }[];
  topPerformingQuizzes: {
    id: string;
    title: string;
    averageScore: number;
    completionRate: number;
  }[];
  questionTypeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
}

export interface BulkQuizAction {
  quizIds: string[];
  action: 'publish' | 'archive' | 'delete' | 'review';
}

// ==================== API ENDPOINTS ====================

export const teacherQuizBuilderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Generate quiz using AI
    generateQuiz: builder.mutation<GeneratedQuiz, GenerateQuizRequest>({
      query: (generateData) => ({
        url: '/content-analysis/quiz-generation/generate',
        method: 'POST',
        body: generateData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: ['GeneratedQuizzes'],
    }),

    // Get all generated quizzes
    getGeneratedQuizzes: builder.query<
      {
        quizzes: GeneratedQuiz[];
        totalCount: number;
        pagination: {
          currentPage: number;
          totalPages: number;
          hasMore: boolean;
        };
      },
      QuizQueryParams
    >({
      query: (params = {}) => ({
        url: '/content-analysis/quiz-generation',
        params: {
          limit: 20,
          offset: 0,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...params,
        },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz[];
        meta?: any;
      }) => {
        const quizzes = response.data || [];
        const totalCount = response.meta?.totalCount || quizzes.length;
        const limit = response.meta?.limit || 20;
        const offset = response.meta?.offset || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(totalCount / limit);

        return {
          quizzes,
          totalCount,
          pagination: {
            currentPage,
            totalPages,
            hasMore: currentPage < totalPages,
          },
        };
      },
      providesTags: ['GeneratedQuizzes'],
    }),

    // Get quiz by ID
    getQuizById: builder.query<GeneratedQuiz, string>({
      query: (id) => `/content-analysis/quiz-generation/${id}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'GeneratedQuizzes', id }],
    }),

    // Get quizzes by lesson
    getQuizzesByLesson: builder.query<GeneratedQuiz[], string>({
      query: (lessonId) => `/content-analysis/quiz-generation/lesson/${lessonId}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz[];
      }) => response.data,
      providesTags: (result, error, lessonId) => [
        { type: 'GeneratedQuizzes', id: `lesson-${lessonId}` },
      ],
    }),

    // Update quiz
    updateQuiz: builder.mutation<
      GeneratedQuiz,
      { id: string; updateData: UpdateQuizRequest }
    >({
      query: ({ id, updateData }) => ({
        url: `/content-analysis/quiz-generation/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'GeneratedQuizzes',
        { type: 'GeneratedQuizzes', id },
      ],
    }),

    // Review quiz
    reviewQuiz: builder.mutation<
      GeneratedQuiz,
      { id: string; reviewData: ReviewQuizRequest }
    >({
      query: ({ id, reviewData }) => ({
        url: `/content-analysis/quiz-generation/${id}/review`,
        method: 'PUT',
        body: reviewData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'GeneratedQuizzes',
        { type: 'GeneratedQuizzes', id },
      ],
    }),

    // Approve quiz
    approveQuiz: builder.mutation<GeneratedQuiz, string>({
      query: (id) => ({
        url: `/content-analysis/quiz-generation/${id}/approve`,
        method: 'PUT',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: (result, error, id) => [
        'GeneratedQuizzes',
        { type: 'GeneratedQuizzes', id },
      ],
    }),

    // Reject quiz
    rejectQuiz: builder.mutation<
      GeneratedQuiz,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/content-analysis/quiz-generation/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'GeneratedQuizzes',
        { type: 'GeneratedQuizzes', id },
      ],
    }),

    // Delete quiz
    deleteQuiz: builder.mutation<void, string>({
      query: (id) => ({
        url: `/content-analysis/quiz-generation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GeneratedQuizzes'],
    }),

    // Create manual quiz
    createManualQuiz: builder.mutation<
      GeneratedQuiz,
      {
        title: string;
        description?: string;
        lessonId?: string;
        courseId?: string;
        questions: QuizQuestion[];
        timeLimit?: number;
        passingScore: number;
        allowMultipleAttempts: boolean;
        shuffleQuestions: boolean;
        shuffleOptions: boolean;
        showCorrectAnswers: boolean;
        showScoreImmediately: boolean;
      }
    >({
      query: (quizData) => ({
        url: '/teacher/quizzes',
        method: 'POST',
        body: {
          ...quizData,
          generatedBy: 'manual',
          status: 'draft',
        },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: ['GeneratedQuizzes'],
    }),

    // Duplicate quiz
    duplicateQuiz: builder.mutation<
      GeneratedQuiz,
      { id: string; title?: string }
    >({
      query: ({ id, title }) => ({
        url: `/content-analysis/quiz-generation/${id}/duplicate`,
        method: 'POST',
        body: title ? { title } : {},
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GeneratedQuiz;
      }) => response.data,
      invalidatesTags: ['GeneratedQuizzes'],
    }),

    // Bulk actions
    bulkQuizActions: builder.mutation<
      { processedCount: number },
      BulkQuizAction
    >({
      query: (bulkData) => ({
        url: '/teacher/quizzes/bulk-actions',
        method: 'POST',
        body: bulkData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { processedCount: number };
      }) => response.data,
      invalidatesTags: ['GeneratedQuizzes'],
    }),

    // Get quiz statistics
    getQuizStatistics: builder.query<
      QuizStatistics,
      { dateRange?: '7d' | '30d' | '90d' | '1y' }
    >({
      query: ({ dateRange = '30d' }) => ({
        url: '/teacher/quizzes/statistics',
        params: { dateRange },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: QuizStatistics;
      }) => response.data,
      providesTags: ['QuizStatistics'],
    }),

    // Import questions from file
    importQuestions: builder.mutation<
      { questions: QuizQuestion[]; importedCount: number },
      { file: File; format: 'csv' | 'json' | 'xlsx' }
    >({
      query: ({ file, format }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);

        return {
          url: '/teacher/quizzes/import-questions',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { questions: QuizQuestion[]; importedCount: number };
      }) => response.data,
    }),

    // Export quiz
    exportQuiz: builder.mutation<
      { downloadUrl: string },
      { id: string; format: 'pdf' | 'docx' | 'json' }
    >({
      query: ({ id, format }) => ({
        url: `/teacher/quizzes/${id}/export`,
        method: 'POST',
        body: { format },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { downloadUrl: string };
      }) => response.data,
    }),

    // Generate question suggestions
    generateQuestionSuggestions: builder.mutation<
      { suggestions: QuizQuestion[] },
      {
        topic: string;
        difficulty: 'easy' | 'medium' | 'hard';
        questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
        count: number;
      }
    >({
      query: (params) => ({
        url: '/teacher/quizzes/generate-suggestions',
        method: 'POST',
        body: params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { suggestions: QuizQuestion[] };
      }) => response.data,
    }),
  }),
});

// Export hooks
export const {
  useGenerateQuizMutation,
  useGetGeneratedQuizzesQuery,
  useGetQuizByIdQuery,
  useGetQuizzesByLessonQuery,
  useUpdateQuizMutation,
  useReviewQuizMutation,
  useApproveQuizMutation,
  useRejectQuizMutation,
  useDeleteQuizMutation,
  useCreateManualQuizMutation,
  useDuplicateQuizMutation,
  useBulkQuizActionsMutation,
  useGetQuizStatisticsQuery,
  useImportQuestionsMutation,
  useExportQuizMutation,
  useGenerateQuestionSuggestionsMutation,
} = teacherQuizBuilderApi;