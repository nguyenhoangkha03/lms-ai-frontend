import { baseApi } from '@/lib/api/base-api';

export interface CourseCreationStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  order: number;
  validationRules?: string[];
  requiredFields?: string[];
}

export interface CourseDraft {
  id?: string;
  step: number;
  basicInfo: {
    title: string;
    subtitle: string;
    description: string;
    categoryId: string;
    subcategoryId?: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'all_levels';
    language: string;
    duration: {
      hours: number;
      minutes: number;
    };
    tags: string[];
    requirements: string[];
    whatYouWillLearn: string[];
    targetAudience: string[];
  };
  curriculum: {
    sections: CourseSection[];
    totalLessons: number;
    totalDuration: number;
  };
  content: {
    thumbnail?: File | string;
    trailerVideo?: File | string;
    courseImage?: File | string;
    materials: CourseMaterial[];
  };
  pricing: {
    isFree: boolean;
    price: number;
    currency: string;
    originalPrice?: number;
    pricingModel: 'free' | 'paid' | 'subscription' | 'freemium';
    accessDuration?: number;
    lifetimeAccess: boolean;
  };
  settings: {
    allowReviews: boolean;
    allowDiscussions: boolean;
    hasCertificate: boolean;
    enrollmentLimit?: number;
    availableFrom?: string;
    availableUntil?: string;
    isPublic: boolean;
    requiresApproval: boolean;
  };
  metadata: {
    lastModified: string;
    completionPercentage: number;
    autoSave: boolean;
    isDraft: boolean;
  };
}

export interface CourseSection {
  id?: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons: CourseLessonDraft[];
  isExpanded?: boolean;
  estimatedDuration: number;
}

export interface CourseLessonDraft {
  id?: string;
  title: string;
  description?: string;
  lessonType:
    | 'video'
    | 'text'
    | 'audio'
    | 'interactive'
    | 'quiz'
    | 'assignment';
  orderIndex: number;
  content?: {
    text?: string;
    videoFile?: File | string;
    audioFile?: File | string;
    attachments?: File[] | string[];
  };
  estimatedDuration: number;
  isPreview: boolean;
  isMandatory: boolean;
  objectives?: string[];
  hasQuiz: boolean;
  hasAssignment: boolean;
}

export interface CourseMaterial {
  id?: string;
  name: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'audio' | 'other';
  file?: File;
  url?: string;
  size?: number;
  description?: string;
  isDownloadable: boolean;
  orderIndex: number;
}

export interface AIContentSuggestion {
  id: string;
  type:
    | 'title'
    | 'description'
    | 'outline'
    | 'lesson_content'
    | 'quiz_questions'
    | 'objectives';
  content: string;
  confidence: number;
  source: 'ai_generated' | 'template' | 'similar_courses';
  metadata: {
    modelVersion: string;
    generatedAt: string;
    prompt?: string;
    relatedCourses?: string[];
    tags?: string[];
  };
  isApplied: boolean;
  feedback?: {
    isHelpful: boolean;
    comment?: string;
    rating?: number;
  };
}

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  structure: {
    sections: {
      title: string;
      lessons: {
        title: string;
        type: string;
        estimatedDuration: number;
      }[];
    }[];
  };
  metadata: {
    usage_count: number;
    rating: number;
    tags: string[];
  };
}

export interface CourseValidationResult {
  isValid: boolean;
  step: number;
  errors: {
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }[];
  suggestions: {
    field: string;
    message: string;
    action?: string;
  }[];
  completionPercentage: number;
  readinessScore: number;
}

export interface FileUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
  url?: string;
}

