import React from 'react';
import type { Metadata } from 'next';
import { generateSEO } from '@/lib/seo';
import { TwoFactorForm } from '@/components/auth/two-factor-form';
import { AuthLayout } from '@/components/auth/auth-layout';

export const metadata: Metadata = generateSEO({
  title: 'Two-Factor Authentication - Secure Login',
  description:
    'Enter your two-factor authentication code to complete the login process.',
  keywords: ['2FA', 'Two Factor Authentication', 'Security', 'Login'],
});

export default function TwoFactorPage() {
  return (
    <AuthLayout
      title="Two-Factor Authentication"
      description="Enter the 6-digit code from your authenticator app"
    >
      <TwoFactorForm />
    </AuthLayout>
  );
}
