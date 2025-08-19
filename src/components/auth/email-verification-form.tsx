'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants/constants';
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import {
  useLazyVerifyEmailQuery,
  useResendVerificationMutation,
} from '@/lib/redux/api/auth-api';
import { Suspense } from 'react';

const EmailVerificationContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const [
    triggerVerify,
    { data: verifyData, error: verifyError, isLoading: isVerifying },
  ] = useLazyVerifyEmailQuery();

  const [resendVerification, { isLoading: isResending, error: resendError }] =
    useResendVerificationMutation();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && token && !isVerified) {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
        'http://localhost:3001';
      window.location.href = `${backendUrl}/api/v1/auth/verify-email?token=${token}`;
    }
  }, [isMounted, token, isVerified]);

  useEffect(() => {
    if (verifyData && !isVerified) {
      setIsVerified(true);
      setRedirectCountdown(3);
      toast({
        title: 'Email verified successfully!',
        description: verifyData.message || 'Your account is now active.',
      });

      let redirectUrl: string = ROUTES.STUDENT_DASHBOARD;

      if (verifyData.user?.userType) {
        switch (verifyData.user.userType) {
          case 'student':
            redirectUrl = ROUTES.STUDENT_DASHBOARD;
            break;
          case 'teacher':
            // Check teacher application status
            if (
              verifyData.user.status === 'pending' ||
              verifyData.user.teacherProfile?.isApproved === false
            ) {
              redirectUrl = '/teacher-application-pending';
            } else if (
              verifyData.user.status === 'active' ||
              verifyData.user.teacherProfile?.isApproved === true
            ) {
              redirectUrl = ROUTES.TEACHER_DASHBOARD;
            } else {
              redirectUrl = '/teacher-application-pending';
            }
            break;
          case 'admin':
            redirectUrl = ROUTES.ADMIN_DASHBOARD;
            break;
          default:
            redirectUrl = ROUTES.STUDENT_DASHBOARD;
        }
      }

      const timer = setTimeout(() => {
        router.push(redirectUrl);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [verifyData, isVerified, router, toast]);

  useEffect(() => {
    if (error && isMounted) {
      toast({
        title: 'Verification Failed',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, isMounted, toast]);

  useEffect(() => {
    if (verifyError) {
      const errorMessage =
        (verifyError as any)?.data?.message ||
        (verifyError as any)?.message ||
        'Verification failed';

      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [verifyError, toast]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (redirectCountdown > 0) {
      const timer = setTimeout(
        () => setRedirectCountdown(redirectCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [redirectCountdown]);

  const handleResendVerification = async () => {
    if (!email || !canResend) return;

    try {
      const result = await resendVerification({ email }).unwrap();

      toast({
        title: 'Verification email sent!',
        description:
          result.message ||
          'Please check your email for the new verification link.',
      });

      setCanResend(false);
      setCountdown(60);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || error?.message || 'Failed to resend email';

      toast({
        title: 'Resend Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // ✅ Show loading state until mounted để avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Loading...</h3>
          <p className="text-muted-foreground">
            Please wait while we load the verification page.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (isVerified || verifyData) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Email Verified!</h3>
          <p className="text-muted-foreground">
            {verifyData?.message ||
              'Your account has been successfully verified.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {redirectCountdown > 0
              ? `Redirecting to dashboard in ${redirectCountdown} seconds...`
              : 'Redirecting to dashboard...'}
          </p>
        </div>

        <Button
          className="w-full"
          onClick={() => {
            let redirectUrl: string = ROUTES.STUDENT_DASHBOARD;

            if (verifyData?.user?.userType) {
              switch (verifyData.user.userType) {
                case 'student':
                  redirectUrl = ROUTES.STUDENT_DASHBOARD;
                  break;
                case 'teacher':
                  // Check teacher application status
                  if (
                    verifyData.user.status === 'pending' ||
                    verifyData.user.teacherProfile?.isApproved === false
                  ) {
                    redirectUrl = '/teacher-application-pending';
                  } else if (
                    verifyData.user.status === 'active' ||
                    verifyData.user.teacherProfile?.isApproved === true
                  ) {
                    redirectUrl = ROUTES.TEACHER_DASHBOARD;
                  } else {
                    redirectUrl = '/teacher-application-pending';
                  }
                  break;
                case 'admin':
                  redirectUrl = ROUTES.ADMIN_DASHBOARD;
                  break;
                default:
                  redirectUrl = ROUTES.STUDENT_DASHBOARD;
              }
            }

            router.push(redirectUrl);
          }}
        >
          {verifyData?.user?.userType === 'teacher' &&
          (verifyData.user.status === 'pending' ||
            verifyData.user.teacherProfile?.isApproved === false)
            ? 'View Application Status'
            : 'Continue to Dashboard'}
        </Button>
      </div>
    );
  }

  // Loading state during verification
  if (token && isVerifying) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Verifying Email...</h3>
          <p className="text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if ((token && verifyError) || error) {
    const errorMessage =
      error ||
      (verifyError as any)?.data?.message ||
      (verifyError as any)?.message ||
      'Verification failed';

    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Verification Failed</h3>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The verification link may be invalid or expired. Please request a
            new verification email.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {email && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleResendVerification}
              disabled={isResending || !canResend}
            >
              {isResending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : countdown > 0 ? (
                <Clock className="mr-2 h-4 w-4" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {countdown > 0
                ? `Resend in ${countdown}s`
                : 'Resend Verification Email'}
            </Button>
          )}

          <Button variant="link" asChild>
            <Link href={ROUTES.LOGIN}>Back to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default state - waiting for verification (no token in URL)
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
          <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Check Your Email</h3>
        <p className="text-muted-foreground">
          {email ? (
            <>
              We've sent a verification link to <strong>{email}</strong>
            </>
          ) : (
            "We've sent a verification link to your email address"
          )}
        </p>
      </div>

      {resendError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(resendError as any)?.data?.message ||
              'Failed to resend verification email'}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Didn't receive the email? Check your spam folder or click the button
            below to resend.
          </AlertDescription>
        </Alert>

        {email && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending || !canResend}
          >
            {isResending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : countdown > 0 ? (
              <Clock className="mr-2 h-4 w-4" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {countdown > 0
              ? `Resend in ${countdown}s`
              : 'Resend Verification Email'}
          </Button>
        )}
      </div>

      <div className="text-center">
        <Button variant="link" asChild>
          <Link href={ROUTES.LOGIN}>Back to Login</Link>
        </Button>
      </div>
    </div>
  );
};

// ✅ Simplified fallback component
const EmailVerificationFallback: React.FC = () => (
  <div className="space-y-6 text-center">
    <div className="flex justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900/20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    </div>
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Loading...</h3>
      <p className="text-muted-foreground">
        Please wait while we load the verification page.
      </p>
    </div>
  </div>
);

export const EmailVerificationForm: React.FC = () => {
  return (
    <Suspense fallback={<EmailVerificationFallback />}>
      <EmailVerificationContent />
    </Suspense>
  );
};
