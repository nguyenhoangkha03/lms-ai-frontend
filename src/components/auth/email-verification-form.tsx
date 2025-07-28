'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const EmailVerificationForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    // Auto-verify if token is present
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  useEffect(() => {
    // Countdown for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Verification failed');
      }

      setIsVerified(true);
      toast({
        title: 'Email verified successfully!',
        description: 'Your account is now active. You can start learning.',
      });

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!email || !canResend) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend verification');
      }

      toast({
        title: 'Verification email sent!',
        description: 'Please check your email for the new verification link.',
      });

      setCanResend(false);
      setCountdown(60); // 60 seconds cooldown
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to resend email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
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
            Your account has been successfully verified. You can now access all
            platform features.
          </p>
        </div>

        <Button className="w-full" asChild>
          <Link href={ROUTES.LOGIN}>Continue to Login</Link>
        </Button>
      </div>
    );
  }

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

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
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

        <Button
          variant="outline"
          className="w-full"
          onClick={resendVerification}
          disabled={isLoading || !canResend}
        >
          {isLoading ? (
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
      </div>

      <div className="text-center">
        <Button variant="link" asChild>
          <Link href={ROUTES.LOGIN}>Back to Login</Link>
        </Button>
      </div>
    </div>
  );
};
