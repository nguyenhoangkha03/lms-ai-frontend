export interface Assessment {
  id: string;
  courseId: string;
  lessonId?: string;
  teacherId: string;
  title: string;
  description: string;
  instructions: string;
  assessmentType:
    | 'quiz'
    | 'exam'
    | 'assignment'
    | 'survey'
    | 'practice'
    | 'final_exam'
    | 'midterm'
    | 'project';
  status: 'draft' | 'published' | 'archived' | 'suspended';

  timeLimit?: number;
  maxAttempts: number;
  availableFrom?: string;
  availableUntil?: string;

  passingScore: number;
  totalPoints: number;
  weight: number;

  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  showResults: boolean;
  showCorrectAnswers: boolean;
  isMandatory: boolean;
  isProctored: boolean;

  gradingMethod: 'automatic' | 'manual' | 'hybrid' | 'peer_review';

  questions: Question[];

  settings: AssessmentSettings;
  antiCheatSettings: AntiCheatSettings;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Question {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType:
    | 'multiple_choice'
    | 'true_false'
    | 'short_answer'
    | 'essay'
    | 'fill_in_the_blank'
    | 'matching'
    | 'ordering'
    | 'numeric'
    | 'code';
  explanation?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  orderIndex: number;
  timeLimit?: number;
  hint?: string;

  // Question-specific data
  options?: QuestionOption[];
  correctAnswer: string | string[] | number;
  validationRules?: ValidationRules;

  // Metadata
  tags: string[];
  attachments: Attachment[];
  analytics: QuestionAnalytics;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
  orderIndex: number;
}

export interface ValidationRules {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidation?: string;
}

export interface QuestionAnalytics {
  attempts: number;
  correctAnswers: number;
  averageScore: number;
  averageTimeSpent: number;
  difficultyIndex: number;
  discriminationIndex: number;
}

export interface AssessmentSettings {
  navigation: {
    allowBackward: boolean;
    showProgress: boolean;
    confirmBeforeSubmit: boolean;
  };
  security: {
    preventCopyPaste: boolean;
    preventPrint: boolean;
    preventRightClick: boolean;
    requireFullscreen: boolean;
  };
  display: {
    questionsPerPage: number;
    showQuestionNumbers: boolean;
    showTimer: boolean;
    theme: 'light' | 'dark' | 'high-contrast';
  };
  accessibility: {
    screenReader: boolean;
    largeText: boolean;
    highContrast: boolean;
    keyboardNavigation: boolean;
  };
}

export interface AntiCheatSettings {
  proctoring: ProctoringSettings;
  lockdown: LockdownSettings;
  monitoring: MonitoringSettings;
  violations: ViolationSettings;
}

export interface ProctoringSettings {
  enabled: boolean;
  requireWebcam: boolean;
  requireMicrophone: boolean;
  recordSession: boolean;
  identityVerification: boolean;
  faceDetection: boolean;
  voiceDetection: boolean;
  environmentScan: boolean;
}

export interface LockdownSettings {
  fullscreenMode: boolean;
  preventTabSwitching: boolean;
  preventWindowSwitching: boolean;
  blockExternalApps: boolean;
  allowedApplications: string[];
  preventVirtualMachine: boolean;
  preventMultipleMonitors: boolean;
}

export interface MonitoringSettings {
  trackMouseMovement: boolean;
  trackKeystrokes: boolean;
  trackFocusLoss: boolean;
  trackTabSwitching: boolean;
  trackCopyPaste: boolean;
  screenshotInterval: number; // seconds
  heartbeatInterval: number; // seconds
}

export interface ViolationSettings {
  suspiciousActivityThreshold: number;
  autoSubmitOnViolation: boolean;
  warningSystem: {
    enabled: boolean;
    maxWarnings: number;
    warningTypes: string[];
  };
  penaltySystem: {
    enabled: boolean;
    penaltyPerViolation: number;
    maxPenalty: number;
  };
}

export interface AssessmentAttempt {
  id: string;
  studentId: string;
  assessmentId: string;
  attemptNumber: number;
  startedAt: string;
  submittedAt?: string;
  timeSpent: number;
  score: number;
  maxScore: number;
  percentage: number;

  // Status
  status: 'in_progress' | 'submitted' | 'graded' | 'flagged';
  gradingStatus: 'pending' | 'graded' | 'reviewing' | 'manual_review_required';

  // Answers
  answers: AssessmentAnswer[];

  // Security & Monitoring
  sessionToken?: string;
  securityEvents: SecurityEvent[];
  proctoringData?: ProctoringData;

  // Grading
  gradedAt?: string;
  gradedBy?: string;
  feedback?: string;
  manualReviewRequired: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer: string | string[] | number;
  isCorrect?: boolean;
  points: number;
  maxPoints: number;
  timeSpent: number;
  attempts: number;

  // AI Grading (for essays, short answers)
  aiScore?: number;
  aiConfidence?: number;
  aiFeedback?: string;
  aiAnalysis?: {
    keyPoints: string[];
    missingElements: string[];
    qualityScore: number;
    plagiarismScore: number;
  };

  // Manual Grading
  manualScore?: number;
  manualFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;

  flaggedForReview: boolean;
  reviewReason?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SecurityEvent {
  id: string;
  attemptId: string;
  eventType:
    | 'tab_switch'
    | 'window_blur'
    | 'fullscreen_exit'
    | 'copy_attempt'
    | 'paste_attempt'
    | 'right_click'
    | 'suspicious_behavior'
    | 'face_not_detected'
    | 'multiple_faces'
    | 'voice_detected'
    | 'network_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface ProctoringData {
  sessionId: string;
  recordingUrl?: string;
  screenshots: Array<{
    timestamp: string;
    url: string;
    flagged: boolean;
    reason?: string;
  }>;
  identityVerification: {
    verified: boolean;
    confidence: number;
    method: 'face_recognition' | 'id_document' | 'manual';
    verifiedAt: string;
  };
  environmentScan: {
    completed: boolean;
    issues: string[];
    scannedAt: string;
  };
  violations: Array<{
    type: string;
    severity: string;
    timestamp: string;
    evidence?: string;
  }>;
}

export interface GradingRubric {
  id: string;
  assessmentId?: string;
  title: string;
  description: string;
  type: 'holistic' | 'analytic' | 'single_point';
  isTemplate: boolean;
  isActive: boolean;

  criteria: RubricCriterion[];
  maxScore: number;
  version: number;

  // Usage tracking
  usageCount: number;
  lastUsedAt?: string;

  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
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
  order: number;
}

// Component Props Types
export interface AssessmentFormData {
  basicInfo: {
    title: string;
    description: string;
    instructions: string;
    assessmentType: string;
    courseId: string;
    lessonId?: string;
  };
  configuration: {
    timeLimit?: number;
    maxAttempts: number;
    passingScore: number;
    weight: number;
    availableFrom?: string;
    availableUntil?: string;
    randomizeQuestions: boolean;
    randomizeAnswers: boolean;
    showResults: boolean;
    showCorrectAnswers: boolean;
    isMandatory: boolean;
    isProctored: boolean;
    gradingMethod: string;
  };
  questions: Question[];
  antiCheatSettings: AntiCheatSettings;
  gradingRubric?: GradingRubric;
}

export interface QuestionFormData {
  questionText: string;
  questionType: string;
  points: number;
  difficulty: string;
  timeLimit?: number;
  hint?: string;
  explanation?: string;
  options?: QuestionOption[];
  correctAnswer: string | string[] | number;
  tags: string[];
  validationRules?: ValidationRules;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

// AI Generation Types
export interface AIGenerationSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  customPrompt?: string;
  includeExplanations: boolean;
  includeHints: boolean;
  generateImages: boolean;
}

// Question Bank Filter Types
export interface QuestionBankFilters {
  search?: string;
  questionType?: string[];
  difficulty?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  usageRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'created' | 'updated' | 'usage' | 'difficulty' | 'score';
  sortOrder?: 'asc' | 'desc';
}

// Manual Grading Types
export interface ManualGradingQueue {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  courseTitle: string;
  pendingSubmissions: number;
  avgGradingTime: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface GradingSession {
  id: string;
  graderId: string;
  assessmentAttemptId: string;
  startedAt: string;
  completedAt?: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  questionsGraded: number;
  totalQuestions: number;
  timeSpent: number;
}

export interface BulkGradingOperation {
  id: string;
  assessmentId: string;
  operationType:
    | 'auto_grade'
    | 'apply_rubric'
    | 'publish_grades'
    | 'send_feedback';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  failedItems: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  createdBy: string;
  results?: {
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{
      itemId: string;
      error: string;
    }>;
  };
}
