import { createApi } from '@reduxjs/toolkit/query/react';
import { API_CONFIG } from '../constants/constants';
import { AdvancedTokenManager } from '../auth/token-manager';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,
  credentials: 'include',
  prepareHeaders: (headers, api) => {
    const token = AdvancedTokenManager.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Check if this is a FormData upload by examining the endpoint name
    const isFileUpload =
      api.endpoint &&
      (api.endpoint.includes('upload') ||
        api.endpoint.includes('avatar') ||
        api.endpoint.includes('cover'));

    // For file uploads, don't set Content-Type header
    // The browser will set the correct multipart/form-data with boundary
    if (!isFileUpload && !headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('X-Request-ID', crypto.randomUUID());
    headers.set('X-Timestamp', new Date().toISOString());

    return headers;
  },
});

// const baseQuery = fetchBaseQuery({
//   baseUrl: API_CONFIG.baseURL,
//   credentials: 'include',
//   prepareHeaders: (headers, { getState: _, endpoint, extra }) => {
//     console.log('🌐 API Base URL:', API_CONFIG.baseURL);
//     const token = tokenManager.getToken();

//     if (token) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }

//     if (
//       !((extra as any)?.body instanceof FormData) &&
//       !headers.get('Content-Type')
//     ) {
//       headers.set('Content-Type', 'application/json');
//     }

//     headers.set('X-Request-ID', crypto.randomUUID());
//     headers.set('X-Timestamp', new Date().toISOString());

//     console.log('📤 Request headers:', Object.fromEntries(headers.entries()));
//     return headers;
//   },
// });

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  // For FormData uploads, we need to handle headers specially
  if (args.body instanceof FormData) {
    // Create a new args object with modified headers
    args = {
      ...args,
      headers: {
        ...args.headers,
        // Explicitly remove Content-Type to let browser set multipart boundary
        'Content-Type': undefined,
      },
    };

    // Also remove undefined values from headers
    Object.keys(args.headers).forEach(key => {
      if (args.headers[key] === undefined) {
        delete args.headers[key];
      }
    });
  }

  let result = await baseQuery(args, api, extraOptions);

  // If 401 error, let TokenManager handle the refresh instead of doing it here
  if (result.error && result.error.status === 401) {
    // Import AdvancedTokenManager here to avoid circular dependency
    const { AdvancedTokenManager } = await import('@/lib/auth/token-manager');

    // Try to refresh token using TokenManager
    const refreshSuccess = await AdvancedTokenManager.refreshTokenSilently();

    if (refreshSuccess) {
      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // TokenManager will handle clearing tokens and redirect
      // Don't do it here to avoid double action
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'UserProfile',
    'Course',
    'Lesson',
    'Assessment',
    'Question',
    'Enrollment',
    'Progress',
    'Grade',
    'Notification',
    'NotificationCount',
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
    'CourseCreation',
    'CourseDraft',
    'CourseTemplate',
    'AISuggestions',
    'CourseContent',
    'LessonContent',
    'CourseCreationAnalytics',
    'QuestionBank',
    'QuestionBankItem',
    'GradingRubric',
    'AssignmentTemplate',
    'AIQuestionGenerationRequest',
    'AIQuestionGenerationResponse',
    'AssessmentAnalytics',
    'GeneratedQuiz',
    'AssessmentStatistics',
    'Gradebook',
    'ManualGrading',
    'VideoSession',
    'SessionParticipant',
    'BreakoutRoom',
    'Poll',
    'Whiteboard',
    'Attendance',
    'SessionAnalytics',
    'AIRecommendation',
    'ContentFeed',
    'LearningPath',
    'TutoringSession',
    'SmartSuggestion',
    'DropoutRisk',
    'PerformancePrediction',
    'LearningPattern',
    'Intervention',
    'LearningOutcome',
    'ResourceOptimization',
    'Dashboard',
    'ChatbotConversation',
    'ChatbotMessage',
    'TutoringSession',
    'LearningHint',
    'KnowledgeGraph',
    'LearningStyle',
    'ContentRecommendation',
    'ContentQuality',
    'PlagiarismCheck',
    'SimilarityAnalysis',
    'ContentTag',
    'GeneratedQuiz',
    'ContentAnalytics',
    'MLModel',
    'ModelVersion',
    'ABTest',
    'Prediction',
    'SystemHealth',
    'ChatRoom',
    'ChatParticipant',
    'ChatMessage',
    'ChatModeration',
    'ChatModerationAppeal',
    'MessageThread',
    'ChatFile',
    'ChatSearchParams',
    'ChatSearchResult',
    'CreateRoomRequest',
    'JoinRoomRequest',
    'SendMessageRequest',
    'ChatApiResponse',
    'ChatRoomAnalytics',
    'ChatThread',
    'ChatSearch',
    'ChatAnalytics',
    'ForumCategory',
    'ForumThread',
    'ForumPost',
    'ForumTag',
    'ForumStats',
    'UserReputation',
    'ModerationReport',
    'StudyGroup',
    'CollaborativeNote',
    'GroupProject',
    'SharedWhiteboard',
    'PeerReview',
    'GroupMember',
    'Users',
    'UserPermissions',
    'Roles',
    'Permissions',
    'TeacherApplications',
    'BulkOperations',
    'UserAnalytics',
    'SecurityEvents',
    'UserActivityLogs',
    'Courses',
    'Categories',
    'Moderation',
    'CourseStatistics',
    'ContentTags',
    'QualityAssessments',
    'QualityStatistics',
    'QualityTrends',
    'PlagiarismChecks',
    'PlagiarismStatistics',
    'SimilarityRecords',
    'ContentAnalysisDashboard',
    'ContentAnalysis',
    'Cart',
    'CartCount',
    'CartCheck',
    'Purchases',
    'Payment',
    'Payments',
    'Subscriptions',
    'PricingPlans',
    'Coupons',
    'PaymentMethods',
    'PurchaseStats',
    'Purchase',
    'SubscriptionStats',
    'File',
    'FileStatistics',
    'ProcessingStatus',
    'FileVersion',
    'SecurityScan',
    'CDNConfig',
    'Search',
    'Forum',
    'SearchSuggestions',
    'SearchTrending',
    'PersonalizedSearch',
    'SmartDiscovery',
    'ContentRecommendations',
    'SimilarContent',
    'SearchFacets',
    'FacetedSearch',
    'SearchAnalytics',
    'SearchBoostRules',
    'SearchOptimization',
    'SearchIndexStatus',
    // Teacher Registration & Admin
    'TeacherDocuments',
    'ApprovalStats',
    'DashboardOverview',
    'PendingDocuments',
    'UserStats',
    'SystemMetrics',
    'SystemAlerts',
    'BusinessMetrics',
    'Role',
    'Roles',
    'RolePermissions',
    'Permission',
    'Permissions',
    'Section',
    'CourseStats',
    'Assessments',
    'QuestionBankStats',
    'AssessmentAvailability',
    'EnrollmentStatus',
  ],
  endpoints: () => ({}),
});

export const {
  util: { invalidateTags, resetApiState },
} = baseApi;