// ==================== API ENDPOINTS ====================
export const courseCreationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Course Creation Wizard Steps
    getCourseCreationSteps: builder.query<CourseCreationStep[], void>({
      query: () => '/course/creation/steps',
      providesTags: ['CourseCreation'],
    }),

    // Draft Management
    createCourseDraft: builder.mutation<CourseDraft, Partial<CourseDraft>>({
      query: draft => ({
        url: '/course/draft',
        method: 'POST',
        body: draft,
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    updateCourseDraft: builder.mutation<
      CourseDraft,
      { id: string; draft: Partial<CourseDraft> }
    >({
      query: ({ id, draft }) => ({
        url: `/course/draft/${id}`,
        method: 'PATCH',
        body: draft,
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    getCourseDraft: builder.query<CourseDraft, string>({
      query: id => `/course/draft/${id}`,
      providesTags: ['CourseDraft'],
    }),

    getMyCourseDrafts: builder.query<CourseDraft[], void>({
      query: () => '/course/draft/my-drafts',
      providesTags: ['CourseDraft'],
    }),

    deleteCourseDraft: builder.mutation<void, string>({
      query: id => ({
        url: `/course/draft/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    // Auto-save functionality
    autoSaveCourseDraft: builder.mutation<
      void,
      { id: string; data: Partial<CourseDraft> }
    >({
      query: ({ id, data }) => ({
        url: `/course/draft/${id}/auto-save`,
        method: 'PATCH',
        body: data,
      }),
    }),

    // Course Templates
    getCourseTemplates: builder.query<
      CourseTemplate[],
      { category?: string; level?: string; limit?: number }
    >({
      query: params => ({
        url: '/course/templates',
        params,
      }),
      providesTags: ['CourseTemplate'],
    }),

    getCourseTemplate: builder.query<CourseTemplate, string>({
      query: id => `/course/templates/${id}`,
      providesTags: ['CourseTemplate'],
    }),

    createCourseFromTemplate: builder.mutation<
      CourseDraft,
      { templateId: string; customizations?: Partial<CourseDraft> }
    >({
      query: ({ templateId, customizations }) => ({
        url: `/course/templates/${templateId}/create`,
        method: 'POST',
        body: customizations,
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    // AI Content Suggestions
    getAIContentSuggestions: builder.query<
      AIContentSuggestion[],
      {
        courseId?: string;
        type?: string;
        context?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/course/ai-suggestions',
        params,
      }),
      providesTags: ['AISuggestions'],
    }),

    generateAIContentSuggestion: builder.mutation<
      AIContentSuggestion,
      {
        type: string;
        context: string;
        courseData?: Partial<CourseDraft>;
        customPrompt?: string;
        assessmentType?: string;
      }
    >({
      query: data => ({
        url: '/course/ai-suggestions/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AISuggestions'],
    }),

    applyAISuggestion: builder.mutation<
      void,
      {
        suggestionId: string;
        courseId: string;
        fieldPath: string;
        feedback?: { isHelpful: boolean; comment?: string };
      }
    >({
      query: data => ({
        url: '/course/ai-suggestions/apply',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CourseDraft', 'AISuggestions'],
    }),

    // Content Upload
    uploadCourseContent: builder.mutation<
      { url: string; fileId: string },
      {
        file: File;
        type: 'thumbnail' | 'trailer' | 'video' | 'material' | 'image';
        courseId?: string;
        onProgress?: (progress: number) => void;
      }
    >({
      query: ({ file, type, courseId }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (courseId) formData.append('courseId', courseId);

        return {
          url: '/course/upload',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['CourseContent'],
    }),

    // Bulk upload for lesson content
    uploadLessonContent: builder.mutation<
      { uploadedFiles: { fileId: string; url: string; type: string }[] },
      {
        files: File[];
        lessonId?: string;
        courseId: string;
        onProgress?: (fileProgress: FileUploadProgress[]) => void;
      }
    >({
      query: ({ files, lessonId, courseId }) => {
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`files[${index}]`, file);
        });
        if (lessonId) formData.append('lessonId', lessonId);
        formData.append('courseId', courseId);

        return {
          url: '/course/upload/lesson-content',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ['LessonContent'],
    }),

    // Course Validation
    validateCourse: builder.mutation<CourseValidationResult, string>({
      query: courseId => ({
        url: `/course/${courseId}/validate`,
        method: 'POST',
      }),
    }),

    validateCourseDraft: builder.mutation<CourseValidationResult, string>({
      query: draftId => ({
        url: `/course/draft/${draftId}/validate`,
        method: 'POST',
      }),
    }),

    // Course Publication
    publishCourse: builder.mutation<
      { courseId: string; status: string },
      { draftId: string; publishOptions?: { submitForReview?: boolean } }
    >({
      query: ({ draftId, publishOptions }) => ({
        url: `/course/draft/${draftId}/publish`,
        method: 'POST',
        body: publishOptions,
      }),
      invalidatesTags: ['CourseDraft', 'Course'],
    }),

    // Course Preview
    previewCourse: builder.mutation<
      { previewUrl: string; expiresAt: string },
      string
    >({
      query: draftId => ({
        url: `/course/draft/${draftId}/preview`,
        method: 'POST',
      }),
    }),

    // Curriculum Builder
    reorderCourseSections: builder.mutation<
      void,
      {
        courseId: string;
        sections: { id: string; orderIndex: number }[];
      }
    >({
      query: ({ courseId, sections }) => ({
        url: `/course/${courseId}/sections/reorder`,
        method: 'PATCH',
        body: { sections },
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    reorderSectionLessons: builder.mutation<
      void,
      {
        sectionId: string;
        lessons: { id: string; orderIndex: number }[];
      }
    >({
      query: ({ sectionId, lessons }) => ({
        url: `/course/sections/${sectionId}/lessons/reorder`,
        method: 'PATCH',
        body: { lessons },
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    // Duplicate course functionality
    duplicateCourse: builder.mutation<
      CourseDraft,
      { courseId: string; newTitle?: string }
    >({
      query: ({ courseId, newTitle }) => ({
        url: `/course/${courseId}/duplicate`,
        method: 'POST',
        body: { newTitle },
      }),
      invalidatesTags: ['CourseDraft'],
    }),

    // Course Analytics for creation process
    getCourseCreationAnalytics: builder.query<
      {
        averageTimeToComplete: number;
        mostUsedTemplates: string[];
        commonStoppingPoints: number[];
        successRate: number;
      },
      void
    >({
      query: () => '/course/creation/analytics',
      providesTags: ['CourseCreationAnalytics'],
    }),
  }),
});

export const {
  useGetCourseCreationStepsQuery,
  useCreateCourseDraftMutation,
  useUpdateCourseDraftMutation,
  useGetCourseDraftQuery,
  useGetMyCourseDraftsQuery,
  useDeleteCourseDraftMutation,
  useAutoSaveCourseDraftMutation,
  useGetCourseTemplatesQuery,
  useGetCourseTemplateQuery,
  useCreateCourseFromTemplateMutation,
  useGetAIContentSuggestionsQuery,
  useGenerateAIContentSuggestionMutation,
  useApplyAISuggestionMutation,
  useUploadCourseContentMutation,
  useUploadLessonContentMutation,
  useValidateCourseMutation,
  useValidateCourseDraftMutation,
  usePublishCourseMutation,
  usePreviewCourseMutation,
  useReorderCourseSectionsMutation,
  useReorderSectionLessonsMutation,
  useDuplicateCourseMutation,
  useGetCourseCreationAnalyticsQuery,
} = courseCreationApi;
