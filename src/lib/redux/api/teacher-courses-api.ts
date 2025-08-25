import { baseApi } from '@/lib/api/base-api';
import {
  CourseLevel,
  CourseStatus,
  CourseLanguage,
  CoursePricing,
} from '@/lib/types/course-enums';

// Teacher Course interfaces based on backend entity
export interface TeacherCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  teacherId: string;
  categoryId: string;
  level: CourseLevel;
  language: CourseLanguage;
  durationHours?: number;
  durationMinutes?: number;
  price: number;
  currency: string;
  originalPrice?: number;
  isFree: boolean;
  pricingModel: CoursePricing;
  status: CourseStatus;
  enrollmentLimit?: number;
  tags?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
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
  lifetimeAccess: boolean;
  accessDuration?: number;
  availableFrom?: string;
  availableUntil?: string;
  publishedAt?: string;
  lastUpdatedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  sections?: any[];
  // Computed properties
  formattedPrice: string;
  completionRate: number;
  averageRating: number;
  isPublished: boolean;
  isDraft: boolean;
  estimatedDuration: string;
  enrollmentStatus: string;
}

export interface TeacherCourseQueryParams {
  categoryId?: string;
  level?: CourseLevel;
  status?: CourseStatus;
  isFree?: boolean;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  language?: CourseLanguage;
  tags?: string[];
  search?: string;
  createdAfter?: string;
  updatedAfter?: string;
  page?: number;
  limit?: number;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'title'
    | 'price'
    | 'rating'
    | 'totalEnrollments'
    | 'publishedAt'
    | 'featured';
  sortOrder?: 'ASC' | 'DESC';
  includeTeacher?: boolean;
  includeCategory?: boolean;
  includeSections?: boolean;
  includeStats?: boolean;
}

