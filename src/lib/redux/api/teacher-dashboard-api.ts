import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface TeacherDashboardStats {
  totalStudents: number;
  activeCourses: number;
  totalCourses: number;
  completedAssignments: number;
  pendingGrading: number;
  averageClassPerformance: number;
  thisMonthEnrollments: number;
  recentActivityCount: number;
}

export interface ClassOverview {
  courseId: string;
  courseName: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageScore: number;
  completionRate: number;
  lastActivity: string;
  upcomingDeadlines: number;
  recentSubmissions: number;
  strugglingStudents: number;
  excellingStudents: number;
  courseImage?: string;
  status: 'active' | 'draft' | 'completed' | 'archived';
}

export interface StudentOverview {
  studentId: string;
  studentName: string;
  email: string;
  avatar?: string;
  enrolledCourses: number;
  overallProgress: number;
  averageScore: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'at_risk' | 'excelling';
  coursesData: {
    courseId: string;
    courseName: string;
    progress: number;
    score: number;
    lastAccessed: string;
  }[];
  riskFactors?: string[];
  achievements: number;
}

export interface TeacherActivityFeedItem {
  id: string;
  type:
    | 'student_enrolled'
    | 'assignment_submitted'
    | 'quiz_completed'
    | 'course_completed'
    | 'student_struggling'
    | 'achievement_earned';
  title: string;
  description: string;
  timestamp: string;
  studentName?: string;
  studentId?: string;
  courseId?: string;
  courseName?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: {
    score?: number;
    submissionId?: string;
    achievementType?: string;
    [key: string]: any;
  };
  actionRequired?: boolean;
}

export interface TeacherQuickAction {
  id: string;
  type:
    | 'grade_assignments'
    | 'review_submissions'
    | 'contact_struggling_students'
    | 'update_course_content'
    | 'schedule_live_session'
    | 'respond_to_questions';
  title: string;
  description: string;
  actionText: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
  count?: number;
  estimatedTime?: number;
  urgent?: boolean;
  metadata?: {
    courseId?: string;
    assignmentId?: string;
    studentCount?: number;
    [key: string]: any;
  };
}

export interface TeachingInsight {
  id: string;
  type:
    | 'class_performance'
    | 'student_engagement'
    | 'content_effectiveness'
    | 'teaching_recommendation'
    | 'improvement_suggestion';
  title: string;
  description: string;
  insights: string[];
  recommendations: {
    action: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: string;
    implementation: string;
  }[];
  confidence: number;
  dataSource: string[];
  generatedAt: string;
  courseId?: string;
  studentSegment?: string;
}

export interface PerformanceAnalytics {
  overview: {
    totalStudents: number;
    averageClassScore: number;
    completionRate: number;
    engagementRate: number;
    improvementRate: number;
  };
  coursePerformance: {
    courseId: string;
    courseName: string;
    enrolledStudents: number;
    completionRate: number;
    averageScore: number;
    engagementMetrics: {
      videoWatchTime: number;
      assignmentSubmissionRate: number;
      discussionParticipation: number;
      quizAttemptRate: number;
    };
    strugglingStudents: number;
    excellingStudents: number;
    contentEffectiveness: {
      lessonsWithHighDrop: string[];
      topPerformingLessons: string[];
      improvementAreas: string[];
    };
  }[];
  studentSegments: {
    segment: 'excelling' | 'on_track' | 'at_risk' | 'struggling';
    count: number;
    percentage: number;
    characteristics: string[];
    recommendedActions: string[];
  }[];
  timeAnalytics: {
    peakActivityHours: { hour: number; activityCount: number }[];
    weeklyEngagement: { week: string; engagement: number }[];
    seasonalTrends: { period: string; performance: number }[];
  };
}

