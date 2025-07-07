import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationPreference } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreference[];
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: string;
    category?: string;
    read?: boolean;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: false,
  },
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.error = null;
    },

    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(
        n => n.id === action.payload.id
      );
      if (index > -1) {
        const wasUnread = !state.notifications[index].isRead;
        const isUnread = !action.payload.isRead;

        state.notifications[index] = action.payload;

        // Update unread count
        if (wasUnread && !isUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else if (!wasUnread && isUnread) {
          state.unreadCount += 1;
        }
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index > -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    markAsReadNotfication: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index > -1 && !state.notifications[index].isRead) {
        state.notifications[index].isRead = true;
        state.notifications[index].readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: state => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },

    setNotificationPreferences: (
      state,
      action: PayloadAction<NotificationPreference[]>
    ) => {
      state.preferences = action.payload;
    },

    updateNotificationPreference: (
      state,
      action: PayloadAction<NotificationPreference>
    ) => {
      const index = state.preferences.findIndex(
        p => p.id === action.payload.id
      );
      if (index > -1) {
        state.preferences[index] = action.payload;
      } else {
        state.preferences.push(action.payload);
      }
    },

    setNotificationFilters: (
      state,
      action: PayloadAction<Partial<NotificationState['filters']>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearNotificationFilters: state => {
      state.filters = {};
    },

    setNotificationPagination: (
      state,
      action: PayloadAction<Partial<NotificationState['pagination']>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setNotificationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearNotifications: state => {
      state.notifications = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  updateNotification,
  removeNotification,
  markAsReadNotfication,
  markAllAsRead,
  setNotificationPreferences,
  updateNotificationPreference,
  setNotificationFilters,
  clearNotificationFilters,
  setNotificationPagination,
  setNotificationLoading,
  setNotificationError,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