export interface TeacherCoursesResponse {
  data: TeacherCourse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateCourseDto {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  trailerVideoUrl?: string;
  categoryId: string;
  level: CourseLevel;
  language?: CourseLanguage;
  durationHours?: number;
  durationMinutes?: number;
  price?: number;
  currency?: string;
  originalPrice?: number;
  isFree?: boolean;
  pricingModel?: CoursePricing;
  enrollmentLimit?: number;
  tags?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  targetAudience?: string[];
  allowReviews?: boolean;
  allowDiscussions?: boolean;
  hasCertificate?: boolean;
  lifetimeAccess?: boolean;
  accessDuration?: number;
  availableFrom?: string;
  availableUntil?: string;
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {
  status?: CourseStatus;
  featured?: boolean;
}

export interface CourseStatistics {
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  avgRating: number;
  avgPrice: number;
  topCategories: Array<{ categoryId: string; name: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  recentlyCreated: number;
  recentlyUpdated: number;
}

export interface CourseFileStatistics {
  courseId: string;
  totalFiles: number;
  filesByType: {
    video: number;
    audio: number;
    image: number;
    document: number;
    thumbnail: number;
    trailer: number;
    lesson: number;
    promotional: number;
  };
  totalSize: number; // in bytes
  totalSizeMB: number; // in MB
}

// Direct S3 Upload interfaces
export interface GenerateUploadUrlRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadType: string;
  lessonId?: string;
  metadata?: Record<string, any>;
}

export interface GenerateUploadUrlResponse {
  uploadId: string;
  presignedUrl: string;
  s3Key: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  uploadId: string;
  s3Key: string;
  etag: string;
  actualFileSize: number;
}

export interface ConfirmUploadResponse {
  success: boolean;
  fileRecord: {
    id: string;
    fileName: string;
    fileUrl: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadType: string;
  };
}

export const teacherCoursesApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get teacher's courses - uses existing /course/my-courses endpoint
    getTeacherCourses: builder.query<
      TeacherCoursesResponse,
      TeacherCourseQueryParams
    >({
      query: (params = {}) => ({
        url: '/course/my-courses',
        params: {
          ...params,
          includeTeacher: params.includeTeacher ?? true,
          includeCategory: params.includeCategory ?? true,
          includeSections: params.includeSections ?? false,
          includeStats: params.includeStats ?? false,
        },
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Course' as const, id })),
              { type: 'Course', id: 'LIST' },
            ]
          : [{ type: 'Course', id: 'LIST' }],
    }),

    // Get single course by ID - uses existing /course/:id endpoint
    getTeacherCourse: builder.query<
      TeacherCourse,
      {
        id: string;
        options?: {
          includeTeacher?: boolean;
          includeCategory?: boolean;
          includeSections?: boolean;
          includeStats?: boolean;
        };
      }
    >({
      query: ({ id, options = {} }) => ({
        url: `/course/${id}`,
        params: {
          includeTeacher: options.includeTeacher ?? true,
          includeCategory: options.includeCategory ?? true,
          includeSections: options.includeSections ?? false,
          includeStats: options.includeStats ?? true,
        },
      }),
      providesTags: (result, error, { id }) => [{ type: 'Course', id }],
    }),

    // Create new course - uses existing POST /course endpoint
    createTeacherCourse: builder.mutation<TeacherCourse, CreateCourseDto>({
      query: courseData => ({
        url: '/course',
        method: 'POST',
        body: courseData,
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),

    // Update course - uses existing PATCH /course/:id endpoint
    updateTeacherCourse: builder.mutation<
      TeacherCourse,
      { id: string; data: UpdateCourseDto }
    >({
      query: ({ id, data }) => ({
        url: `/course/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Delete course - uses existing DELETE /course/:id endpoint
    deleteTeacherCourse: builder.mutation<void, string>({
      query: id => ({
        url: `/course/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Submit course for review - uses existing POST /course/:id/submit-for-review endpoint
    submitCourseForReview: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: id => ({
        url: `/course/${id}/submit-for-review`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Publish course - uses existing POST /course/:id/publish endpoint
    publishCourse: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: id => ({
        url: `/course/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Unpublish course - uses existing POST /course/:id/unpublish endpoint
    unpublishCourse: builder.mutation<
      { success: boolean; message: string },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/course/${id}/unpublish`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Course', id },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Get course statistics - uses existing GET /course/:id/statistics endpoint
    getCourseStatistics: builder.query<CourseStatistics, string>({
      query: id => `/course/${id}/statistics`,
      providesTags: (result, error, id) => [{ type: 'CourseStats', id }],
    }),

    // Get course file statistics from file_uploads table
    getCourseFileStatistics: builder.query<CourseFileStatistics, string>({
      query: courseId => `/course/${courseId}/file-statistics`,
      providesTags: (result, error, courseId) => [
        { type: 'CourseFileStats', id: courseId },
      ],
    }),

    // Bulk operations - uses existing bulk endpoints
    bulkUpdateCourseStatus: builder.mutation<
      { success: boolean; updated: number },
      { courseIds: string[]; status: CourseStatus }
    >({
      query: data => ({
        url: '/course/bulk/status',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),

    bulkDeleteCourses: builder.mutation<
      { success: boolean; deleted: number },
      { courseIds: string[] }
    >({
      query: data => ({
        url: '/course/bulk',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: [{ type: 'Course', id: 'LIST' }],
    }),

    // ==================== FILE UPLOAD ENDPOINTS ====================

    // Upload course thumbnail
    uploadCourseThumbnail: builder.mutation<
      { thumbnailUrl: string },
      { courseId: string; file: File }
    >({
      query: ({ courseId, file }) => {
        const formData = new FormData();
        formData.append('thumbnail', file);
        return {
          url: `/course/${courseId}/thumbnail`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Upload course trailer video
    uploadCourseTrailerVideo: builder.mutation<
      { trailerVideoUrl: string },
      { courseId: string; file: File }
    >({
      query: ({ courseId, file }) => {
        const formData = new FormData();
        formData.append('trailerVideo', file);
        return {
          url: `/course/${courseId}/trailer-video`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Delete course thumbnail
    deleteCourseThumbnail: builder.mutation<void, string>({
      query: courseId => ({
        url: `/course/${courseId}/thumbnail`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // Delete course trailer video
    deleteCourseTrailerVideo: builder.mutation<void, string>({
      query: courseId => ({
        url: `/course/${courseId}/trailer-video`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, courseId) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),

    // ==================== DIRECT S3 UPLOAD ====================

    // Generate presigned URL for direct S3 upload
    generateUploadUrl: builder.mutation<
      GenerateUploadUrlResponse,
      { courseId: string } & GenerateUploadUrlRequest
    >({
      query: ({ courseId, ...body }) => ({
        url: `/course/${courseId}/generate-upload-url`,
        method: 'POST',
        body,
      }),
    }),

    // Confirm upload completion
    confirmUpload: builder.mutation<
      ConfirmUploadResponse,
      { courseId: string } & ConfirmUploadRequest
    >({
      query: ({ courseId, ...body }) => ({
        url: `/course/${courseId}/confirm-upload`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: 'Course', id: courseId },
        { type: 'Course', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetTeacherCoursesQuery,
  useGetTeacherCourseQuery,
  useCreateTeacherCourseMutation,
  useUpdateTeacherCourseMutation,
  useDeleteTeacherCourseMutation,
  useSubmitCourseForReviewMutation,
  usePublishCourseMutation,
  useUnpublishCourseMutation,
  useGetCourseStatisticsQuery,
  useGetCourseFileStatisticsQuery,
  useBulkUpdateCourseStatusMutation,
  useBulkDeleteCoursesMutation,
  // File upload hooks
  useUploadCourseThumbnailMutation,
  useUploadCourseTrailerVideoMutation,
  useDeleteCourseThumbnailMutation,
  useDeleteCourseTrailerVideoMutation,
  // Direct S3 upload hooks
  useGenerateUploadUrlMutation,
  useConfirmUploadMutation,
} = teacherCoursesApi;
