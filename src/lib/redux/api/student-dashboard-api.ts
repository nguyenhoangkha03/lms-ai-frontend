import { baseApi } from '@/lib/api/base-api';

export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalStudyHours: number;
  weeklyStudyHours: number;
  currentStreak: number;
  totalAchievements: number;
  averageScore: number;
}

export interface ProgressOverview {
  courseId: string;
  courseName: string;
  courseImage: string;
  progressPercentage: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastActivity: string;
  nextLesson?: {
    id: string;
    title: string;
    estimatedDuration: number;
  };
  isCompleted: boolean;
}

export interface ActivityFeedItem {
  id: string;
  type:
    | 'lesson_completed'
    | 'quiz_taken'
    | 'achievement_earned'
    | 'course_enrolled'
    | 'milestone_reached';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    courseId?: string;
    lessonId?: string;
    score?: number;
    achievementId?: string;
    [key: string]: any;
  };
  icon: string;
  color: string;
}

export interface QuickAction {
  id: string;
  type:
    | 'continue_learning'
    | 'take_quiz'
    | 'join_session'
    | 'view_assignment'
    | 'ai_tutor';
  title: string;
  description: string;
  actionText: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
  metadata?: {
    courseId?: string;
    lessonId?: string;
    dueDate?: string;
    [key: string]: any;
  };
  isNew?: boolean;
  estimatedTime?: number;
}

export interface AIRecommendation {
  id: string;
  type:
    | 'next_lesson'
    | 'review_content'
    | 'practice_quiz'
    | 'supplementary_material'
    | 'study_break'
    | 'course_recommendation';
  title: string;
  description: string;
  reason: string;
  confidence: number;
  actionText: string;
  href?: string;
  metadata?: {
    courseId?: string;
    contentId?: string;
    difficulty?: string;
    estimatedTime?: number;
    [key: string]: any;
  };
  createdAt: string;
  expiresAt?: string;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  streakHistory: {
    date: string;
    minutes: number;
    achieved: boolean;
  }[];
}

export interface UpcomingDeadline {
  id: string;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  title: string;
  courseName: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  isOverdue: boolean;
  daysRemaining: number;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  currentProgress: number;
  targetValue: number;
  unit: string;
  category:
    | 'course_completion'
    | 'study_hours'
    | 'skill_mastery'
    | 'assessment_score';
  isCompleted: boolean;
}

export const studentDashboardApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get dashboard statistics
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/student/dashboard/stats',
      providesTags: ['DashboardStats'],
    }),

    // Get progress overview for courses
    getProgressOverview: builder.query<ProgressOverview[], void>({
      query: () => '/student/dashboard/progress',
      providesTags: ['ProgressOverview'],
    }),

    // Get activity feed
    getActivityFeed: builder.query<
      ActivityFeedItem[],
      { limit?: number; offset?: number }
    >({
      query: ({ limit = 10, offset = 0 }) =>
        `/student/dashboard/activity?limit=${limit}&offset=${offset}`,
      providesTags: ['ActivityFeed'],
    }),

    // Get quick actions
    getQuickActions: builder.query<QuickAction[], void>({
      query: () => '/student/dashboard/quick-actions',
      providesTags: ['QuickActions'],
    }),

    // Get AI recommendations
    getAIRecommendations: builder.query<AIRecommendation[], { limit?: number }>(
      {
        query: ({ limit = 5 }) =>
          `/student/dashboard/ai-recommendations?limit=${limit}`,
        providesTags: ['AIRecommendations'],
      }
    ),

    // Get study streak information
    getStudyStreak: builder.query<StudyStreak, void>({
      query: () => '/student/dashboard/study-streak',
      providesTags: ['StudyStreak'],
    }),

    // Get upcoming deadlines
    getUpcomingDeadlines: builder.query<UpcomingDeadline[], { limit?: number }>(
      {
        query: ({ limit = 5 }) => `/student/dashboard/deadlines?limit=${limit}`,
        providesTags: ['UpcomingDeadlines'],
      }
    ),

    // Get learning goals
    getLearningGoals: builder.query<LearningGoal[], void>({
      query: () => '/student/dashboard/goals',
      providesTags: ['LearningGoals'],
    }),

    // Update learning goal
    updateLearningGoal: builder.mutation<
      LearningGoal,
      { goalId: string; updates: Partial<LearningGoal> }
    >({
      query: ({ goalId, updates }) => ({
        url: `/student/dashboard/goals/${goalId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['LearningGoals'],
    }),

    // Dismiss AI recommendation
    dismissAIRecommendation: builder.mutation<
      void,
      { recommendationId: string; reason?: string }
    >({
      query: ({ recommendationId, reason }) => ({
        url: `/student/dashboard/ai-recommendations/${recommendationId}/dismiss`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['AIRecommendations'],
    }),

    // Mark quick action as completed
    completeQuickAction: builder.mutation<void, { actionId: string }>({
      query: ({ actionId }) => ({
        url: `/student/dashboard/quick-actions/${actionId}/complete`,
        method: 'POST',
      }),
      invalidatesTags: ['QuickActions', 'ActivityFeed'],
    }),

    // Log study session
    logStudySession: builder.mutation<
      void,
      { minutes: number; courseId?: string; lessonId?: string }
    >({
      query: sessionData => ({
        url: '/student/dashboard/study-session',
        method: 'POST',
        body: sessionData,
      }),
      invalidatesTags: ['StudyStreak', 'DashboardStats'],
    }),

    // Refresh dashboard data
    refreshDashboard: builder.mutation<void, void>({
      query: () => ({
        url: '/student/dashboard/refresh',
        method: 'POST',
      }),
      invalidatesTags: [
        'DashboardStats',
        'ProgressOverview',
        'ActivityFeed',
        'QuickActions',
        'AIRecommendations',
        'StudyStreak',
        'UpcomingDeadlines',
        'LearningGoals',
      ],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetProgressOverviewQuery,
  useGetActivityFeedQuery,
  useGetQuickActionsQuery,
  useGetAIRecommendationsQuery,
  useGetStudyStreakQuery,
  useGetUpcomingDeadlinesQuery,
  useGetLearningGoalsQuery,
  useUpdateLearningGoalMutation,
  useDismissAIRecommendationMutation,
  useCompleteQuickActionMutation,
  useLogStudySessionMutation,
  useRefreshDashboardMutation,
} = studentDashboardApi;
