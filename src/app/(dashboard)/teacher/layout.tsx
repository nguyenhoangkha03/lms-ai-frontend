'use client';

import React from 'react';
import { ModernTeacherNavbar } from '@/components/layout/modern-teacher-navbar';
import { TeacherBottomNav } from '@/components/layout/teacher-bottom-nav';
import { AIChatFloat } from '@/components/ai/ai-chat-float';
import { NotificationProvider } from '@/contexts/notification-context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { USER_ROLES } from '@/lib/constants/constants';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ProtectedRoute
    //   allowedRoles={[USER_ROLES.TEACHER]}
    //   requireMfa={false}
    //   requireFreshSession={false}
    // >
    <NotificationProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col">
        {/* Modern Teacher Navigation */}
        <ModernTeacherNavbar />

        {/* Main Content */}
        <main className="flex-1 pb-24 pt-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        {/* AI Chat Float */}
        <AIChatFloat />
        
        {/* Bottom Navigation - Sticky at bottom */}
        <div className="sticky bottom-0 w-full flex justify-center pb-4">
          <TeacherBottomNav />
        </div>
      </div>
    </NotificationProvider>
    // </ProtectedRoute>
  );
}
