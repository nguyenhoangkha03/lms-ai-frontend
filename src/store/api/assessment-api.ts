import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type { Assessment, AssessmentAttempt, Question } from '@/types';

export const assessmentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get assessments
    getAssessments: builder.query<Assessment[], void>({
      query: () => API_ENDPOINTS.ASSESSMENTS.LIST,
      providesTags: ['Assessment'],
    }),

    // Get assessment by ID
    getAssessment: builder.query<Assessment, string>({
      query: id => API_ENDPOINTS.ASSESSMENTS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Assessment', id }],
    }),

    // Start assessment attempt
    startAssessment: builder.mutation<AssessmentAttempt, string>({
      query: assessmentId => ({
        url: `${API_ENDPOINTS.ASSESSMENTS.DETAIL(assessmentId)}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['Assessment'],
    }),

    // Submit assessment
    submitAssessment: builder.mutation<
      AssessmentAttempt,
      { assessmentId: string; answers: Record<string, any> }
    >({
      query: ({ assessmentId, answers }) => ({
        url: API_ENDPOINTS.ASSESSMENTS.SUBMIT(assessmentId),
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Assessment', 'Progress'],
    }),

    // Get assessment results
    getAssessmentResults: builder.query<AssessmentAttempt, string>({
      query: assessmentId => API_ENDPOINTS.ASSESSMENTS.RESULTS(assessmentId),
      providesTags: (result, error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
      ],
    }),

    // Get assessment attempts
    getAssessmentAttempts: builder.query<AssessmentAttempt[], string>({
      query: assessmentId =>
        `${API_ENDPOINTS.ASSESSMENTS.DETAIL(assessmentId)}/attempts`,
      providesTags: ['Assessment'],
    }),

    // Save draft answers
    saveDraftAnswers: builder.mutation<
      void,
      { assessmentId: string; answers: Record<string, any> }
    >({
      query: ({ assessmentId, answers }) => ({
        url: `${API_ENDPOINTS.ASSESSMENTS.DETAIL(assessmentId)}/draft`,
        method: 'PUT',
        body: { answers },
      }),
    }),
  }),
});

export const {
  useGetAssessmentsQuery,
  useGetAssessmentQuery,
  useStartAssessmentMutation,
  useSubmitAssessmentMutation,
  useGetAssessmentResultsQuery,
  useGetAssessmentAttemptsQuery,
  useSaveDraftAnswersMutation,
} = assessmentApi;
