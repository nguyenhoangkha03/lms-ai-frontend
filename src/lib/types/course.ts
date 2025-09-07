export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  coverUrl?: string;
  color?: string;
  courseCount: number;
  isActive: boolean;
  isFeatured: boolean;
  parentId?: string;
  children?: Category[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl: string;
  trailerVideoUrl?: string;
  teacherId: string;
  description: string;
  teacher: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    rating?: number;
    totalStudents?: number;
  };
  categoryId: string;
  category: Category;
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
  tags: string[];
  rating: number;
  totalRatings: number;
  totalEnrollments: number;
  totalCompletions: number;
  totalSections: number;
  totalLessons: number;
  totalVideoDuration: number;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  hasCertificate: boolean;
  lifetimeAccess: boolean;
  accessDuration?: number;
  enrollmentLimit?: number;
  allowReviews: boolean;
  allowDiscussions: boolean;
  availableFrom?: string;
  availableUntil?: string;
  lastUpdatedAt?: string;
  seoMeta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  isEnrolled?: boolean; // For UI state - indicates if current user is enrolled
}

export interface CourseDetail extends Course {
  description: string;
  requirements: string[];
  whatYouWillLearn: string[];
  targetAudience: string[];
  sections: CourseSection[];
  instructor: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    bio: string;
    rating: number;
    totalStudents: number;
    totalCourses: number;
    experience: string;
    expertise: string[];
    socialLinks?: {
      website?: string;
      linkedin?: string;
      twitter?: string;
      youtube?: string;
    };
  };
  reviews: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    recentReviews: CourseReview[];
  };
  faq: {
    question: string;
    answer: string;
  }[];
  relatedCourses: Course[];
  enrollment?: {
    isEnrolled: boolean;
    enrolledAt?: string;
    progress?: number;
    lastAccessedLesson?: string;
  };
}

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  orderIndex: number;
  totalLessons: number;
  totalDuration: number;
  isActive: boolean;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  description?: string;
  lessonType:
    | 'video'
    | 'text'
    | 'audio'
    | 'interactive'
    | 'quiz'
    | 'assignment';
  videoUrl?: string;
  videoDuration?: number;
  orderIndex: number;
  isPreview: boolean;
  isMandatory: boolean;
  isActive: boolean;
  thumbnailUrl?: string;
  estimatedDuration: number;
  objectives?: string[];
  hasQuiz: boolean;
  hasAssignment: boolean;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    downloadable: boolean;
  }[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  course: Course;
  enrollmentDate: string; // Match backend field name
  enrolledAt: string; // Keep for backward compatibility
  status:
    | 'active'
    | 'completed'
    | 'paused'
    | 'cancelled'
    | 'in_progress'
    | 'enrolled';
  progressPercentage: number; // Match backend field name
  progress: number; // Keep for backward compatibility
  lastAccessedAt?: string;
  lastAccessedLessonId?: string;
  completedAt?: string;
  totalTimeSpent: number; // Match backend field name
  timeSpent: number; // Keep for backward compatibility
  formattedTimeSpent?: string;
  lessonsCompleted?: number;
  totalLessons?: number;
  certificateIssued: boolean;
  certificateUrl?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentAmount: number;
  paymentTransactionId?: string;
  paymentMethod?: string;
  couponCode?: string;
  discountAmount?: number;
  accessExpiresAt?: string;
  sourceAttribution?: string;
  rating?: number;
}

export interface Wishlist {
  id: string;
  studentId: string;
  courseId: string;
  course: Course;
  addedAt: string;
}

export interface CourseReview {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  courseId: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  level?: string[];
  price?: 'free' | 'paid' | 'all';
  isFree?: boolean; // For backend API
  priceRange?: { min: number; max: number };
  rating?: number;
  duration?: 'short' | 'medium' | 'long';
  language?: string[];
  features?: string[];
  instructor?: string;
  sortBy?:
    | 'newest'
    | 'rating'
    | 'popularity'
    | 'price_low'
    | 'price_high'
    | 'duration';
  page?: number;
  limit?: number;
}

export interface SearchSuggestion {
  type: 'course' | 'instructor' | 'category' | 'topic';
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
}

// Course Statistics
export interface CourseStats {
  totalCourses: number;
  totalStudents: number;
  totalInstructors: number;
  averageRating: number;
  popularCategories: {
    category: Category;
    courseCount: number;
    enrollmentCount: number;
  }[];
  featuredCourses: Course[];
  trendingTopics: string[];
}
