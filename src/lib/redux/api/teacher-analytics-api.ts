import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface OverviewAnalytics {
  totalStudents: number;
  averageClassScore: number;
  completionRate: number;
  engagementRate: number;
  improvementRate: number;
}

export interface EngagementMetrics {
  videoWatchTime: number;
  assignmentSubmissionRate: number;
  discussionParticipation: number;
  quizAttemptRate: number;
}

export interface ContentEffectiveness {
  lessonsWithHighDrop: string[];
  topPerformingLessons: string[];
  improvementAreas: string[];
}

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  enrolledStudents: number;
  completionRate: number;
  averageScore: number;
  engagementMetrics: EngagementMetrics;
  strugglingStudents: number;
  excellingStudents: number;
  contentEffectiveness: ContentEffectiveness;
}

export interface StudentSegment {
  segment: 'excelling' | 'on_track' | 'at_risk' | 'struggling';
  count: number;
  percentage: number;
  characteristics: string[];
  recommendedActions: string[];
}

export interface TimeAnalytics {
  peakActivityHours: Array<{
    hour: number;
    activityCount: number;
  }>;
  weeklyEngagement: Array<{
    week: string;
    engagement: number;
  }>;
  seasonalTrends: Array<{
    period: string;
    performance: number;
  }>;
}

export interface PerformanceAnalytics {
  overview: OverviewAnalytics;
  coursePerformance: CoursePerformance[];
  studentSegments: StudentSegment[];
  timeAnalytics: TimeAnalytics;
}

export interface AnalyticsQuery {
  period?: 'week' | 'month' | 'semester' | 'year';
  courseIds?: string[];
  studentIds?: string[];
  startDate?: string;
  endDate?: string;
}

export interface CourseAnalytics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  completionRate: number;
  averageGrade: number;
  timeSpent: number;
  engagementScore: number;
  dropoffPoints: Array<{
    lessonId: string;
    lessonName: string;
    dropoffRate: number;
  }>;
}

