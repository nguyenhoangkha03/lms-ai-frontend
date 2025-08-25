import { baseApi } from '@/lib/api/base-api';

export interface CreateLessonDto {
  courseId: string;
  sectionId?: string;
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  audioUrl?: string;
  lessonType: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  isActive?: boolean;
  orderIndex?: number;
  isPreview?: boolean;
  isMandatory?: boolean;
  estimatedDuration?: number;
  points?: number;
  availableFrom?: string;
  availableUntil?: string;
  thumbnailUrl?: string;
  objectives?: string[];
  prerequisites?: string[];
  interactiveElements?: Record<string, any>;
  transcript?: any[];
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateLessonDto {
  title?: string;
  description?: string;
  content?: string;
  lessonType?: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  orderIndex?: number;
  duration?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  videoDuration?: number;
  availableUntil?: string;
  audioUrl?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileSize: number;
    mimeType: string;
  }>;
  isPreview?: boolean;
  isMandatory?: boolean;
  estimatedDuration?: number;
  points?: number;
  availableFrom?: string;
  tags?: string[];
  objectives?: string[];
  materials?: string[];
  settings?: Record<string, any>;
  status?: 'draft' | 'published' | 'archived';
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  lessonType: 'video' | 'text' | 'quiz' | 'assignment' | 'interactive';
  orderIndex: number;
  duration: number;
  isPreview: boolean;
  isMandatory: boolean;
  estimatedDuration: number;
  audioUrl?: string;
  videoUrl?: string;
  videoDuration?: number;
  availableUntil?: string;
  thumbnailUrl?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    fileSize: number;
    mimeType: string;
  }>;
  points: number;
  prerequisites?: string[];
  objectives?: string[];
  transcript?: any[];
  interactiveElements?: Record<string, any>;
  availableFrom?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  materials?: string[];
  settings?: {
    allowComments: boolean;
    showProgress: boolean;
    allowDownload: boolean;
    autoPlay: boolean;
    showTranscript: boolean;
  };
  sectionId: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  section?: any;
  files?: any[];
  // Computed
  formattedDuration: string;
  metadata?: {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tags: string[];
    language: string;
  };
}

