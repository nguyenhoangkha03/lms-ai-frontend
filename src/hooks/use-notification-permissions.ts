'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/notifications/toast-provider';

export interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isRequesting: boolean;
}

export function useNotificationPermissions() {
  const [state, setState] = useState<NotificationPermissionState>({
    permission: 'default',
    isSupported: false,
    isRequesting: false,
  });
  const { warning, success, error } = useToast();

  useEffect(() => {
    const isSupported = 'Notification' in window;
    setState(prev => ({
      ...prev,
      permission: isSupported ? Notification.permission : 'denied',
      isSupported,
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) {
      warning('Browser notifications are not supported');
      return false;
    }

    if (state.permission === 'granted') {
      return true;
    }

    setState(prev => ({ ...prev, isRequesting: true }));

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({
        ...prev,
        permission,
        isRequesting: false,
      }));

      if (permission === 'granted') {
        success('Browser notifications enabled!');
        return true;
      } else if (permission === 'denied') {
        error(
          'Notification permission denied. You can enable it in browser settings.'
        );
        return false;
      }
    } catch (err) {
      error('Failed to request notification permission');
      setState(prev => ({ ...prev, isRequesting: false }));
    }

    return false;
  }, [state.isSupported, state.permission, warning, success, error]);

  const showBrowserNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (state.permission !== 'granted') {
        return null;
      }

      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/notification-badge.png',
        ...options,
      });
    },
    [state.permission]
  );

  return {
    ...state,
    requestPermission,
    showBrowserNotification,
  };
}
