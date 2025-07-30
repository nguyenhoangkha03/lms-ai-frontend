import { baseApi } from '@/lib/api/base-api';

export interface StudentAnalytics {
  id: string;
  studentId: string;
  courseId?: string;
  date: string;
  totalTimeSpent: number;
  lessonsCompleted: number;
  quizzesAttempted: number;
  quizzesPassed: number;
  averageQuizScore: number;
  loginCount: number;
  videoWatchTime: number;
  readingTime: number;
  discussionPosts: number;
  chatMessages: number;
  mostActiveHour: number;
  struggleIndicators?: string[];
  engagementScore: number;
  progressPercentage: number;
  performanceLevel: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  learningPattern:
    | 'consistent'
    | 'binge_learner'
    | 'procrastinator'
    | 'perfectionist'
    | 'explorer'
    | 'focused'
    | 'social_learner'
    | 'independent';
  engagementMetrics: {
    videoEngagement: number;
    quizEngagement: number;
    discussionEngagement: number;
    overallEngagement: number;
  };
  learningVelocity: {
    lessonsPerWeek: number;
    minutesPerLesson: number;
    retentionRate: number;
    completionRate: number;
  };
  predictiveIndicators: {
    dropoutRisk: number;
    strugglingConcepts: string[];
    recommendedActions: string[];
    nextMilestone: string;
  };
  skillsGained: string[];
  behavioralPatterns: Record<string, any>;
  metadata: Record<string, any>;
}

export interface LearningGoal {
  id: string;
  studentId: string;
  title: string;
  description: string;
  category:
    | 'course_completion'
    | 'study_hours'
    | 'skill_mastery'
    | 'assessment_score'
    | 'streak_maintenance';
  targetValue: number;
  currentProgress: number;
  unit: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  priority: 'low' | 'medium' | 'high';
  milestones: {
    id: string;
    title: string;
    targetValue: number;
    completedAt?: string;
    isCompleted: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metadata: Record<string, any>;
}

export interface Achievement {
  id: string;
  type: 'badge' | 'certificate' | 'trophy' | 'milestone' | 'skill_unlock';
  category:
    | 'completion'
    | 'engagement'
    | 'performance'
    | 'consistency'
    | 'social'
    | 'mastery';
  title: string;
  description: string;
  icon: string;
  color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: string;
    value: number;
    operator: 'gte' | 'lte' | 'eq';
    context?: string;
  }[];
  unlockedAt?: string;
  isUnlocked: boolean;
  progress: {
    current: number;
    required: number;
    percentage: number;
  };
  metadata: Record<string, any>;
}

export interface PerformanceAnalytics {
  overview: {
    totalCourses: number;
    completedCourses: number;
    totalStudyHours: number;
    averageScore: number;
    currentStreak: number;
    longestStreak: number;
    totalAchievements: number;
    overallProgress: number;
  };
  timeAnalytics: {
    dailyStudyTime: { date: string; minutes: number }[];
    weeklyProgress: { week: string; progress: number }[];
    monthlyComparison: { month: string; hours: number; courses: number }[];
    studyPatterns: {
      mostActiveDay: string;
      mostActiveHour: number;
      averageSessionLength: number;
      preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
    };
  };
  coursePerformance: {
    courseId: string;
    courseName: string;
    progress: number;
    averageScore: number;
    timeSpent: number;
    lessonsCompleted: number;
    totalLessons: number;
    lastActivity: string;
    performanceLevel: string;
    strugglingAreas: string[];
    strongAreas: string[];
  }[];
  skillAssessment: {
    skillId: string;
    skillName: string;
    currentLevel: number;
    masteryPercentage: number;
    recentProgress: number;
    relatedCourses: string[];
    nextMilestone: string;
  }[];
  learningInsights: {
    strengths: string[];
    improvementAreas: string[];
    studyRecommendations: string[];
    nextGoals: string[];
    aiInsights: string[];
  };
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  streakGoal: number;
  todayCompleted: boolean;
  streakHistory: {
    date: string;
    completed: boolean;
    studyTime: number;
    activitiesCompleted: number;
  }[];
  weeklyStats: {
    week: string;
    daysActive: number;
    totalTime: number;
    averageScore: number;
  }[];
  milestones: {
    days: number;
    title: string;
    reward: string;
    achieved: boolean;
    achievedAt?: string;
  }[];
}

