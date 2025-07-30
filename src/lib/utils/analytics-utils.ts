import { ANALYTICS_CONSTANTS } from '@/lib/constants/analytics-constants';

export const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffTime = now.getTime() - date.getTime();

  const minutes = Math.floor(diffTime / (1000 * 60));
  const hours = Math.floor(diffTime / (1000 * 60 * 60));
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  const months = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
};

export const getPerformanceColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case ANALYTICS_CONSTANTS.PERFORMANCE_LEVELS.EXCELLENT:
      return 'text-green-600';
    case ANALYTICS_CONSTANTS.PERFORMANCE_LEVELS.GOOD:
      return 'text-blue-600';
    case ANALYTICS_CONSTANTS.PERFORMANCE_LEVELS.AVERAGE:
      return 'text-yellow-600';
    case ANALYTICS_CONSTANTS.PERFORMANCE_LEVELS.BELOW_AVERAGE:
      return 'text-orange-600';
    case ANALYTICS_CONSTANTS.PERFORMANCE_LEVELS.POOR:
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getAchievementRarityColor = (rarity: string): string => {
  switch (rarity) {
    case ANALYTICS_CONSTANTS.ACHIEVEMENT_RARITIES.COMMON:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    case ANALYTICS_CONSTANTS.ACHIEVEMENT_RARITIES.UNCOMMON:
      return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
    case ANALYTICS_CONSTANTS.ACHIEVEMENT_RARITIES.RARE:
      return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
    case ANALYTICS_CONSTANTS.ACHIEVEMENT_RARITIES.EPIC:
      return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
    case ANALYTICS_CONSTANTS.ACHIEVEMENT_RARITIES.LEGENDARY:
      return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  }
};

export const calculateProgressPercentage = (
  current: number,
  target: number
): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const formatProgressText = (
  current: number,
  target: number,
  unit: string
): string => {
  return `${current} / ${target} ${unit}`;
};

export const getStreakMotivationMessage = (streak: number): string => {
  if (streak === 0) return 'Start your learning journey today! 🚀';
  if (streak < 7) return 'Great start! Keep building momentum! 💪';
  if (streak < 30) return "You're on fire! Don't break the chain! 🔥";
  return "Incredible dedication! You're a learning champion! 🏆";
};

export const categorizeRiskLevel = (
  riskScore: number
): {
  level: 'low' | 'medium' | 'high';
  color: string;
  message: string;
} => {
  if (riskScore < 0.3) {
    return {
      level: 'low',
      color: 'text-green-600',
      message: "You're doing great! Keep up the excellent work.",
    };
  } else if (riskScore < 0.7) {
    return {
      level: 'medium',
      color: 'text-yellow-600',
      message: 'Some areas need attention. Check our recommendations.',
    };
  } else {
    return {
      level: 'high',
      color: 'text-red-600',
      message: "Let's work together to get you back on track.",
    };
  }
};

export const formatInsightConfidence = (confidence: number): string => {
  return `${Math.round(confidence * 100)}%`;
};

export const generateChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    [xKey]: item[xKey],
    [yKey]: item[yKey],
  }));
};

export const aggregateTimeSeriesData = (
  data: any[],
  period: 'daily' | 'weekly' | 'monthly'
): any[] => {
  // Implementation for aggregating time series data based on period
  // This would handle grouping data by day, week, or month
  return data; // Simplified for now
};
