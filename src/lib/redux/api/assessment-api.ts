import { baseApi } from '@/lib/api/base-api';
import {
  Assessment,
  AssessmentSession,
  AssessmentAttempt,
  SecurityEvent,
} from '@/types/assessment';

export interface StartAssessmentRequest {
  assessmentId: string;
  antiCheatConfig?: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: any;
  timeSpent: number;
  confidence?: number;
}

export interface SessionHeartbeatRequest {
  sessionId: string;
  timestamp: number;
  isActive: boolean;
  metadata?: {
    windowFocused: boolean;
    fullscreenActive: boolean;
    tabSwitchCount: number;
    mouseMovements: number;
    keystrokes: number;
  };
}

export interface SecurityEventRequest {
  sessionId: string;
  eventType:
    | 'tab_switch'
    | 'window_blur'
    | 'fullscreen_exit'
    | 'copy_attempt'
    | 'paste_attempt'
    | 'right_click'
    | 'key_combination'
    | 'suspicious_behavior';
  timestamp: number;
  metadata?: Record<string, any>;
}

export const assessmentApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Student Access Endpoints
    getCourseAssessments: builder.query<Assessment[], string>({
      query: courseId => `/assessments/course/${courseId}`,
      providesTags: (_result, _error, courseId) => [
        { type: 'Assessment', id: `course-${courseId}` },
      ],
      transformResponse: (response: any) => {
        return response.data;
      },
    }),

    getLessonAssessments: builder.query<Assessment[], string>({
      query: lessonId => `/assessments/lesson/${lessonId}`,
      providesTags: (_result, _error, lessonId) => [
        { type: 'Assessment', id: `lesson-${lessonId}` },
      ],
    }),

    checkAssessmentAvailability: builder.query<
      {
        available: boolean;
        reason?: string;
        details: {
          isPublished: boolean;
          isInTimeWindow: boolean;
          hasAttemptsLeft: boolean;
          attemptCount: number;
          maxAttempts: number;
        };
      },
      string
    >({
      query: assessmentId => `/assessments/${assessmentId}/availability`,
      providesTags: (_result, _error, assessmentId) => [
        { type: 'AssessmentAvailability', id: assessmentId },
      ],
    }),

    // Get assessment details
    getAssessment: builder.query<Assessment, string>({
      query: assessmentId => `/assessments/${assessmentId}`,
      providesTags: (_result, _error, assessmentId) => [
        { type: 'Assessment', id: assessmentId },
      ],
      transformResponse: (response: any) => {
        console.log(`Assessment: `, response);
        return response.data;
      },
    }),

    // Start assessment session
    startAssessment: builder.mutation<
      AssessmentSession,
      StartAssessmentRequest
    >({
      query: data => ({
        url: `/assessments/${data.assessmentId}/start`,
        method: 'POST',
        body: {},
      }),
      invalidatesTags: ['AssessmentSession'],
      transformResponse: (response: any) => {
        return response.data;
      },
    }),

    // Get current session
    getAssessmentSession: builder.query<AssessmentSession, string>({
      query: sessionId => `/assessments/sessions/${sessionId}`,
      providesTags: (_result, _error, sessionId) => [
        { type: 'AssessmentSession', id: sessionId },
      ],
    }),

    // Submit answer
    submitAnswer: builder.mutation<
      {
        isCorrect?: boolean;
        feedback?: string;
        explanation?: string;
        nextQuestionId?: string;
        adaptiveAdjustment?: {
          difficultyLevel: number;
          reason: string;
        };
      },
      SubmitAnswerRequest
    >({
      query: data => ({
        url: `/assessments/sessions/${data.sessionId}/answers`,
        method: 'POST',
        body: {
          questionId: data.questionId,
          answer: data.answer,
          timeSpent: data.timeSpent,
          confidence: data.confidence,
        },
      }),
      invalidatesTags: ['AssessmentSession'],
    }),

    // Session heartbeat
    sessionHeartbeat: builder.mutation<void, SessionHeartbeatRequest>({
      query: data => ({
        url: '/assessments/heartbeat',
        method: 'POST',
        body: data,
      }),
    }),

    // Report security event
    reportSecurityEvent: builder.mutation<void, SecurityEventRequest>({
      query: data => ({
        url: '/assessments/security-event',
        method: 'POST',
        body: data,
      }),
    }),

    // Pause session
    pauseSession: builder.mutation<
      void,
      {
        sessionId: string;
        reason?: string;
      }
    >({
      query: data => ({
        url: `/assessments/sessions/${data.sessionId}/pause`,
        method: 'POST',
        body: { reason: data.reason },
      }),
      invalidatesTags: ['AssessmentSession'],
    }),

    // Resume session
    resumeSession: builder.mutation<void, string>({
      query: sessionId => ({
        url: `/assessments/sessions/${sessionId}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['AssessmentSession'],
    }),

    // Submit assessment
    submitAssessment: builder.mutation<
      AssessmentAttempt,
      {
        sessionId: string;
        confirmSubmission: boolean;
      }
    >({
      query: data => ({
        url: `/assessments/sessions/${data.sessionId}/submit`,
        method: 'POST',
        body: { confirmSubmission: data.confirmSubmission },
      }),
      invalidatesTags: ['AssessmentSession', 'Assessment'],
    }),

    // Get session analytics
    getSessionAnalytics: builder.query<
      {
        timeSpent: number;
        questionsAnswered: number;
        totalQuestions: number;
        averageTimePerQuestion: number;
        securityEvents: SecurityEvent[];
        focusLossCount: number;
        tabSwitchCount: number;
        suspiciousActivityScore: number;
      },
      string
    >({
      query: sessionId => `/assessments/sessions/${sessionId}/analytics`,
      providesTags: (_result, _error, sessionId) => [
        { type: 'Analytics', id: sessionId },
      ],
    }),

    // Get assessment attempts history
    getAssessmentAttempts: builder.query<AssessmentAttempt[], string>({
      query: assessmentId => `/assessments/${assessmentId}/attempts`,
      providesTags: (_result, _error, assessmentId) => [
        { type: 'AssessmentAttempt', id: assessmentId },
      ],
      transformResponse: (response: any) => {
        console.log('Attempts API response:', response);
        return response.data;
      },
    }),

    // Flag session for review
    flagSessionForReview: builder.mutation<
      void,
      {
        sessionId: string;
        reason: string;
        severity: 'low' | 'medium' | 'high';
      }
    >({
      query: data => ({
        url: '/assessments/flag-session',
        method: 'POST',
        body: data,
      }),
    }),

    // Get AI feedback
    getAIFeedback: builder.query<
      {
        overallPerformance: string;
        strengthAreas: string[];
        improvementAreas: string[];
        recommendations: string[];
        nextSteps: string[];
      },
      string
    >({
      query: sessionId => `/assessments/sessions/${sessionId}/ai-feedback`,
      providesTags: (_result, _error, sessionId) => [
        { type: 'AIFeedback', id: sessionId },
      ],
    }),
  }),
});

export const {
  // Student Access Hooks
  useGetCourseAssessmentsQuery,
  useGetLessonAssessmentsQuery,
  useCheckAssessmentAvailabilityQuery,

  // Assessment Taking Hooks
  useGetAssessmentQuery,
  useStartAssessmentMutation,
  useGetAssessmentSessionQuery,
  useSubmitAnswerMutation,
  useSessionHeartbeatMutation,
  useReportSecurityEventMutation,
  usePauseSessionMutation,
  useResumeSessionMutation,
  useSubmitAssessmentMutation,
  useGetSessionAnalyticsQuery,
  useGetAssessmentAttemptsQuery,
  useFlagSessionForReviewMutation,
  useGetAIFeedbackQuery,
} = assessmentApi;
