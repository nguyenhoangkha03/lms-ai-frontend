import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../constants/constants';
import { tokenManager } from './client';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,
  prepareHeaders: (headers, { getState: _ }) => {
    const token = tokenManager.getToken();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    headers.set('Content-Type', 'application/json');
    headers.set('X-Request-ID', crypto.randomUUID());
    headers.set('X-Timestamp', new Date().toISOString());

    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refreshToken = tokenManager.getRefreshToken();

    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken } = (refreshResult.data as any).data;
        tokenManager.setToken(accessToken);

        result = await baseQuery(args, api, extraOptions);
      } else {
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    } else {
      tokenManager.clearTokens();
      window.location.href = '/login';
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Course',
    'Lesson',
    'Assessment',
    'Question',
    'Enrollment',
    'Progress',
    'Grade',
    'Notification',
    'Chat',
    'VideoSession',
    'AIRecommendation',
    'Analytics',
    'OnboardingProgress',
    'SkillAssessment',
    'AssessmentResult',
    'LearningPath',
    'Preferences',
    'DashboardStats',
    'ProgressOverview',
    'ActivityFeed',
    'QuickActions',
    'AIRecommendations',
    'StudyStreak',
    'UpcomingDeadlines',
    'LearningGoals',
    'Category',
    'Wishlist',
    'Enrollment',
    'CourseDetail',
    'CourseSearchResponse',
    'CourseFilters',
    'Review',
    'LearningSession',
    'LessonProgress',
    'Note',
    'InteractiveElement',
    'Interactive',
    'Bookmark',
    'Resource',
    'AssessmentSession',
    'AssessmentAttempt',
    'SecurityEvent',
    'ProctoringData',
    'SessionAnalytics',
    'SessionHeartbeat',
    'AdaptiveQuestionAdjustment',
    'AIFeedback',
    'StudentAnalytics',
    'Achievements',
    'AIInsights',
    'TeacherDashboard',
    'ClassOverview',
    'StudentOverview',
    'TeacherActivity',
    'TeacherQuickActions',
    'TeachingInsights',
    'TeacherAnalytics',
    'AtRiskStudents',
    'GradingQueue',
    'CourseAnalytics',
  ],
  endpoints: () => ({}),
});

export const {
  util: { invalidateTags, resetApiState },
} = baseApi;