export interface AtRiskStudent {
  studentId: string;
  studentName: string;
  email: string;
  avatar?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  riskFactors: {
    factor: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
  coursesAffected: {
    courseId: string;
    courseName: string;
    progress: number;
    lastActivity: string;
    issueAreas: string[];
  }[];
  recommendedActions: {
    action: string;
    priority: 'immediate' | 'urgent' | 'moderate' | 'low';
    description: string;
    estimatedImpact: string;
  }[];
  lastContactDate?: string;
  interventionHistory: {
    date: string;
    action: string;
    outcome?: string;
  }[];
}

export interface GradingQueue {
  id: string;
  type: 'assignment' | 'quiz' | 'exam' | 'project';
  title: string;
  courseName: string;
  courseId: string;
  studentName: string;
  studentId: string;
  submittedAt: string;
  dueDate: string;
  isOverdue: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedGradingTime: number;
  submissionType: 'file' | 'text' | 'quiz' | 'code';
  hasAIPreGrade?: boolean;
  aiConfidence?: number;
}

// ==================== API ENDPOINTS ====================

export const teacherDashboardApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get teacher dashboard statistics
    getTeacherDashboardStats: builder.query<TeacherDashboardStats, void>({
      query: () => '/teacher/dashboard/stats',
      providesTags: ['TeacherDashboard'],
    }),

    // Get class overview for all courses
    getClassOverview: builder.query<ClassOverview[], void>({
      query: () => '/teacher/dashboard/classes',
      providesTags: ['ClassOverview'],
    }),

    // Get detailed class overview for specific course
    getDetailedClassOverview: builder.query<ClassOverview, string>({
      query: courseId => `/teacher/dashboard/classes/${courseId}`,
      providesTags: ['ClassOverview'],
    }),

    // Get student overview across all courses
    getStudentOverview: builder.query<
      StudentOverview[],
      { courseId?: string; status?: string; limit?: number; offset?: number }
    >({
      query: ({ courseId, status, limit = 20, offset = 0 }) => ({
        url: '/teacher/dashboard/students',
        params: { courseId, status, limit, offset },
      }),
      providesTags: ['StudentOverview'],
    }),

    // Get detailed student information
    getDetailedStudentInfo: builder.query<StudentOverview, string>({
      query: studentId => `/teacher/dashboard/students/${studentId}`,
      providesTags: ['StudentOverview'],
    }),

    // Get teacher activity feed
    getTeacherActivityFeed: builder.query<
      TeacherActivityFeedItem[],
      { limit?: number; offset?: number; priority?: string }
    >({
      query: ({ limit = 15, offset = 0, priority }) => ({
        url: '/teacher/dashboard/activity',
        params: { limit, offset, priority },
      }),
      providesTags: ['TeacherActivity'],
    }),

    // Get quick actions for teacher
    getTeacherQuickActions: builder.query<TeacherQuickAction[], void>({
      query: () => '/teacher/dashboard/quick-actions',
      providesTags: ['TeacherQuickActions'],
    }),

    // Get AI teaching insights
    getTeachingInsights: builder.query<
      TeachingInsight[],
      { courseId?: string; type?: string; limit?: number }
    >({
      query: ({ courseId, type, limit = 5 }) => ({
        url: '/teacher/dashboard/ai-insights',
        params: { courseId, type, limit },
      }),
      providesTags: ['TeachingInsights'],
    }),

    // Get performance analytics
    getTeacherPerformanceAnalytics: builder.query<
      PerformanceAnalytics,
      { period?: string; courseIds?: string[] }
    >({
      query: ({ period = 'month', courseIds }) => ({
        url: '/teacher/dashboard/analytics',
        params: { period, courseIds: courseIds?.join(',') },
      }),
      providesTags: ['TeacherAnalytics'],
    }),

    // Get at-risk students
    getAtRiskStudents: builder.query<
      AtRiskStudent[],
      { courseId?: string; riskLevel?: string; limit?: number }
    >({
      query: ({ courseId, riskLevel, limit = 10 }) => ({
        url: '/teacher/dashboard/at-risk-students',
        params: { courseId, riskLevel, limit },
      }),
      providesTags: ['AtRiskStudents'],
    }),

