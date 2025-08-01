export interface AIRecommendation {
  id: string;
  studentId: string;
  recommendationType:
    | 'next_lesson'
    | 'review_content'
    | 'practice_quiz'
    | 'supplementary_material'
    | 'course_recommendation'
    | 'study_schedule'
    | 'learning_path'
    | 'skill_improvement'
    | 'peer_study_group'
    | 'tutor_session'
    | 'break_suggestion'
    | 'difficulty_adjustment';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  estimatedDuration?: number;
  category?: string;
  metadata: {
    courseId?: string;
    lessonId?: string;
    assessmentId?: string;
    skillId?: string;
    targetUrl?: string;
    params?: Record<string, any>;
    aiModel?: string;
    algorithmVersion?: string;
    features?: Record<string, number>;
    contextData?: Record<string, any>;
  };
  isActive: boolean;
  expiresAt?: string;
  viewedAt?: string;
  clickedAt?: string;
  dismissedAt?: string;
  feedback?: 'positive' | 'negative' | 'neutral';
  feedbackComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalizedContentFeed {
  id: string;
  studentId: string;
  feedType:
    | 'discovery'
    | 'continue_learning'
    | 'recommended'
    | 'trending'
    | 'personalized';
  title: string;
  description?: string;
  items: ContentFeedItem[];
  metadata: {
    algorithm: string;
    confidence: number;
    refreshInterval: number;
    lastUpdated: string;
    userInteractionScore: number;
    diversityScore: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentFeedItem {
  id: string;
  type:
    | 'course'
    | 'lesson'
    | 'assessment'
    | 'article'
    | 'video'
    | 'podcast'
    | 'book';
  title: string;
  description: string;
  thumbnailUrl?: string;
  author?: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  enrollmentCount?: number;
  completionRate?: number;
  tags: string[];
  relevanceScore: number;
  personalizedReason: string;
  metadata: {
    courseId?: string;
    lessonId?: string;
    assessmentId?: string;
    url?: string;
    price?: number;
    isPremium?: boolean;
    estimatedTime?: number;
    prerequisites?: string[];
    learningObjectives?: string[];
  };
}

export interface AdaptiveLearningPath {
  id: string;
  studentId: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: number;
    percentageComplete: number;
    estimatedTimeRemaining: number;
  };
  steps: LearningPathStep[];
  aiAdaptations: AIAdaptation[];
  learningStyle: {
    visualPreference: number;
    auditoryPreference: number;
    kinestheticPreference: number;
    readingPreference: number;
    pace: 'slow' | 'normal' | 'fast';
    preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    sessionDuration: number;
  };
  performance: {
    overallScore: number;
    strengthAreas: string[];
    improvementAreas: string[];
    consistencyScore: number;
    engagementScore: number;
  };
  nextRecommendation: {
    stepId: string;
    reason: string;
    confidence: number;
    estimatedDifficulty: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathStep {
  id: string;
  pathId: string;
  order: number;
  type:
    | 'lesson'
    | 'assessment'
    | 'practice'
    | 'project'
    | 'review'
    | 'milestone';
  title: string;
  description: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed' | 'skipped';
  difficulty: number;
  estimatedDuration: number;
  prerequisites: string[];
  learningObjectives: string[];
  resources: StepResource[];
  assessment?: {
    type: 'quiz' | 'assignment' | 'project' | 'peer_review';
    passingScore: number;
    maxAttempts: number;
  };
  aiRecommendations: string[];
  completedAt?: string;
  score?: number;
  feedback?: string;
}

export interface StepResource {
  id: string;
  type: 'video' | 'article' | 'document' | 'interactive' | 'external_link';
  title: string;
  url: string;
  duration?: number;
  isRequired: boolean;
  description?: string;
}

export interface AIAdaptation {
  id: string;
  pathId: string;
  timestamp: string;
  adaptationType:
    | 'difficulty_adjustment'
    | 'content_modification'
    | 'pacing_change'
    | 'resource_addition'
    | 'step_reorder';
  reason: string;
  beforeState: Record<string, any>;
  afterState: Record<string, any>;
  confidence: number;
  effectiveness?: number;
}

export interface AITutoringSession {
  id: string;
  studentId: string;
  mode: 'adaptive' | 'guided' | 'exploratory' | 'assessment';
  status: 'active' | 'completed' | 'paused' | 'ended';
  topic?: string;
  context: {
    currentCourse?: string;
    currentLesson?: string;
    currentAssessment?: string;
    difficulty: number;
    learningObjectives: string[];
    previousErrors?: string[];
    knowledgeGaps?: string[];
  };
  messages: TutoringMessage[];
  insights: {
    understandingLevel: number;
    engagementLevel: number;
    frustrationLevel: number;
    confidenceLevel: number;
    recommendedActions: string[];
  };
  sessionMetrics: {
    duration: number;
    messagesCount: number;
    questionsAsked: number;
    conceptsExplained: number;
    hintsProvided: number;
    problemsSolved: number;
    satisfaction?: number;
  };
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutoringMessage {
  id: string;
  sessionId: string;
  role: 'student' | 'tutor' | 'system';
  content: string;
  messageType:
    | 'text'
    | 'question'
    | 'explanation'
    | 'hint'
    | 'encouragement'
    | 'correction'
    | 'summary';
  metadata?: {
    confidence?: number;
    relatedConcepts?: string[];
    difficulty?: number;
    references?: string[];
    visualAids?: string[];
  };
  timestamp: string;
}

export interface SmartSuggestion {
  id: string;
  studentId: string;
  suggestionType: 'real_time' | 'contextual' | 'behavioral' | 'predictive';
  trigger: string;
  title: string;
  message: string;
  actionType:
    | 'navigate'
    | 'show_content'
    | 'start_session'
    | 'reminder'
    | 'notification';
  actionData: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  displayMode: 'popup' | 'banner' | 'sidebar' | 'toast' | 'inline';
  timing: {
    showAt?: string;
    hideAt?: string;
    showDuration?: number;
    conditions?: Record<string, any>;
  };
  personalization: {
    relevanceScore: number;
    userContext: Record<string, any>;
    behaviorTriggers: string[];
    conditions?: Record<string, any>;
  };
  isShown: boolean;
  isActioned: boolean;
  isDismissed: boolean;
  feedback?: 'helpful' | 'not_helpful' | 'irrelevant';
  createdAt: string;
  updatedAt: string;
}
