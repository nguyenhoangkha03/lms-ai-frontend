'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ROUTES } from '@/lib/constants/constants';
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
} from 'lucide-react';

export const TeacherApplicationSuccess: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="mb-2 text-lg font-semibold">
          Application Submitted Successfully!
        </h3>
        <p className="text-muted-foreground">
          Your instructor application has been received and is under review.
        </p>
      </div>

      {/* Timeline Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Review Timeline:</strong> We typically review applications
          within 3-5 business days. You'll receive an email update about your
          application status.
        </AlertDescription>
      </Alert>

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
