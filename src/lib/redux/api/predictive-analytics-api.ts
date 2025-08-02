import { baseApi } from '@/lib/api/base-api';
import {
  DropoutRiskAssessment,
  InterventionRecommendation,
  LearningOutcomeForecast,
  LearningPattern,
  PerformancePrediction,
  PredictiveAnalyticsDashboard,
  ResourceOptimization,
} from '@/lib/types/predictive-analytics';

export const predictiveAnalyticsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Dashboard Overview
    getDashboardAnalytics: builder.query<
      PredictiveAnalyticsDashboard,
      {
        entityType: 'student' | 'instructor';
        entityId?: string;
      }
    >({
      query: ({ entityType, entityId }) => ({
        url: `/dashboard/${entityType}`,
        params: entityId ? { entityId } : {},
      }),
      providesTags: ['Dashboard'],
    }),

    // Dropout Risk Assessments
    getDropoutRiskAssessments: builder.query<
      DropoutRiskAssessment[],
      {
        studentId?: string;
        courseId?: string;
        riskLevel?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/dropout-risk',
        params,
      }),
      providesTags: ['DropoutRisk'],
    }),

    getDropoutRiskById: builder.query<DropoutRiskAssessment, string>({
      query: id => `/dropout-risk/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'DropoutRisk', id }],
    }),

    assessDropoutRisk: builder.mutation<
      DropoutRiskAssessment,
      {
        studentId: string;
        courseId?: string;
        forceReassess?: boolean;
      }
    >({
      query: data => ({
        url: '/dropout-risk/assess',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DropoutRisk', 'Dashboard'],
    }),

    getHighRiskStudents: builder.query<
      {
        students: any[];
        total: number;
        riskDistribution: Record<string, number>;
      },
      {
        courseId?: string;
        threshold?: number;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/dropout-risk/high-risk/students',
        params,
      }),
      providesTags: ['DropoutRisk'],
    }),

    // Performance Predictions
    getPerformancePredictions: builder.query<
      PerformancePrediction[],
      {
        studentId?: string;
        courseId?: string;
        outcomeType?: string;
      }
    >({
      query: params => ({
        url: '/performance-predictions',
        params,
      }),
      providesTags: ['PerformancePrediction'],
    }),

    generatePerformancePrediction: builder.mutation<
      PerformancePrediction,
      {
        studentId: string;
        courseId: string;
        outcomeType: string;
        parameters?: any;
      }
    >({
      query: data => ({
        url: '/performance-predictions/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PerformancePrediction', 'Dashboard'],
    }),

    getPerformanceTrends: builder.query<any, string>({
      query: studentId => `/performance-predictions/trends/${studentId}`,
      providesTags: ['PerformancePrediction'],
    }),

    validatePredictions: builder.mutation<
      {
        accuracy: number;
        validatedPredictions: number;
        report: any;
      },
      {
        predictionIds?: string[];
        startDate?: string;
        endDate?: string;
      }
    >({
      query: data => ({
        url: '/performance-predictions/validate',
        method: 'POST',
        body: data,
      }),
    }),

    // Learning Patterns
    getLearningPatterns: builder.query<
      LearningPattern[],
      {
        studentId?: string;
        patternType?: string;
        minConfidence?: number;
      }
    >({
      query: params => ({
        url: '/learning-patterns',
        params,
      }),
      providesTags: ['LearningPattern'],
    }),

    recognizeLearningPatterns: builder.mutation<
      LearningPattern[],
      {
        studentId: string;
        analysisWindow?: string;
        includeWeakPatterns?: boolean;
      }
    >({
      query: data => ({
        url: '/learning-patterns/recognize',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LearningPattern'],
    }),

    // Intervention Recommendations
    getInterventionRecommendations: builder.query<
      InterventionRecommendation[],
      {
        studentId?: string;
        courseId?: string;
        status?: string;
        priority?: number;
      }
    >({
      query: params => ({
        url: '/interventions',
        params,
      }),
      providesTags: ['Intervention'],
    }),

    generateInterventions: builder.mutation<
      InterventionRecommendation[],
      {
        predictionId: string;
        interventionTypes?: string[];
        maxRecommendations?: number;
      }
    >({
      query: ({ predictionId, ...data }) => ({
        url: `/interventions/generate/${predictionId}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Intervention'],
    }),

    scheduleIntervention: builder.mutation<
      InterventionRecommendation,
      {
        interventionId: string;
        scheduledDate: string;
        assignedToId?: string;
        notes?: string;
      }
    >({
      query: ({ interventionId, ...data }) => ({
        url: `/interventions/${interventionId}/schedule`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Intervention'],
    }),

    completeIntervention: builder.mutation<
      InterventionRecommendation,
      {
        interventionId: string;
        outcome: string;
        effectivenessScore: number;
        feedback?: string;
      }
    >({
      query: ({ interventionId, ...data }) => ({
        url: `/interventions/${interventionId}/complete`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Intervention', 'Dashboard'],
    }),

    getPendingInterventions: builder.query<
      InterventionRecommendation[],
      {
        assignedToId?: string;
        priority?: number;
        dueDate?: string;
      }
    >({
      query: params => ({
        url: '/interventions/pending/list',
        params,
      }),
      providesTags: ['Intervention'],
    }),

    // Learning Outcome Forecasts
    getLearningOutcomeForecasts: builder.query<
      LearningOutcomeForecast[],
      {
        studentId?: string;
        courseId?: string;
        outcomeType?: string;
      }
    >({
      query: params => ({
        url: '/learning-outcomes',
        params,
      }),
      providesTags: ['LearningOutcome'],
    }),

    generateLearningOutcomeForecast: builder.mutation<
      LearningOutcomeForecast,
      {
        studentId: string;
        courseId: string;
        outcomeType: string;
        targetDate?: string;
        parameters?: any;
      }
    >({
      query: data => ({
        url: '/learning-outcomes/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LearningOutcome'],
    }),

    getForecastSummary: builder.query<
      {
        totalForecasts: number;
        successProbability: number;
        riskFactors: string[];
        recommendations: string[];
      },
      string
    >({
      query: studentId => `/learning-outcomes/summary/${studentId}`,
      providesTags: ['LearningOutcome'],
    }),

    // Resource Optimization
    getResourceOptimizations: builder.query<
      ResourceOptimization[],
      {
        studentId?: string;
        courseId?: string;
        resourceType?: string;
      }
    >({
      query: params => ({
        url: '/resource-optimization',
        params,
      }),
      providesTags: ['ResourceOptimization'],
    }),

    generateResourceOptimization: builder.mutation<
      ResourceOptimization[],
      {
        studentId: string;
        courseId?: string;
        resourceTypes?: string[];
        optimizationGoals?: string[];
      }
    >({
      query: data => ({
        url: '/resource-optimization/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ResourceOptimization'],
    }),

    // Comprehensive Analytics
    runComprehensiveAnalysis: builder.mutation<
      {
        dropoutRisk: DropoutRiskAssessment;
        performancePredictions: PerformancePrediction[];
        learningPatterns: LearningPattern[];
        interventions: InterventionRecommendation[];
        forecasts: LearningOutcomeForecast[];
      },
      {
        studentId: string;
        analysisScope?: string[];
        includePredictions?: boolean;
      }
    >({
      query: data => ({
        url: '/analyze/comprehensive',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        'DropoutRisk',
        'PerformancePrediction',
        'LearningPattern',
        'Intervention',
        'LearningOutcome',
      ],
    }),

    // System Health
    getSystemHealth: builder.query<
      {
        status: 'healthy' | 'degraded' | 'down';
        modelAccuracy: number;
        processingLatency: number;
        lastModelUpdate: string;
        activeModels: number;
      },
      void
    >({
      query: () => '/health-check',
    }),
  }),
});

export const {
  useGetDashboardAnalyticsQuery,
  useGetDropoutRiskAssessmentsQuery,
  useGetDropoutRiskByIdQuery,
  useAssessDropoutRiskMutation,
  useGetHighRiskStudentsQuery,
  useGetPerformancePredictionsQuery,
  useGeneratePerformancePredictionMutation,
  useGetPerformanceTrendsQuery,
  useValidatePredictionsMutation,
  useGetLearningPatternsQuery,
  useRecognizeLearningPatternsMutation,
  useGetInterventionRecommendationsQuery,
  useGenerateInterventionsMutation,
  useScheduleInterventionMutation,
  useCompleteInterventionMutation,
  useGetPendingInterventionsQuery,
  useGetLearningOutcomeForecastsQuery,
  useGenerateLearningOutcomeForecastMutation,
  useGetForecastSummaryQuery,
  useGetResourceOptimizationsQuery,
  useGenerateResourceOptimizationMutation,
  useRunComprehensiveAnalysisMutation,
  useGetSystemHealthQuery,
} = predictiveAnalyticsApi;
