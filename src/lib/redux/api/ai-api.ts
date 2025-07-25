import { baseApi } from '@/lib/api/base-api';
import type { AIRecommendation, ApiResponse, Question } from '@/lib/types';

interface AITutorRequest {
  message: string;
  context?: {
    courseId?: string;
    lessonId?: string;
    topic?: string;
  };
}

interface AITutorResponse {
  response: string;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

export const aiApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // AI Recommendations
    getRecommendations: builder.query<
      AIRecommendation[],
      {
        userId?: string;
        type?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/ai/recommendations',
        params,
      }),
      transformResponse: (response: ApiResponse<AIRecommendation[]>) =>
        response.data!,
      providesTags: ['AIRecommendation'],
    }),

    interactWithRecommendation: builder.mutation<
      { message: string },
      {
        recommendationId: string;
        interactionType: 'accept' | 'dismiss' | 'view';
        feedback?: string;
      }
    >({
      query: ({ recommendationId, ...data }) => ({
        url: `/ai/recommendations/${recommendationId}/interact`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['AIRecommendation'],
    }),

    // AI Tutor
    askAITutor: builder.mutation<AITutorResponse, AITutorRequest>({
      query: data => ({
        url: '/ai/tutor/ask',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<AITutorResponse>) =>
        response.data!,
    }),

    getAITutorHistory: builder.query<
      Array<{
        question: string;
        answer: string;
        timestamp: string;
      }>,
      { courseId?: string; limit?: number }
    >({
      query: params => ({
        url: '/ai/tutor/history',
        params,
      }),
      transformResponse: (response: ApiResponse<any[]>) => response.data!,
    }),

    // Learning Path Generation
    generateLearningPath: builder.mutation<
      {
        path: Array<{
          courseId: string;
          title: string;
          estimatedDuration: number;
          difficulty: string;
          prerequisites: string[];
        }>;
        reasoning: string;
      },
      {
        goals: string[];
        currentLevel: string;
        timeAvailable: number;
        preferredTopics?: string[];
      }
    >({
      query: data => ({
        url: '/ai/learning-path/generate',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data!,
    }),

    // Adaptive Assessment
    getAdaptiveQuestions: builder.mutation<
      Question[],
      {
        assessmentId: string;
        studentLevel: string;
        previousAnswers?: Array<{
          questionId: string;
          correct: boolean;
          timeSpent: number;
        }>;
      }
    >({
      query: data => ({
        url: '/ai/assessment/adaptive-questions',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Question[]>) => response.data!,
    }),

    // Study Analytics
    getStudyInsights: builder.query<
      {
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
        performanceTrend: Array<{
          date: string;
          score: number;
          topic: string;
        }>;
        predictedOutcomes: {
          nextAssessmentScore: number;
          completionTime: number;
          successProbability: number;
        };
      },
      { courseId?: string; timeframe?: string }
    >({
      query: params => ({
        url: '/ai/analytics/study-insights',
        params,
      }),
      transformResponse: (response: ApiResponse<any>) => response.data!,
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetRecommendationsQuery,
  useInteractWithRecommendationMutation,
  useAskAITutorMutation,
  useGetAITutorHistoryQuery,
  useGenerateLearningPathMutation,
  useGetAdaptiveQuestionsMutation,
  useGetStudyInsightsQuery,
} = aiApi;
