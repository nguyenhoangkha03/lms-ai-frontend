import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { TeacherApplicationSuccess } from '@/components/auth/teacher-application-success';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Application Submitted - Thank You for Applying',
  description:
    'Your instructor application has been submitted successfully. We will review it and get back to you within 3-5 business days.',
  keywords: [
    'Application Submitted',
    'Teacher Application',
    'Instructor Success',
    'Application Status',
    'Teaching Application Confirmation',
    'Instructor Registration Complete',
  ],
});

export default function TeacherRegisterSuccessPage() {
  return (
    <AuthLayout
      title="Application Submitted"
      description="Thank you for your interest in becoming an instructor on our platform"
      showBackButton={false}
    >
      <TeacherApplicationSuccess />
    </AuthLayout>
  );
}
