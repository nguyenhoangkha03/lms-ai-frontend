import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { LoginForm } from '@/components/auth/login-form';
import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginPageContent } from '@/components/auth/login-page-content';

export const metadata: Metadata = generateSEO({
  title: 'Login - Access Your Learning Dashboard',
  description:
    'Sign in to your AI-powered learning platform. Access personalized courses, track progress, and continue your educational journey.',
  keywords: [
    'Login',
    'Sign In',
    'Access Account',
    'Student Portal',
    'Learning Platform',
  ],
});

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back"
      description="Sign in to your account to continue your learning journey"
    >
      <Suspense fallback={<LoginForm />}>
        <LoginPageContent />
      </Suspense>
    </AuthLayout>
  );
}
