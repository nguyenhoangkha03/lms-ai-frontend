export interface ChatbotMessage {
  id: string;
  conversationId: string;
  sender: 'user' | 'bot' | 'system';
  content: string;
  messageType:
    | 'text'
    | 'rich_text'
    | 'image'
    | 'audio'
    | 'video'
    | 'file'
    | 'interactive'
    | 'system'
    | 'typing';
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed' | 'processing';
  timestamp: string;
  attachments?: any[];
  aiMetadata?: {
    confidence: number;
    sources: string[];
    concepts: string[];
    difficulty: number;
    ragContext?: string[];
  };
  inputAnalysis?: {
    intent: string;
    entities: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    complexity: number;
  };
  interactiveElements?: {
    type: 'quiz' | 'poll' | 'button' | 'form';
    data: any;
  };
  personalization?: {
    adaptedToUser: boolean;
    learningStyle: string;
    difficulty: number;
  };
  educationalContent?: {
    concepts: string[];
    learningObjectives: string[];
    prerequisites: string[];
    followUpTopics: string[];
  };
  isImportant: boolean;
  needsFollowUp: boolean;
  isFlagged: boolean;
  flagReason?: string;
  userRating?: number;
  userFeedback?: string;
  errorInfo?: any;
  analytics?: any;
  metadata?: any;
}

export interface ChatbotConversation {
  id: string;
  userId: string;
  courseId?: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'escalated' | 'archived';
  conversationType:
    | 'general'
    | 'academic_help'
    | 'technical_support'
    | 'course_guidance'
    | 'career_advice'
    | 'study_planning'
    | 'assessment_help'
    | 'onboarding';
  startedAt: string;
  endedAt?: string;
  isActive: boolean;
  messageCount: number;
  userMessageCount: number;
  botMessageCount: number;
  lastMessageAt: string;
  lastMessageBy: string;
  context: {
    currentCourse?: string;
    currentLesson?: string;
    learningObjectives?: string[];
    userProgress?: any;
    difficulty?: number;
    knowledgeGraph?: any;
  };
  userProfile: {
    learningStyle: string;
    preferences: any;
    knowledgeLevel: number;
    currentGoals: string[];
  };
  summary: {
    mainTopics: string[];
    resolvedIssues: string[];
    pendingQuestions: string[];
    learningProgress: any;
  };
  aiConfig: {
    model: string;
    temperature: number;
    maxTokens: number;
    ragEnabled: boolean;
    knowledgeGraphEnabled: boolean;
  };
  learningAnalytics: {
    engagementScore: number;
    understandingLevel: number;
    questionsAsked: number;
    conceptsLearned: string[];
    timeSpent: number;
  };
  qualityMetrics: {
    userSatisfaction?: number;
    resolutionRate: number;
    responseAccuracy: number;
    helpfulnessRating?: number;
  };
  escalation?: {
    reason: string;
    escalatedTo: string;
    escalatedAt: string;
    status: string;
  };
  rating?: number;
  feedback?: string;
  integrations?: any;
  metadata?: any;
}

export interface TutoringSession {
  id: string;
  studentId: string;
  courseId?: string;
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

export interface LearningHint {
  id: string;
  context: string;
  hintText: string;
  difficulty: number;
  type: 'concept' | 'procedure' | 'example' | 'analogy' | 'visual';
  effectiveness: number;
  prerequisites: string[];
  followUpConcepts: string[];
  usageCount: number;
  successRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeGraph {
  nodes: {
    id: string;
    label: string;
    type: 'concept' | 'skill' | 'topic' | 'prerequisite' | 'outcome';
    properties: {
      difficulty: number;
      importance: number;
      learningTime: number;
      mastery: number;
    };
  }[];
  edges: {
    source: string;
    target: string;
    relationship:
      | 'prerequisite'
      | 'leads_to'
      | 'related_to'
      | 'part_of'
      | 'enables';
    weight: number;
  }[];
}

export interface LearningStyleProfile {
  id: string;
  studentId: string;
  visualLearner: number;
  auditoryLearner: number;
  kinestheticLearner: number;
  readingWritingLearner: number;
  preferredPace: 'slow' | 'medium' | 'fast';
  attentionSpan: number;
  motivationFactors: string[];
  learningPreferences: {
    timeOfDay: string;
    sessionLength: number;
    breakFrequency: number;
    difficultyProgression: 'gradual' | 'moderate' | 'steep';
  };
  adaptationHistory: {
    date: string;
    changes: any[];
    effectiveness: number;
  }[];
  lastAnalyzed: string;
  confidence: number;
}

export interface ContentRecommendation {
  id: string;
  studentId: string;
  type:
    | 'next_lesson'
    | 'review_content'
    | 'practice_exercise'
    | 'supplementary_material'
    | 'assessment';
  content: {
    id: string;
    title: string;
    description: string;
    url: string;
    difficulty: number;
    estimatedTime: number;
    prerequisites: string[];
  };
  reasoning: string;
  confidence: number;
  priority: number;
  adaptiveFactors: {
    learningStyle: string;
    currentPerformance: number;
    knowledgeGaps: string[];
    timeConstraints: any;
  };
  createdAt: string;
  expiresAt: string;
}
