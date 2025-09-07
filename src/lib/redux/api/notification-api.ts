import { baseApi } from '@/lib/api/base-api';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement' | 'assignment' | 'grade' | 'message' | 'system';
  category: 'course' | 'assignment' | 'grade' | 'message' | 'system' | 'achievement' | 'reminder';
  isRead: boolean;
  isImportant: boolean;
  isFavorite: boolean;
  actionUrl?: string;
  actionText?: string;
  data?: Record<string, any>;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  courseId?: string;
  courseName?: string;
  createdAt: string;
  readAt?: string;
  priority: 'low' | 'medium' | 'high';
  userId: string;
  iconUrl?: string;
  description?: string;
}

export interface NotificationSettings {
  id: string;
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  
  // Notification Categories
  courseUpdates: boolean;
  assignmentReminders: boolean;
  gradeNotifications: boolean;
  messageNotifications: boolean;
  achievementNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
  socialActivity: boolean;
  
  // Timing Settings
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'instant' | 'daily' | 'weekly';
  
  // Advanced Settings
  digestEnabled: boolean;
  digestTime: string; // HH:mm format
  timezone: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  categories: {
    academic: boolean;
    social: boolean;
    system: boolean;
    marketing: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface MarkNotificationsRequest {
  notificationIds: string[];
  isRead: boolean;
}

export interface DeleteNotificationsRequest {
  notificationIds: string[];
}

export interface BulkNotificationAction {
  action: 'read' | 'unread' | 'delete' | 'favorite' | 'unfavorite';
  notificationIds: string[];
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications for the current user
    getNotifications: builder.query<
      {
        notifications: NotificationData[];
        total: number;
        unreadCount: number;
        hasMore: boolean;
      },
      {
        page?: number;
        limit?: number;
        category?: string;
        type?: string;
        isRead?: boolean;
        isImportant?: boolean;
        isFavorite?: boolean;
        search?: string;
        sortBy?: 'newest' | 'oldest' | 'importance' | 'type';
        dateFrom?: string;
        dateTo?: string;
      }
    >({
      query: (params) => ({
        url: '/notifications',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        // Backend returns: { success: true, data: { notifications: [], total: number, unreadCount: number, ... } }
        // Transform to match frontend expectation: { notifications: [], total: number, unreadCount: number, hasMore: boolean }
        if (response?.data) {
          return {
            notifications: response.data.notifications || [],
            total: response.data.total || 0,
            unreadCount: response.data.unreadCount || 0,
            hasMore: response.data.hasMore || false,
          };
        }
        return {
          notifications: [],
          total: 0,
          unreadCount: 0,
          hasMore: false,
        };
      },
      providesTags: ['Notification'],
    }),

    // Get single notification
    getNotification: builder.query<NotificationData, string>({
      query: (id) => `/notifications/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Notification', id }],
    }),

    // Mark notifications as read/unread
    markNotifications: builder.mutation<void, MarkNotificationsRequest>({
      query: (data) => ({
        url: '/notifications/mark',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete notifications
    deleteNotifications: builder.mutation<void, DeleteNotificationsRequest>({
      query: (data) => ({
        url: '/notifications/delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete all notifications
    deleteAllNotifications: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/delete-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Toggle favorite status
    toggleFavorite: builder.mutation<void, { notificationId: string; isFavorite: boolean }>({
      query: ({ notificationId, isFavorite }) => ({
        url: `/notifications/${notificationId}/favorite`,
        method: 'PUT',
        body: { isFavorite },
      }),
      invalidatesTags: ['Notification'],
    }),

    // Bulk actions on notifications
    bulkActionNotifications: builder.mutation<void, BulkNotificationAction>({
      query: (data) => ({
        url: '/notifications/bulk-action',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get notification settings
    getNotificationSettings: builder.query<NotificationSettings, void>({
      query: () => '/notifications/settings',
      providesTags: ['NotificationSettings'],
    }),

    // Update notification settings
    updateNotificationSettings: builder.mutation<
      NotificationSettings,
      Partial<NotificationSettings>
    >({
      query: (data) => ({
        url: '/notifications/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationSettings'],
    }),

    // Get notification preferences (simplified version)
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => '/notifications/preferences',
      providesTags: ['NotificationPreferences'],
    }),

    // Update notification preferences
    updateNotificationPreferences: builder.mutation<
      NotificationPreferences,
      Partial<NotificationPreferences>
    >({
      query: (data) => ({
        url: '/notifications/preferences',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['NotificationPreferences'],
    }),

    // Get unread count
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (response: any) => {
        // Backend returns: { success: true, data: { count: number } }
        // Transform to match frontend expectation: { count: number }
        if (response?.data) {
          return {
            count: response.data.count || 0,
          };
        }
        return {
          count: 0,
        };
      },
      providesTags: ['NotificationCount'],
    }),

    // Subscribe to push notifications
    subscribePushNotifications: builder.mutation<
      void,
      { 
        endpoint: string;
        keys: {
          p256dh: string;
          auth: string;
        };
      }
    >({
      query: (data) => ({
        url: '/notifications/push/subscribe',
        method: 'POST',
        body: data,
      }),
    }),

    // Unsubscribe from push notifications
    unsubscribePushNotifications: builder.mutation<void, { endpoint: string }>({
      query: (data) => ({
        url: '/notifications/push/unsubscribe',
        method: 'POST',
        body: data,
      }),
    }),

    // Test notification (for development/debugging)
    sendTestNotification: builder.mutation<
      void,
      {
        type: NotificationData['type'];
        title: string;
        message: string;
        actionUrl?: string;
      }
    >({
      query: (data) => ({
        url: '/notifications/test',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get notification statistics
    getNotificationStats: builder.query<
      {
        total: number;
        unread: number;
        byType: Record<string, number>;
        byCategory: Record<string, number>;
        todayCount: number;
        thisWeekCount: number;
        lastReadAt?: string;
      },
      void
    >({
      query: () => '/notifications/stats',
      providesTags: ['NotificationStats'],
    }),

    // Archive notifications
    archiveNotifications: builder.mutation<void, { notificationIds: string[] }>({
      query: (data) => ({
        url: '/notifications/archive',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get archived notifications
    getArchivedNotifications: builder.query<
      {
        notifications: NotificationData[];
        total: number;
      },
      {
        page?: number;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: '/notifications/archived',
        method: 'GET',
        params,
      }),
      providesTags: ['ArchivedNotification'],
    }),

    // Restore archived notifications
    restoreNotifications: builder.mutation<void, { notificationIds: string[] }>({
      query: (data) => ({
        url: '/notifications/restore',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notification', 'ArchivedNotification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationQuery,
  useMarkNotificationsMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationsMutation,
  useDeleteAllNotificationsMutation,
  useToggleFavoriteMutation,
  useBulkActionNotificationsMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useGetUnreadCountQuery,
  useSubscribePushNotificationsMutation,
  useUnsubscribePushNotificationsMutation,
  useSendTestNotificationMutation,
  useGetNotificationStatsQuery,
  useArchiveNotificationsMutation,
  useGetArchivedNotificationsQuery,
  useRestoreNotificationsMutation,
} = notificationApi;