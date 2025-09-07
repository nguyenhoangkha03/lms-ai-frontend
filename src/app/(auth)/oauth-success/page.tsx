'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { loginSuccess } from '@/lib/redux/slices/auth-slice';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCheckAuthQuery } from '@/lib/redux/api/auth-api';

export default function OAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check auth to get user info from cookies set by backend
  const { data: authData, error: authError, isLoading } = useCheckAuthQuery();

  useEffect(() => {
    const processOAuthSuccess = async () => {
      try {
        console.log('🔄 Processing OAuth success...');

        // Wait for auth check to complete
        if (isLoading) {
          console.log('⏳ Waiting for auth check...');
          return;
        }

        if (authError || !authData?.isAuthenticated) {
          console.error('❌ Auth check failed:', authError);
          setError('Authentication failed. Please try logging in again.');
          setIsProcessing(false);
          return;
        }

        console.log('✅ OAuth success - user authenticated:', authData.user);

        // Update Redux store with user data
        dispatch(
          loginSuccess({
            user: authData.user!,
            accessToken: '', // Token is in httpOnly cookies
            refreshToken: '', // Token is in httpOnly cookies
            expiresIn: 900, // Default expiration
            twoFactorEnabled: false,
          })
        );

        // Show success message
        toast({
          title: 'Welcome!',
          description:
            'You have been successfully logged in with your social account.',
        });

        // Determine redirect URL based on user type
        let redirectUrl = '/dashboard'; // Unified dashboard

        switch (authData.user?.userType) {
          case 'admin':
            redirectUrl = ROUTES.ADMIN_DASHBOARD;
            break;
          case 'teacher':
            const isApproved = authData.user?.teacherProfile?.isApproved;
            redirectUrl = isApproved
              ? ROUTES.TEACHER_DASHBOARD
              : '/teacher-application-pending';
            break;
          case 'student':
          default:
            // Check if onboarding is completed for OAuth users
            const hasCompletedOnboarding =
              authData.user?.studentProfile?.onboardingCompleted || false;
            redirectUrl = hasCompletedOnboarding
              ? '/student' // Unified dashboard route
              : '/onboarding'; // Unified onboarding route
            break;
        }

        console.log('🚀 Redirecting to:', redirectUrl);

        // Small delay to show success message
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 1500);
      } catch (error: any) {
        console.error('❌ OAuth processing failed:', error);
        setError(error.message || 'Failed to process login. Please try again.');
        setIsProcessing(false);
      }
    };

    processOAuthSuccess();
  }, [authData, authError, isLoading, dispatch, router, toast]);

  const handleRetry = () => {
    router.push(ROUTES.LOGIN);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="mt-4">Authentication Failed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            {isProcessing ? (
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
          <CardTitle className="mt-4">
            {isProcessing ? 'Completing Sign In...' : 'Sign In Successful!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {isProcessing
              ? 'Please wait while we complete your sign in...'
              : 'Redirecting you to your dashboard...'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
