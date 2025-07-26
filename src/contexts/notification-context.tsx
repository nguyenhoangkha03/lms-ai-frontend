'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  updateSettings,
} from '@/lib/redux/slices/notification-slice';
import { useSocket } from './socket-context';
import { SOCKET_EVENTS } from '@/lib/constants';
import type { Notification } from '@/lib/types';
import { toast } from 'sonner';

interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  marketing: boolean;
  academicUpdates: boolean;
  socialActivity: boolean;
  systemAlerts: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;

  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAll: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;

  getNotificationsByType: (type: string) => Notification[];
  getUnreadNotifications: () => Notification[];
  isNotificationRead: (notificationId: string) => boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const dispatch = useAppDispatch();
  const notificationState = useAppSelector(state => state.notification);
  const { socket, connected } = useSocket();

  const [isInitialized, setIsInitialized] = useState(false);

  // Handle real-time notifications
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (notification: Notification) => {
      dispatch(addNotification(notification));

      // Show toast for in-app notifications
      if (notificationState.settings.inApp) {
        toast(notification.title, {
          description: notification.message,
          duration: 5000,
        });
      }
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION, handleNewNotification);

    return () => {
      socket.off(SOCKET_EVENTS.NOTIFICATION, handleNewNotification);
    };
  }, [socket, connected, dispatch, notificationState.settings.inApp]);

  // Load initial notifications
  useEffect(() => {
    if (!isInitialized) {
      // In a real app, this would fetch from API
      // For now, we'll just mark as initialized
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Context actions
  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      dispatch(markAsRead(notificationId));
    },
    [dispatch]
  );

  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const handleRemoveNotification = useCallback(
    (notificationId: string) => {
      dispatch(removeNotification(notificationId));
    },
    [dispatch]
  );

  const handleClearAll = useCallback(() => {
    dispatch(clearAllNotifications());
  }, [dispatch]);

  const handleUpdateSettings = useCallback(
    (newSettings: Partial<typeof notificationState.settings>) => {
      dispatch(updateSettings(newSettings));
    },
    [dispatch]
  );

  // Utility functions
  const getNotificationsByType = useCallback(
    (type: string) => {
      return notificationState.notifications.filter(n => n.type === type);
    },
    [notificationState.notifications]
  );

  const getUnreadNotifications = useCallback(() => {
    return notificationState.notifications.filter(n => !n.isRead);
  }, [notificationState.notifications]);

  const isNotificationRead = useCallback(
    (notificationId: string) => {
      const notification = notificationState.notifications.find(
        n => n.id === notificationId
      );
      return notification?.isRead || false;
    },
    [notificationState.notifications]
  );

  const contextValue: NotificationContextType = {
    // State
    notifications: notificationState.notifications,
    unreadCount: notificationState.unreadCount,
    settings: notificationState.settings,

    // Actions
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    removeNotification: handleRemoveNotification,
    clearAll: handleClearAll,
    updateNotificationSettings: handleUpdateSettings,

    // Utilities
    getNotificationsByType,
    getUnreadNotifications,
    isNotificationRead,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
}
