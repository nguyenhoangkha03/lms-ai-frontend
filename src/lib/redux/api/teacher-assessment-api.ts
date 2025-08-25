import { baseApi } from '@/lib/api/base-api';
import {
  AntiCheatSettings,
  GradingRubric,
  Question,
  QuestionBankItem,
  QuestionType,
} from '@/lib/types/assessment';

// ==================== TYPES AND INTERFACES ====================

export interface AssessmentQuestion {
  id?: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  options?: string; // JSON string for multiple choice options
  correctAnswer?: string; // JSON string
  explanation?: string;
  hint?: string;
  timeLimit?: number; // in seconds
  tags?: string; // JSON string
  attachments?: string; // JSON string
  validationRules?: string; // JSON string
  orderIndex?: number;
}

export interface Assessment {
  id?: string;
  courseId?: string;
  lessonId?: string;
  teacherId: string;
  title: string;
  description: string;
  instructions?: string;
  assessmentType: 'quiz' | 'exam' | 'survey' | 'project';
  status: 'draft' | 'published' | 'archived' | 'suspended';
  timeLimit?: number; // in minutes
  maxAttempts: number;
  passingScore: number; // percentage
  totalPoints?: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  isMandatory: boolean;
  isProctored: boolean;
  availableFrom?: string; // ISO date string
  availableUntil?: string; // ISO date string
  gradingMethod: 'automatic' | 'manual' | 'hybrid';
  weight: number;
  settings?: string; // JSON string
  antiCheatSettings?: AntiCheatSettings; // JSON string
  metadata?: string; // JSON string
  questions?: Question[];
  questionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAssessmentDto {
  courseId?: string;
  lessonId?: string;
  title: string;
  description: string;
  instructions?: string;
  assessmentType:
    | 'quiz'
    | 'exam'
    | 'assignment'
    | 'survey'
    | 'practice'
    | 'final_exam'
    | 'midterm'
    | 'project';
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  isMandatory: boolean;
  isProctored: boolean;
  availableFrom?: string;
  availableUntil?: string;
  gradingMethod: 'automatic' | 'manual' | 'hybrid' | 'peer_review';
  status: 'draft' | 'published' | 'archived' | 'suspended';
  weight: number;
  settings?: Record<string, any>;
  antiCheatSettings?: AntiCheatSettings;
  metadata?: Record<string, any>;
}

export interface UpdateAssessmentDto {
  title?: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  maxAttempts?: number;
  passingScore?: number;
  randomizeQuestions?: boolean;
  randomizeAnswers?: boolean;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  isMandatory?: boolean;
  isProctored?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  gradingMethod?: 'automatic' | 'manual' | 'hybrid' | 'peer_review';
  status?: 'draft' | 'published' | 'archived' | 'suspended';
  weight?: number;
  settings?: Record<string, any>;
  antiCheatSettings?: AntiCheatSettings;
  metadata?: Record<string, any>;
}

interface AIQuestionGenerationRequest {
  lessonId?: string;
  courseId?: string;
  topic: string;
  questionType: QuestionType;
  difficulty: string;
  count: number;
  context?: string;
  learningObjectives?: string[];
  customInstructions?: string;
}

interface AIQuestionGenerationResponse {
  questions: QuestionBankItem[];
  generationMetadata: {
    modelVersion: string;
    prompt: string;
    qualityScore: number;
    suggestions: string[];
  };
}

export interface AssessmentQueryParams {
  courseId?: string;
  lessonId?: string;
  status?: 'draft' | 'published' | 'archived';
  assessmentType?: 'quiz' | 'exam' | 'survey' | 'project';
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface AssessmentResponse {
  data: Assessment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateQuestionBankDto {
  questionText: string;
  questionType:
    | 'multiple_choice'
    | 'essay'
    | 'short_answer'
    | 'fill_in_the_blank'
    | 'true_false'
    | 'matching';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  options?: Record<string, any>;
  correctAnswer?: any;
  explanation?: string;
  hint?: string;
  timeLimit?: number;
  tags?: string[];
  attachments?: any[];
  validationRules?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface QuestionBankQueryParams {
  searchQuery?: string;
  courseId?: string;
  questionType?: QuestionType;
  difficulty?: 'easy' | 'medium' | 'hard' | 'expert';
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'difficulty' | 'points';
  sortOrder?: 'asc' | 'desc';
  page?: number;
}

export interface QuestionBankResponse {
  data: Question[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QuestionBankStatistics {
  totalQuestions: number;
  questionsByType: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
  averagePoints: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
}

// ==================== API ENDPOINTS ====================

export const teacherAssessmentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Assessment CRUD Operations
    createAssessmentTeacher: builder.mutation<Assessment, CreateAssessmentDto>({
      query: assessmentData => ({
        url: '/assessments',
        method: 'POST',
        body: assessmentData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      invalidatesTags: ['Assessments'],
    }),

    getAssessments: builder.query<
      {
        message: string;
        data: Assessment[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
      },
      {
        courseId?: string;
        status?: string;
        type?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/assessments',
        params,
      }),
      providesTags: ['Assessment'],
    }),

    archiveAssessment: builder.mutation<Assessment, string>({
      query: id => ({
        url: `/assessments/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Assessment', id },
        'Assessment',
      ],
    }),

    getAssessmentById: builder.query<
      Assessment,
      { id: string; includeQuestions?: boolean }
    >({
      query: ({ id, includeQuestions = true }) => ({
        url: `/assessments/${id}`,
        params: includeQuestions ? { includeQuestions: 'true' } : {},
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      providesTags: (result, error, { id }) => [{ type: 'Assessments', id }],
    }),

    updateAssessment: builder.mutation<
      Assessment,
      { id: string; data: UpdateAssessmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/assessments/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'Assessments',
        { type: 'Assessments', id },
      ],
    }),

    generateQuestionsWithAI: builder.mutation<
      AIQuestionGenerationResponse,
      AIQuestionGenerationRequest
    >({
      query: data => ({
        url: '/content-analysis/quiz-generation/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBank'],
    }),

    duplicateAssessment: builder.mutation<Assessment, string>({
      query: id => ({
        url: `/assessments/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['Assessment'],
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
    }),

    getGradingRubrics: builder.query<
      {
        rubrics: GradingRubric[];
        total: number;
        page: number;
        limit: number;
      },
      {
        assessmentId?: string;
        isTemplate?: boolean;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/grading-rubrics',
        params,
      }),
      providesTags: ['GradingRubric'],
    }),

    updateGradingRubric: builder.mutation<
      GradingRubric,
      { id: string; data: Partial<GradingRubric> }
    >({
      query: ({ id, data }) => ({
        url: `/grading-rubrics/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'GradingRubric', id },
        'GradingRubric',
      ],
    }),

    createGradingRubric: builder.mutation<
      GradingRubric,
      Partial<GradingRubric>
    >({
      query: data => ({
        url: '/grading-rubrics',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GradingRubric'],
    }),

    deleteAssessment: builder.mutation<void, string>({
      query: id => ({
        url: `/assessments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assessments'],
    }),

    publishAssessment: builder.mutation<Assessment, string>({
      query: id => ({
        url: `/assessments/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      invalidatesTags: (result, error, id) => [
        'Assessments',
        { type: 'Assessments', id },
      ],
    }),

    importQuestionsToAssessment: builder.mutation<
      void,
      { assessmentId: string; questionIds: string[]; importSettings?: any }
    >({
      query: ({ assessmentId, questionIds, importSettings }) => ({
        url: `/assessments/${assessmentId}/import-questions`,
        method: 'POST',
        body: { questionIds, importSettings },
      }),
      invalidatesTags: (result, error, { assessmentId }) => [
        { type: 'Assessment', id: assessmentId },
      ],
    }),

    // Question Bank CRUD Operations
    createQuestionBankQuestion: builder.mutation<
      Question,
      CreateQuestionBankDto
    >({
      query: questionData => ({
        url: '/assessments/question-bank',
        method: 'POST',
        body: questionData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Question;
      }) => response.data,
      invalidatesTags: ['QuestionBank'],
    }),

    getQuestionBankQuestions: builder.query<
      QuestionBankResponse,
      QuestionBankQueryParams
    >({
      query: (params = {}) => ({
        url: '/assessments/question-bank',
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
        data: Question[];
        meta?: any;
      }) => {
        const questions = response.data || [];
        const totalCount = response.meta?.totalCount || questions.length;
        const limit = response.meta?.limit || 20;
        const offset = response.meta?.offset || 0;
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(totalCount / limit);

        return {
          data: questions,
          meta: {
            total: totalCount,
            page: currentPage,
            limit,
            totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
          },
        };
      },
      providesTags: ['QuestionBank'],
    }),

    getQuestionBankQuestionById: builder.query<Question, string>({
      query: id => `/assessments/question-bank/${id}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Question;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'QuestionBank', id }],
    }),

    updateQuestionBankQuestion: builder.mutation<
      Question,
      { id: string; data: Partial<CreateQuestionBankDto> }
    >({
      query: ({ id, data }) => ({
        url: `/assessments/question-bank/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Question;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'QuestionBank',
        { type: 'QuestionBank', id },
      ],
    }),

    deleteQuestionBankQuestion: builder.mutation<void, string>({
      query: id => ({
        url: `/assessments/question-bank/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QuestionBank'],
    }),

    getQuestionBankStatistics: builder.query<QuestionBankStatistics, string>({
      query: courseId => ({
        url: '/assessments/question-bank/statistics',
        params: { courseId },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: QuestionBankStatistics;
      }) => response.data,
      providesTags: ['QuestionBankStats'],
    }),

    getRandomQuestions: builder.query<
      Question[],
      {
        count: number;
        difficulty?: 'easy' | 'medium' | 'hard';
        questionType?: QuestionType;
        tags?: string[];
      }
    >({
      query: params => ({
        url: '/assessments/question-bank/random',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Question[];
      }) => response.data,
    }),

    // Assessment Configuration
    configureAssessment: builder.mutation<
      Assessment,
      {
        id: string;
        configuration: {
          randomizeQuestions?: boolean;
          randomizeAnswers?: boolean;
          timeLimit?: number;
          maxAttempts?: number;
          settings?: Record<string, any>;
          antiCheatSettings?: Record<string, any>;
        };
      }
    >({
      query: ({ id, configuration }) => ({
        url: `/assessments/${id}/configure`,
        method: 'PATCH',
        body: configuration,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'Assessments',
        { type: 'Assessments', id },
      ],
    }),

    // Add questions to assessment (from question bank using IDs)
    addQuestionsToAssessment: builder.mutation<
      Assessment,
      {
        assessmentId: string;
        questionIds: string[];
      }
    >({
      query: ({ assessmentId, questionIds }) => ({
        url: `/assessments/${assessmentId}/questions`,
        method: 'POST',
        body: { questionIds },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      invalidatesTags: (result, error, { assessmentId }) => [
        'Assessments',
        { type: 'Assessments', id: assessmentId },
      ],
    }),

    // Create questions directly for assessment
    createQuestionsForAssessment: builder.mutation<
      any,
      {
        assessmentId: string;
        questions: any[];
      }
    >({
      query: ({ assessmentId, questions }) => ({
        url: `/assessments/${assessmentId}/questions`,
        method: 'POST',
        body: questions,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      invalidatesTags: (result, error, { assessmentId }) => [
        'Assessments',
        { type: 'Assessments', id: assessmentId },
      ],
    }),

    // Remove questions from assessment
    removeQuestionsFromAssessment: builder.mutation<
      Assessment,
      {
        assessmentId: string;
        questionIds: string[];
      }
    >({
      query: ({ assessmentId, questionIds }) => ({
        url: `/assessments/${assessmentId}/questions`,
        method: 'DELETE',
        body: { questionIds },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: Assessment;
      }) => response.data,
      invalidatesTags: (result, error, { assessmentId }) => [
        'Assessments',
        { type: 'Assessments', id: assessmentId },
      ],
    }),
  }),
});

// Export hooks
export const {
  useCreateAssessmentTeacherMutation,
  useGetAssessmentsQuery,
  useGetAssessmentByIdQuery,
  useGenerateQuestionsWithAIMutation,
  useImportQuestionsToAssessmentMutation,
  useDuplicateAssessmentMutation,
  useUpdateAssessmentMutation,
  useDeleteAssessmentMutation,
  usePublishAssessmentMutation,
  useArchiveAssessmentMutation,
  useCreateQuestionBankQuestionMutation,
  useGetQuestionBankQuestionsQuery,
  useGetQuestionBankQuestionByIdQuery,
  useUpdateQuestionBankQuestionMutation,
  useDeleteQuestionBankQuestionMutation,
  useGetQuestionBankStatisticsQuery,
  useGetRandomQuestionsQuery,
  useConfigureAssessmentMutation,
  useAddQuestionsToAssessmentMutation,
  useCreateQuestionsForAssessmentMutation,
  useRemoveQuestionsFromAssessmentMutation,
  useGetGradingRubricsQuery,
  useCreateGradingRubricMutation,
  useUpdateGradingRubricMutation,
} = teacherAssessmentApi;