    // Get grading queue
    getGradingQueue: builder.query<
      GradingQueue[],
      { courseId?: string; type?: string; priority?: string; limit?: number }
    >({
      query: ({ courseId, type, priority, limit = 20 }) => ({
        url: '/teacher/dashboard/grading-queue',
        params: { courseId, type, priority, limit },
      }),
      providesTags: ['GradingQueue'],
    }),

    // Contact student action
    contactStudent: builder.mutation<
      void,
      { studentId: string; message: string; subject: string; courseId?: string }
    >({
      query: ({ studentId, message, subject, courseId }) => ({
        url: '/teacher/dashboard/contact-student',
        method: 'POST',
        body: { studentId, message, subject, courseId },
      }),
      invalidatesTags: ['TeacherActivity'],
    }),

    // Update course visibility/status
    updateCourseStatus: builder.mutation<
      void,
      { courseId: string; status: 'active' | 'draft' | 'archived' }
    >({
      query: ({ courseId, status }) => ({
        url: `/teacher/dashboard/courses/${courseId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['ClassOverview'],
    }),

    // Bulk actions on students
    bulkStudentAction: builder.mutation<
      void,
      {
        studentIds: string[];
        action:
          | 'send_reminder'
          | 'extend_deadline'
          | 'provide_additional_resources';
        data: any;
      }
    >({
      query: ({ studentIds, action, data }) => ({
        url: '/teacher/dashboard/bulk-student-action',
        method: 'POST',
        body: { studentIds, action, data },
      }),
      invalidatesTags: ['StudentOverview', 'AtRiskStudents'],
    }),

    // Generate teaching recommendations
    generateTeachingRecommendations: builder.mutation<
      TeachingInsight[],
      { courseId?: string; analysisType?: string[] }
    >({
      query: ({ courseId, analysisType }) => ({
        url: '/teacher/dashboard/generate-insights',
        method: 'POST',
        body: { courseId, analysisType },
      }),
      invalidatesTags: ['TeachingInsights'],
    }),

    // Rate teaching insight
    rateTeachingInsight: builder.mutation<
      void,
      { insightId: string; rating: number; feedback?: string }
    >({
      query: ({ insightId, rating, feedback }) => ({
        url: `/teacher/dashboard/insights/${insightId}/rate`,
        method: 'POST',
        body: { rating, feedback },
      }),
    }),

    // Get course-specific analytics
    getCourseAnalytics: builder.query<any, string>({
      query: courseId => `/analytics/processing/course/${courseId}/analytics`,
      providesTags: ['CourseAnalytics'],
    }),

    // Get instructor analytics dashboard
    getInstructorAnalyticsDashboard: builder.query<any, void>({
      query: () => '/predictive-analytics/dashboard/instructor',
      providesTags: ['TeacherAnalytics'],
    }),
  }),
});

// Export hooks
export const {
  useGetTeacherDashboardStatsQuery,
  useGetClassOverviewQuery,
  useGetDetailedClassOverviewQuery,
  useGetStudentOverviewQuery,
  useGetDetailedStudentInfoQuery,
  useGetTeacherActivityFeedQuery,
  useGetTeacherQuickActionsQuery,
  useGetTeachingInsightsQuery,
  useGetTeacherPerformanceAnalyticsQuery,
  useGetAtRiskStudentsQuery,
  useGetGradingQueueQuery,
  useContactStudentMutation,
  useUpdateCourseStatusMutation,
  useBulkStudentActionMutation,
  useGenerateTeachingRecommendationsMutation,
  useRateTeachingInsightMutation,
  useGetCourseAnalyticsQuery,
  useGetInstructorAnalyticsDashboardQuery,
} = teacherDashboardApi;
