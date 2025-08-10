'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants/constants';
import { useResendVerificationMutation } from '@/lib/redux/api/auth-api';
import {
  CheckCircle,
  Clock,
  Mail,
  FileText,
  Home,
  Users,
  BookOpen,
  MessageCircle,
  Star,
  RefreshCw,
  AlertCircle,
  User,
  FileCheck,
} from 'lucide-react';

export const TeacherApplicationSuccess: React.FC = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [resendCount, setResendCount] = useState(0);

  // RTK Query hook for resending verification email
  const [resendVerification, { isLoading: isResending }] = useResendVerificationMutation();

  const handleResendEmail = async () => {
    if (!email || resendCount >= 3) return;

    try {
      await resendVerification({ email }).unwrap();

      toast({
        title: 'Email sent!',
        description: 'Please check your email inbox and spam folder.',
      });
      setResendCount(prev => prev + 1);
    } catch (error: any) {
      toast({
        title: 'Failed to resend email',
        description: error?.data?.message || error?.message || 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Application Submitted',
      description: 'Your teacher application has been received',
      status: 'completed' as const,
      icon: FileCheck,
    },
    {
      id: 2,
      title: 'Email Verification',
      description: 'Verify your email address to continue',
      status: 'current' as const,
      icon: Mail,
    },
    {
      id: 3,
      title: 'Admin Review',
      description: 'Our team will review your qualifications',
      status: 'pending' as const,
      icon: User,
    },
    {
      id: 4,
      title: 'Approval Decision',
      description: 'You\'ll receive notification of our decision',
      status: 'pending' as const,
      icon: CheckCircle,
    },
  ];
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Application Submitted Successfully!</CardTitle>
          <CardDescription className="text-green-700">
            Thank you for your interest in becoming an instructor on our platform
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Email Verification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> You must verify your email address before we can review your application.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              We've sent a verification email to:
            </p>
            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{email}</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please check your email inbox (and spam folder) and click the verification link.
            </p>
          </div>

          {/* Resend Email Button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResendEmail}
              disabled={isResending || resendCount >= 3}
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Email {resendCount > 0 && `(${3 - resendCount} left)`}
                </>
              )}
            </Button>
          </div>

          {resendCount >= 3 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You've reached the maximum number of resend attempts. Please contact support if you continue having issues.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Application Process Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Application Process</CardTitle>
          <CardDescription>
            Track the progress of your instructor application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full
                    ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
                      step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                      'bg-muted text-muted-foreground'
                    }
                  `}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{step.title}</p>
                      {step.status === 'completed' && (
                        <Badge variant="secondary" className="text-xs">
                          Complete
                        </Badge>
                      )}
                      {step.status === 'current' && (
                        <Badge className="text-xs">
                          Current Step
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            What Happens Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="font-medium">1. Email Verification (Required)</p>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account. This step must be completed before review.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">2. Application Review (3-5 business days)</p>
            <p className="text-sm text-muted-foreground">
              Our team will review your qualifications, experience, and submitted documents.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">3. Decision Notification</p>
            <p className="text-sm text-muted-foreground">
              You'll receive an email with our decision. If approved, you can start creating courses immediately.
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Keep this email address accessible as all communication will be sent here.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* What's Next Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            What's Next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  1
                </span>
              </div>
              <div>
                <p className="font-medium">Application Review</p>
                <p className="text-sm text-muted-foreground">
                  Our team will review your qualifications and documents
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  2
                </span>
              </div>
              <div>
                <p className="font-medium">Interview Process</p>
                <p className="text-sm text-muted-foreground">
                  If approved, we'll schedule a brief interview to discuss your
                  teaching goals
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  3
                </span>
              </div>
              <div>
                <p className="font-medium">Onboarding</p>
                <p className="text-sm text-muted-foreground">
                  Complete instructor onboarding and start creating your first
                  course
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preparation Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Prepare for Success
          </CardTitle>
          <CardDescription>
            While you wait, here are some things you can do to prepare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Tip 1 */}
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium">Plan Your First Course</p>
                <p className="text-xs text-muted-foreground">
                  Think about your course topic, learning objectives, and
                  content structure
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm font-medium">Understand Your Audience</p>
                <p className="text-xs text-muted-foreground">
                  Consider who will be taking your courses and their learning
                  needs
                </p>
              </div>
            </div>

            {/* Tip 3 */}
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium">Gather Teaching Materials</p>
                <p className="text-xs text-muted-foreground">
                  Prepare slides, videos, exercises, and other resources you'll
                  need
                </p>
              </div>
            </div>

            {/* Tip 4 */}
            <div className="flex items-start gap-3">
              <Star className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium">Study Best Practices</p>
                <p className="text-xs text-muted-foreground">
                  Learn about online teaching methodologies and engagement
                  techniques
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button className="w-full" asChild>
          <Link href={ROUTES.HOME}>
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link href={ROUTES.CONTACT}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Link>
        </Button>
      </div>

      {/* Contact Information */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Questions about your application? Email us at{' '}
          <a
            href="mailto:instructors@lmsai.com"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            instructors@lmsai.com
          </a>
        </p>
      </div>

      {/* Additional Resources Card */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10">
        <CardContent className="p-4">
          <div className="text-center">
            <h4 className="mb-2 text-sm font-medium">Want to Learn More?</h4>
            <p className="mb-3 text-xs text-muted-foreground">
              Check out our instructor resources and best practices guide
            </p>
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/instructor-guide">Teaching Guide</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/instructor-faq">FAQ</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Application ID:</strong> #
          {Math.random().toString(36).substr(2, 9).toUpperCase()}
          <br />
          <span className="text-xs">
            Save this ID for your records and future reference
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
};
