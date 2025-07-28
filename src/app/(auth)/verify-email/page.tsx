import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { EmailVerificationForm } from '@/components/auth/email-verification-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Verify Email - Complete Your Registration',
  description:
    'Verify your email address to complete your account setup and start learning.',
  keywords: [
    'Email Verification',
    'Account Activation',
    'Complete Registration',
  ],
});

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify Your Email"
      description="We've sent a verification link to your email address"
    >
      <EmailVerificationForm />
    </AuthLayout>
  );
}
