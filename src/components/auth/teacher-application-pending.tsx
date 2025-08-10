'use client';

import React, { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants/constants';
import { toast } from 'sonner';
import { useGetTeacherApplicationStatusQuery } from '@/lib/redux/api/auth-api';
import {
  CheckCircle,
  Clock,
  Mail,
  FileText,
  Home,
  MessageCircle,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const TeacherApplicationPending: React.FC = () => {
  //   const { toast } = useToast();
  const {
    data: applicationStatus,
    error,
    isLoading,
    refetch,
  } = useGetTeacherApplicationStatusQuery();

  const handleRefreshStatus = async () => {
    try {
      await refetch();
      toast.success('Application status has been refreshed.');
    } catch (error) {
      toast.error('Failed to fetch status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'under_review':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      case 'under_review':
        return <User className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'approved':
        return 100;
      case 'rejected':
        return 100;
      case 'under_review':
        return 75;
      default:
        return 50;
    }
  };

  const steps = [
    {
      title: 'Email Verified',
      description: 'Your email has been confirmed',
      status: 'completed',
    },
    {
      title: 'Application Submitted',
      description: 'Your application is in our queue',
      status: 'completed',
    },
    {
      title: 'Under Review',
      description: 'Our team is reviewing your qualifications',
      status:
        applicationStatus?.status === 'under_review'
          ? 'current'
          : applicationStatus?.status === 'approved' ||
              applicationStatus?.status === 'rejected'
            ? 'completed'
            : 'pending',
    },
    {
      title: 'Decision Made',
      description: 'Application approved or needs revision',
      status:
        applicationStatus?.status === 'approved' ||
        applicationStatus?.status === 'rejected'
          ? 'completed'
          : 'pending',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Loading application status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load your application status. Please try again later or
            contact support.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button onClick={handleRefreshStatus}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!applicationStatus) {
    return null; // RTK Query will handle loading state
  }

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            {getStatusIcon(applicationStatus.status)}
          </div>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>
            <Badge className={getStatusColor(applicationStatus.status)}>
              {applicationStatus.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{applicationStatus.message}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{getProgressValue(applicationStatus.status)}%</span>
            </div>
            <Progress
              value={getProgressValue(applicationStatus.status)}
              className="w-full"
            />
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshStatus}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Status
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Application Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Application Progress</CardTitle>
          <CardDescription>
            Track your application through each stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    step.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : step.status === 'current'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-muted text-muted-foreground'
                  } `}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step.status === 'current' ? (
                    <Clock className="h-4 w-4" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-current" />
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
                      <Badge className="text-xs">In Progress</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status-specific content */}
      {applicationStatus.status === 'approved' && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Congratulations! Application Approved
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              Welcome to our instructor community! You can now access your
              teacher dashboard and start creating courses.
            </p>
            <Button asChild>
              <Link href="/teacher">
                <ExternalLink className="mr-2 h-4 w-4" />
                Go to Teacher Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {applicationStatus.status === 'rejected' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Application Requires Revision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-700">
              Your application needs some improvements before it can be
              approved.
            </p>
            {applicationStatus.reviewNotes && (
              <Alert>
                <AlertDescription>
                  <strong>Feedback:</strong> {applicationStatus.reviewNotes}
                </AlertDescription>
              </Alert>
            )}
            <Button variant="outline" asChild>
              <Link href="/teacher-register">
                <FileText className="mr-2 h-4 w-4" />
                Submit Updated Application
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Timeline Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="font-medium">Submitted:</p>
              <p className="text-sm text-muted-foreground">
                {new Date(applicationStatus.submittedAt).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }
                )}
              </p>
            </div>

            {applicationStatus.reviewedAt && (
              <div className="space-y-2">
                <p className="font-medium">Reviewed:</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(applicationStatus.reviewedAt).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
            )}
          </div>

          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              All status updates will be sent to your registered email address.
              Make sure to check your spam folder.
            </AlertDescription>
          </Alert>
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
    </div>
  );
};
