export interface ContentQualityAssessment {
  id: string;
  content_type: 'course' | 'lesson';
  content_id: string;
  overall_score: number;
  quality_level:
    | 'excellent'
    | 'good'
    | 'satisfactory'
    | 'needs_improvement'
    | 'poor';
  assessed_at: string;
  is_latest: boolean;
  ai_model_version: string;
  dimensionScores: {
    clarity: number;
    engagement: number;
    accuracy: number;
    completeness: number;
    structure: number;
  };
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  improvements: string[];
  metadata: Record<string, any>;
}

export interface PlagiarismCheck {
  id: string;
  content_type: 'course' | 'lesson' | 'assignment' | 'forum_post';
  content_id: string;
  content_hash: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scan_started_at: string;
  scan_completed_at?: string;
  overall_similarity: number;
  plagiarism_level: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  sources_checked: number;
  matches_found: number;
  matches: Array<{
    source: string;
    similarity: number;
    matchedText: string;
    sourceUrl?: string;
    confidence: number;
  }>;
  analysis: {
    summary: string;
    details: string[];
    recommendations: string[];
  };
  scanConfiguration: {
    sensitivity: 'low' | 'medium' | 'high';
    excludeQuotes: boolean;
    excludeReferences: boolean;
    minimumMatchLength: number;
  };
  metadata: Record<string, any>;
}

export interface SimilarityAnalysis {
  id: string;
  source_content_type: 'course' | 'lesson';
  source_content_id: string;
  target_content_type: 'course' | 'lesson';
  target_content_id: string;
  similarity_type:
    | 'semantic'
    | 'structural'
    | 'topic'
    | 'difficulty'
    | 'comprehensive';
  similarity_score: number;
  status: 'calculated' | 'processing' | 'failed' | 'outdated';
  calculated_at: string;
  algorithm_version: string;
  analysis: {
    dimensions: {
      semantic: number;
      structural: number;
      topical: number;
      stylistic: number;
    };
    commonElements: string[];
    differences: string[];
    recommendations: string[];
  };
  metadata: Record<string, any>;
}

export interface ContentTag {
  id: string;
  content_type: 'course' | 'lesson';
  content_id: string;
  tag: string;
  category:
    | 'topic'
    | 'difficulty'
    | 'skill'
    | 'subject'
    | 'learning_objective'
    | 'content_type'
    | 'language';
  type: 'auto_generated' | 'manual' | 'ai_suggested' | 'system';
  confidence: number;
  description?: string;
  is_active: boolean;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  ai_model_version?: string;
  extraction_method?: string;
  metadata: Record<string, any>;
}

export interface GeneratedQuiz {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number;
  questions: Array<{
    id: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    question: string;
    options?: string[];
    correct_answer: string | string[];
    explanation?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    bloom_taxonomy:
      | 'remember'
      | 'understand'
      | 'apply'
      | 'analyze'
      | 'evaluate'
      | 'create';
    estimated_time: number;
  }>;
  generation_config: {
    question_count: number;
    difficulty_distribution: Record<string, number>;
    question_types: string[];
    focus_areas: string[];
  };
  ai_confidence: number;
  status: 'generated' | 'reviewed' | 'approved' | 'rejected' | 'published';
  reviewed_by?: string;
  reviewed_at?: string;
  feedback?: string;
  metadata: Record<string, any>;
}

export interface AssessContentQualityRequest {
  content_type: 'course' | 'lesson';
  content_id: string;
  analysis_type?: 'full' | 'quick' | 'detailed';
  focus_areas?: string[];
}

export interface CheckPlagiarismRequest {
  content_type: 'course' | 'lesson' | 'assignment' | 'forum_post';
  content_id: string;
  content?: string;
  configuration?: {
    sensitivity?: 'low' | 'medium' | 'high';
    excludeQuotes?: boolean;
    excludeReferences?: boolean;
    minimumMatchLength?: number;
  };
}

export interface AnalyzeSimilarityRequest {
  source_content_type: 'course' | 'lesson';
  source_content_id: string;
  target_content_type: 'course' | 'lesson';
  target_content_id: string;
  similarity_type?:
    | 'semantic'
    | 'structural'
    | 'topic'
    | 'difficulty'
    | 'comprehensive';
}

export interface GenerateTagsRequest {
  content_type: 'course' | 'lesson';
  content_id: string;
  categories?: string[];
  max_tags?: number;
  confidence_threshold?: number;
}

export interface GenerateQuizRequest {
  lesson_id: string;
  config: {
    question_count: number;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    question_types: string[];
    focus_areas?: string[];
    estimated_duration?: number;
  };
}
