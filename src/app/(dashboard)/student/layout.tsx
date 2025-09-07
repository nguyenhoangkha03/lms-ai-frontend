'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { AIChatFloat } from '@/components/ai/ai-chat-float';
import { NotificationProvider } from '@/contexts/notification-context';
import { useAppSelector } from '@/lib/redux/hooks';
import { cn } from '@/lib/utils';

// Temporarily bypass ProtectedRoute - middleware handles auth
// import { ProtectedRoute } from '@/components/auth/protected-route';
// import { USER_ROLES } from '@/lib/constants/constants';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useAppSelector(state => state.ui);

  return (
    // <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]} requireMfa={false}>
    <NotificationProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar positioned outside the main layout */}
        <StudentSidebar />

        {/* Header - full width, spans entire screen */}
        <Header />

        {/* Page Content with left margin to avoid sidebar */}
        <main className="ml-[94px] p-4">{children}</main>
      </div>

      {/* AI Chat Float - fixed with documentElement portal */}
      <AIChatFloat />
    </NotificationProvider>

    // </ProtectedRoute>
  );
}
