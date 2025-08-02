import { baseApi } from '@/lib/api/base-api';
import {
  ChatbotConversation,
  ChatbotMessage,
  ContentRecommendation,
  KnowledgeGraph,
  LearningHint,
  LearningStyleProfile,
  TutoringSession,
} from '@/lib/types/intelligent-tutoring';

export const intelligentTutoringApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Chatbot Conversations
    getConversations: builder.query<
      ChatbotConversation[],
      {
        status?: string;
        conversationType?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/chatbot/conversations',
        params,
      }),
      providesTags: ['ChatbotConversation'],
    }),

    createConversation: builder.mutation<
      ChatbotConversation,
      {
        courseId?: string;
        conversationType: string;
        context?: any;
      }
    >({
      query: data => ({
        url: '/chatbot/conversations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ChatbotConversation'],
    }),

    getConversation: builder.query<
      {
        conversation: ChatbotConversation;
        messages: ChatbotMessage[];
      },
      string
    >({
      query: conversationId => `/chatbot/conversations/${conversationId}`,
      providesTags: (_result, _error, id) => [
        { type: 'ChatbotConversation', id },
        { type: 'ChatbotMessage', id },
      ],
    }),

    sendMessage: builder.mutation<
      ChatbotMessage,
      {
        conversationId: string;
        content: string;
        messageType?: string;
        attachments?: any[];
      }
    >({
      query: ({ conversationId, ...data }) => ({
        url: `/chatbot/conversations/${conversationId}/messages`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ChatbotMessage'],
    }),

    // AI Tutor Questions
    askTutorQuestion: builder.mutation<
      ChatbotMessage,
      {
        question: string;
        context?: {
          courseId?: string;
          lessonId?: string;
          currentTopic?: string;
          difficulty?: number;
        };
      }
    >({
      query: data => ({
        url: '/questions/ask',
        method: 'POST',
        body: data,
      }),
    }),

    // Learning Hints
    requestHint: builder.mutation<
      LearningHint,
      {
        context: string;
        currentProblem?: string;
        studentLevel?: number;
        previousAttempts?: string[];
      }
    >({
      query: data => ({
        url: '/hints/request',
        method: 'POST',
        body: data,
      }),
    }),

    getHintStatistics: builder.query<
      {
        totalHintsUsed: number;
        successRate: number;
        mostHelpfulHints: LearningHint[];
        effectiveness: number;
      },
      void
    >({
      query: () => '/hints/statistics',
    }),

    rateHint: builder.mutation<
      void,
      {
        hintId: string;
        rating: number;
        feedback?: string;
      }
    >({
      query: ({ hintId, ...data }) => ({
        url: `/hints/${hintId}/feedback`,
        method: 'POST',
        body: data,
      }),
    }),

    // Tutoring Sessions
    createTutoringSession: builder.mutation<
      TutoringSession,
      {
        mode: string;
        topic?: string;
        context?: any;
      }
    >({
      query: data => ({
        url: '/sessions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TutoringSession'],
    }),

    getTutoringSessions: builder.query<
      TutoringSession[],
      {
        status?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/sessions',
        params,
      }),
      providesTags: ['TutoringSession'],
    }),

    getTutoringSession: builder.query<TutoringSession, string>({
      query: sessionId => `/sessions/${sessionId}`,
      providesTags: (_result, _error, id) => [{ type: 'TutoringSession', id }],
    }),

    updateTutoringSession: builder.mutation<
      TutoringSession,
      {
        sessionId: string;
        updates: Partial<TutoringSession>;
      }
    >({
      query: ({ sessionId, updates }) => ({
        url: `/sessions/${sessionId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['TutoringSession'],
    }),

    endTutoringSession: builder.mutation<
      TutoringSession,
      {
        sessionId: string;
        feedback?: any;
      }
    >({
      query: ({ sessionId, feedback }) => ({
        url: `/sessions/${sessionId}/end`,
        method: 'POST',
        body: { feedback },
      }),
      invalidatesTags: ['TutoringSession'],
    }),

    getSessionAnalytics: builder.query<any, string>({
      query: sessionId => `/sessions/${sessionId}/analytics`,
    }),

    // Learning Style Analysis
    analyzeLearningStyle: builder.mutation<
      LearningStyleProfile,
      {
        interactions: any[];
        assessmentResults?: any[];
        preferences?: any;
      }
    >({
      query: data => ({
        url: '/learning-style/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LearningStyle'],
    }),

    getLearningStyleProfile: builder.query<LearningStyleProfile, void>({
      query: () => '/learning-style/profile',
      providesTags: ['LearningStyle'],
    }),

    // Learning Paths
    generateLearningPath: builder.mutation<
      any,
      {
        goals: string[];
        preferences?: any;
        constraints?: any;
      }
    >({
      query: data => ({
        url: '/learning-paths/generate',
        method: 'POST',
        body: data,
      }),
    }),

    getLearningPath: builder.query<any, string>({
      query: pathId => `/learning-paths/${pathId}`,
    }),

    adaptLearningPath: builder.mutation<
      any,
      {
        pathId: string;
        performance: any;
        preferences?: any;
      }
    >({
      query: ({ pathId, ...data }) => ({
        url: `/learning-paths/${pathId}/adapt`,
        method: 'PUT',
        body: data,
      }),
    }),

    // Content Recommendations
    getContentRecommendations: builder.query<
      ContentRecommendation[],
      {
        type?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/recommendations/content',
        params,
      }),
      providesTags: ['ContentRecommendation'],
    }),

    // Adaptive Content Delivery
    getAdaptiveContent: builder.mutation<
      any,
      {
        currentTopic: string;
        studentLevel: number;
        learningStyle: string;
        performance: any;
      }
    >({
      query: data => ({
        url: '/content/adaptive',
        method: 'POST',
        body: data,
      }),
    }),

    adjustContentDifficulty: builder.mutation<
      any,
      {
        contentId: string;
        currentDifficulty: number;
        targetDifficulty: number;
        performance: any;
      }
    >({
      query: data => ({
        url: '/content/difficulty/adjust',
        method: 'POST',
        body: data,
      }),
    }),

    // Strategy Adaptation
    adaptTutoringStrategy: builder.mutation<
      any,
      {
        sessionId?: string;
        performance: any;
        learningPatterns: any;
        preferences?: any;
      }
    >({
      query: data => ({
        url: '/strategy/adapt',
        method: 'POST',
        body: data,
      }),
    }),

    // Analytics
    getLearningPatternAnalytics: builder.query<
      any,
      {
        timeRange?: string;
        analysisType?: string;
      }
    >({
      query: params => ({
        url: '/analytics/learning-patterns',
        params,
      }),
    }),

    getPerformanceAnalytics: builder.query<
      any,
      {
        timeRange?: string;
        includeComparison?: boolean;
      }
    >({
      query: params => ({
        url: '/analytics/performance',
        params,
      }),
    }),

    // RAG Knowledge Search
    searchKnowledge: builder.mutation<
      {
        results: any[];
        sources: string[];
        confidence: number;
      },
      {
        query: string;
        context?: string;
        limit?: number;
      }
    >({
      query: data => ({
        url: '/knowledge/search',
        method: 'POST',
        body: data,
      }),
    }),

    // Knowledge Graph Operations
    getKnowledgeGraph: builder.query<
      KnowledgeGraph,
      {
        topic?: string;
        depth?: number;
      }
    >({
      query: params => ({
        url: '/knowledge-graph',
        params,
      }),
      providesTags: ['KnowledgeGraph'],
    }),

    updateKnowledgeGraph: builder.mutation<
      KnowledgeGraph,
      {
        nodes?: any[];
        edges?: any[];
      }
    >({
      query: data => ({
        url: '/knowledge-graph',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['KnowledgeGraph'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetConversationQuery,
  useSendMessageMutation,
  useAskTutorQuestionMutation,
  useRequestHintMutation,
  useGetHintStatisticsQuery,
  useRateHintMutation,
  useCreateTutoringSessionMutation,
  useGetTutoringSessionsQuery,
  useGetTutoringSessionQuery,
  useUpdateTutoringSessionMutation,
  useEndTutoringSessionMutation,
  useGetSessionAnalyticsQuery,
  useAnalyzeLearningStyleMutation,
  useGetLearningStyleProfileQuery,
  useGenerateLearningPathMutation,
  useGetLearningPathQuery,
  useAdaptLearningPathMutation,
  useGetContentRecommendationsQuery,
  useGetAdaptiveContentMutation,
  useAdjustContentDifficultyMutation,
  useAdaptTutoringStrategyMutation,
  useGetLearningPatternAnalyticsQuery,
  useGetPerformanceAnalyticsQuery,
  useSearchKnowledgeMutation,
  useGetKnowledgeGraphQuery,
  useUpdateKnowledgeGraphMutation,
} = intelligentTutoringApi;
