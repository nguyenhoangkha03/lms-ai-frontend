import { baseApi } from '@/lib/api/base-api';

// ==================== TYPES AND INTERFACES ====================

export interface TeacherAnnouncement {
  id: string;
  teacherId: string;
  title: string;
  content: string;
  courseId?: string;
  courseName?: string;
  targetAudience: 'all_students' | 'specific_course' | 'specific_students';
  specificStudentIds?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  scheduledAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  attachments: string[];
  tags: string[];
  allowComments: boolean;
  sendEmail: boolean;
  sendPush: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  courseId?: string;
  targetAudience: 'all_students' | 'specific_course' | 'specific_students';
  specificStudentIds?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: string;
  expiresAt?: string;
  attachments?: string[];
  tags?: string[];
  allowComments: boolean;
  sendEmail: boolean;
  sendPush: boolean;
}

export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  courseId?: string;
  targetAudience?: 'all_students' | 'specific_course' | 'specific_students';
  specificStudentIds?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: string;
  expiresAt?: string;
  attachments?: string[];
  tags?: string[];
  allowComments?: boolean;
  sendEmail?: boolean;
  sendPush?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface AnnouncementAnalytics {
  announcementId: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  clickThroughRate: number;
  engagementRate: number;
  reachStats: {
    totalStudents: number;
    viewedStudents: number;
    emailOpens: number;
    pushOpens: number;
  };
  timeStats: {
    averageReadTime: number;
    peakViewHours: number[];
  };
  demographics: {
    byGrade: { grade: string; count: number }[];
    byCourse: { courseName: string; count: number }[];
  };
}

export interface AnnouncementStatistics {
  totalAnnouncements: number;
  publishedAnnouncements: number;
  draftAnnouncements: number;
  archivedAnnouncements: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageEngagement: number;
  topPerformingAnnouncements: {
    id: string;
    title: string;
    viewCount: number;
    engagementRate: number;
  }[];
  recentActivity: {
    date: string;
    announcements: number;
    views: number;
    engagements: number;
  }[];
}

export interface BulkActionRequest {
  announcementIds: string[];
  action: 'publish' | 'archive' | 'delete';
}

export interface DuplicateAnnouncementRequest {
  title?: string;
  courseId?: string;
}

// ==================== API ENDPOINTS ====================

export const teacherAnnouncementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all announcements
    getAnnouncements: builder.query<
      {
        announcements: TeacherAnnouncement[];
        totalCount: number;
        pagination: {
          currentPage: number;
          totalPages: number;
          hasMore: boolean;
        };
      },
      {
        limit?: number;
        offset?: number;
        courseId?: string;
        status?: 'draft' | 'published' | 'archived';
      }
    >({
      query: ({ limit = 20, offset = 0, courseId, status }) => ({
        url: '/teacher/announcements',
        params: { limit, offset, courseId, status },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: any;
      }) => response.data,
      providesTags: ['Announcements'],
    }),

    // Get announcement by ID
    getAnnouncementById: builder.query<TeacherAnnouncement, string>({
      query: (id) => `/teacher/announcements/${id}`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherAnnouncement;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Announcements', id }],
    }),

    // Create new announcement
    createAnnouncement: builder.mutation<TeacherAnnouncement, CreateAnnouncementRequest>({
      query: (announcementData) => ({
        url: '/teacher/announcements',
        method: 'POST',
        body: announcementData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherAnnouncement;
      }) => response.data,
      invalidatesTags: ['Announcements'],
    }),

    // Update announcement
    updateAnnouncement: builder.mutation<
      TeacherAnnouncement,
      { id: string; updateData: UpdateAnnouncementRequest }
    >({
      query: ({ id, updateData }) => ({
        url: `/teacher/announcements/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherAnnouncement;
      }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        'Announcements',
        { type: 'Announcements', id },
      ],
    }),

    // Delete announcement
    deleteAnnouncement: builder.mutation<void, string>({
      query: (id) => ({
        url: `/teacher/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcements'],
    }),

    // Publish announcement
    publishAnnouncement: builder.mutation<TeacherAnnouncement, string>({
      query: (id) => ({
        url: `/teacher/announcements/${id}/publish`,
        method: 'POST',
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherAnnouncement;
      }) => response.data,
      invalidatesTags: (result, error, id) => [
        'Announcements',
        { type: 'Announcements', id },
      ],
    }),

    // Archive announcement
    archiveAnnouncement: builder.mutation<void, string>({
      query: (id) => ({
        url: `/teacher/announcements/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Announcements',
        { type: 'Announcements', id },
      ],
    }),

    // Get announcement analytics
    getAnnouncementAnalytics: builder.query<AnnouncementAnalytics, string>({
      query: (id) => `/teacher/announcements/${id}/analytics`,
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AnnouncementAnalytics;
      }) => response.data,
      providesTags: (result, error, id) => [{ type: 'AnnouncementAnalytics', id }],
    }),

    // Get announcement statistics
    getAnnouncementStatistics: builder.query<
      AnnouncementStatistics,
      { dateRange?: '7d' | '30d' | '90d' | '1y' }
    >({
      query: ({ dateRange = '30d' }) => ({
        url: '/teacher/announcements/statistics/overview',
        params: { dateRange },
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: AnnouncementStatistics;
      }) => response.data,
      providesTags: ['AnnouncementStatistics'],
    }),

    // Duplicate announcement
    duplicateAnnouncement: builder.mutation<
      TeacherAnnouncement,
      { id: string; options?: DuplicateAnnouncementRequest }
    >({
      query: ({ id, options = {} }) => ({
        url: `/teacher/announcements/${id}/duplicate`,
        method: 'POST',
        body: options,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: TeacherAnnouncement;
      }) => response.data,
      invalidatesTags: ['Announcements'],
    }),

    // Bulk actions
    bulkActions: builder.mutation<
      { processedCount: number },
      BulkActionRequest
    >({
      query: (bulkActionData) => ({
        url: '/teacher/announcements/bulk-actions',
        method: 'POST',
        body: bulkActionData,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { processedCount: number };
      }) => response.data,
      invalidatesTags: ['Announcements'],
    }),

    // Upload announcement attachment
    uploadAnnouncementAttachment: builder.mutation<
      { fileName: string; fileUrl: string },
      File
    >({
      query: (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return {
          url: '/teacher/announcements/upload-attachment',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: {
        success: boolean;
        message: string;
        data: { fileName: string; fileUrl: string };
      }) => response.data,
    }),
  }),
});

// Export hooks
export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
  useArchiveAnnouncementMutation,
  useGetAnnouncementAnalyticsQuery,
  useGetAnnouncementStatisticsQuery,
  useDuplicateAnnouncementMutation,
  useBulkActionsMutation,
  useUploadAnnouncementAttachmentMutation,
} = teacherAnnouncementsApi;