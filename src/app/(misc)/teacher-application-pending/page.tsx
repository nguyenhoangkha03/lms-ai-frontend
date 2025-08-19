import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { TeacherApplicationPending } from '@/components/auth/teacher-application-pending';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Application Under Review - Teacher Application Status',
  description:
    'Your teacher application is currently being reviewed by our team. Check your application status and next steps.',
  keywords: [
    'Teacher Application Status',
    'Application Under Review',
    'Pending Application',
    'Instructor Review',
    'Teaching Application Progress',
  ],
});

export default function TeacherApplicationPendingPage() {
  return (
    <AuthLayout
      title="Application Under Review"
      description="Your instructor application is being reviewed by our team"
      showBackButton={false}
    >
      <TeacherApplicationPending />
    </AuthLayout>
  );
}