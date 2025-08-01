export interface Gradebook {
  id: string;
  courseId: string;
  teacherId: string;
  name: string;
  description?: string;
  status: 'active' | 'finalized' | 'archived';
  gradingScale: GradingScale;
  weightingScheme: WeightingScheme;
  passingThreshold: number;
  allowLateSubmissions: boolean;
  latePenaltyPercentage: number;
  totalStudents: number;
  totalAssessments: number;
  classAverage: number;
  lastCalculatedAt: string;
  displaySettings: DisplaySettings;
  exportSettings: ExportSettings;
  createdAt: string;
  updatedAt: string;
}

export interface GradingScale {
  type: 'letter' | 'percentage' | 'points' | 'custom';
  ranges: {
    grade: string;
    minPercent: number;
    maxPercent: number;
    gpa?: number;
  }[];
}

export interface WeightingScheme {
  type: 'equal' | 'category' | 'custom';
  categories: {
    name: string;
    weight: number;
    assessmentTypes: string[];
  }[];
}

export interface DisplaySettings {
  showStudentNames: boolean;
  showAvatars: boolean;
  showStatistics: boolean;
  showTrends: boolean;
  defaultView: 'grid' | 'list' | 'compact';
  sortBy: 'name' | 'grade' | 'progress' | 'lastActivity';
  groupBy?: 'none' | 'grade' | 'status' | 'risk_level';
}

export interface ExportSettings {
  includeComments: boolean;
  includeStatistics: boolean;
  includeTimestamps: boolean;
  format: 'csv' | 'xlsx' | 'pdf';
  layout: 'detailed' | 'summary' | 'compact';
}

// ==================== GRADING TYPES ====================

