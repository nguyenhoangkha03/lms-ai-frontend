import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Reset Password - Recover Your Account',
  description:
    "Forgot your password? Enter your email address and we'll send you a link to reset your password.",
  keywords: [
    'Reset Password',
    'Forgot Password',
    'Account Recovery',
    'Password Help',
  ],
});

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset Your Password"
      description="Enter your email address and we'll send you a link to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
