export const ANALYTICS_CONSTANTS = {
  // Chart colors
  CHART_COLORS: {
    primary: '#0088FE',
    secondary: '#00C49F',
    tertiary: '#FFBB28',
    quaternary: '#FF8042',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Performance levels
  PERFORMANCE_LEVELS: {
    EXCELLENT: 'excellent',
    GOOD: 'good',
    AVERAGE: 'average',
    BELOW_AVERAGE: 'below_average',
    POOR: 'poor',
  },

  // Learning patterns
  LEARNING_PATTERNS: {
    CONSISTENT: 'consistent',
    BINGE_LEARNER: 'binge_learner',
    PROCRASTINATOR: 'procrastinator',
    PERFECTIONIST: 'perfectionist',
    EXPLORER: 'explorer',
    FOCUSED: 'focused',
    SOCIAL_LEARNER: 'social_learner',
    INDEPENDENT: 'independent',
  },

  // Achievement categories
  ACHIEVEMENT_CATEGORIES: {
    COMPLETION: 'completion',
    ENGAGEMENT: 'engagement',
    PERFORMANCE: 'performance',
    CONSISTENCY: 'consistency',
    SOCIAL: 'social',
    MASTERY: 'mastery',
  },

  // Achievement rarities
  ACHIEVEMENT_RARITIES: {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
  },

  // Goal categories
  GOAL_CATEGORIES: {
    COURSE_COMPLETION: 'course_completion',
    STUDY_HOURS: 'study_hours',
    SKILL_MASTERY: 'skill_mastery',
    ASSESSMENT_SCORE: 'assessment_score',
    STREAK_MAINTENANCE: 'streak_maintenance',
  },

  // AI insight types
  AI_INSIGHT_TYPES: {
    PERFORMANCE_PREDICTION: 'performance_prediction',
    LEARNING_RECOMMENDATION: 'learning_recommendation',
    RISK_ASSESSMENT: 'risk_assessment',
    SKILL_GAP_ANALYSIS: 'skill_gap_analysis',
    STUDY_OPTIMIZATION: 'study_optimization',
  },

  // Time periods
  TIME_PERIODS: {
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
  },

  // Export formats
  EXPORT_FORMATS: {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
  },
} as const;
