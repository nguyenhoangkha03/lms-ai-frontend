'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/socket-context';
import { useNotifications } from '@/contexts/notification-context';
import { useNotificationPermissions } from './use-notification-permissions';
import { useToast } from '@/components/notifications/toast-provider';
import { SOCKET_EVENTS } from '@/lib/constants/constants';
import type { Notification } from '@/lib/types';

export function useRealtimeNotifications() {
  const { socket, connected } = useSocket();
  const { addNotification, settings } = useNotifications();
  const { showBrowserNotification, permission } = useNotificationPermissions();
  const { success, info, warning, error } = useToast();

  const handleNotification = useCallback(
    (notification: Notification) => {
      // Add to notification center
      addNotification(notification);

      // Show in-app toast if enabled
      if (settings.inApp) {
        const toastMessage = notification.message || notification.title;

        switch (notification.type) {
          case 'success':
            success(toastMessage, {
              description: notification.description,
            });
            break;
          case 'error':
            error(toastMessage, {
              description: notification.description,
            });
            break;
          case 'warning':
            warning(toastMessage, {
              description: notification.description,
            });
            break;
          default:
            info(toastMessage, {
              description: notification.description,
            });
        }
      }

      // Show browser notification if enabled and permission granted
      if (settings.push && permission === 'granted') {
        showBrowserNotification(notification.title, {
          body: notification.message,
          icon: notification.iconUrl || '/favicon.ico',
          tag: notification.type,
          requireInteraction: notification.priority === 'high',
          data: {
            url: notification.actionUrl,
            notificationId: notification.id,
          },
        });
      }
    },
    [
      addNotification,
      settings,
      permission,
      showBrowserNotification,
      success,
      info,
      warning,
      error,
    ]
  );

  // Socket event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    const eventHandlers = {
      [SOCKET_EVENTS.NOTIFICATION]: handleNotification,
      [SOCKET_EVENTS.COURSE_UPDATE]: (data: any) => {
        handleNotification({
          id: Date.now().toString(),
          type: 'academic',
          title: 'Course Updated',
          message: `${data.courseName} has been updated`,
          createdAt: new Date().toISOString(),
          isRead: false,
          userId: data.userId,
          priority: 'low',
          actionUrl: `/courses/${data.courseId}`,
        });
      },
      [SOCKET_EVENTS.ASSIGNMENT_DUE]: (data: any) => {
        handleNotification({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Assignment Due Soon',
          message: `${data.assignmentName} is due in ${data.timeRemaining}`,
          createdAt: new Date().toISOString(),
          isRead: false,
          userId: data.userId,
          priority: 'high',
          actionUrl: `/assignments/${data.assignmentId}`,
        });
      },
      [SOCKET_EVENTS.MESSAGE_RECEIVED]: (data: any) => {
        handleNotification({
          id: Date.now().toString(),
          type: 'social',
          title: 'New Message',
          message: `${data.senderName}: ${data.preview}`,
          createdAt: new Date().toISOString(),
          isRead: false,
          userId: data.userId,
          priority: 'low',
          actionUrl: `/messages/${data.conversationId}`,
        });
      },
      [SOCKET_EVENTS.ACHIEVEMENT_EARNED]: (data: any) => {
        handleNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Achievement Unlocked!',
          message: `You earned: ${data.achievementName}`,
          createdAt: new Date().toISOString(),
          isRead: false,
          userId: data.userId,
          priority: 'low',
          actionUrl: '/profile/achievements',
        });
      },
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    return () => {
      Object.keys(eventHandlers).forEach(event => {
        socket.off(event);
      });
    };
  }, [socket, connected, handleNotification]);

  return {
    connected,
    handleNotification,
  };
}