export interface StudentProgressAnalytics {
  studentId: string;
  studentName: string;
  overallProgress: number;
  courseProgress: Array<{
    courseId: string;
    courseName: string;
    progress: number;
    grade: number;
    timeSpent: number;
    lastActivity: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface GradingAnalytics {
  totalAssignments: number;
  gradedAssignments: number;
  pendingGrading: number;
  averageGradingTime: number;
  gradeDistribution: Array<{
    grade: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    assignmentsGraded: number;
  }>;
}

export interface ReportRequest {
  type: 'performance' | 'engagement' | 'progress' | 'comprehensive';
  format: 'pdf' | 'excel' | 'csv';
  period: 'week' | 'month' | 'semester' | 'year';
  courseIds?: string[];
  studentIds?: string[];
  includeCharts?: boolean;
  includeRecommendations?: boolean;
}

// ==================== API ENDPOINTS ====================

export const teacherAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get overall performance analytics
    getPerformanceAnalytics: builder.query<
      PerformanceAnalytics,
      AnalyticsQuery
    >({
      query: (params) => ({
        url: '/teacher/analytics/performance',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: PerformanceAnalytics;
      }) => response.data,
      providesTags: ['TeacherAnalytics'],
    }),

    // Get course-specific analytics
    getCourseAnalytics: builder.query<
      CourseAnalytics[],
      { courseIds?: string[]; period?: string }
    >({
      query: (params) => ({
        url: '/teacher/analytics/courses',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: CourseAnalytics[];
      }) => response.data,
      providesTags: ['CourseAnalytics'],
    }),

    // Get student progress analytics
    getStudentProgressAnalytics: builder.query<
      StudentProgressAnalytics[],
      { courseId?: string; studentIds?: string[] }
    >({
      query: (params) => ({
        url: '/teacher/analytics/students',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: StudentProgressAnalytics[];
      }) => response.data,
      providesTags: ['StudentAnalytics'],
    }),

    // Get grading analytics
    getGradingAnalytics: builder.query<
      GradingAnalytics,
      { period?: string; courseIds?: string[] }
    >({
      query: (params) => ({
        url: '/teacher/analytics/grading',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: GradingAnalytics;
      }) => response.data,
      providesTags: ['GradingAnalytics'],
    }),

    // Get engagement metrics
    getEngagementMetrics: builder.query<
      {
        totalEngagementScore: number;
        courseEngagement: Array<{
          courseId: string;
          courseName: string;
          engagementScore: number;
          trend: 'up' | 'down' | 'stable';
        }>;
        studentEngagement: Array<{
          studentId: string;
          studentName: string;
          engagementScore: number;
          risk: 'low' | 'medium' | 'high';
        }>;
        peakHours: Array<{
          hour: number;
          activityCount: number;
        }>;
      },
      AnalyticsQuery
    >({
      query: (params) => ({
        url: '/teacher/analytics/engagement',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['EngagementAnalytics'],
    }),

    // Generate comprehensive report
    generateAnalyticsReport: builder.mutation<
      Blob,
      ReportRequest
    >({
      query: (reportData) => ({
        url: '/teacher/analytics/reports/generate',
        method: 'POST',
        body: reportData,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get learning outcomes analytics
    getLearningOutcomes: builder.query<
      {
        totalOutcomes: number;
        achievedOutcomes: number;
        inProgressOutcomes: number;
        notStartedOutcomes: number;
        outcomeDetails: Array<{
          outcomeId: string;
          outcomeName: string;
          achievementRate: number;
          averageScore: number;
          studentsAchieved: number;
          totalStudents: number;
        }>;
      },
      { courseId?: string; period?: string }
    >({
      query: (params) => ({
        url: '/teacher/analytics/learning-outcomes',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['LearningOutcomes'],
    }),

    // Get content effectiveness analytics
    getContentEffectiveness: builder.query<
      {
        topPerformingContent: Array<{
          contentId: string;
          contentTitle: string;
          completionRate: number;
          averageScore: number;
          engagementTime: number;
        }>;
        underperformingContent: Array<{
          contentId: string;
          contentTitle: string;
          dropoffRate: number;
          commonIssues: string[];
          suggestions: string[];
        }>;
        contentAnalytics: Array<{
          contentType: string;
          totalItems: number;
          averageEngagement: number;
          completionRate: number;
        }>;
      },
      { courseId?: string; contentType?: string }
    >({
      query: (params) => ({
        url: '/teacher/analytics/content-effectiveness',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['ContentAnalytics'],
    }),

    // Get real-time dashboard data
    getRealTimeDashboard: builder.query<
      {
        activeStudents: number;
        ongoingSessions: number;
        completedActivities: number;
        recentSubmissions: number;
        alerts: Array<{
          type: 'warning' | 'info' | 'error';
          message: string;
          studentId?: string;
          courseId?: string;
          timestamp: string;
        }>;
        liveActivity: Array<{
          timestamp: string;
          activityCount: number;
        }>;
      },
      void
    >({
      query: () => '/teacher/analytics/realtime-dashboard',
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['RealTimeDashboard'],
    }),

    // Get assessment analytics
    getAssessmentAnalytics: builder.query<
      {
        totalAssessments: number;
        averageScore: number;
        passRate: number;
        timeAnalytics: {
          averageCompletionTime: number;
          quickestCompletion: number;
          longestCompletion: number;
        };
        questionAnalytics: Array<{
          questionId: string;
          questionText: string;
          correctAnswerRate: number;
          averageTimeSpent: number;
          commonMistakes: string[];
        }>;
        difficultyAnalysis: Array<{
          difficulty: string;
          questionCount: number;
          averageScore: number;
        }>;
      },
      { assessmentId?: string; courseId?: string; period?: string }
    >({
      query: (params) => ({
        url: '/teacher/analytics/assessments',
        params,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['AssessmentAnalytics'],
    }),
  }),
});

// Export hooks
export const {
  useGetPerformanceAnalyticsQuery,
  useGetCourseAnalyticsQuery,
  useGetStudentProgressAnalyticsQuery,
  useGetGradingAnalyticsQuery,
  useGetEngagementMetricsQuery,
  useGenerateAnalyticsReportMutation,
  useGetLearningOutcomesQuery,
  useGetContentEffectivenessQuery,
  useGetRealTimeDashboardQuery,
  useGetAssessmentAnalyticsQuery,
} = teacherAnalyticsApi;