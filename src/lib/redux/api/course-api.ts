import { baseApi } from '@/lib/api/base-api';
import type {
  Course,
  Lesson,
  Category,
  ApiResponse,
  PaginationParams,
} from '@/lib/types';

interface CourseFilters {
  categoryId?: string;
  level?: string;
  language?: string;
  isFree?: boolean;
  featured?: boolean;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const courseApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCourses: builder.query<
      {
        courses: Course[];
        total: number;
      },
      PaginationParams & CourseFilters
    >({
      query: params => ({
        url: '/courses',
        params,
      }),
      transformResponse: (
        response: ApiResponse<{ courses: Course[]; total: number }>
      ) => response.data!,
      providesTags: ['Course'],
    }),

    getCourseBySlug: builder.query<Course, string>({
      query: slug => `/courses/slug/${slug}`,
      transformResponse: (response: ApiResponse<Course>) => response.data!,
      providesTags: (result, error, slug) => [{ type: 'Course', id: slug }],
    }),

    getCourseById: builder.query<Course, string>({
      query: id => `/courses/${id}`,
      transformResponse: (response: ApiResponse<Course>) => response.data!,
      providesTags: (result, error, id) => [{ type: 'Course', id }],
    }),

    getCategories: builder.query<Category[], { parentId?: string }>({
      query: params => ({
        url: '/courses/categories',
        params,
      }),
      transformResponse: (response: ApiResponse<Category[]>) => response.data!,
    }),

    getCourseLessons: builder.query<Lesson[], string>({
      query: courseId => `/courses/${courseId}/lessons`,
      transformResponse: (response: ApiResponse<Lesson[]>) => response.data!,
      providesTags: (result, error, courseId) => [
        { type: 'Lesson', id: courseId },
      ],
    }),

    getLessonById: builder.query<
      Lesson,
      { courseId: string; lessonId: string }
    >({
      query: ({ courseId, lessonId }) =>
        `/courses/${courseId}/lessons/${lessonId}`,
      transformResponse: (response: ApiResponse<Lesson>) => response.data!,
      providesTags: (result, error, { lessonId }) => [
        { type: 'Lesson', id: lessonId },
      ],
    }),

    enrollInCourse: builder.mutation<{ message: string }, string>({
      query: courseId => ({
        url: `/courses/${courseId}/enroll`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['Course', 'Enrollment'],
    }),

    getEnrolledCourses: builder.query<Course[], { userId?: string }>({
      query: params => ({
        url: '/courses/enrolled',
        params,
      }),
      transformResponse: (response: ApiResponse<Course[]>) => response.data!,
      providesTags: ['Enrollment'],
    }),

    updateProgress: builder.mutation<
      { message: string },
      {
        courseId: string;
        lessonId: string;
        progress: number;
        completed?: boolean;
      }
    >({
      query: data => ({
        url: `/courses/${data.courseId}/lessons/${data.lessonId}/progress`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['Progress'],
    }),

    getCourseProgress: builder.query<
      {
        overallProgress: number;
        completedLessons: number;
        totalLessons: number;
        timeSpent: number;
      },
      string
    >({
      query: courseId => `/courses/${courseId}/progress`,
      transformResponse: (response: ApiResponse<any>) => response.data!,
      providesTags: (result, error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    getCourseReviews: builder.query<
      any[],
      { courseId: string } & PaginationParams
    >({
      query: ({ courseId, ...params }) => ({
        url: `/courses/${courseId}/reviews`,
        params,
      }),
      transformResponse: (response: ApiResponse<any[]>) => response.data!,
    }),

    submitCourseReview: builder.mutation<
      { message: string },
      {
        courseId: string;
        rating: number;
        comment: string;
      }
    >({
      query: ({ courseId, ...data }) => ({
        url: `/courses/${courseId}/reviews`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data!,
      invalidatesTags: ['Course'],
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseBySlugQuery,
  useGetCourseByIdQuery,
  useGetCategoriesQuery,
  useGetCourseLessonsQuery,
  useGetLessonByIdQuery,
  useEnrollInCourseMutation,
  useGetEnrolledCoursesQuery,
  useUpdateProgressMutation,
  useGetCourseProgressQuery,
  useGetCourseReviewsQuery,
  useSubmitCourseReviewMutation,
} = courseApi;
