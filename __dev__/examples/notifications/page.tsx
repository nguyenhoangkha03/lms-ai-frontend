'use client';

import React from 'react';
import { ToastProvider } from '@/components/notifications/toast-provider';
import { NotificationDemo } from '@/components/notifications/notification-demo';

export default function NotificationsExamplePage() {
  return (
    <ToastProvider>
      <NotificationDemo />
    </ToastProvider>
  );
}
