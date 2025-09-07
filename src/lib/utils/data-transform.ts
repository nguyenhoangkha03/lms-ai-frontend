/**
 * Data transformation utilities for backward compatibility
 * between frontend and backend data structures
 */

import { Course, Enrollment } from '@/lib/types/course';

/**
 * Transform backend course data to frontend format
 */
export function transformCourse(backendCourse: any): Course {
  return {
    ...backendCourse,
    // Ensure all required fields exist with defaults
    thumbnailUrl: backendCourse.thumbnailUrl || '',
    trailerVideoUrl: backendCourse.trailerVideoUrl || undefined,
    rating: backendCourse.rating || 0,
    totalRatings: backendCourse.totalRatings || 0,
    totalEnrollments: backendCourse.totalEnrollments || 0,
    totalCompletions: backendCourse.totalCompletions || 0,
    totalSections: backendCourse.totalSections || 0,
    totalLessons: backendCourse.totalLessons || 0,
    totalVideoDuration: backendCourse.totalVideoDuration || 0,
    featured: backendCourse.featured || false,
    bestseller: backendCourse.bestseller || false,
    isNew: backendCourse.isNew || false,
    hasCertificate: backendCourse.hasCertificate || false,
    lifetimeAccess: backendCourse.lifetimeAccess || false,
    allowReviews: backendCourse.allowReviews ?? true,
    allowDiscussions: backendCourse.allowDiscussions ?? true,
    
    // Transform teacher relation if needed - with safe fallbacks
    teacher: backendCourse.teacher ? {
      id: backendCourse.teacher.id,
      name: backendCourse.teacher.fullName || backendCourse.teacher.name || 'Unknown Teacher',
      avatar: backendCourse.teacher.profilePicture || backendCourse.teacher.avatar || '/images/default-avatar.png',
      bio: backendCourse.teacher.bio || '',
      rating: backendCourse.teacher.rating || 0,
      totalStudents: backendCourse.teacher.totalStudents || 0,
    } : {
      // Fallback if teacher is null/undefined
      id: backendCourse.teacherId || '',
      name: 'Unknown Teacher',
      avatar: '/images/default-avatar.png',
      bio: '',
      rating: 0,
      totalStudents: 0,
    },
  };
}

/**
 * Transform backend enrollment data to frontend format
 */
export function transformEnrollment(backendEnrollment: any): Enrollment {
  const baseEnrollment = {
    ...backendEnrollment,
    
    // Handle field name mappings
    enrolledAt: backendEnrollment.enrolledAt || backendEnrollment.enrollmentDate,
    enrollmentDate: backendEnrollment.enrollmentDate || backendEnrollment.enrolledAt,
    
    progress: backendEnrollment.progress || backendEnrollment.progressPercentage || 0,
    progressPercentage: backendEnrollment.progressPercentage || backendEnrollment.progress || 0,
    
    timeSpent: backendEnrollment.timeSpent || backendEnrollment.totalTimeSpent || 0,
    totalTimeSpent: backendEnrollment.totalTimeSpent || backendEnrollment.timeSpent || 0,
    
    // Generate formatted time if not provided
    formattedTimeSpent: backendEnrollment.formattedTimeSpent || formatTimeSpent(
      backendEnrollment.totalTimeSpent || backendEnrollment.timeSpent || 0
    ),
    
    // Ensure course is transformed if present
    course: backendEnrollment.course ? transformCourse(backendEnrollment.course) : backendEnrollment.course,
    
    // Handle status mapping
    status: mapEnrollmentStatus(backendEnrollment.status),
  };

  return baseEnrollment as Enrollment;
}

/**
 * Map backend enrollment status to frontend format
 */
function mapEnrollmentStatus(backendStatus: string): Enrollment['status'] {
  const statusMap: Record<string, Enrollment['status']> = {
    'in_progress': 'in_progress',
    'enrolled': 'active',
    'active': 'active',
    'completed': 'completed',
    'paused': 'paused',
    'cancelled': 'cancelled',
  };
  
  return statusMap[backendStatus] || 'active';
}

/**
 * Format time spent in seconds to human readable format
 */
function formatTimeSpent(timeInSeconds: number): string {
  if (timeInSeconds < 60) {
    return `${timeInSeconds}s`;
  } else if (timeInSeconds < 3600) {
    const minutes = Math.round(timeInSeconds / 60);
    return `${minutes}m`;
  } else {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.round((timeInSeconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

/**
 * Transform response data with proper error handling
 */
export function transformApiResponse<T>(
  response: any,
  transformer: (data: any) => T
): T | null {
  try {
    if (response?.success && response?.data) {
      return transformer(response.data);
    } else if (response?.data) {
      return transformer(response.data);
    } else if (Array.isArray(response)) {
      return transformer(response);
    } else if (response) {
      return transformer(response);
    }
    
    console.warn('Unexpected API response format:', response);
    return null;
  } catch (error) {
    console.error('Data transformation error:', error);
    return null;
  }
}

/**
 * Transform array of courses
 */
export function transformCourses(courses: any[]): Course[] {
  return courses?.map(transformCourse) || [];
}

/**
 * Transform array of enrollments
 */
export function transformEnrollments(enrollments: any[]): Enrollment[] {
  return enrollments?.map(transformEnrollment) || [];
}