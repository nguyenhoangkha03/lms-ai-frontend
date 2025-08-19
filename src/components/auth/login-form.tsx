'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  loginSchema,
  type LoginFormData,
} from '@/lib/validations/auth-schemas';
import { ROUTES, OAUTH_CONFIG } from '@/lib/constants/constants';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { SocialLoginButtons } from './social-login-buttons';
import { useLoginMutation } from '@/lib/redux/api/auth-api';
import { AdvancedTokenManager } from '@/lib/auth/token-manager';
import { useAppDispatch } from '@/lib/redux/hooks';
import { loginSuccess } from '@/lib/redux/slices/auth-slice';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectUrl = searchParams.get('redirect');

  const [login, { isLoading, error: apiError }] = useLoginMutation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      const result = await login(data).unwrap();
      console.log('✅ Login successful:', result);
      console.log('🔍 Processing login result...');

      if (result.twoFactorEnabled) {
        console.log('🔐 2FA required, redirecting...');
        router.push(`/login/2fa?token=${result.tempToken}`);
        return;
      }

      console.log('💭 No 2FA required, continuing...');

      console.log('🔄 Saving tokens and updating auth state...');

      if (result.accessToken) {
        console.log('💾 Saving tokens to AdvancedTokenManager...');
        AdvancedTokenManager.setTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken || '',
          expiresIn: result.expiresIn || 900,
          tokenType: 'Bearer' as const,
        });
        console.log('✅ Tokens saved successfully');
      }

      console.log('🚀 Dispatching loginSuccess to Redux...', {
        user: result.user,
        token: result.accessToken,
        refreshToken: result.refreshToken || '',
      });

      dispatch(
        loginSuccess({
          user: result.user!,
          expiresIn: result.expiresIn,
          twoFactorEnabled: result.twoFactorEnabled,
          accessToken: result.accessToken!,
          refreshToken: result.refreshToken!,
        })
      );

      console.log('✅ loginSuccess dispatched to Redux');

      console.log('📢 Showing success toast...');
      toast({
        title: 'Welcome back!',
        description: result.message || 'You have been successfully logged in.',
      });

      console.log('🚀 Preparing redirect...');

      let finalRedirectUrl = redirectUrl;

      // If no redirect URL specified, determine based on user role
      if (!finalRedirectUrl) {
        switch (result.user?.userType) {
          case 'admin':
            finalRedirectUrl = ROUTES.ADMIN_DASHBOARD;
            console.log('👑 Admin login - redirecting to admin dashboard');
            break;
          case 'teacher':
            const isApproved = result.user?.teacherProfile?.isApproved;
            finalRedirectUrl = isApproved
              ? ROUTES.TEACHER_DASHBOARD
              : '/teacher-application-pending';
            console.log(
              `🎓 Teacher login - Approved: ${isApproved}, redirecting to: ${finalRedirectUrl}`
            );
            break;
          case 'student':
          default:
            finalRedirectUrl = ROUTES.STUDENT_DASHBOARD;
            console.log('🎓 Student login - redirecting to student dashboard');
            break;
        }
      } else if (result.user?.userType === 'teacher') {
        // Special case: if redirect URL is specified but user is teacher, check approval
        const isApproved = result.user?.teacherProfile?.isApproved;
        if (!isApproved) {
          finalRedirectUrl = '/teacher-application-pending';
          console.log(
            `🎓 Teacher login - Not approved, overriding redirect to: ${finalRedirectUrl}`
          );
        }
      }

      console.log('🚀 Final redirect URL:', finalRedirectUrl);

      console.log('🚀 Executing immediate redirect to:', finalRedirectUrl);

      router.push(finalRedirectUrl);
    } catch (error: any) {
      console.log('❌ Login failed:', error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log(`🔄 Initiating ${provider} OAuth login...`);

      // Get the correct OAuth URL from config
      const oauthUrl =
        provider === 'google'
          ? OAUTH_CONFIG.googleLoginUrl
          : OAUTH_CONFIG.facebookLoginUrl;

      // Add redirect parameter if specified
      const finalUrl = redirectUrl
        ? `${oauthUrl}?redirect=${encodeURIComponent(redirectUrl)}`
        : oauthUrl;

      console.log(`🚀 Redirecting to: ${finalUrl}`);

      // Redirect to backend OAuth endpoint
      window.location.href = finalUrl;
    } catch (error) {
      console.error(`❌ Failed to initiate ${provider} login:`, error);
      setError(`Failed to login with ${provider}. Please try again.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Login */}
      <SocialLoginButtons
        onGoogleLogin={() => handleSocialLogin('google')}
        onFacebookLogin={() => handleSocialLogin('facebook')}
        isLoading={isLoading}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Login Form */}
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
                      placeholder="Enter your email"
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-9 pr-9"
                      autoComplete="current-password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button variant="link" className="px-0 font-normal" asChild>
              <Link href={ROUTES.FORGOT_PASSWORD}>Forgot password?</Link>
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>

      {/* Register Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Button variant="link" className="px-0 font-normal" asChild>
          <Link href={ROUTES.REGISTER}>Create account</Link>
        </Button>
      </div>

      {/* Teacher Registration */}
      <div className="text-center">
        <Separator className="my-4" />
        <div className="mb-2 text-sm text-muted-foreground">
          Want to teach on our platform?
        </div>
        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.TEACHER_REGISTER}>Apply as Instructor</Link>
        </Button>
      </div>
    </div>
  );
};
