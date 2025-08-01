import { baseApi } from '@/lib/api/base-api';
import {
  AdaptiveLearningPath,
  AIRecommendation,
  AITutoringSession,
  PersonalizedContentFeed,
  SmartSuggestion,
  TutoringMessage,
} from '@/lib/types/ai-recommendation';

// API Endpoints
export const aiRecommendationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // AI Recommendations
    getAIRecommendations: builder.query<
      AIRecommendation[],
      {
        type?: string;
        category?: string;
        priority?: string;
        limit?: number;
        active?: boolean;
      }
    >({
      query: params => ({
        url: '/api/v1/ai/recommendations',
        params,
      }),
      providesTags: ['AIRecommendation'],
    }),

    getComprehensiveRecommendations: builder.query<AIRecommendation[], void>({
      query: () => '/api/v1/ai/recommendations/comprehensive',
      providesTags: ['AIRecommendation'],
    }),

    generateRecommendations: builder.mutation<
      AIRecommendation[],
      {
        type?: string;
        context?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/api/v1/ai/recommendations/all',
        method: 'GET',
        params: data,
      }),
      invalidatesTags: ['AIRecommendation'],
    }),

    interactWithRecommendation: builder.mutation<
      void,
      {
        id: string;
        action: 'view' | 'click' | 'dismiss';
        metadata?: Record<string, any>;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/ai/recommendations/${id}/interact`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AIRecommendation'],
    }),

    provideFeedback: builder.mutation<
      void,
      {
        id: string;
        feedback: 'positive' | 'negative' | 'neutral';
        comment?: string;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/ai/recommendations/${id}/feedback`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AIRecommendation'],
    }),

    // Content Feeds
    getPersonalizedContentFeeds: builder.query<
      PersonalizedContentFeed[],
      {
        feedType?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/api/v1/ai/recommendations/content',
        params,
      }),
      providesTags: ['ContentFeed'],
    }),

    generateContentRecommendations: builder.mutation<
      PersonalizedContentFeed[],
      {
        feedType?: string;
        preferences?: Record<string, any>;
        context?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/api/v1/ai/recommendations/content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentFeed'],
    }),

    // Adaptive Learning Paths
    getLearningPath: builder.query<AdaptiveLearningPath, string>({
      query: pathId => `/api/v1/intelligent-tutoring/learning-paths/${pathId}`,
      providesTags: ['LearningPath'],
    }),

    getCurrentLearningPath: builder.query<AdaptiveLearningPath, void>({
      query: () => '/api/v1/ai/recommendations/learning-path',
      providesTags: ['LearningPath'],
    }),

    generateLearningPath: builder.mutation<
      AdaptiveLearningPath,
      {
        goals: string[];
        preferences?: Record<string, any>;
        constraints?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/api/v1/intelligent-tutoring/learning-paths/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LearningPath'],
    }),

    adaptLearningPath: builder.mutation<
      AdaptiveLearningPath,
      {
        pathId: string;
        performance: Record<string, any>;
        preferences?: Record<string, any>;
      }
    >({
      query: ({ pathId, ...data }) => ({
        url: `/api/v1/intelligent-tutoring/learning-paths/${pathId}/adapt`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LearningPath'],
    }),

    // AI Tutoring
    getTutoringSessions: builder.query<
      AITutoringSession[],
      {
        status?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/api/v1/intelligent-tutoring/sessions',
        params,
      }),
      providesTags: ['TutoringSession'],
    }),

    createTutoringSession: builder.mutation<
      AITutoringSession,
      {
        mode: string;
        topic?: string;
        context?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/api/v1/intelligent-tutoring/sessions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TutoringSession'],
    }),

    askTutorQuestion: builder.mutation<
      TutoringMessage,
      {
        question: string;
        context?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/api/v1/intelligent-tutoring/questions/ask',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TutoringSession'],
    }),

    endTutoringSession: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/api/v1/intelligent-tutoring/sessions/${sessionId}/end`,
        method: 'POST',
      }),
      invalidatesTags: ['TutoringSession'],
    }),

    // Smart Suggestions
    getSmartSuggestions: builder.query<
      SmartSuggestion[],
      {
        type?: string;
        priority?: string;
        active?: boolean;
      }
    >({
      query: params => ({
        url: '/api/v1/ai/suggestions/smart',
        params,
      }),
      providesTags: ['SmartSuggestion'],
    }),

    recordSuggestionInteraction: builder.mutation<
      void,
      {
        id: string;
        action: 'shown' | 'clicked' | 'dismissed';
        feedback?: string;
      }
    >({
      query: ({ id, ...data }) => ({
        url: `/api/v1/ai/suggestions/${id}/interact`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SmartSuggestion'],
    }),

    analyzeLearningStyle: builder.mutation<
      any,
      {
        activityData: Record<string, any>;
        preferences?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/api/v1/intelligent-tutoring/learning-style/analyze',
        method: 'POST',
        body: data,
      }),
    }),

    getLearningStyleProfile: builder.query<any, void>({
      query: () => '/api/v1/intelligent-tutoring/learning-style/profile',
    }),

    getPerformanceImprovementSuggestions: builder.query<
      AIRecommendation[],
      void
    >({
      query: () => '/api/v1/ai/recommendations/performance-improvement',
      providesTags: ['AIRecommendation'],
    }),

    getStudyScheduleRecommendations: builder.query<AIRecommendation[], void>({
      query: () => '/api/v1/ai/recommendations/study-schedule',
      providesTags: ['AIRecommendation'],
    }),

    getDifficultyAdjustmentRecommendations: builder.query<
      AIRecommendation[],
      void
    >({
      query: () => '/api/v1/ai/recommendations/difficulty-adjustment',
      providesTags: ['AIRecommendation'],
    }),
  }),
});

export const {
  useGetAIRecommendationsQuery,
  useGetComprehensiveRecommendationsQuery,
  useGenerateRecommendationsMutation,
  useInteractWithRecommendationMutation,
  useProvideFeedbackMutation,
  useGetPersonalizedContentFeedsQuery,
  useGenerateContentRecommendationsMutation,
  useGetLearningPathQuery,
  useGetCurrentLearningPathQuery,
  useGenerateLearningPathMutation,
  useAdaptLearningPathMutation,
  useGetTutoringSessionsQuery,
  useCreateTutoringSessionMutation,
  useAskTutorQuestionMutation,
  useEndTutoringSessionMutation,
  useGetSmartSuggestionsQuery,
  useRecordSuggestionInteractionMutation,
  useAnalyzeLearningStyleMutation,
  useGetLearningStyleProfileQuery,
  useGetPerformanceImprovementSuggestionsQuery,
  useGetStudyScheduleRecommendationsQuery,
  useGetDifficultyAdjustmentRecommendationsQuery,
} = aiRecommendationApi;
