export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  teacherId: string;
  categoryId: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all_levels';
  language: string;
  durationHours: number;
  durationMinutes: number;
  price: number;
  currency: string;
  originalPrice?: number;
  isFree: boolean;
  pricingModel: 'free' | 'paid' | 'subscription' | 'freemium';
  status: 'draft' | 'under_review' | 'published' | 'archived' | 'suspended';
  enrollmentLimit?: number;
  tags: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];
  rating: number;
  totalRatings: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalReviews: number;
  totalSections: number;
  totalLessons: number;
  totalVideoDuration: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  allowReviews: boolean;
  allowDiscussions: boolean;
  hasCertificate: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  teacher?: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    email: string;
  };
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  coverUrl?: string;
  color?: string;
  orderIndex: number;
  level: number;
  isActive: boolean;
  showInMenu: boolean;
  isFeatured: boolean;
  courseCount: number;
  parentId?: string;
  children?: Category[];
  seoMeta?: Record<string, any>;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ContentModerationItem {
  id: string;
  contentType: 'course' | 'lesson' | 'forum_post' | 'comment';
  contentId: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected' | 'requires_changes' | 'flagged';
  moderatedBy?: string;
  moderatedAt?: string;
  moderationReason?: string;
  flaggedReason?: string;
  reportCount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  submittedBy: string;
  aiAnalysis?: {
    qualityScore: number;
    flags: string[];
    suggestions: string[];
    confidence: number;
  };
  plagiarismCheck?: {
    similarityScore: number;
    status: 'clean' | 'suspicious' | 'plagiarized';
    sources: Array<{
      source: string;
      similarity: number;
      matchedText: string;
    }>;
  };
  content?: {
    title: string;
    description: string;
    thumbnailUrl?: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface ContentTag {
  id: string;
  contentType: 'course' | 'lesson';
  contentId: string;
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
  isActive: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  aiModelVersion?: string;
  extractionMethod?: string;
  metadata?: Record<string, any>;
}

export interface QualityAssessment {
  id: string;
  contentType: 'course' | 'lesson';
  contentId: string;
  overallScore: number;
  status: 'processing' | 'completed' | 'failed';
  assessedAt: string;
  assessedBy?: string;
  metrics: {
    contentQuality: number;
    structure: number;
    engagement: number;
    clarity: number;
    completeness: number;
    accessibility: number;
  };
  suggestions: Array<{
    category: string;
    priority: 'low' | 'medium' | 'high';
    suggestion: string;
    impact: string;
  }>;
  aiAnalysis: {
    modelVersion: string;
    confidence: number;
    processedAt: string;
    flags: string[];
  };
  version: number;
}

export interface PlagiarismCheck {
  id: string;
  contentType: 'course' | 'lesson' | 'assignment' | 'forum_post';
  contentId: string;
  contentHash: string;
  status: 'pending' | 'scanning' | 'completed' | 'failed';
  scanStartedAt?: string;
  scanCompletedAt?: string;
  overallSimilarity: number;
  plagiarismLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe';
  sourcesChecked: number;
  matchesFound: number;
  matches: Array<{
    source: string;
    similarity: number;
    matchedText: string;
    context: string;
  }>;
  analysis: {
    originalContent: number;
    quotedContent: number;
    similarContent: number;
    flags: string[];
  };
  scanConfiguration: {
    sensitivity: 'low' | 'medium' | 'high';
    excludeQuotes: boolean;
    excludeReferences: boolean;
    minimumMatchLength: number;
  };
  initiatedBy: string;
  metadata?: Record<string, any>;
}

export interface SimilarityRecord {
  id: string;
  sourceContentType: 'course' | 'lesson';
  sourceContentId: string;
  targetContentType: 'course' | 'lesson';
  targetContentId: string;
  similarityType:
    | 'semantic'
    | 'structural'
    | 'topic'
    | 'difficulty'
    | 'comprehensive';
  similarityScore: number;
  status: 'calculated' | 'processing' | 'failed' | 'outdated';
  calculatedAt: string;
  algorithmVersion: string;
  analysis: {
    matchingElements: string[];
    differences: string[];
    recommendations: string[];
  };
  metadata?: Record<string, any>;
}

// Query parameters interfaces
export interface CoursesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  teacherId?: string;
  status?: string;
  level?: string;
  language?: string;
  isFree?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  awaiting_approval?: boolean;
}

export interface CategoriesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string;
  level?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ModerationQueryParams {
  page?: number;
  limit?: number;
  contentType?: string;
  status?: string;
  priority?: string;
  moderatedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  reportCount?: number;
}

export interface ContentAnalysisQueryParams {
  content_type?: string;
  content_id?: string;
  category?: string;
  type?: string;
  is_verified?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}
