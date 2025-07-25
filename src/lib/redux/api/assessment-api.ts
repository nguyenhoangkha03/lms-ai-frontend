import { baseApi } from '@/lib/api/base-api';
import type { Assessment, Question, ApiResponse } from '@/lib/types';

export const assessmentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getAssessments: builder.query<
      Assessment[],
      { courseId?: string; lessonId?: string }
    >({
      query: params => ({
        url: '/assessments',
        params,
      }),
      transformResponse: (response: ApiResponse<Assessment[]>) =>
        response.data!,
      providesTags: ['Assessment'],
    }),

    getAssessmentById: builder.query<Assessment, string>({
      query: id => `/assessments/${id}`,
      transformResponse: (response: ApiResponse<Assessment>) => response.data!,
      providesTags: (result, error, id) => [{ type: 'Assessment', id }],
    }),

    startAssessment: builder.mutation<{ sessionToken: string }, string>({
      query: assessmentId => ({
        url: `/assessments/${assessmentId}/start`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ sessionToken: string }>) =>
        response.data!,
    }),

    getAssessmentSession: builder.query<any, string>({
      query: sessionToken => `/assessments/sessions/${sessionToken}`,
      transformResponse: (response: ApiResponse<any>) => response.data!,
    }),

    submitAnswer: builder.mutation<
      { message: string },
      {
        sessionToken: string;
        questionId: string;
        answer: any;
      }
    >({
      query: ({ sessionToken, ...data }) => ({
        url: `/assessments/sessions/${sessionToken}/answers`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
    }),

    submitAssessment: builder.mutation<any, string>({
      query: sessionToken => ({
        url: `/assessments/sessions/${sessionToken}/submit`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<any>) => response.data!,
      invalidatesTags: ['Assessment', 'Grade'],
    }),

    reportSecurityEvent: builder.mutation<
      { message: string },
      {
        sessionToken: string;
        eventType: string;
        data: any;
      }
    >({
      query: ({ sessionToken, ...data }) => ({
        url: `/assessments/sessions/${sessionToken}/security-events`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
    }),

    sessionHeartbeat: builder.mutation<{ message: string }, string>({
      query: sessionToken => ({
        url: `/assessments/sessions/${sessionToken}/heartbeat`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
    }),
  }),
});

export const {
  useGetAssessmentsQuery,
  useGetAssessmentByIdQuery,
  useStartAssessmentMutation,
  useGetAssessmentSessionQuery,
  useSubmitAnswerMutation,
  useSubmitAssessmentMutation,
  useReportSecurityEventMutation,
  useSessionHeartbeatMutation,
} = assessmentApi;
