import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type { AIRecommendation, LearningAnalytics } from '@/types';

interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  actions?: Array<{
    type: string;
    label: string;
    data: any;
  }>;
}

export const aiApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get AI recommendations
    getRecommendations: builder.query<AIRecommendation[], void>({
      query: () => API_ENDPOINTS.AI.RECOMMENDATIONS,
      providesTags: ['AI'],
    }),

    // Chat with AI tutor
    chatWithAI: builder.mutation<
      ChatbotResponse,
      { message: string; context?: any }
    >({
      query: ({ message, context }) => ({
        url: API_ENDPOINTS.AI.CHATBOT,
        method: 'POST',
        body: { message, context },
      }),
    }),

    // Get learning analytics
    getAnalytics: builder.query<
      LearningAnalytics[],
      { period?: string; courseId?: string }
    >({
      query: params => ({
        url: API_ENDPOINTS.AI.ANALYZE_PROGRESS,
        params,
      }),
      providesTags: ['Analytics'],
    }),

    // Generate quiz
    generateQuiz: builder.mutation<
      any,
      { topic: string; difficulty: string; questionCount: number }
    >({
      query: params => ({
        url: API_ENDPOINTS.AI.GENERATE_QUIZ,
        method: 'POST',
        body: params,
      }),
    }),

    // Update recommendation feedback
    updateRecommendationFeedback: builder.mutation<
      void,
      {
        recommendationId: string;
        rating: number;
        feedback?: string;
        wasEffective?: boolean;
      }
    >({
      query: ({ recommendationId, ...data }) => ({
        url: `${API_ENDPOINTS.AI.RECOMMENDATIONS}/${recommendationId}/feedback`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AI'],
    }),
  }),
});

export const {
  useGetRecommendationsQuery,
  useChatWithAIMutation,
  useGetAnalyticsQuery,
  useGenerateQuizMutation,
  useUpdateRecommendationFeedbackMutation,
} = aiApi;
