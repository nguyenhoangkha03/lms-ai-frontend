import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Set New Password - Complete Password Reset',
  description:
    'Create a new password for your account. Choose a strong password to keep your account secure.',
  keywords: [
    'Set Password',
    'New Password',
    'Password Reset',
    'Account Security',
  ],
});

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set New Password"
      description="Create a new password for your account"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
