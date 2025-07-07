import { baseApi } from './base-api';
import type {
  Notification,
  NotificationPreference,
  PaginatedResponse,
} from '@/types';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Get notifications
    getNotifications: builder.query<
      PaginatedResponse<Notification>,
      {
        page?: number;
        limit?: number;
        type?: string;
        read?: boolean;
      }
    >({
      query: params => ({
        url: '/notifications',
        params,
      }),
      providesTags: ['Notification'],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<void, string>({
      query: notificationId => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Get notification preferences
    getNotificationPreferences: builder.query<NotificationPreference[], void>({
      query: () => '/notifications/preferences',
      providesTags: ['Notification'],
    }),

    // Update notification preference
    updateNotificationPreference: builder.mutation<
      NotificationPreference,
      {
        id: string;
        updates: Partial<NotificationPreference>;
      }
    >({
      query: ({ id, updates }) => ({
        url: `/notifications/preferences/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Notification'],
    }),

    // Delete notification
    deleteNotification: builder.mutation<void, string>({
      query: notificationId => ({
        url: `/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferenceMutation,
  useDeleteNotificationMutation,
} = notificationApi;
