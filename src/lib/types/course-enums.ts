// Course Enums - matching backend enums from /common/enums/course.enums.ts

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
  ALL_LEVELS = 'all_levels',
}

export enum CourseStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum CourseLanguage {
  ENGLISH = 'en',
  VIETNAMESE = 'vi',
}

export enum CoursePricing {
  FREE = 'free',
  PAID = 'paid',
  SUBSCRIPTION = 'subscription',
  FREEMIUM = 'freemium',
}

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

// Type aliases for better compatibility
export type CourseLevel_Type = `${CourseLevel}`;
export type CourseStatus_Type = `${CourseStatus}`;
export type CourseLanguage_Type = `${CourseLanguage}`;
export type CoursePricing_Type = `${CoursePricing}`;
export type EnrollmentStatus_Type = `${EnrollmentStatus}`;
export type PaymentStatus_Type = `${PaymentStatus}`;