export interface Grade {
  id: string;
  studentId: string;
  assessmentId: string;
  attemptId?: string;
  graderId: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'pending' | 'graded' | 'under_review' | 'finalized';
  feedbackType: 'overall' | 'question_specific' | 'ai_generated' | 'manual';
  questionScores: QuestionScore[];
  overallFeedback?: string;
  comments?: string;
  gradedAt?: string;
  publishedAt?: string;
  isPublished: boolean;
  isAiGraded: boolean;
  aiConfidence?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComments?: string;
  gradingRubric?: GradingRubricData;
  analytics: GradeAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionScore {
  questionId: string;
  questionText: string;
  score: number;
  maxScore: number;
  isCorrect?: boolean;
  feedback?: string;
  timeSpent?: number;
  attempts?: number;
}

export interface GradeAnalytics {
  timeToGrade?: number;
  gradingMethod: 'automatic' | 'manual' | 'ai_assisted' | 'peer_review';
  revisionCount: number;
  difficultyRating?: number;
  qualityScore?: number;
  improvementSuggestions?: string[];
}

export interface GradingRubricData {
  id: string;
  title: string;
  type: 'holistic' | 'analytic' | 'single_point';
  criteria: RubricCriterion[];
  scores: RubricScore[];
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  id: string;
  name: string;
  description: string;
  points: number;
}

export interface RubricScore {
  criterionId: string;
  levelId: string;
  score: number;
  feedback?: string;
}

// ==================== FEEDBACK TYPES ====================

export interface Feedback {
  id: string;
  gradeId: string;
  questionId?: string;
  authorId: string;
  category:
    | 'content'
    | 'structure'
    | 'grammar'
    | 'logic'
    | 'creativity'
    | 'technical';
  severity: 'info' | 'suggestion' | 'warning' | 'error';
  content: string;
  suggestion?: string;
  isAiGenerated: boolean;
  aiConfidence?: number;
  startPosition?: number;
  endPosition?: number;
  highlightedText?: string;
  helpfulnessRating?: number;
  isMarkedHelpful: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIGradingRequest {
  text: string;
  rubric?: GradingRubricData;
  assessmentType: 'essay' | 'short_answer' | 'code' | 'creative_writing';
  subject?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  customCriteria?: string[];
}

export interface AIGradingResponse {
  score: number;
  maxScore: number;
  confidence: number;
  feedback: {
    overall: string;
    specific: {
      criterion: string;
      score: number;
      feedback: string;
      suggestions: string[];
    }[];
  };
  strengths: string[];
  improvements: string[];
  qualityIndicators: {
    clarity: number;
    coherence: number;
    accuracy: number;
    creativity: number;
    grammar: number;
  };
  flaggedIssues: {
    type: 'plagiarism' | 'inappropriate' | 'off_topic' | 'insufficient';
    confidence: number;
    description: string;
  }[];
}

// ==================== MANUAL GRADING TYPES ====================

export interface ManualGradingQueue {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  submissions: ManualGradingSubmission[];
  courseTitle: string;
  totalSubmissions: number;
  courseId: string;
  type: 'essay' | 'short_answer' | 'code' | 'creative_writing';
  pendingSubmissions: number;
  avgGradingTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string[];
  estimatedCompletionTime: number;
  createdAt: string;
}

export interface ManualGradingSubmission {
  id: string;
  studentId: string;
  studentName: string;
  submissionId: string;
  assessmentId: string;
  submittedAt: string;
  gradingStatus: 'pending' | 'in_progress' | 'completed' | 'requires_review';
  assignedGrader?: string;
  estimatedGradingTime: number;
  queueInfo?: ManualGradingQueue;
  aiPreGrade?: {
    score: number;
    confidence: number;
    suggestions: string[];
  };
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }[];
  previousGrades?: {
    graderId: string;
    score: number;
    feedback: string;
    gradedAt: string;
  }[];
}

// ==================== BULK OPERATIONS TYPES ====================

export interface BulkGradingOperation {
  id: string;
  type: 'grade_update' | 'feedback_add' | 'publish' | 'unpublish' | 'export';
  targetIds: string[];
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  results: BulkOperationResult[];
  startedAt: string;
  completedAt?: string;
  createdBy: string;
}

export interface BulkOperationResult {
  itemId: string;
  status: 'success' | 'failed' | 'skipped';
  message?: string;
  data?: any;
}

// ==================== STATISTICS TYPES ====================

export interface GradingStatistics {
  assessmentId: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  medianScore: number;
  standardDeviation: number;
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  gradeDistribution: {
    grade: string;
    count: number;
    percentage: number;
  }[];
  difficultyAnalysis: {
    questionId: string;
    averageScore: number;
    difficultyRating: 'easy' | 'medium' | 'hard';
    discriminationIndex: number;
  }[];
  timeAnalytics: {
    averageGradingTime: number;
    medianGradingTime: number;
    totalGradingTime: number;
  };
  qualityMetrics: {
    avgAiConfidence: number;
    manualReviewRate: number;
    feedbackLength: number;
    rubricUsageRate: number;
  };
}

// ==================== GRADEBOOK DATA TYPES ====================

export interface GradebookData {
  gradebook: Gradebook;
  gradebooks: Gradebook[];
  students: GradebookStudent[];
  assessments: GradebookAssessment[];
  grades: Grade[];
  statistics: GradebookStatistics;
  totalStudents: number;
  classAverage: number;
}

export interface GradebookStudent {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrollmentDate: string;
  status: 'active' | 'inactive' | 'dropped';
  overallGrade: number;
  overallPercentage: number;
  letterGrade: string;
  gpa?: number;
  rank?: number;
  attendance: number;
  participation: number;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface GradebookAssessment {
  id: string;
  title: string;
  type: string;
  maxScore: number;
  weight: number;
  dueDate?: string;
  status: 'draft' | 'published' | 'completed' | 'archived';
  submissionCount: number;
  gradedCount: number;
  averageScore: number;
  category: string;
}

export interface GradebookStatistics {
  classAverage: number;
  median: number;
  standardDeviation: number;
  passingRate: number;
  excellenceRate: number;
  atRiskCount: number;
  trends: {
    period: string;
    average: number;
    change: number;
  }[];
  categoryPerformance: {
    category: string;
    average: number;
    weight: number;
    trend: number;
  }[];
}
