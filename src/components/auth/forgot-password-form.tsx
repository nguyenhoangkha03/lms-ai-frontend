'use client';

import React, { useState } from 'react';
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
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth-schemas';
import { ROUTES } from '@/lib/constants/constants';
import { useForgotPasswordMutation } from '@/lib/redux/api/auth-api';
import {
  Mail,
  AlertCircle,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);

      const result = await forgotPassword(data).unwrap();

      setIsSuccess(true);
      toast({
        title: 'Reset email sent!',
        description: 'Please check your email for password reset instructions.',
      });
    } catch (error: any) {
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        'Failed to send reset email. Please try again.';
      setError(errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Check Your Email</h3>
          <p className="text-muted-foreground">
            We've sent password reset instructions to {form.getValues('email')}
          </p>
        </div>

        <div className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Didn't receive the email? Check your spam folder or wait a few
              minutes and try again.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsSuccess(false)}
          >
            Try Different Email
          </Button>
        </div>

        <div className="text-center">
          <Button variant="link" asChild>
            <Link href={ROUTES.LOGIN} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-9"
                      autoComplete="email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Instructions
          </Button>
        </form>
      </Form>

      <div className="space-y-4 text-center">
        <div className="text-sm text-muted-foreground">
          Remember your password?{' '}
          <Button variant="link" className="px-0 font-normal" asChild>
            <Link href={ROUTES.LOGIN}>Back to Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
