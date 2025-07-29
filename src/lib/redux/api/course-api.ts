import { baseApi } from '@/lib/api/base-api';
import {
  Course,
  Enrollment,
  Category,
  Wishlist,
  CourseDetail,
} from '@/lib/types/course';
export interface CourseFilters {
  search?: string;
  category?: string;
  level?: string;
  price?: 'free' | 'paid' | 'all';
  rating?: number;
  duration?: 'short' | 'medium' | 'long';
  language?: string;
  featured?: boolean;
  sortBy?: 'newest' | 'rating' | 'popularity' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export interface CourseSearchResponse {
  courses: Course[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  filters: {
    categories: Category[];
    levels: string[];
    languages: string[];
    priceRange: { min: number; max: number };
  };
}

export interface EnrollmentRequest {
  courseId: string;
  paymentMethod?: string;
  couponCode?: string;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPublicCourses: builder.query<CourseSearchResponse, CourseFilters>({
      query: filters => ({
        url: '/course/public',
        params: filters,
      }),
      providesTags: ['Course'],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),

    getCourseDetail: builder.query<CourseDetail, string>({
      query: slug => `/course/public/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Course', id: slug }],
    }),

    searchCourses: builder.query<CourseSearchResponse, CourseFilters>({
      query: filters => ({
        url: '/course/search',
        params: filters,
      }),
      providesTags: ['Course'],
    }),

    getFeaturedCourses: builder.query<Course[], { limit?: number }>({
      query: ({ limit = 8 } = {}) => ({
        url: '/course/featured',
        params: { limit },
      }),
      providesTags: ['Course'],
    }),

    getCourseRecommendations: builder.query<
      Course[],
      {
        courseId?: string;
        userId?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/course/recommendations',
        params,
      }),
      providesTags: ['Course'],
    }),

    enrollInCourse: builder.mutation<Enrollment, EnrollmentRequest>({
      query: data => ({
        url: '/enrollments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enrollment', 'Course'],
    }),

    getUserEnrollments: builder.query<
      Enrollment[],
      {
        status?: 'active' | 'completed' | 'paused';
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/enrollments/my',
        params,
      }),
      providesTags: ['Enrollment'],
    }),

    getEnrollmentStatus: builder.query<
      {
        isEnrolled: boolean;
        enrollment?: Enrollment;
      },
      string
    >({
      query: courseId => `/enrollments/status/${courseId}`,
      providesTags: (_result, _error, courseId) => [
        { type: 'Enrollment', id: courseId },
      ],
    }),

    getWishlist: builder.query<Wishlist[], void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
    }),

    addToWishlist: builder.mutation<Wishlist, { courseId: string }>({
      query: data => ({
        url: '/wishlist',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Wishlist'],
    }),

    removeFromWishlist: builder.mutation<void, string>({
      query: courseId => ({
        url: `/wishlist/${courseId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wishlist'],
    }),

    isInWishlist: builder.query<{ isInWishlist: boolean }, string>({
      query: courseId => `/wishlist/check/${courseId}`,
      providesTags: (_result, _error, courseId) => [
        { type: 'Wishlist', id: courseId },
      ],
    }),

    getCourseReviews: builder.query<
      {
        reviews: any[];
        summary: {
          averageRating: number;
          totalReviews: number;
          ratingDistribution: { [key: number]: number };
        };
      },
      { courseId: string; page?: number; limit?: number }
    >({
      query: ({ courseId, page = 1, limit = 10 }) => ({
        url: `/course/${courseId}/reviews`,
        params: { page, limit },
      }),
      providesTags: (_result, _error, { courseId }) => [
        { type: 'Review', id: courseId },
      ],
    }),

    addCourseReview: builder.mutation<
      any,
      {
        courseId: string;
        rating: number;
        comment: string;
      }
    >({
      query: ({ courseId, ...data }) => ({
        url: `/course/${courseId}/reviews`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: 'Review', id: courseId },
        { type: 'Course', id: courseId },
      ],
    }),

    getCourseProgress: builder.query<
      {
        progressPercentage: number;
        completedLessons: number;
        totalLessons: number;
        lastAccessedLesson?: string;
        timeSpent: number;
      },
      string
    >({
      query: courseId => `/course/${courseId}/progress`,
      providesTags: (_result, _error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),
  }),
});

export const {
  useGetPublicCoursesQuery,
  useGetCategoriesQuery,
  useGetCourseDetailQuery,
  useSearchCoursesQuery,
  useGetFeaturedCoursesQuery,
  useGetCourseRecommendationsQuery,
  useEnrollInCourseMutation,
  useGetUserEnrollmentsQuery,
  useGetEnrollmentStatusQuery,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useIsInWishlistQuery,
  useGetCourseReviewsQuery,
  useAddCourseReviewMutation,
  useGetCourseProgressQuery,
} = courseApi;
