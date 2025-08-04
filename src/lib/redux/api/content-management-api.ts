import { baseApi } from '@/lib/api/base-api';
import {
  CategoriesQueryParams,
  Category,
  ContentAnalysisQueryParams,
  ContentModerationItem,
  ContentTag,
  Course,
  CoursesQueryParams,
  ModerationQueryParams,
  PlagiarismCheck,
  QualityAssessment,
  SimilarityRecord,
} from '@/lib/types/content-management';

export const contentManagementApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getCourses: builder.query<
      { courses: Course[]; total: number; totalPages: number },
      CoursesQueryParams
    >({
      query: params => ({
        url: '/course',
        params,
      }),
      providesTags: ['Courses'],
    }),

    getCourseById: builder.query<Course, string>({
      query: id => `/course/${id}`,
      providesTags: ['Courses'],
    }),
    createCourse: builder.mutation<Course, Partial<Course>>({
      query: data => ({
        url: '/course',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Courses'],
    }),

    updateCourse: builder.mutation<
      Course,
      { id: string; data: Partial<Course> }
    >({
      query: ({ id, data }) => ({
        url: `/course/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Courses'],
    }),

    deleteCourse: builder.mutation<void, string>({
      query: id => ({
        url: `/course/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Courses'],
    }),

    submitCourseForReview: builder.mutation<Course, string>({
      query: id => ({
        url: `/course/${id}/submit-for-review`,
        method: 'POST',
      }),
      invalidatesTags: ['Courses', 'Moderation'],
    }),

    approveCourse: builder.mutation<Course, { id: string; feedback?: string }>({
      query: ({ id, feedback }) => ({
        url: `/course/${id}/approve`,
        method: 'POST',
        body: { feedback },
      }),
      invalidatesTags: ['Courses', 'Moderation'],
    }),

    rejectCourse: builder.mutation<
      Course,
      { id: string; reason: string; feedback?: string }
    >({
      query: ({ id, reason, feedback }) => ({
        url: `/course/${id}/reject`,
        method: 'POST',
        body: { reason, feedback },
      }),
      invalidatesTags: ['Courses', 'Moderation'],
    }),

    publishCourse: builder.mutation<Course, string>({
      query: id => ({
        url: `/course/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: ['Courses'],
    }),

    unpublishCourse: builder.mutation<Course, string>({
      query: id => ({
        url: `/course/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: ['Courses'],
    }),

    getCoursesAwaitingApproval: builder.query<
      { courses: Course[]; total: number; totalPages: number },
      { page?: number; limit?: number }
    >({
      query: params => ({
        url: '/course/admin/awaiting-approval',
        params,
      }),
      providesTags: ['Courses', 'Moderation'],
    }),

    bulkDeleteCourses: builder.mutation<void, { courseIds: string[] }>({
      query: ({ courseIds }) => ({
        url: '/course/bulk',
        method: 'DELETE',
        body: { courseIds },
      }),
      invalidatesTags: ['Courses'],
    }),

    bulkUpdateCourseCategory: builder.mutation<
      void,
      { courseIds: string[]; categoryId: string }
    >({
      query: ({ courseIds, categoryId }) => ({
        url: '/course/bulk/category',
        method: 'PATCH',
        body: { courseIds, categoryId },
      }),
      invalidatesTags: ['Courses'],
    }),

    bulkUpdateCourseStatus: builder.mutation<
      void,
      { courseIds: string[]; status: string }
    >({
      query: ({ courseIds, status }) => ({
        url: '/course/bulk/status',
        method: 'PATCH',
        body: { courseIds, status },
      }),
      invalidatesTags: ['Courses'],
    }),

    bulkUpdateCourseTags: builder.mutation<
      void,
      { courseIds: string[]; tags: string[] }
    >({
      query: ({ courseIds, tags }) => ({
        url: '/course/bulk/tags',
        method: 'PATCH',
        body: { courseIds, tags },
      }),
      invalidatesTags: ['Courses'],
    }),

    getCourseStatistics: builder.query<any, string>({
      query: id => `/course/${id}/statistics`,
      providesTags: ['CourseStatistics'],
    }),

    getGlobalCourseStatistics: builder.query<any, void>({
      query: () => '/course/admin/statistics',
      providesTags: ['CourseStatistics'],
    }),

    getCategories: builder.query<
      { categories: Category[]; total: number; totalPages: number },
      CategoriesQueryParams
    >({
      query: params => ({
        url: '/categories',
        params,
      }),
      providesTags: ['Categories'],
    }),

    getCategoryHierarchy: builder.query<Category[], void>({
      query: () => '/categories/hierarchy',
      providesTags: ['Categories'],
    }),

    getCategoryById: builder.query<Category, string>({
      query: id => `/categories/${id}`,
      providesTags: ['Categories'],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      query: data => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    updateCategory: builder.mutation<
      Category,
      { id: string; data: Partial<Category> }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),

    // Delete category
    deleteCategory: builder.mutation<void, string>({
      query: id => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),

    // ========== CONTENT MODERATION ==========

    // Get content moderation queue
    getModerationQueue: builder.query<
      { items: ContentModerationItem[]; total: number; totalPages: number },
      ModerationQueryParams
    >({
      query: params => ({
        url: '/content-moderation/queue',
        params,
      }),
      providesTags: ['Moderation'],
    }),

    // Get moderation item by ID
    getModerationItemById: builder.query<ContentModerationItem, string>({
      query: id => `/content-moderation/${id}`,
      providesTags: ['Moderation'],
    }),

    // Moderate content
    moderateContent: builder.mutation<
      ContentModerationItem,
      {
        id: string;
        action: 'approve' | 'reject' | 'flag' | 'require_changes';
        reason?: string;
        feedback?: string;
      }
    >({
      query: ({ id, action, reason, feedback }) => ({
        url: `/content-moderation/${id}/moderate`,
        method: 'POST',
        body: { action, reason, feedback },
      }),
      invalidatesTags: ['Moderation', 'Courses'],
    }),

    // Bulk moderate content
    bulkModerateContent: builder.mutation<
      void,
      {
        itemIds: string[];
        action: 'approve' | 'reject' | 'flag';
        reason?: string;
      }
    >({
      query: ({ itemIds, action, reason }) => ({
        url: '/content-moderation/bulk-moderate',
        method: 'POST',
        body: { itemIds, action, reason },
      }),
      invalidatesTags: ['Moderation', 'Courses'],
    }),

    // ========== CONTENT ANALYSIS ==========

    // Content tagging
    getContentTags: builder.query<
      { tags: ContentTag[]; total: number; totalPages: number },
      ContentAnalysisQueryParams
    >({
      query: params => ({
        url: '/content-analysis/tagging',
        params,
      }),
      providesTags: ['ContentTags'],
    }),

    createContentTag: builder.mutation<ContentTag, Partial<ContentTag>>({
      query: data => ({
        url: '/content-analysis/tagging',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentTags'],
    }),

    updateContentTag: builder.mutation<
      ContentTag,
      { id: string; data: Partial<ContentTag> }
    >({
      query: ({ id, data }) => ({
        url: `/content-analysis/tagging/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['ContentTags'],
    }),

    deleteContentTag: builder.mutation<void, string>({
      query: id => ({
        url: `/content-analysis/tagging/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ContentTags'],
    }),

    generateContentTags: builder.mutation<
      { tags: ContentTag[] },
      {
        contentType: 'course' | 'lesson';
        contentId: string;
        categories?: string[];
        maxTags?: number;
        confidenceThreshold?: number;
      }
    >({
      query: data => ({
        url: '/content-analysis/tagging/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ContentTags'],
    }),

    getTagsForContent: builder.query<
      ContentTag[],
      { contentType: 'course' | 'lesson'; contentId: string }
    >({
      query: ({ contentType, contentId }) =>
        `/content-analysis/tagging/content/${contentType}/${contentId}`,
      providesTags: ['ContentTags'],
    }),

    verifyContentTag: builder.mutation<ContentTag, string>({
      query: id => ({
        url: `/content-analysis/tagging/${id}/verify`,
        method: 'PUT',
      }),
      invalidatesTags: ['ContentTags'],
    }),

    bulkVerifyContentTags: builder.mutation<void, { tagIds: string[] }>({
      query: ({ tagIds }) => ({
        url: '/content-analysis/tagging/bulk-verify',
        method: 'PUT',
        body: { tagIds },
      }),
      invalidatesTags: ['ContentTags'],
    }),

    // Quality assessment
    getQualityAssessments: builder.query<
      { assessments: QualityAssessment[]; total: number; totalPages: number },
      ContentAnalysisQueryParams
    >({
      query: params => ({
        url: '/content-analysis/quality',
        params,
      }),
      providesTags: ['QualityAssessments'],
    }),

    assessContentQuality: builder.mutation<
      QualityAssessment,
      {
        contentType: 'course' | 'lesson';
        contentId: string;
        options?: {
          includeStructure?: boolean;
          includeEngagement?: boolean;
          includeAccessibility?: boolean;
        };
      }
    >({
      query: data => ({
        url: '/content-analysis/quality/assess',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QualityAssessments'],
    }),

    bulkAssessContentQuality: builder.mutation<
      void,
      {
        items: Array<{
          contentType: 'course' | 'lesson';
          contentId: string;
        }>;
        options?: {
          includeStructure?: boolean;
          includeEngagement?: boolean;
          includeAccessibility?: boolean;
        };
      }
    >({
      query: data => ({
        url: '/content-analysis/quality/bulk-assess',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QualityAssessments'],
    }),

    getQualityStatistics: builder.query<any, { period?: string }>({
      query: params => ({
        url: '/content-analysis/quality/statistics',
        params,
      }),
      providesTags: ['QualityStatistics'],
    }),

    getQualityTrends: builder.query<
      any,
      { contentType: 'course' | 'lesson'; contentId: string; period?: string }
    >({
      query: ({ contentType, contentId, period }) => ({
        url: `/content-analysis/quality/trends/${contentType}/${contentId}`,
        params: { period },
      }),
      providesTags: ['QualityTrends'],
    }),

    // Plagiarism detection
    getPlagiarismChecks: builder.query<
      { checks: PlagiarismCheck[]; total: number; totalPages: number },
      ContentAnalysisQueryParams
    >({
      query: params => ({
        url: '/content-analysis/plagiarism',
        params,
      }),
      providesTags: ['PlagiarismChecks'],
    }),

    getPlagiarismCheckById: builder.query<PlagiarismCheck, string>({
      query: id => `/content-analysis/plagiarism/${id}`,
      providesTags: ['PlagiarismChecks'],
    }),

    checkPlagiarism: builder.mutation<
      PlagiarismCheck,
      {
        contentType: 'course' | 'lesson' | 'assignment' | 'forum_post';
        contentId: string;
        configuration?: {
          sensitivity?: 'low' | 'medium' | 'high';
          excludeQuotes?: boolean;
          excludeReferences?: boolean;
          minimumMatchLength?: number;
        };
      }
    >({
      query: data => ({
        url: '/content-analysis/plagiarism/check',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PlagiarismChecks'],
    }),

    bulkCheckPlagiarism: builder.mutation<
      void,
      {
        items: Array<{
          contentType: 'course' | 'lesson' | 'assignment' | 'forum_post';
          contentId: string;
        }>;
        configuration?: {
          sensitivity?: 'low' | 'medium' | 'high';
          excludeQuotes?: boolean;
          excludeReferences?: boolean;
          minimumMatchLength?: number;
        };
      }
    >({
      query: data => ({
        url: '/content-analysis/plagiarism/bulk-check',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PlagiarismChecks'],
    }),

    getPlagiarismStatistics: builder.query<any, { period?: string }>({
      query: params => ({
        url: '/content-analysis/plagiarism/statistics/overview',
        params,
      }),
      providesTags: ['PlagiarismStatistics'],
    }),

    // Similarity detection
    getSimilarityRecords: builder.query<
      { records: SimilarityRecord[]; total: number; totalPages: number },
      ContentAnalysisQueryParams
    >({
      query: params => ({
        url: '/content-analysis/similarity',
        params,
      }),
      providesTags: ['SimilarityRecords'],
    }),

    analyzeSimilarity: builder.mutation<
      SimilarityRecord,
      {
        sourceContentType: 'course' | 'lesson';
        sourceContentId: string;
        targetContentType: 'course' | 'lesson';
        targetContentId: string;
        similarityType?:
          | 'semantic'
          | 'structural'
          | 'topic'
          | 'difficulty'
          | 'comprehensive';
      }
    >({
      query: data => ({
        url: '/content-analysis/similarity/analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SimilarityRecords'],
    }),

    bulkAnalyzeSimilarity: builder.mutation<
      void,
      {
        sourceContentType: 'course' | 'lesson';
        sourceContentId: string;
        targets: Array<{
          contentType: 'course' | 'lesson';
          contentId: string;
        }>;
        similarityType?:
          | 'semantic'
          | 'structural'
          | 'topic'
          | 'difficulty'
          | 'comprehensive';
      }
    >({
      query: data => ({
        url: '/content-analysis/similarity/bulk-analyze',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SimilarityRecords'],
    }),

    getSimilarContent: builder.query<
      SimilarityRecord[],
      {
        contentType: 'course' | 'lesson';
        contentId: string;
        threshold?: number;
        limit?: number;
      }
    >({
      query: ({ contentType, contentId, threshold, limit }) => ({
        url: `/content-analysis/similarity/similar/${contentType}/${contentId}`,
        params: { threshold, limit },
      }),
      providesTags: ['SimilarityRecords'],
    }),

    // Content analysis dashboard
    getContentAnalysisDashboard: builder.query<any, void>({
      query: () => '/content-analysis/dashboard',
      providesTags: ['ContentAnalysisDashboard'],
    }),

    getContentAnalysis: builder.query<
      any,
      { contentType: 'course' | 'lesson'; contentId: string }
    >({
      query: ({ contentType, contentId }) =>
        `/content-analysis/content/${contentType}/${contentId}/analysis`,
      providesTags: ['ContentAnalysis'],
    }),
  }),
});

// Export hooks
export const {
  // Course management hooks
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useSubmitCourseForReviewMutation,
  useApproveCourseMutation,
  useRejectCourseMutation,
  usePublishCourseMutation,
  useUnpublishCourseMutation,
  useGetCoursesAwaitingApprovalQuery,
  useBulkDeleteCoursesMutation,
  useBulkUpdateCourseCategoryMutation,
  useBulkUpdateCourseStatusMutation,
  useBulkUpdateCourseTagsMutation,
  useGetCourseStatisticsQuery,
  useGetGlobalCourseStatisticsQuery,

  // Category management hooks
  useGetCategoriesQuery,
  useGetCategoryHierarchyQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Content moderation hooks
  useGetModerationQueueQuery,
  useGetModerationItemByIdQuery,
  useModerateContentMutation,
  useBulkModerateContentMutation,

  // Content analysis hooks
  useGetContentTagsQuery,
  useCreateContentTagMutation,
  useUpdateContentTagMutation,
  useDeleteContentTagMutation,
  useGenerateContentTagsMutation,
  useGetTagsForContentQuery,
  useVerifyContentTagMutation,
  useBulkVerifyContentTagsMutation,

  // Quality assessment hooks
  useGetQualityAssessmentsQuery,
  useAssessContentQualityMutation,
  useBulkAssessContentQualityMutation,
  useGetQualityStatisticsQuery,
  useGetQualityTrendsQuery,

  // Plagiarism detection hooks
  useGetPlagiarismChecksQuery,
  useGetPlagiarismCheckByIdQuery,
  useCheckPlagiarismMutation,
  useBulkCheckPlagiarismMutation,
  useGetPlagiarismStatisticsQuery,

  // Similarity detection hooks
  useGetSimilarityRecordsQuery,
  useAnalyzeSimilarityMutation,
  useBulkAnalyzeSimilarityMutation,
  useGetSimilarContentQuery,

  // Dashboard hooks
  useGetContentAnalysisDashboardQuery,
  useGetContentAnalysisQuery,
} = contentManagementApi;
