import { baseApi } from '@/lib/api/base-api';
import {
  ABTest,
  MLModel,
  ModelVersion,
  PredictionRecord,
  SystemHealth,
} from '@/lib/types/ml-model';

export const mlModelApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // ML Models Management
    getMLModels: builder.query<MLModel[], void>({
      query: () => 'models',
      providesTags: ['MLModel'],
    }),

    getMLModel: builder.query<MLModel, string>({
      query: id => `models/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'MLModel', id }],
    }),

    createMLModel: builder.mutation<MLModel, Partial<MLModel>>({
      query: model => ({
        url: 'models',
        method: 'POST',
        body: model,
      }),
      invalidatesTags: ['MLModel'],
    }),

    updateMLModel: builder.mutation<
      MLModel,
      { id: string; data: Partial<MLModel> }
    >({
      query: ({ id, data }) => ({
        url: `models/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'MLModel', id }],
    }),

    deleteMLModel: builder.mutation<void, string>({
      query: id => ({
        url: `models/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MLModel'],
    }),

    getModelMetrics: builder.query<any, string>({
      query: id => `models/${id}/metrics`,
      providesTags: (_result, _error, id) => [{ type: 'MLModel', id }],
    }),

    getModelHealth: builder.query<any, string>({
      query: id => `models/${id}/health`,
      providesTags: (_result, _error, id) => [{ type: 'MLModel', id }],
    }),

    retrainModel: builder.mutation<void, { modelId: string }>({
      query: ({ modelId }) => ({
        url: `models/${modelId}/versions`,
        method: 'POST',
        body: { action: 'retrain' },
      }),
      invalidatesTags: ['MLModel'],
    }),

    // Model Versions Management
    getModelVersions: builder.query<ModelVersion[], string>({
      query: modelId => `models/${modelId}/versions`,
      providesTags: ['ModelVersion'],
    }),

    getModelVersion: builder.query<
      ModelVersion,
      { modelId: string; versionId: string }
    >({
      query: ({ modelId, versionId }) =>
        `models/${modelId}/versions/${versionId}`,
      providesTags: (_result, _error, { versionId }) => [
        { type: 'ModelVersion', id: versionId },
      ],
    }),

    createModelVersion: builder.mutation<
      ModelVersion,
      { modelId: string; data: any }
    >({
      query: ({ modelId, data }) => ({
        url: `models/${modelId}/versions`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ModelVersion'],
    }),

    deployModelVersion: builder.mutation<
      void,
      { versionId: string; config?: any }
    >({
      query: ({ versionId, config }) => ({
        url: `models/versions/${versionId}/deploy`,
        method: 'POST',
        body: config || {},
      }),
      invalidatesTags: ['ModelVersion', 'MLModel'],
    }),

    undeployModelVersion: builder.mutation<void, string>({
      query: versionId => ({
        url: `models/versions/${versionId}/deploy`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ModelVersion', 'MLModel'],
    }),

    trainModelVersion: builder.mutation<
      void,
      { versionId: string; config: any }
    >({
      query: ({ versionId, config }) => ({
        url: `models/versions/${versionId}/train`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['ModelVersion'],
    }),

    validateModelVersion: builder.mutation<any, string>({
      query: versionId => ({
        url: `models/versions/${versionId}/validate`,
        method: 'POST',
      }),
      invalidatesTags: ['ModelVersion'],
    }),

    // A/B Testing
    getABTests: builder.query<ABTest[], void>({
      query: () => 'ab-tests',
      providesTags: ['ABTest'],
    }),

    getABTest: builder.query<ABTest, string>({
      query: id => `ab-tests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ABTest', id }],
    }),

    createABTest: builder.mutation<ABTest, Partial<ABTest>>({
      query: test => ({
        url: 'ab-tests',
        method: 'POST',
        body: test,
      }),
      invalidatesTags: ['ABTest'],
    }),

    startABTest: builder.mutation<void, { testId: string }>({
      query: ({ testId }) => ({
        url: `ab-tests/${testId}/start`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { testId }) => [
        { type: 'ABTest', id: testId },
      ],
    }),

    stopABTest: builder.mutation<void, { testId: string }>({
      query: ({ testId }) => ({
        url: `ab-tests/${testId}/stop`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { testId }) => [
        { type: 'ABTest', id: testId },
      ],
    }),

    getABTestResults: builder.query<any, string>({
      query: testId => `ab-tests/${testId}/results`,
      providesTags: (_result, _error, testId) => [
        { type: 'ABTest', id: testId },
      ],
    }),

    recordABTestResult: builder.mutation<void, { testId: string; data: any }>({
      query: ({ testId, data }) => ({
        url: `ab-tests/${testId}/results`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { testId }) => [
        { type: 'ABTest', id: testId },
      ],
    }),

    // Predictions Management
    getPredictions: builder.query<
      PredictionRecord[],
      { modelId?: string; timeRange?: string; predictionType?: string }
    >({
      query: params => ({
        url: 'predictions',
        params,
      }),
      providesTags: ['Prediction'],
    }),

    getPrediction: builder.query<PredictionRecord, string>({
      query: id => `predictions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Prediction', id }],
    }),

    makePrediction: builder.mutation<any, { modelId: string; inputData: any }>({
      query: ({ modelId, inputData }) => ({
        url: 'predictions',
        method: 'POST',
        body: { modelId, inputData },
      }),
      invalidatesTags: ['Prediction'],
    }),

    makeBatchPrediction: builder.mutation<
      any,
      { modelId: string; inputData: any[] }
    >({
      query: ({ modelId, inputData }) => ({
        url: 'predictions/batch',
        method: 'POST',
        body: { modelId, inputData },
      }),
      invalidatesTags: ['Prediction'],
    }),

    getBatchPredictionStatus: builder.query<any, string>({
      query: batchId => `predictions/batch/${batchId}/status`,
    }),

    // Performance Tracking
    getModelPerformance: builder.query<
      any,
      { modelId: string; timeRange: string }
    >({
      query: ({ modelId, timeRange }) => ({
        url: `models/${modelId}/performance`,
        params: { timeRange },
      }),
    }),

    getPredictionAccuracy: builder.query<
      any,
      { modelId: string; timeRange: string; predictionType?: string }
    >({
      query: ({ modelId, timeRange, predictionType }) => ({
        url: 'predictions/accuracy',
        params: { modelId, timeRange, predictionType },
      }),
      providesTags: ['Prediction'],
    }),

    getPredictionStats: builder.query<any, void>({
      query: () => 'predictions/stats',
      providesTags: ['Prediction'],
    }),

    getSystemHealth: builder.query<SystemHealth, void>({
      query: () => 'system/health',
      providesTags: ['SystemHealth'],
    }),

    // Model Usage Statistics
    getModelUsageStats: builder.query<any, string>({
      query: modelId => `models/${modelId}/usage-stats`,
    }),

    // Model Configuration
    getModelConfig: builder.query<any, string>({
      query: modelId => `models/${modelId}/config`,
    }),

    updateModelConfig: builder.mutation<any, { modelId: string; config: any }>({
      query: ({ modelId, config }) => ({
        url: `models/${modelId}/config`,
        method: 'PUT',
        body: config,
      }),
      invalidatesTags: (_result, _error, { modelId }) => [
        { type: 'MLModel', id: modelId },
      ],
    }),
  }),
});

export const {
  // ML Models
  useGetMLModelsQuery,
  useGetMLModelQuery,
  useCreateMLModelMutation,
  useUpdateMLModelMutation,
  useDeleteMLModelMutation,
  useGetModelMetricsQuery,
  useGetModelHealthQuery,
  useRetrainModelMutation,

  // Model Versions
  useGetModelVersionsQuery,
  useGetModelVersionQuery,
  useCreateModelVersionMutation,
  useDeployModelVersionMutation,
  useUndeployModelVersionMutation,
  useTrainModelVersionMutation,
  useValidateModelVersionMutation,

  // A/B Testing
  useGetABTestsQuery,
  useGetABTestQuery,
  useCreateABTestMutation,
  useStartABTestMutation,
  useStopABTestMutation,
  useGetABTestResultsQuery,
  useRecordABTestResultMutation,

  // Predictions
  useGetPredictionsQuery,
  useGetPredictionQuery,
  useMakePredictionMutation,
  useMakeBatchPredictionMutation,
  useGetBatchPredictionStatusQuery,

  // Performance & Analytics
  useGetModelPerformanceQuery,
  useGetPredictionAccuracyQuery,
  useGetPredictionStatsQuery,
  useGetSystemHealthQuery,
  useGetModelUsageStatsQuery,

  // Configuration
  useGetModelConfigQuery,
  useUpdateModelConfigMutation,
} = mlModelApi;
