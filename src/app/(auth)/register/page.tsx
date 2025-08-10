import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { RegisterForm } from '@/components/auth/register-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Create Account - Join Our Learning Community',
  description:
    'Create your account to access AI-powered personalized learning. Choose your role and start your educational journey today.',
  keywords: [
    'Register',
    'Create Account',
    'Sign Up',
    'Join',
    'Student Registration',
  ],
});

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Join as a Student"
      description="Learn smarter with AI – personalized learning paths, progress tracking, and certificates"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
