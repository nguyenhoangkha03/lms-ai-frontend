import { baseApi } from './base-api';
import { API_ENDPOINTS } from '@/constants';
import type { Lesson, LessonProgress } from '@/types';

export const lessonApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get lesson by ID
    getLesson: builder.query<Lesson, string>({
      query: id => API_ENDPOINTS.LESSONS.DETAIL(id),
      providesTags: (result, error, id) => [{ type: 'Lesson', id }],
    }),

    // Get lesson progress
    getLessonProgress: builder.query<LessonProgress, string>({
      query: lessonId => API_ENDPOINTS.LESSONS.PROGRESS(lessonId),
      providesTags: (result, error, lessonId) => [
        { type: 'Progress', id: lessonId },
      ],
    }),

    // Update lesson progress
    updateLessonProgress: builder.mutation<
      LessonProgress,
      { lessonId: string; progress: Partial<LessonProgress> }
    >({
      query: ({ lessonId, progress }) => ({
        url: API_ENDPOINTS.LESSONS.PROGRESS(lessonId),
        method: 'PUT',
        body: progress,
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        { type: 'Progress', id: lessonId },
        'Course',
      ],
    }),

    // Mark lesson as complete
    completeLesson: builder.mutation<LessonProgress, string>({
      query: lessonId => ({
        url: API_ENDPOINTS.LESSONS.COMPLETE(lessonId),
        method: 'POST',
      }),
      invalidatesTags: (result, error, lessonId) => [
        { type: 'Progress', id: lessonId },
        'Course',
      ],
    }),

    // Save lesson notes
    saveLessonNotes: builder.mutation<
      void,
      { lessonId: string; notes: string }
    >({
      query: ({ lessonId, notes }) => ({
        url: `${API_ENDPOINTS.LESSONS.DETAIL(lessonId)}/notes`,
        method: 'PUT',
        body: { notes },
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        { type: 'Progress', id: lessonId },
      ],
    }),

    // Save video bookmarks
    saveBookmarks: builder.mutation<
      void,
      { lessonId: string; bookmarks: number[] }
    >({
      query: ({ lessonId, bookmarks }) => ({
        url: `${API_ENDPOINTS.LESSONS.DETAIL(lessonId)}/bookmarks`,
        method: 'PUT',
        body: { bookmarks },
      }),
      invalidatesTags: (result, error, { lessonId }) => [
        { type: 'Progress', id: lessonId },
      ],
    }),
  }),
});

export const {
  useGetLessonQuery,
  useGetLessonProgressQuery,
  useUpdateLessonProgressMutation,
  useCompleteLessonMutation,
  useSaveLessonNotesMutation,
  useSaveBookmarksMutation,
} = lessonApi;
