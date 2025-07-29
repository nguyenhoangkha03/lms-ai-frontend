import { baseApi } from '@/lib/api/base-api';
import {
  LearningSession,
  LessonProgress,
  Note,
  InteractiveElement,
} from '@/types/learning';

export interface UpdateProgressRequest {
  lessonId: string;
  progressPercentage: number;
  timeSpent: number;
  lastPosition?: number;
  completed?: boolean;
}

export interface CreateNoteRequest {
  lessonId: string;
  content: string;
  timestamp?: number;
  isPrivate?: boolean;
}

export interface UpdateNoteRequest {
  content: string;
  timestamp?: number;
  isPrivate?: boolean;
}

export interface InteractiveResponse {
  elementId: string;
  response: any;
  isCorrect?: boolean;
  timeSpent: number;
}

export const learningApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    startLearningSession: builder.mutation<
      LearningSession,
      {
        courseId: string;
        lessonId: string;
      }
    >({
      query: data => ({
        url: '/analytics/data-collection/sessions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LearningSession'],
    }),

    endLearningSession: builder.mutation<
      void,
      {
        sessionId: string;
        totalTimeSpent: number;
        completedLessons?: string[];
      }
    >({
      query: ({ sessionId, ...data }) => ({
        url: `/analytics/data-collection/sessions/${sessionId}/end`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LearningSession', 'Progress'],
    }),

    // Lesson Progress
    updateLessonProgress: builder.mutation<
      LessonProgress,
      UpdateProgressRequest
    >({
      query: data => ({
        url: '/lessons/progress',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Progress'],
    }),

    getLessonProgress: builder.query<LessonProgress, string>({
      query: lessonId => `/lessons/${lessonId}/progress`,
      providesTags: (_result, _error, lessonId) => [
        { type: 'Progress', id: lessonId },
      ],
    }),

    getCourseProgress: builder.query<
      {
        overallProgress: number;
        completedLessons: string[];
        totalTimeSpent: number;
        lastAccessedLesson: string;
        lessonProgresses: LessonProgress[];
      },
      string
    >({
      query: courseId => `/courses/${courseId}/progress`,
      providesTags: (_result, _error, courseId) => [
        { type: 'Progress', id: courseId },
      ],
    }),

    // Notes
    getLessonNotes: builder.query<
      Note[],
      {
        lessonId: string;
        includePrivate?: boolean;
      }
    >({
      query: ({ lessonId, includePrivate = true }) => ({
        url: `/lessons/${lessonId}/notes`,
        params: { includePrivate },
      }),
      providesTags: (_result, _error, { lessonId }) => [
        { type: 'Note', id: lessonId },
      ],
    }),

    createNote: builder.mutation<Note, CreateNoteRequest>({
      query: data => ({
        url: '/notes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_result, _error, { lessonId }) => [
        { type: 'Note', id: lessonId },
      ],
    }),

    updateNote: builder.mutation<
      Note,
      {
        noteId: string;
        data: UpdateNoteRequest;
      }
    >({
      query: ({ noteId, data }) => ({
        url: `/notes/${noteId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Note'],
    }),

    deleteNote: builder.mutation<void, string>({
      query: noteId => ({
        url: `/notes/${noteId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Note'],
    }),

    // Interactive Elements
    getInteractiveElements: builder.query<InteractiveElement[], string>({
      query: lessonId => `/lessons/${lessonId}/interactive-elements`,
      providesTags: (_result, _error, lessonId) => [
        { type: 'Interactive', id: lessonId },
      ],
    }),

    submitInteractiveResponse: builder.mutation<
      {
        isCorrect: boolean;
        feedback: string;
        explanation?: string;
        score?: number;
      },
      InteractiveResponse
    >({
      query: data => ({
        url: '/interactive/responses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Interactive', 'Progress'],
    }),

    // Video Position Tracking
    updateVideoPosition: builder.mutation<
      void,
      {
        lessonId: string;
        position: number;
        duration: number;
      }
    >({
      query: data => ({
        url: '/lessons/video-position',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Progress'],
    }),

    getVideoPosition: builder.query<
      {
        position: number;
        duration: number;
        lastWatched: string;
      },
      string
    >({
      query: lessonId => `/lessons/${lessonId}/video-position`,
      providesTags: (_result, _error, lessonId) => [
        { type: 'Progress', id: `video-${lessonId}` },
      ],
    }),

    // Learning Analytics
    trackLearningActivity: builder.mutation<
      void,
      {
        sessionId?: string;
        lessonId: string;
        activityType:
          | 'video_start'
          | 'video_pause'
          | 'video_complete'
          | 'note_created'
          | 'interactive_completed';
        metadata?: Record<string, any>;
      }
    >({
      query: data => ({
        url: '/analytics/data-collection/activities',
        method: 'POST',
        body: data,
      }),
    }),

    // Lesson Resources
    getLessonResources: builder.query<
      {
        attachments: Array<{
          id: string;
          name: string;
          type: string;
          url: string;
          size: number;
          downloadable: boolean;
        }>;
        transcript?: string;
        subtitles?: Array<{
          language: string;
          url: string;
        }>;
      },
      string
    >({
      query: lessonId => `/lessons/${lessonId}/resources`,
      providesTags: (_result, _error, lessonId) => [
        { type: 'Resource', id: lessonId },
      ],
    }),

    // Bookmarks
    getBookmarks: builder.query<
      Array<{
        id: string;
        lessonId: string;
        timestamp: number;
        note?: string;
        createdAt: string;
      }>,
      string
    >({
      query: courseId => `/courses/${courseId}/bookmarks`,
      providesTags: ['Bookmark'],
    }),

    createBookmark: builder.mutation<
      void,
      {
        lessonId: string;
        timestamp: number;
        note?: string;
      }
    >({
      query: data => ({
        url: '/bookmarks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bookmark'],
    }),

    deleteBookmark: builder.mutation<void, string>({
      query: bookmarkId => ({
        url: `/bookmarks/${bookmarkId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookmark'],
    }),
  }),
});

export const {
  useStartLearningSessionMutation,
  useEndLearningSessionMutation,
  useUpdateLessonProgressMutation,
  useGetLessonProgressQuery,
  useGetCourseProgressQuery,
  useGetLessonNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useGetInteractiveElementsQuery,
  useSubmitInteractiveResponseMutation,
  useUpdateVideoPositionMutation,
  useGetVideoPositionQuery,
  useTrackLearningActivityMutation,
  useGetLessonResourcesQuery,
  useGetBookmarksQuery,
  useCreateBookmarkMutation,
  useDeleteBookmarkMutation,
} = learningApi;
