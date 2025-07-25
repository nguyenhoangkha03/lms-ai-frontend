import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '@/lib/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  settings: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    marketing: boolean;
    academicUpdates: boolean;
    socialActivity: boolean;
    systemAlerts: boolean;
  };
  lastFetch: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    email: true,
    push: true,
    inApp: true,
    marketing: false,
    academicUpdates: true,
    socialActivity: true,
    systemAlerts: true,
  },
  lastFetch: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
      state.lastFetch = new Date().toISOString();
    },

    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount -= 1;
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

    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index >= 0) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    },

    clearAllNotifications: state => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    updateSettings: (
      state,
      action: PayloadAction<Partial<NotificationState['settings']>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    incrementUnreadCount: state => {
      state.unreadCount += 1;
    },

    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updateSettings,
  incrementUnreadCount,
  setUnreadCount,
} = notificationSlice.actions;

export default notificationSlice.reducer;
