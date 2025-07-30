import { useCallback, useMemo } from 'react';
import {
  useGetProgressDashboardQuery,
  useGetPerformanceAnalyticsQuery,
  useGetLearningGoalsQuery,
  useGetAchievementsQuery,
  useGetStudyStreakQuery,
  useGetAIInsightsQuery,
} from '@/lib/redux/api/student-analytics-api';
import {
  formatStudyTime,
  getPerformanceColor,
  calculateProgressPercentage,
} from '@/lib/utils/analytics-utils';

export const useAnalytics = (timeFilter: string = 'month') => {
  // Fetch all analytics data
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useGetProgressDashboardQuery();
  const { data: performanceData, isLoading: isPerformanceLoading } =
    useGetPerformanceAnalyticsQuery({
      period: timeFilter,
    });
  const { data: goals, isLoading: isGoalsLoading } = useGetLearningGoalsQuery(
    {}
  );
  const { data: achievements, isLoading: isAchievementsLoading } =
    useGetAchievementsQuery({});
  const { data: streak, isLoading: isStreakLoading } = useGetStudyStreakQuery();
  const { data: insights, isLoading: isInsightsLoading } =
    useGetAIInsightsQuery({});

  // Memoized computed values
  const analytics = useMemo(() => {
    if (!dashboardData || !performanceData) return null;

    return {
      overview: {
        totalStudyTime: formatStudyTime(
          performanceData.overview.totalStudyHours * 60
        ),
        averageScore: performanceData.overview.averageScore,
        currentStreak: streak?.currentStreak || 0,
        completionRate: calculateProgressPercentage(
          performanceData.overview.completedCourses,
          performanceData.overview.totalCourses
        ),
      },
      goals: {
        active: goals?.filter(g => g.status === 'active').length || 0,
        completed: goals?.filter(g => g.status === 'completed').length || 0,
        total: goals?.length || 0,
      },
      achievements: {
        unlocked: achievements?.filter(a => a.isUnlocked).length || 0,
        total: achievements?.length || 0,
        points:
          achievements
            ?.filter(a => a.isUnlocked)
            .reduce((sum, a) => sum + a.points, 0) || 0,
      },
      insights: {
        total: insights?.length || 0,
        highPriority: insights?.filter(i => i.confidence > 0.8).length || 0,
      },
    };
  }, [dashboardData, performanceData, goals, achievements, streak, insights]);

  // Loading state
  const isLoading =
    isDashboardLoading ||
    isPerformanceLoading ||
    isGoalsLoading ||
    isAchievementsLoading ||
    isStreakLoading ||
    isInsightsLoading;

  // Utility functions
  const getProgressColor = useCallback((progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-blue-600';
    if (progress >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }, []);

  const formatMetric = useCallback(
    (value: number, type: 'time' | 'percentage' | 'number') => {
      switch (type) {
        case 'time':
          return formatStudyTime(value);
        case 'percentage':
          return `${Math.round(value)}%`;
        case 'number':
        default:
          return value.toString();
      }
    },
    []
  );

  return {
    analytics,
    dashboardData,
    performanceData,
    goals,
    achievements,
    streak,
    insights,
    isLoading,
    getProgressColor,
    formatMetric,
  };
};

export default useAnalytics;
