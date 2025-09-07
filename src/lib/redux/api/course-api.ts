import { baseApi } from '@/lib/api/base-api';
import { Lesson } from '@/lib/types';
import {
  Course,
  Enrollment,
  Category,
  Wishlist,
  CourseDetail,
} from '@/lib/types/course';
import {
  transformCourse,
  transformCourses,
  transformEnrollments,
  transformApiResponse,
} from '@/lib/utils/data-transform';
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
      transformResponse: (response: any) => {
        console.log('getPublicCourses API response:', response);

        // Handle new backend response format
        if (response.success && response.data) {
          return {
            courses: response.data,
            total: response.total,
            page: response.page,
            totalPages: response.totalPages,
            hasNext: response.hasNext,
            hasPrevious: response.hasPrevious,
            filters: response.filters,
          };
        }

        // Fallback for old format
        const courses = response.data || response;
        return {
          courses: response.data,
          total: courses?.length || 0,
          page: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
          filters: {},
        };
      },
      providesTags: ['Course'],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Category'],
      transformResponse: (response: any) => {
        console.log('Categories API response:', response);

        // Handle different response structures
        if (response.data && Array.isArray(response.data)) {
          // Pagination case: { success, message, data: categories[], meta }
          return response.data;
        } else if (Array.isArray(response)) {
          // Direct array response
          return response;
        } else if (response && typeof response === 'object') {
          // Check if response has numeric keys (spread array case)
          const { success, message, meta, ...rest } = response;
          const keys = Object.keys(rest);
          const hasNumericKeys = keys.some(key => !isNaN(Number(key)));

          if (hasNumericKeys) {
            // Convert back to array from spread object
            const categoriesArray = Object.values(rest).filter(
              item => item && typeof item === 'object' && 'id' in item
            );
            return categoriesArray;
          }
        }

        // Fallback to empty array
        console.warn('Unexpected categories response structure:', response);
        return [];
      },
    }),

    getCourseDetail: builder.query<CourseDetail, string>({
      query: slug => `/course/public/${slug}`,
      transformResponse: (response: any) => {
        console.log('getCourseDetail API responseeee:', response);
        return response.data;
      },
      providesTags: (_result, _error, slug) => [{ type: 'Course', id: slug }],
    }),

    searchCourses: builder.query<CourseSearchResponse, CourseFilters>({
      query: filters => ({
        url: '/course/public',
        params: filters,
      }),
      transformResponse: (response: any) => {
        console.log('searchCourses API response:', response);

        // Handle backend response format
        if (response.success && response.data) {
          return {
            courses: response.data,
            total: response.total,
            page: response.page,
            totalPages: response.totalPages,
            hasNext: response.hasNext,
            hasPrevious: response.hasPrevious,
            filters: response.filters || { categories: [], levels: [], languages: [] }
          };
        }

        // Fallback for direct data
        return {
          courses: response.data || response.courses || [],
          total: response.total || 0,
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          hasNext: response.hasNext || false,
          hasPrevious: response.hasPrevious || false,
          filters: response.filters || { categories: [], levels: [], languages: [] }
        };
      },
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
      invalidatesTags: ['Enrollment', 'Course', 'EnrollmentStatus'],
    }),

    // getEnrollmentStatus: builder.query<
    //   { isEnrolled: boolean; enrollment?: any },
    //   string
    // >({
    //   query: courseId => `/course/${courseId}/enrollment-status`,
    //   providesTags: (_result, _error, courseId) => [
    //     { type: 'EnrollmentStatus', id: courseId },
    //   ],
    // }),

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
      transformResponse: (response: any) => {
        console.log('getUserEnrollments API response:', response);

        if (response?.success && response?.data) {
          return transformEnrollments(response.data);
        } else if (Array.isArray(response)) {
          return transformEnrollments(response);
        } else if (response?.data && Array.isArray(response.data)) {
          return transformEnrollments(response.data);
        }

        return transformEnrollments(response || []);
      },
      providesTags: ['Enrollment'],
    }),

    getEnrollmentStatus: builder.query<
      {
        isEnrolled: boolean;
        enrollment?: Enrollment;
      },
      string
    >({
      query: courseId => `/enrollments/check/${courseId}`,
      providesTags: (_result, _error, courseId) => [
        { type: 'Enrollment', id: courseId },
      ],
    }),

    getWishlist: builder.query<Wishlist[], void>({
      query: () => '/wishlist',
      providesTags: ['Wishlist'],
      transformResponse: (response: any) => {
        console.log('getWishlist API response:', response);

        if (response?.success && response?.data) {
          return response.data;
        } else if (Array.isArray(response)) {
          return response;
        } else if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }

        return response || [];
      },
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

    getCoursesQuery: builder.query<
      {
        data: Course[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrevious: boolean;
        };
      },
      {
        teacherId?: string;
        status?: string;
        limit?: number;
        page?: number;
        id?: string;
      }
    >({
      query: params => ({
        url: '/course',
        params,
      }),
      providesTags: ['Course'],
    }),

    getCourseById: builder.query<Course, string>({
      query: id => `/course/${id}`,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getLessonById: builder.query<
      Lesson,
      { courseId: string; lessonId: string }
    >({
      query: ({ courseId, lessonId }) =>
        `/course/${courseId}/lessons/${lessonId}`,
      providesTags: (result, error, { lessonId }) => [
        { type: 'Lesson', id: lessonId },
      ],
    }),

    getCourseCategories: builder.query<
      {
        categories: Category[];
        total: number;
      },
      void
    >({
      query: () => '/course/categories',
      providesTags: ['Category'],
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
  useGetCoursesQueryQuery: useGetCoursesQuery,
  useGetCourseByIdQuery,
  useGetLessonByIdQuery,
  useGetCourseCategoriesQuery,
} = courseApi;
