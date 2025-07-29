export interface Assessment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  lessonId?: string;
  type:
    | 'quiz'
    | 'exam'
    | 'assignment'
    | 'survey'
    | 'practice'
    | 'final_exam'
    | 'midterm'
    | 'project';
  settings: AssessmentSettings;
  antiCheatSettings: AntiCheatSettings;
  questions: Question[];
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  timeLimit?: number; // in minutes
  attemptsAllowed: number;
  isAdaptive: boolean;
  showResults: 'immediate' | 'after_submission' | 'after_due_date' | 'never';
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  status: 'draft' | 'published' | 'archived';
  availableFrom?: string;
  availableUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSettings {
  allowBackNavigation: boolean;
  showProgressBar: boolean;
  showQuestionNumbers: boolean;
  showTimeRemaining: boolean;
  autoSubmitOnTimeUp: boolean;
  pauseAllowed: boolean;
  maxPauseDuration?: number; // in minutes
  requireSequentialCompletion: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScore: boolean;
  allowReview: boolean;
  passwordProtected: boolean;
  password?: string;
}

export interface AntiCheatSettings {
  enabled: boolean;
  requireFullscreen: boolean;
  detectTabSwitching: boolean;
  blockRightClick: boolean;
  blockCopyPaste: boolean;
  blockPrintScreen: boolean;
  requireWebcam: boolean;
  enableProctoring: boolean;
  suspiciousActivityThreshold: number;
  autoFlagHighRisk: boolean;
  lockdownBrowser: boolean;
  ipRestriction?: string[];
  maxTabSwitches: number;
  maxWindowBlurEvents: number;
  monitorMouseMovement: boolean;
  monitorKeystrokes: boolean;
  faceDetection: boolean;
  multiplePersonDetection: boolean;
  screenRecording: boolean;
  audioRecording: boolean;
}

export interface Question {
  id: string;
  type:
    | 'multiple_choice'
    | 'true_false'
    | 'short_answer'
    | 'essay'
    | 'fill_in_the_blank'
    | 'matching'
    | 'ordering'
    | 'numeric'
    | 'code';
  title: string;
  content: string;
  points: number;
  difficultyLevel: number; // 1-5
  timeLimit?: number; // in seconds
  required: boolean;
  options?: QuestionOption[];
  correctAnswer?: any;
  explanation?: string;
  hints?: string[];
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  metadata?: {
    topic: string;
    learningObjective: string;
    bloomsTaxonomy: string;
  };
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  weight?: number; // for partial credit
}

export interface AssessmentSession {
  id: string;
  assessmentId: string;
  studentId: string;
  status:
    | 'not_started'
    | 'in_progress'
    | 'paused'
    | 'completed'
    | 'timed_out'
    | 'flagged';
  startedAt: string;
  pausedAt?: string;
  submittedAt?: string;
  timeRemaining?: number; // in seconds
  timeSpent: number; // in seconds
  currentQuestionIndex: number;
  currentQuestionId?: string;
  answers: Record<string, any>;
  securityEvents: SecurityEvent[];
  proctoring: ProctoringData;
  analytics: SessionAnalytics;
  ipAddress: string;
  userAgent: string;
  isReviewMode: boolean;
  suspiciousActivityScore: number;
  flaggedForReview: boolean;
  flagReason?: string;
}

export interface SecurityEvent {
  id: string;
  sessionId: string;
  type:
    | 'tab_switch'
    | 'window_blur'
    | 'fullscreen_exit'
    | 'copy_attempt'
    | 'paste_attempt'
    | 'right_click'
    | 'key_combination'
    | 'suspicious_behavior'
    | 'face_not_detected'
    | 'multiple_faces'
    | 'noise_detected';
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  metadata?: Record<string, any>;
  autoDetected: boolean;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface ProctoringData {
  webcamEnabled: boolean;
  microphoneEnabled: boolean;
  screenRecording: boolean;
  faceDetectionResults: Array<{
    timestamp: string;
    facesDetected: number;
    confidence: number;
    emotions?: string[];
    lookingAway: boolean;
  }>;
  audioAnalysis: Array<{
    timestamp: string;
    noiseLevel: number;
    speechDetected: boolean;
    suspiciousAudio: boolean;
  }>;
  screenshots: Array<{
    timestamp: string;
    url: string;
    analyzed: boolean;
    flags?: string[];
  }>;
}

export interface SessionAnalytics {
  mouseMovements: Array<{
    timestamp: string;
    x: number;
    y: number;
    action: 'move' | 'click' | 'scroll';
  }>;
  keystrokes: Array<{
    timestamp: string;
    key: string;
    questionId: string;
  }>;
  focusEvents: Array<{
    timestamp: string;
    type: 'focus' | 'blur';
    duration?: number;
  }>;
  pageVisibility: Array<{
    timestamp: string;
    visible: boolean;
  }>;
  scrollBehavior: Array<{
    timestamp: string;
    questionId: string;
    scrollTop: number;
    scrollSpeed: number;
  }>;
  timePerQuestion: Record<string, number>;
  hesitationPatterns: Array<{
    questionId: string;
    pauseDuration: number;
    changeCount: number;
  }>;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  studentId: string;
  sessionId: string;
  attempt: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  startedAt: string;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect: boolean;
    points: number;
    timeSpent: number;
  }>;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
  flagged: boolean;
  flagReason?: string;
  integrity: {
    suspiciousActivityScore: number;
    securityEventsCount: number;
    manualReviewRequired: boolean;
    cleared: boolean;
  };
}

// Real-time monitoring types
export interface SessionHeartbeat {
  sessionId: string;
  timestamp: number;
  isActive: boolean;
  windowFocused: boolean;
  fullscreenActive: boolean;
  batteryLevel?: number;
  networkStatus: 'online' | 'offline' | 'slow';
  performance: {
    memory: number;
    cpu: number;
    responseTime: number;
  };
}

export interface AdaptiveQuestionAdjustment {
  currentDifficultyLevel: number;
  suggestedDifficultyLevel: number;
  reason: string;
  confidence: number;
  nextQuestionPool: string[];
}

export interface AIFeedback {
  overallPerformance: {
    score: number;
    percentile: number;
    level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement' | 'poor';
    summary: string;
  };
  strengthAreas: Array<{
    topic: string;
    confidence: number;
    evidence: string[];
  }>;
  improvementAreas: Array<{
    topic: string;
    difficulty: number;
    recommendations: string[];
  }>;
  learningRecommendations: Array<{
    type: 'review' | 'practice' | 'advance';
    content: string;
    priority: 'high' | 'medium' | 'low';
    estimatedTime: number;
  }>;
  nextSteps: string[];
}
