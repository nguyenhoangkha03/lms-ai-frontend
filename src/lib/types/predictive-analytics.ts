export interface DropoutRiskAssessment {
  id: string;
  studentId: string;
  courseId: string;
  assessmentDate: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskProbability: number;
  riskFactors: string[];
  protectiveFactors: string[];
  interventionRequired: boolean;
  recommendedInterventions: string[];
  interventionPriority: number;
  trendAnalysis: any;
  confidence: number;
  metadata: any;
}

export interface PerformancePrediction {
  id: string;
  studentId: string;
  courseId: string;
  predictionDate: string;
  outcomeType: 'course_completion' | 'grade_prediction' | 'time_to_complete';
  predictedScore: number;
  confidence: number;
  scenarios: any[];
  factors: any[];
  recommendations: string[];
  targetDate: string;
  estimatedDaysToCompletion: number;
}

export interface LearningPattern {
  id: string;
  studentId: string;
  patternType:
    | 'engagement'
    | 'time_preference'
    | 'difficulty_progression'
    | 'content_preference';
  description: string;
  confidence: number;
  strength: 'weak' | 'moderate' | 'strong';
  frequency: number;
  lastObserved: string;
  implications: string[];
  recommendations: string[];
  metadata: any;
}

export interface InterventionRecommendation {
  id: string;
  studentId: string;
  courseId: string;
  interventionType:
    | 'academic_support'
    | 'motivational'
    | 'technical'
    | 'time_management'
    | 'content_clarification';
  title: string;
  description: string;
  priority: number;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  estimatedDuration: number;
  successCriteria: string[];
  effectiveness: number;
  metadata: any;
}

export interface LearningOutcomeForecast {
  id: string;
  studentId: string;
  courseId: string;
  outcomeType: 'completion' | 'grade' | 'mastery' | 'engagement';
  forecastDate: string;
  targetDate: string;
  successProbability: number;
  predictedScore: number;
  scenarios: any[];
  milestones: any[];
  resourceRequirements: string[];
  confidenceLevel: number;
}

export interface ResourceOptimization {
  id: string;
  resourceType: 'time' | 'content' | 'difficulty' | 'schedule';
  currentUtilization: number;
  optimalUtilization: number;
  recommendations: string[];
  expectedImprovement: number;
  priority: number;
  implementationCost: number;
}

export interface PredictiveAnalyticsDashboard {
  studentAnalytics: {
    totalStudents: number;
    atRiskStudents: number;
    highPerformers: number;
    trendingUp: number;
    trendingDown: number;
  };
  courseAnalytics: {
    totalCourses: number;
    completionRate: number;
    avgPerformance: number;
    dropoutRate: number;
  };
  predictionAccuracy: {
    overall: number;
    byType: Record<string, number>;
    lastUpdated: string;
  };
  interventionEffectiveness: {
    totalInterventions: number;
    successRate: number;
    avgResponseTime: number;
  };
}
