import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { TeacherRegistrationForm } from '@/components/auth/teacher-registration-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Become an Instructor - Join Our Teaching Community',
  description:
    'Apply to become an instructor on our AI-powered learning platform. Share your expertise and help students around the world.',
  keywords: [
    'Teacher Registration',
    'Become Instructor',
    'Teach Online',
    'Educator Application',
  ],
});

export default function TeacherRegisterPage() {
  return (
    <AuthLayout
      title="Become an Instructor"
      description="Join our community of educators and start teaching with AI-powered tools"
      showBackButton={true}
      backButtonText="Back to Home"
      backButtonHref="/"
    >
      <TeacherRegistrationForm />
    </AuthLayout>
  );
}
