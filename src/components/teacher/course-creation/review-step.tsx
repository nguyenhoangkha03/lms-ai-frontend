'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  Info,
  Edit,
  Eye,
  Upload,
  Clock,
  Users,
  DollarSign,
  BookOpen,
  Play,
  Settings,
  Target,
  Zap,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import type { CourseDraft } from '@/lib/redux/api/course-creation-api';

interface ReviewStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
  onPublish?: (submitForReview?: boolean) => void;
  onPreview?: () => void;
}

interface ValidationItem {
  id: string;
  title: string;
  status: 'completed' | 'warning' | 'error';
  description: string;
  action?: string;
  stepIndex?: number;
}

export function ReviewStep({
  draft,
  onUpdate,
  onNext,
  onPrevious,
  isLoading,
  errors = {},
  onPublish,
  onPreview,
}: ReviewStepProps) {
  const { toast } = useToast();
  const [showFullPreview, setShowFullPreview] = useState(false);

  // Validation checks
  const validationItems: ValidationItem[] = [
    // Basic Info Validations
    {
      id: 'course_title',
      title: 'Course Title',
      status: draft.basicInfo.title ? 'completed' : 'error',
      description: draft.basicInfo.title
        ? `Title: "${draft.basicInfo.title}"`
        : 'Course title is required',
      stepIndex: 0,
    },
    {
      id: 'course_description',
      title: 'Course Description',
      status: draft.basicInfo.description
        ? draft.basicInfo.description.length >= 100
          ? 'completed'
          : 'warning'
        : 'error',
      description: draft.basicInfo.description
        ? `${draft.basicInfo.description.length} characters`
        : 'Course description is required',
      stepIndex: 0,
    },
    {
      id: 'course_category',
      title: 'Course Category',
      status: draft.basicInfo.categoryId ? 'completed' : 'error',
      description: draft.basicInfo.categoryId
        ? 'Category selected'
        : 'Course category is required',
      stepIndex: 0,
    },
    {
      id: 'learning_outcomes',
      title: 'Learning Outcomes',
      status:
        draft.basicInfo.whatYouWillLearn.length >= 3 ? 'completed' : 'warning',
      description: `${draft.basicInfo.whatYouWillLearn.length} learning outcomes`,
      action:
        draft.basicInfo.whatYouWillLearn.length < 3
          ? 'Add at least 3 learning outcomes'
          : undefined,
      stepIndex: 0,
    },

    // Curriculum Validations
    {
      id: 'course_sections',
      title: 'Course Sections',
      status: draft.curriculum.sections.length >= 3 ? 'completed' : 'warning',
      description: `${draft.curriculum.sections.length} sections`,
      action:
        draft.curriculum.sections.length < 3
          ? 'Add at least 3 sections for better organization'
          : undefined,
      stepIndex: 1,
    },
    {
      id: 'course_lessons',
      title: 'Course Lessons',
      status: draft.curriculum.totalLessons >= 5 ? 'completed' : 'warning',
      description: `${draft.curriculum.totalLessons} lessons`,
      action:
        draft.curriculum.totalLessons < 5
          ? 'Add more lessons for comprehensive learning'
          : undefined,
      stepIndex: 1,
    },
    {
      id: 'course_duration',
      title: 'Course Duration',
      status: draft.curriculum.totalDuration >= 60 ? 'completed' : 'warning',
      description: `${Math.floor(draft.curriculum.totalDuration / 60)}h ${draft.curriculum.totalDuration % 60}m`,
      action:
        draft.curriculum.totalDuration < 60
          ? 'Consider adding more content for better value'
          : undefined,
      stepIndex: 1,
    },
    {
      id: 'preview_lessons',
      title: 'Preview Lessons',
      status: draft.curriculum.sections.some(s =>
        s.lessons.some(l => l.isPreview)
      )
        ? 'completed'
        : 'warning',
      description: draft.curriculum.sections.some(s =>
        s.lessons.some(l => l.isPreview)
      )
        ? 'Preview lessons available'
        : 'No preview lessons',
      action: !draft.curriculum.sections.some(s =>
        s.lessons.some(l => l.isPreview)
      )
        ? 'Add preview lessons to attract students'
        : undefined,
      stepIndex: 1,
    },

    // Content Validations
    {
      id: 'course_thumbnail',
      title: 'Course Thumbnail',
      status: draft.content.thumbnail ? 'completed' : 'warning',
      description: draft.content.thumbnail
        ? 'Thumbnail uploaded'
        : 'No thumbnail',
      action: !draft.content.thumbnail
        ? 'Add an attractive thumbnail'
        : undefined,
      stepIndex: 2,
    },

    // Pricing Validations
    {
      id: 'pricing_model',
      title: 'Pricing Model',
      status: 'completed',
      description: `${draft.pricing.pricingModel} - ${
        draft.pricing.isFree ? 'Free' : `$${draft.pricing.price}`
      }`,
      stepIndex: 3,
    },
  ];

  // Calculate completion percentage
  const completedItems = validationItems.filter(
    item => item.status === 'completed'
  ).length;
  const completionPercentage = Math.round(
    (completedItems / validationItems.length) * 100
  );

  // Group validation items by status
  const errorItems = validationItems.filter(item => item.status === 'error');
  const warningItems = validationItems.filter(
    item => item.status === 'warning'
  );
  const completedValidationItems = validationItems.filter(
    item => item.status === 'completed'
  );

  // Check if course can be published
  const canPublish =
    errorItems.length === 0 &&
    completedItems >= Math.ceil(validationItems.length * 0.7);

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  // Navigate to step
  const navigateToStep = (stepIndex: number) => {
    // This would trigger navigation to the specific step
    toast({
      title: 'Navigate to Step',
      description: `Navigate to step ${stepIndex + 1} to make changes`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Readiness Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Course Readiness
          </CardTitle>
          <CardDescription>
            Review your course before publishing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Completion</span>
              <span className="text-2xl font-bold text-blue-600">
                {completionPercentage}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-3" />

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <CheckCircle className="mx-auto mb-1 h-6 w-6 text-green-600" />
                <p className="text-sm font-medium text-green-900">
                  {completedValidationItems.length} Completed
                </p>
              </div>
              <div className="rounded-lg bg-yellow-50 p-3 text-center">
                <AlertTriangle className="mx-auto mb-1 h-6 w-6 text-yellow-600" />
                <p className="text-sm font-medium text-yellow-900">
                  {warningItems.length} Warnings
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <AlertTriangle className="mx-auto mb-1 h-6 w-6 text-red-600" />
                <p className="text-sm font-medium text-red-900">
                  {errorItems.length} Errors
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Pre-Publication Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Errors */}
            {errorItems.length > 0 && (
              <AccordionItem value="errors">
                <AccordionTrigger className="text-red-600">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Issues ({errorItems.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {errorItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-medium text-red-900">
                              {item.title}
                            </p>
                            <p className="text-sm text-red-700">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        {item.stepIndex !== undefined && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateToStep(item.stepIndex!)}
                            className="border-red-300 text-red-700 hover:bg-red-100"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Fix
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Warnings */}
            {warningItems.length > 0 && (
              <AccordionItem value="warnings">
                <AccordionTrigger className="text-yellow-600">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Recommendations ({warningItems.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {warningItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <p className="font-medium text-yellow-900">
                              {item.title}
                            </p>
                            <p className="text-sm text-yellow-700">
                              {item.description}
                            </p>
                            {item.action && (
                              <p className="mt-1 text-xs text-yellow-600">
                                {item.action}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.stepIndex !== undefined && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigateToStep(item.stepIndex!)}
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Improve
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Completed Items */}
            <AccordionItem value="completed">
              <AccordionTrigger className="text-green-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completed Items ({completedValidationItems.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {completedValidationItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
                    >
                      {getStatusIcon(item.status)}
                      <div>
                        <p className="font-medium text-green-900">
                          {item.title}
                        </p>
                        <p className="text-sm text-green-700">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Course Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Info className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Title:</span>
                    <span className="col-span-2 font-medium">
                      {draft.basicInfo.title || 'Not set'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Level:</span>
                    <span className="col-span-2 capitalize">
                      {draft.basicInfo.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Language:</span>
                    <span className="col-span-2">
                      {draft.basicInfo.language}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Duration:</span>
                    <span className="col-span-2">
                      {draft.basicInfo.duration.hours}h{' '}
                      {draft.basicInfo.duration.minutes}m
                    </span>
                  </div>
                </div>

                {draft.basicInfo.tags.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-600">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {draft.basicInfo.tags.slice(0, 5).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {draft.basicInfo.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{draft.basicInfo.tags.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Curriculum */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4" />
                  Curriculum
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Sections:</span>
                    <span className="col-span-2 font-medium">
                      {draft.curriculum.sections.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Lessons:</span>
                    <span className="col-span-2 font-medium">
                      {draft.curriculum.totalLessons}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Total Duration:</span>
                    <span className="col-span-2 font-medium">
                      {formatDuration(draft.curriculum.totalDuration)}
                    </span>
                  </div>
                </div>

                {draft.curriculum.sections.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-600">
                      Sections Preview:
                    </p>
                    <div className="space-y-1">
                      {draft.curriculum.sections
                        .slice(0, 3)
                        .map((section, index) => (
                          <div
                            key={section.id}
                            className="rounded bg-gray-50 p-2 text-xs"
                          >
                            <span className="font-medium">
                              {index + 1}. {section.title}
                            </span>
                            <span className="ml-2 text-gray-500">
                              ({section.lessons.length} lessons)
                            </span>
                          </div>
                        ))}
                      {draft.curriculum.sections.length > 3 && (
                        <div className="p-2 text-xs text-gray-500">
                          +{draft.curriculum.sections.length - 3} more sections
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <DollarSign className="h-4 w-4" />
                  Pricing & Access
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Model:</span>
                    <span className="col-span-2 font-medium capitalize">
                      {draft.pricing.pricingModel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Price:</span>
                    <span className="col-span-2 font-medium">
                      {draft.pricing.isFree ? 'Free' : `${draft.pricing.price}`}
                    </span>
                  </div>
                  {draft.pricing.originalPrice && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="text-gray-600">Original:</span>
                      <span className="col-span-2 text-gray-500 line-through">
                        ${draft.pricing.originalPrice}
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-gray-600">Access:</span>
                    <span className="col-span-2">
                      {draft.pricing.lifetimeAccess
                        ? 'Lifetime'
                        : `${draft.pricing.accessDuration} days`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Settings className="h-4 w-4" />
                  Course Settings
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Public Course:</span>
                    <Badge
                      variant={
                        draft.settings.isPublic ? 'default' : 'secondary'
                      }
                    >
                      {draft.settings.isPublic ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Reviews:</span>
                    <Badge
                      variant={
                        draft.settings.allowReviews ? 'default' : 'secondary'
                      }
                    >
                      {draft.settings.allowReviews ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Discussions:</span>
                    <Badge
                      variant={
                        draft.settings.allowDiscussions
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {draft.settings.allowDiscussions ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Certificate:</span>
                    <Badge
                      variant={
                        draft.settings.hasCertificate ? 'default' : 'secondary'
                      }
                    >
                      {draft.settings.hasCertificate ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {draft.settings.enrollmentLimit && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Enrollment Limit:</span>
                      <Badge variant="outline">
                        {draft.settings.enrollmentLimit}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Summary */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <Upload className="h-4 w-4" />
                  Content Status
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Thumbnail:</span>
                    <Badge
                      variant={
                        draft.content.thumbnail ? 'default' : 'secondary'
                      }
                    >
                      {draft.content.thumbnail ? 'Uploaded' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Trailer Video:</span>
                    <Badge
                      variant={
                        draft.content.trailerVideo ? 'default' : 'secondary'
                      }
                    >
                      {draft.content.trailerVideo ? 'Added' : 'None'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Materials:</span>
                    <Badge variant="outline">
                      {draft.content.materials.length} files
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Outcomes */}
      {draft.basicInfo.whatYouWillLearn.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              What Students Will Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {draft.basicInfo.whatYouWillLearn.map((outcome, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg bg-green-50 p-2"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                  <span className="text-sm">{outcome}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Ready to Launch?
          </CardTitle>
          <CardDescription>
            Choose how you want to publish your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Publication Status */}
            <Alert
              className={cn(
                canPublish
                  ? 'border-green-200 bg-green-50'
                  : 'border-yellow-200 bg-yellow-50'
              )}
            >
              {canPublish ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription>
                {canPublish ? (
                  <strong>Your course is ready to publish!</strong>
                ) : (
                  <div>
                    <strong>Course needs attention before publishing</strong>
                    <p className="mt-1 text-sm">
                      Please fix {errorItems.length} critical issues
                      {warningItems.length > 0 &&
                        ` and consider addressing ${warningItems.length} recommendations`}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={onPreview} variant="outline" className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Preview Course
              </Button>

              {canPublish && (
                <>
                  <Button
                    onClick={() => onPublish?.(true)}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Submit for Review
                  </Button>

                  <Button
                    onClick={() => onPublish?.(false)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Publish Now
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Publication Options Info */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <h4 className="mb-1 text-sm font-medium">Submit for Review</h4>
                <p className="text-xs text-gray-600">
                  Your course will be reviewed by our team before going live.
                  This ensures quality and compliance with our guidelines.
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <h4 className="mb-1 text-sm font-medium">Publish Now</h4>
                <p className="text-xs text-gray-600">
                  Your course will go live immediately. You can make changes
                  after publishing, but students will see updates in real-time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Course Preview Dialog */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-h-[80vh] max-w-4xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Course Preview</DialogTitle>
            <DialogDescription>
              This is how your course will appear to students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Course Header */}
            <div className="space-y-4">
              {draft.content.thumbnail && (
                <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={
                      typeof draft.content.thumbnail === 'string'
                        ? draft.content.thumbnail
                        : ''
                    }
                    alt="Course thumbnail"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold">{draft.basicInfo.title}</h1>
                {draft.basicInfo.subtitle && (
                  <p className="mt-1 text-lg text-gray-600">
                    {draft.basicInfo.subtitle}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <Badge>{draft.basicInfo.level}</Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(draft.curriculum.totalDuration)}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {draft.curriculum.totalLessons} lessons
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {draft.curriculum.sections.length} sections
                </span>
              </div>

              <p className="text-gray-700">{draft.basicInfo.description}</p>
            </div>

            {/* Course Content Preview */}
            <div>
              <h3 className="mb-3 font-semibold">Course Content</h3>
              <div className="space-y-2">
                {draft.curriculum.sections.map((section, sectionIndex) => (
                  <div key={section.id} className="rounded-lg border p-3">
                    <h4 className="font-medium">
                      Section {sectionIndex + 1}: {section.title}
                    </h4>
                    <p className="mb-2 text-sm text-gray-600">
                      {section.lessons.length} lessons
                    </p>
                    <div className="space-y-1">
                      {section.lessons
                        .slice(0, 3)
                        .map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Play className="h-3 w-3" />
                            <span>{lesson.title}</span>
                            {lesson.isPreview && (
                              <Badge variant="outline" className="text-xs">
                                Preview
                              </Badge>
                            )}
                          </div>
                        ))}
                      {section.lessons.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{section.lessons.length - 3} more lessons
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
