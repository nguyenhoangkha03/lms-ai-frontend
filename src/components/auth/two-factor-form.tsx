'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  twoFactorSchema,
  type TwoFactorFormData,
} from '@/lib/validations/auth-schemas';
import { ROUTES } from '@/lib/constants';
import { Shield, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

export const TwoFactorForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const tempToken = searchParams.get('token');
  const redirectUrl = searchParams.get('redirect') || ROUTES.STUDENT_DASHBOARD;

  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (!tempToken) {
      router.push(ROUTES.LOGIN);
      return;
    }

    // Countdown for backup code option
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, tempToken, router]);

  const handleCodeChange = (value: string, index: number) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newCode = form.getValues('code').split('');
    newCode[index] = digit;
    const fullCode = newCode.join('');

    form.setValue('code', fullCode);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (fullCode.length === 6) {
      form.handleSubmit(onSubmit)();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !form.getValues('code')[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data: TwoFactorFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tempToken,
          code: data.code,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '2FA verification failed');
      }

      toast({
        title: 'Login successful!',
        description: 'Welcome back to your learning dashboard.',
      });

      router.push(redirectUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
      form.reset();
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const useBackupCode = async () => {
    // This would typically open a modal or redirect to backup code entry
    toast({
      title: 'Backup codes',
      description: 'Contact support if you need to use backup codes.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Open your authenticator app and enter the 6-digit code
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Authentication Code</FormLabel>
                <FormControl>
                  <div className="flex justify-center gap-3">
                    {[0, 1, 2, 3, 4, 5].map(index => (
                      <Input
                        key={index}
                        ref={el => {
                          inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="h-12 w-12 text-center text-lg font-semibold"
                        value={field.value[index] || ''}
                        onChange={e => handleCodeChange(e.target.value, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        autoComplete="one-time-code"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || form.getValues('code').length !== 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Code
          </Button>
        </form>
      </Form>

      <div className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Having trouble with your authenticator?
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={useBackupCode}
          disabled={!canResend}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Use Backup Code
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
