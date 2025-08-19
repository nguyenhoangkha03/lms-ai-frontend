'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  registerSchema,
  type RegisterFormData,
} from '@/lib/validations/auth-schemas';
import { ROUTES, OAUTH_CONFIG } from '@/lib/constants/constants';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  GraduationCap,
  Users,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { SocialLoginButtons } from './social-login-buttons';
import { useRegisterMutation } from '@/lib/redux/api/auth-api';

const roleOptions = [
  {
    value: 'student' as const,
    label: 'Student',
    description: 'Learn at your own pace with AI-powered personalization',
    icon: GraduationCap,
    color: 'blue',
    features: [
      'Personalized learning paths',
      'AI tutor support',
      'Progress tracking',
      'Certificates',
    ],
  },
];

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedUserType, setSelectedUserType] =
    useState<'student'>('student');

  const [register, { isLoading, error: apiError }] = useRegisterMutation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: selectedUserType,
      acceptTerms: false,
    },
  });

  useEffect(() => {
    form.setValue('userType', selectedUserType);
  }, [selectedUserType, form]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      console.log('🔍 Submitting form with data:', data);

      const result = await register({
        ...data,
        agreedToTerms: data.acceptTerms,
      }).unwrap();

      console.log('✅ Registration successful:', result);

      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
      });

      router.push('/verify-email?email=' + encodeURIComponent(data.email));
    } catch (error: any) {
      console.error('❌ Registration failed:', error);

      const errorMessage =
        error?.data?.message || error?.message || 'Registration failed';

      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      console.log(`🔄 Initiating ${provider} OAuth registration...`);
      
      // Get the correct OAuth URL from config
      const oauthUrl = provider === 'google' 
        ? OAUTH_CONFIG.googleLoginUrl 
        : OAUTH_CONFIG.facebookLoginUrl;
      
      // Add register action parameter
      const finalUrl = `${oauthUrl}?action=register`;
      
      console.log(`🚀 Redirecting to: ${finalUrl}`);
      
      // Redirect to backend OAuth endpoint
      window.location.href = finalUrl;
    } catch (error) {
      console.error(`❌ Failed to initiate ${provider} registration:`, error);
      toast({
        title: 'Social Registration Failed',
        description: `Failed to register with ${provider}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Social Registration */}
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
            Or create account with email
          </span>
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="mb-2 text-lg font-semibold">Your Learning Journey</h3>
          <p className="text-sm text-muted-foreground">
            Discover how you’ll use our platform as a student
          </p>
        </div>

        <div className="grid gap-3">
          {roleOptions.map(role => {
            const Icon = role.icon;
            const isSelected = selectedUserType === role.value;
            const isDisabled = role.disabled;

            return (
              <motion.div
                key={role.value}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? `ring-2 ring-${role.color}-500 border-${role.color}-200 dark:border-${role.color}-800`
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={() => !isDisabled && setSelectedUserType(role.value)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-lg p-2 bg-${role.color}-100 dark:bg-${role.color}-900/20`}
                        >
                          <Icon
                            className={`h-5 w-5 text-${role.color}-600 dark:text-${role.color}-400`}
                          />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base">
                            {role.label}
                            {role.note && (
                              <Badge variant="secondary" className="text-xs">
                                {role.note}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {role.description}
                          </CardDescription>
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </CardHeader>
                  {isSelected && (
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-2">
                        {role.features.map(feature => (
                          <div
                            key={feature}
                            className="flex items-center gap-2 text-xs text-muted-foreground"
                          >
                            <div className="h-1 w-1 rounded-full bg-current" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Registration Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 🔥 ENHANCED ERROR DISPLAY */}
          {apiError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {(apiError as any)?.data?.message ||
                  'Registration failed. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Form Validation Errors */}
          {form.formState.errors &&
            Object.keys(form.formState.errors).length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="font-medium">
                      Please fix the following errors:
                    </div>
                    {Object.entries(form.formState.errors).map(
                      ([field, error]) => (
                        <div key={field} className="text-sm">
                          • {field}: {error?.message}
                        </div>
                      )
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

          {/* Hidden role field */}
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input {...field} value={selectedUserType} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="John"
                        className="pl-9"
                        autoComplete="given-name"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Doe"
                        className="pl-9"
                        autoComplete="family-name"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                      placeholder="john@example.com"
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
                      placeholder="Create a strong password"
                      className="pl-9 pr-9"
                      autoComplete="new-password"
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

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-9 pr-9"
                      autoComplete="new-password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
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

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      Privacy Policy
                    </Link>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>

          {/* 🔧 DEBUG BUTTON (Remove in production) */}
          {/* {process.env.NODE_ENV === 'development' && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log('Form values:', form.getValues());
                console.log('Form errors:', form.formState.errors);
                console.log('Form valid:', form.formState.isValid);
              }}
            >
              Debug Form
            </Button>
          )} */}
        </form>
      </Form>

      {/* Login Link */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Button variant="link" className="px-0 font-normal" asChild>
          <Link href={ROUTES.LOGIN}>Sign in</Link>
        </Button>
      </div>
    </div>
  );
};