export interface AIInsights {
  id: string;
  studentId: string;
  type:
    | 'performance_prediction'
    | 'learning_recommendation'
    | 'risk_assessment'
    | 'skill_gap_analysis'
    | 'study_optimization';
  title: string;
  description: string;
  insights: string[];
  recommendations: {
    action: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: string;
    estimatedTime: string;
  }[];
  confidence: number;
  dataPoints: {
    metric: string;
    value: number;
    trend: 'improving' | 'declining' | 'stable';
  }[];
  predictions: {
    metric: string;
    currentValue: number;
    predictedValue: number;
    timeframe: string;
    confidence: number;
  }[];
  generatedAt: string;
  validUntil: string;
  metadata: Record<string, any>;
}

export interface ProgressDashboardData {
  analytics: StudentAnalytics;
  performance: PerformanceAnalytics;
  goals: LearningGoal[];
  achievements: Achievement[];
  streak: StudyStreak;
  aiInsights: AIInsights[];
  recentActivities: {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    metadata: Record<string, any>;
  }[];
}

// ==================== API ENDPOINTS ====================

export const studentAnalyticsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get comprehensive progress dashboard data
    getProgressDashboard: builder.query<ProgressDashboardData, void>({
      query: () => '/student/analytics/dashboard',
      providesTags: ['StudentAnalytics', 'LearningGoals', 'Achievements'],
    }),

    // Get detailed student analytics
    getStudentAnalytics: builder.query<
      StudentAnalytics[],
      {
        courseId?: string;
        period?: 'week' | 'month' | 'quarter' | 'year';
        limit?: number;
      }
    >({
      query: ({ courseId, period = 'month', limit = 30 }) => ({
        url: '/student/analytics',
        params: { courseId, period, limit },
      }),
      providesTags: ['StudentAnalytics'],
    }),

    // Get performance analytics
    getPerformanceAnalytics: builder.query<
      PerformanceAnalytics,
      { period?: string; courseIds?: string[] }
    >({
      query: ({ period = 'month', courseIds }) => ({
        url: '/student/analytics/performance',
        params: { period, courseIds: courseIds?.join(',') },
      }),
      providesTags: ['StudentAnalytics'],
    }),

    // Learning Goals Management
    getLearningGoals: builder.query<
      LearningGoal[],
      { status?: string; category?: string }
    >({
      query: ({ status, category }) => ({
        url: '/student/goals',
        params: { status, category },
      }),
      providesTags: ['LearningGoals'],
    }),

    createLearningGoal: builder.mutation<LearningGoal, Partial<LearningGoal>>({
      query: goalData => ({
        url: '/student/goals',
        method: 'POST',
        body: goalData,
      }),
      invalidatesTags: ['LearningGoals'],
    }),

    updateLearningGoal: builder.mutation<
      LearningGoal,
      { id: string; updates: Partial<LearningGoal> }
    >({
      query: ({ id, updates }) => ({
        url: `/student/goals/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['LearningGoals'],
    }),

    deleteLearningGoal: builder.mutation<void, string>({
      query: id => ({
        url: `/student/goals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LearningGoals'],
    }),

    // Achievements System
    getAchievements: builder.query<
      Achievement[],
      { category?: string; unlocked?: boolean }
    >({
      query: ({ category, unlocked }) => ({
        url: '/student/achievements',
        params: { category, unlocked },
      }),
      providesTags: ['Achievements'],
    }),

    getAchievementProgress: builder.query<Achievement[], void>({
      query: () => '/student/achievements/progress',
      providesTags: ['Achievements'],
    }),

    claimAchievement: builder.mutation<Achievement, string>({
      query: achievementId => ({
        url: `/student/achievements/${achievementId}/claim`,
        method: 'POST',
      }),
      invalidatesTags: ['Achievements'],
    }),

    // Study Streak
    getStudyStreak: builder.query<StudyStreak, void>({
      query: () => '/student/analytics/streak',
      providesTags: ['StudentAnalytics'],
    }),

    updateStreakGoal: builder.mutation<StudyStreak, { goal: number }>({
      query: ({ goal }) => ({
        url: '/student/analytics/streak/goal',
        method: 'PATCH',
        body: { goal },
      }),
      invalidatesTags: ['StudentAnalytics'],
    }),

    // AI Insights
    getAIInsights: builder.query<
      AIInsights[],
      { type?: string; limit?: number }
    >({
      query: ({ type, limit = 5 }) => ({
        url: '/student/analytics/ai-insights',
        params: { type, limit },
      }),
      providesTags: ['AIInsights'],
    }),

    generateAIInsights: builder.mutation<
      AIInsights[],
      { analysisType?: string[] }
    >({
      query: ({ analysisType }) => ({
        url: '/student/analytics/ai-insights/generate',
        method: 'POST',
        body: { analysisType },
      }),
      invalidatesTags: ['AIInsights'],
    }),

    rateAIInsight: builder.mutation<
      void,
      { insightId: string; rating: number; feedback?: string }
    >({
      query: ({ insightId, rating, feedback }) => ({
        url: `/student/analytics/ai-insights/${insightId}/rate`,
        method: 'POST',
        body: { rating, feedback },
      }),
    }),

    // Comprehensive Analytics (from backend API)
    getComprehensiveAnalytics: builder.query<any, string>({
      query: studentId =>
        `/analytics/processing/student/${studentId}/comprehensive`,
      providesTags: ['StudentAnalytics'],
    }),

    // Learning Pattern Recognition
    getLearningPatterns: builder.query<any, string>({
      query: studentId =>
        `/analytics/processing/patterns/learning/${studentId}`,
      providesTags: ['StudentAnalytics'],
    }),

    // Dropout Risk Prediction
    getDropoutRiskPrediction: builder.query<any, string>({
      query: studentId =>
        `/analytics/processing/prediction/dropout/${studentId}`,
      providesTags: ['StudentAnalytics'],
    }),

    // Performance Comparison with Peers
    getPeerComparison: builder.query<any, string>({
      query: studentId => `/analytics/processing/comparison/peer/${studentId}`,
      providesTags: ['StudentAnalytics'],
    }),

    // Export Analytics Data
    exportAnalyticsData: builder.mutation<
      Blob,
      { format: 'pdf' | 'excel' | 'csv'; filters?: any }
    >({
      query: ({ format, filters }) => ({
        url: `/analytics/processing/export/${format}`,
        method: 'GET',
        params: filters,
        responseHandler: (response: any) => response.blob(),
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetProgressDashboardQuery,
  useGetStudentAnalyticsQuery,
  useGetPerformanceAnalyticsQuery,
  useGetLearningGoalsQuery,
  useCreateLearningGoalMutation,
  useUpdateLearningGoalMutation,
  useDeleteLearningGoalMutation,
  useGetAchievementsQuery,
  useGetAchievementProgressQuery,
  useClaimAchievementMutation,
  useGetStudyStreakQuery,
  useUpdateStreakGoalMutation,
  useGetAIInsightsQuery,
  useGenerateAIInsightsMutation,
  useRateAIInsightMutation,
  useGetComprehensiveAnalyticsQuery,
  useGetLearningPatternsQuery,
  useGetDropoutRiskPredictionQuery,
  useGetPeerComparisonQuery,
  useExportAnalyticsDataMutation,
} = studentAnalyticsApi;
