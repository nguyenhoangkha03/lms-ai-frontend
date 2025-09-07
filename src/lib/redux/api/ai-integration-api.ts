import { baseApi } from '@/lib/api/base-api';

export interface LessonRecommendationRequest {
  user_id: string;
  assessment_attemp_id: string;
}

export interface LessonRecommendation {
  accuracy_correct: number;
  course_title: string;
  data_source: string;
  difficulty_affected: string[];
  lesson_accuracy_percentage: string;
  lesson_correct_total_ratio: string;
  lesson_id: string;
  lesson_slug: string;
  lesson_title: string;
  lesson_wrong_total_ratio: string;
  order_index: number;
  priority_rank: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority_score: number;
  questions_wrong: Array<{
    orderIndex: number;
    title: string;
  }>;
  reason: string;
}

export interface LessonRecommendationResponse {
  success: boolean;
  data: {
    strategy: string;
    strategy_confidence: number;
    recommendations: LessonRecommendation[];
    total_recommendations: number;
  };
  ai_api_available: boolean;
  timestamp: string;
}

export interface AttitudePredictionRequest {
  user_id: string;
}

export interface AttitudePredictionResponse {
  success: boolean;
  data: {
    predicted_attitude: 'Give_up' | 'Active' | 'Moderate';
    confidence: number;
    probabilities: Record<string, number>;
    user_id: string;
  };
  ai_api_available: boolean;
  timestamp: string;
}

export interface AITrackingRequest {
  data: {
    user_id: string;
    course_id: string;
  };
}

export interface AITrackingResponse {
  success: boolean;
  data: {
    performance_level: 'excellent' | 'good' | 'average' | 'poor';
    predicted_score: number;
    trend_prediction: 'tăng' | 'giảm' | 'ổn định';
    user_id: string;
  };
  ai_api_available: boolean;
  timestamp: string;
}

export interface AIHealthResponse {
  success: boolean;
  ai_api_available: boolean;
  message: string;
  timestamp: string;
}

export const aiIntegrationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonRecommendations: builder.mutation<
      LessonRecommendationResponse,
      LessonRecommendationRequest
    >({
      query: (data) => ({
        url: '/ai-integration/lesson-recommendations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AIRecommendations'],
    }),

    predictLearningAttitude: builder.mutation<
      AttitudePredictionResponse,
      AttitudePredictionRequest
    >({
      query: (data) => ({
        url: '/ai-integration/predict-attitude',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AIAttitude'],
    }),

    trackAIPerformance: builder.mutation<AITrackingResponse, AITrackingRequest>({
      query: (data) => ({
        url: '/ai-integration/track-performance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AIPerformance'],
    }),

    // Query version for dashboard widgets
    getAIPerformanceTracking: builder.query<AITrackingResponse, { user_id: string; course_id: string }>({
      query: ({ user_id, course_id }) => ({
        url: '/ai-integration/track-performance',
        method: 'POST',
        body: { data: { user_id, course_id } },
      }),
      providesTags: ['AIPerformance'],
    }),

    getStudentAttitude: builder.query<AttitudePredictionResponse, { user_id: string }>({
      query: ({ user_id }) => ({
        url: '/ai-integration/predict-attitude',
        method: 'POST',
        body: { user_id },
      }),
      providesTags: ['AIAttitude'],
    }),

    checkAIHealth: builder.query<AIHealthResponse, void>({
      query: () => '/ai-integration/health',
      providesTags: ['AIHealth'],
    }),
  }),
});

export const {
  useGetLessonRecommendationsMutation,
  usePredictLearningAttitudeMutation,
  useTrackAIPerformanceMutation,
  useGetAIPerformanceTrackingQuery,
  useGetStudentAttitudeQuery,
  useCheckAIHealthQuery,
} = aiIntegrationApi;

// Helper hooks for easier usage
export const useAIRecommendations = () => {
  const [getLessonRecommendations, { data, isLoading, error }] = useGetLessonRecommendationsMutation();
  
  return {
    getLessonRecommendations,
    recommendations: data?.data?.recommendations || [],
    strategy: data?.data?.strategy || '',
    strategyConfidence: data?.data?.strategy_confidence || 0,
    totalRecommendations: data?.data?.total_recommendations || 0,
    isLoading,
    error,
    aiAvailable: data?.ai_api_available || false,
  };
};

export const useStudentAttitudePredictor = () => {
  const [predictAttitude, { data, isLoading, error }] = usePredictLearningAttitudeMutation();
  
  return {
    predictAttitude,
    attitude: data?.data?.predicted_attitude || null,
    confidence: data?.data?.confidence || 0,
    probabilities: data?.data?.probabilities || {},
    isLoading,
    error,
    aiAvailable: data?.ai_api_available || false,
  };
};

export const useAIPerformanceTracker = () => {
  const [trackPerformance, { data, isLoading, error }] = useTrackAIPerformanceMutation();
  
  return {
    trackPerformance,
    performanceLevel: data?.data?.performance_level || null,
    predictedScore: data?.data?.predicted_score || 0,
    trendPrediction: data?.data?.trend_prediction || null,
    isLoading,
    error,
    aiAvailable: data?.ai_api_available || false,
  };
};