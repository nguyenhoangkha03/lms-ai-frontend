export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export interface RiskFactor {
  factor: string;
  impact: number;
  description: string;
  recommendations: string[];
}

export interface LearningPattern {
  name: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  characteristics: string[];
}

export interface PeerComparisonResult {
  percentile: number;
  above_average: boolean;
  improvement_potential: number;
  strengths: string[];
  areas_for_improvement: string[];
}

// Export all analytics-related types and utilities
export * from '@/lib/redux/api/student-analytics-api';
export { ANALYTICS_CONSTANTS } from '@/lib/constants/analytics-constants';
export * from '@/lib/utils/analytics-utils';
