import { baseApi } from '@/lib/api/base-api';
import {
  AnalyzeSimilarityRequest,
  AssessContentQualityRequest,
  CheckPlagiarismRequest,
  ContentQualityAssessment,
  ContentTag,
  GeneratedQuiz,
  GenerateQuizRequest,
  GenerateTagsRequest,
  PlagiarismCheck,
  SimilarityAnalysis,
} from '@/lib/types/content-analysis';

export const contentAnalysisApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Quality Assessment
    getQualityAssessments: builder.query<
      {
        data: ContentQualityAssessment[];
        total: number;
        page: number;
        limit: number;
      },
      {
        page?: number;
        limit?: number;
        content_type?: 'course' | 'lesson';
        quality_level?: string;
        search?: string;
      }
    >({
      query: params => ({
        url: '/content-analysis/quality',
        params,
      }),
      providesTags: ['ContentQuality'],
    }),

    assessContentQuality: builder.mutation<
      ContentQualityAssessment,
      AssessContentQualityRequest
    >({
      query: data => ({
        url: '/content-analysis/quality/assess',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentQuality'],
    }),

    bulkAssessContentQuality: builder.mutation<
      { results: ContentQualityAssessment[]; failures: any[] },
      {
        content_items: Array<{
          content_type: 'course' | 'lesson';
          content_id: string;
        }>;
      }
    >({
      query: data => ({
        url: '/content-analysis/quality/bulk-assess',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentQuality'],
    }),

    getQualityStatistics: builder.query<
      {
        overview: {
          total_assessments: number;
          average_score: number;
          quality_distribution: Record<string, number>;
        };
        trends: Array<{
          date: string;
          average_score: number;
          assessments_count: number;
        }>;
        by_content_type: Record<
          string,
          {
            count: number;
            average_score: number;
          }
        >;
      },
      { period?: '7d' | '30d' | '90d' | '1y' }
    >({
      query: params => ({
        url: '/content-analysis/quality/statistics',
        params,
      }),
      providesTags: ['ContentQuality'],
    }),

    getQualityTrends: builder.query<
      {
        trends: Array<{
          date: string;
          score: number;
          assessment_count: number;
        }>;
        improvements: Array<{
          dimension: string;
          change: number;
          period: string;
        }>;
      },
      { content_type: 'course' | 'lesson'; content_id: string; period?: string }
    >({
      query: ({ content_type, content_id, ...params }) => ({
        url: `/content-analysis/quality/trends/${content_type}/${content_id}`,
        params,
      }),
      providesTags: ['ContentQuality'],
    }),

    // Plagiarism Detection
    getPlagiarismChecks: builder.query<
      {
        data: PlagiarismCheck[];
        total: number;
        page: number;
        limit: number;
      },
      {
        page?: number;
        limit?: number;
        content_type?: string;
        status?: string;
        plagiarism_level?: string;
        search?: string;
      }
    >({
      query: params => ({
        url: '/content-analysis/plagiarism',
        params,
      }),
      providesTags: ['PlagiarismCheck'],
    }),

    getPlagiarismCheckById: builder.query<PlagiarismCheck, string>({
      query: id => `/content-analysis/plagiarism/${id}`,
      providesTags: ['PlagiarismCheck'],
    }),

    checkPlagiarism: builder.mutation<PlagiarismCheck, CheckPlagiarismRequest>({
      query: data => ({
        url: '/content-analysis/plagiarism/check',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PlagiarismCheck'],
    }),

    bulkCheckPlagiarism: builder.mutation<
      { results: PlagiarismCheck[]; failures: any[] },
      { content_items: Array<{ content_type: string; content_id: string }> }
    >({
      query: data => ({
        url: '/content-analysis/plagiarism/bulk-check',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PlagiarismCheck'],
    }),

    getPlagiarismStatistics: builder.query<
      {
        overview: {
          total_checks: number;
          flagged_content: number;
          average_similarity: number;
          by_level: Record<string, number>;
        };
        trends: Array<{
          date: string;
          checks_count: number;
          flagged_count: number;
          average_similarity: number;
        }>;
        top_sources: Array<{
          source: string;
          matches: number;
          average_similarity: number;
        }>;
      },
      { period?: '7d' | '30d' | '90d' | '1y' }
    >({
      query: params => ({
        url: '/content-analysis/plagiarism/statistics/overview',
        params,
      }),
      providesTags: ['PlagiarismCheck'],
    }),

    // Similarity Analysis
    getSimilarityAnalyses: builder.query<
      {
        data: SimilarityAnalysis[];
        total: number;
        page: number;
        limit: number;
      },
      {
        page?: number;
        limit?: number;
        content_type?: string;
        similarity_type?: string;
        min_score?: number;
        search?: string;
      }
    >({
      query: params => ({
        url: '/content-analysis/similarity',
        params,
      }),
      providesTags: ['SimilarityAnalysis'],
    }),

    analyzeSimilarity: builder.mutation<
      SimilarityAnalysis,
      AnalyzeSimilarityRequest
    >({
      query: data => ({
        url: '/content-analysis/similarity/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SimilarityAnalysis'],
    }),

    bulkAnalyzeSimilarity: builder.mutation<
      { results: SimilarityAnalysis[]; failures: any[] },
      {
        source_content_type: 'course' | 'lesson';
        source_content_id: string;
        targets: Array<{
          content_type: 'course' | 'lesson';
          content_id: string;
        }>;
      }
    >({
      query: data => ({
        url: '/content-analysis/similarity/bulk-analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SimilarityAnalysis'],
    }),

    getSimilarContent: builder.query<
      SimilarityAnalysis[],
      {
        content_type: 'course' | 'lesson';
        content_id: string;
        limit?: number;
        min_score?: number;
      }
    >({
      query: ({ content_type, content_id, ...params }) => ({
        url: `/content-analysis/similarity/similar/${content_type}/${content_id}`,
        params,
      }),
      providesTags: ['SimilarityAnalysis'],
    }),

    // Content Tagging
    getContentTags: builder.query<
      {
        data: ContentTag[];
        total: number;
        page: number;
        limit: number;
      },
      {
        page?: number;
        limit?: number;
        content_type?: string;
        category?: string;
        type?: string;
        is_verified?: boolean;
        search?: string;
      }
    >({
      query: params => ({
        url: '/content-analysis/tagging',
        params,
      }),
      providesTags: ['ContentTag'],
    }),

    createContentTag: builder.mutation<
      ContentTag,
      Omit<ContentTag, 'id' | 'createdAt' | 'updatedAt'>
    >({
      query: data => ({
        url: '/content-analysis/tagging',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentTag'],
    }),

    updateContentTag: builder.mutation<
      ContentTag,
      { id: string; data: Partial<ContentTag> }
    >({
      query: ({ id, data }) => ({
        url: `/content-analysis/tagging/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ContentTag'],
    }),

    deleteContentTag: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `/content-analysis/tagging/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContentTag'],
    }),

    verifyContentTag: builder.mutation<ContentTag, string>({
      query: id => ({
        url: `/content-analysis/tagging/${id}/verify`,
        method: 'PUT',
      }),
      invalidatesTags: ['ContentTag'],
    }),

    bulkVerifyContentTags: builder.mutation<
      { verified: number; failed: number },
      { tag_ids: string[] }
    >({
      query: data => ({
        url: '/content-analysis/tagging/bulk-verify',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ContentTag'],
    }),

    getTagsForContent: builder.query<
      ContentTag[],
      { content_type: 'course' | 'lesson'; content_id: string }
    >({
      query: ({ content_type, content_id }) =>
        `/content-analysis/tagging/content/${content_type}/${content_id}`,
      providesTags: ['ContentTag'],
    }),

    generateTags: builder.mutation<
      { tags: ContentTag[]; confidence: number },
      GenerateTagsRequest
    >({
      query: data => ({
        url: '/content-analysis/tagging/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentTag'],
    }),

    // Quiz Generation
    getGeneratedQuizzes: builder.query<
      {
        data: GeneratedQuiz[];
        total: number;
        page: number;
        limit: number;
      },
      {
        page?: number;
        limit?: number;
        lesson_id?: string;
        status?: string;
        difficulty_level?: string;
        search?: string;
      }
    >({
      query: params => ({
        url: '/content-analysis/quiz-generation',
        params,
      }),
      providesTags: ['GeneratedQuiz'],
    }),

    getGeneratedQuizById: builder.query<GeneratedQuiz, string>({
      query: id => `/content-analysis/quiz-generation/${id}`,
      providesTags: ['GeneratedQuiz'],
    }),

    generateQuiz: builder.mutation<GeneratedQuiz, GenerateQuizRequest>({
      query: data => ({
        url: '/content-analysis/quiz-generation/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GeneratedQuiz'],
    }),

    updateGeneratedQuiz: builder.mutation<
      GeneratedQuiz,
      { id: string; data: Partial<GeneratedQuiz> }
    >({
      query: ({ id, data }) => ({
        url: `/content-analysis/quiz-generation/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['GeneratedQuiz'],
    }),

    deleteGeneratedQuiz: builder.mutation<{ success: boolean }, string>({
      query: id => ({
        url: `/content-analysis/quiz-generation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GeneratedQuiz'],
    }),

    reviewGeneratedQuiz: builder.mutation<
      GeneratedQuiz,
      {
        id: string;
        feedback: string;
        decision: 'approve' | 'reject' | 'needs_revision';
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/content-analysis/quiz-generation/${id}/review`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['GeneratedQuiz'],
    }),

    approveGeneratedQuiz: builder.mutation<GeneratedQuiz, string>({
      query: id => ({
        url: `/content-analysis/quiz-generation/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['GeneratedQuiz'],
    }),

    rejectGeneratedQuiz: builder.mutation<
      GeneratedQuiz,
      { id: string; reason: string }
    >({
      query: ({ id, ...data }) => ({
        url: `/content-analysis/quiz-generation/${id}/reject`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['GeneratedQuiz'],
    }),

    getQuizzesForLesson: builder.query<GeneratedQuiz[], string>({
      query: lessonId => `/content-analysis/quiz-generation/lesson/${lessonId}`,
      providesTags: ['GeneratedQuiz'],
    }),

    // Dashboard
    getContentAnalysisDashboard: builder.query<
      {
        quality: {
          total_assessments: number;
          average_score: number;
          recent_assessments: ContentQualityAssessment[];
        };
        plagiarism: {
          total_checks: number;
          flagged_content: number;
          recent_checks: PlagiarismCheck[];
        };
        similarity: {
          total_analyses: number;
          high_similarity_pairs: number;
          recent_analyses: SimilarityAnalysis[];
        };
        tagging: {
          total_tags: number;
          verified_tags: number;
          recent_tags: ContentTag[];
        };
        quiz_generation: {
          total_quizzes: number;
          approved_quizzes: number;
          recent_quizzes: GeneratedQuiz[];
        };
      },
      void
    >({
      query: () => '/content-analysis/dashboard',
      providesTags: ['ContentAnalytics'],
    }),

    // Comprehensive Analysis
    getContentAnalysis: builder.query<
      {
        quality: ContentQualityAssessment | null;
        plagiarism: PlagiarismCheck | null;
        similarity: SimilarityAnalysis[];
        tags: ContentTag[];
        generated_quizzes: GeneratedQuiz[];
        recommendations: {
          improvements: string[];
          actions: string[];
          insights: string[];
        };
      },
      { content_type: 'course' | 'lesson'; content_id: string }
    >({
      query: ({ content_type, content_id }) =>
        `/content-analysis/content/${content_type}/${content_id}/analysis`,
      providesTags: ['ContentAnalytics'],
    }),
  }),
});

export const {
  // Quality Assessment
  useGetQualityAssessmentsQuery,
  useAssessContentQualityMutation,
  useBulkAssessContentQualityMutation,
  useGetQualityStatisticsQuery,
  useGetQualityTrendsQuery,

  // Plagiarism Detection
  useGetPlagiarismChecksQuery,
  useGetPlagiarismCheckByIdQuery,
  useCheckPlagiarismMutation,
  useBulkCheckPlagiarismMutation,
  useGetPlagiarismStatisticsQuery,

  // Similarity Analysis
  useGetSimilarityAnalysesQuery,
  useAnalyzeSimilarityMutation,
  useBulkAnalyzeSimilarityMutation,
  useGetSimilarContentQuery,

  // Content Tagging
  useGetContentTagsQuery,
  useCreateContentTagMutation,
  useUpdateContentTagMutation,
  useDeleteContentTagMutation,
  useVerifyContentTagMutation,
  useBulkVerifyContentTagsMutation,
  useGetTagsForContentQuery,
  useGenerateTagsMutation,

  // Quiz Generation
  useGetGeneratedQuizzesQuery,
  useGetGeneratedQuizByIdQuery,
  useGenerateQuizMutation,
  useUpdateGeneratedQuizMutation,
  useDeleteGeneratedQuizMutation,
  useReviewGeneratedQuizMutation,
  useApproveGeneratedQuizMutation,
  useRejectGeneratedQuizMutation,
  useGetQuizzesForLessonQuery,

  // Dashboard & Analytics
  useGetContentAnalysisDashboardQuery,
  useGetContentAnalysisQuery,
} = contentAnalysisApi;