export interface CreateSectionDto {
  courseId: string;
  title: string;
  description?: string;
  orderIndex?: number;
  isRequired?: boolean;
  objectives?: string[];
  availableFrom?: string;
  availableUntil?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateSectionDto {
  title?: string;
  description?: string;
  orderIndex?: number;
  isRequired?: boolean;
  objectives?: string[];
  isActive?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface CourseSection {
  data: {
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
    isActive: boolean;
    isRequired: boolean;
    totalLessons: number;
    totalDuration: number;
    objectives?: string[];
    courseId: string;
    availableFrom?: string;
    availableUntil?: string;
    settings: {
      allowDownloads: boolean;
      requireSequentialAccess: boolean;
      completionCriteria: 'all_lessons' | 'percentage' | 'time_based';
    };
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    // Relations
    lessons?: Lesson[];
    // Computed
    formattedDuration: string;
    isAvailable: boolean;
  };
  lessons: Lesson[];
}

export interface ReorderLessonsDto {
  sectionId: string;
  lessonIds: string[];
}

export interface ReorderSectionsDto {
  courseId: string;
  sectionIds: string[];
}

export const teacherLessonsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // === SECTION ENDPOINTS === //
    createSection: builder.mutation<CourseSection, CreateSectionDto>({
      query: data => ({
        url: '/course-sections',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Section'],
    }),

    getSectionsByCourse: builder.query<CourseSection[], string>({
      query: courseId =>
        `/course-sections?courseId=${courseId}&includeLessons=true`,
      providesTags: ['Section'],
    }),

    updateSection: builder.mutation<
      CourseSection,
      { id: string; data: UpdateSectionDto }
    >({
      query: ({ id, data }) => ({
        url: `/course-sections/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Section'],
    }),

    deleteSection: builder.mutation<void, string>({
      query: id => ({
        url: `/course-sections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Section'],
    }),

    reorderSections: builder.mutation<void, ReorderSectionsDto>({
      query: data => ({
        url: '/course-sections/reorder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Section'],
    }),

    // === LESSON ENDPOINTS === //
    createLesson: builder.mutation<Lesson, CreateLessonDto>({
      query: data => ({
        url: '/lessons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Lesson', 'Section'],
    }),

    getLessonsBySection: builder.query<Lesson[], string>({
      query: sectionId => `/lessons?sectionId=${sectionId}`,
      providesTags: ['Lesson'],
    }),

    getLesson: builder.query<Lesson, { id: string; includeContent?: boolean }>({
      query: ({ id, includeContent = true }) =>
        `/lessons/${id}?includeContent=${includeContent}`,
      providesTags: ['Lesson'],
    }),

    updateLesson: builder.mutation<
      Lesson,
      { id: string; data: UpdateLessonDto }
    >({
      query: ({ id, data }) => ({
        url: `/lessons/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Lesson', 'Section'],
    }),

    deleteLesson: builder.mutation<void, string>({
      query: id => ({
        url: `/lessons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lesson', 'Section'],
    }),

    publishLesson: builder.mutation<Lesson, string>({
      query: id => ({
        url: `/lessons/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Lesson'],
    }),

    getLessonsQuery: builder.query<
      {
        lessons: Lesson[];
        total: number;
        page: number;
        limit: number;
      },
      {
        courseId: string;
        lessonId?: string;
        status?: string;
        limit?: number;
        page?: number;
      }
    >({
      query: ({ courseId, ...params }) => ({
        url: `/lessons/course/${courseId}`,
        params,
      }),
      providesTags: ['Lesson'],
    }),

    reorderLessons: builder.mutation<void, ReorderLessonsDto>({
      query: data => ({
        url: '/lessons/reorder',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Lesson'],
    }),

    // === FILE UPLOAD ENDPOINTS === //
    uploadLessonFiles: builder.mutation<
      any[],
      { lessonId: string; files: FormData }
    >({
      query: ({ lessonId, files }) => ({
        url: `/lessons/${lessonId}/files`,
        method: 'POST',
        body: files,
      }),
      invalidatesTags: ['Lesson'],
    }),

    uploadLessonVideo: builder.mutation<
      any,
      { lessonId: string; video: FormData }
    >({
      query: ({ lessonId, video }) => ({
        url: `/lessons/${lessonId}/video`,
        method: 'POST',
        body: video,
      }),
      invalidatesTags: ['Lesson'],
    }),

    getLessonFiles: builder.query<any[], string>({
      query: lessonId => `/lessons/${lessonId}/files`,
      providesTags: ['Lesson'],
    }),

    deleteLessonFile: builder.mutation<
      void,
      { lessonId: string; fileId: string }
    >({
      query: ({ lessonId, fileId }) => ({
        url: `/lessons/${lessonId}/files/${fileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Lesson'],
    }),

    getVideoStreamUrl: builder.query<{ streamUrl: string }, string>({
      query: lessonId => `/lessons/${lessonId}/video/stream`,
    }),
  }),
});

export const {
  // Section hooks
  useCreateSectionMutation,
  useGetSectionsByCourseQuery,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,

  // Lesson hooks
  useCreateLessonMutation,
  useGetLessonsBySectionQuery,
  useGetLessonQuery,
  useGetLessonsQueryQuery: useGetLessonsQuery,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  usePublishLessonMutation,
  useReorderLessonsMutation,

  // File upload hooks
  useUploadLessonFilesMutation,
  useUploadLessonVideoMutation,
  useGetLessonFilesQuery,
  useDeleteLessonFileMutation,
  useGetVideoStreamUrlQuery,
} = teacherLessonsApi;
