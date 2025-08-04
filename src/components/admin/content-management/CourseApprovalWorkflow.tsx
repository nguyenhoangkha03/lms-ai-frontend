'use client';

import React, { useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  Clock,
  Check,
  X,
  AlertCircle,
  Eye,
  Star,
  Users,
  BookOpen,
  Tag,
  TrendingUp,
  Bot,
  Shield,
} from 'lucide-react';
import {
  useGetCoursesAwaitingApprovalQuery,
  useGetCourseByIdQuery,
  useApproveCourseMutation,
  useRejectCourseMutation,
  useGetCourseStatisticsQuery,
} from '@/lib/redux/api/content-management-api';
import { Course } from '@/lib/types/content-management';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { Progress } from '@/components/ui/progress';

interface CourseApprovalWorkflowProps {
  onCourseApproved?: (courseId: string) => void;
  onCourseRejected?: (courseId: string) => void;
}

const CourseApprovalWorkflow: React.FC<CourseApprovalWorkflowProps> = ({
  onCourseApproved,
  onCourseRejected,
}) => {
  const { toast } = useToast();

  // State management
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 20,
    awaiting_approval: true,
  });
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>(
    'approve'
  );
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // API queries
  const { data: coursesData, isLoading: coursesLoading } =
    useGetCoursesAwaitingApprovalQuery(queryParams);

  const { data: courseDetails } = useGetCourseByIdQuery(selectedCourse!, {
    skip: !selectedCourse,
  });

  const { data: courseStats } = useGetCourseStatisticsQuery(selectedCourse!, {
    skip: !selectedCourse,
  });

  // API mutations
  const [approveCourse] = useApproveCourseMutation();
  const [rejectCourse] = useRejectCourseMutation();

  // Handlers
  const handleCourseSelect = useCallback((courseId: string) => {
    setSelectedCourse(courseId);
  }, []);

  const handleReviewSubmit = async () => {
    if (!selectedCourse) return;

    try {
      if (reviewAction === 'approve') {
        await approveCourse({
          id: selectedCourse,
          feedback: reviewFeedback,
        }).unwrap();

        toast({
          title: 'Course approved successfully',
          description: 'The course has been approved and is now published',
        });

        onCourseApproved?.(selectedCourse);
      } else {
        await rejectCourse({
          id: selectedCourse,
          reason: rejectionReason,
          feedback: reviewFeedback,
        }).unwrap();

        toast({
          title: 'Course rejected',
          description: 'The course has been rejected with feedback',
        });

        onCourseRejected?.(selectedCourse);
      }

      setShowReviewDialog(false);
      setSelectedCourse(null);
      setReviewFeedback('');
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to review course',
        variant: 'destructive',
      });
    }
  };

  const getLevelBadge = (level: string) => {
    const levelConfig = {
      beginner: {
        variant: 'default' as const,
        text: 'Beginner',
        color: 'text-green-600',
      },
      intermediate: {
        variant: 'secondary' as const,
        text: 'Intermediate',
        color: 'text-blue-600',
      },
      advanced: {
        variant: 'outline' as const,
        text: 'Advanced',
        color: 'text-orange-600',
      },
      expert: {
        variant: 'destructive' as const,
        text: 'Expert',
        color: 'text-red-600',
      },
      all_levels: {
        variant: 'outline' as const,
        text: 'All Levels',
        color: 'text-purple-600',
      },
    };

    const config =
      levelConfig[level as keyof typeof levelConfig] || levelConfig.beginner;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getPricingBadge = (course: Course) => {
    if (course.isFree) {
      return (
        <Badge variant="default" className="text-green-600">
          Free
        </Badge>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {course.currency} {course.price.toLocaleString()}
        </Badge>
        {course.originalPrice && course.originalPrice > course.price && (
          <Badge variant="secondary" className="text-xs line-through">
            {course.currency} {course.originalPrice.toLocaleString()}
          </Badge>
        )}
      </div>
    );
  };

  const getQualityScore = (course: Course) => {
    // Mock quality score calculation based on course completeness
    let score = 0;

    if (course.description && course.description.length > 100) score += 20;
    if (course.thumbnailUrl) score += 15;
    if (course.trailerVideoUrl) score += 15;
    if (course.totalLessons >= 5) score += 20;
    if (course.requirements.length > 0) score += 10;
    if (course.whatYouWillLearn.length >= 3) score += 10;
    if (course.tags.length >= 3) score += 10;

    return Math.min(score, 100);
  };

  const columns: ColumnDef<Course>[] = [
    {
      accessorKey: 'course',
      header: 'Course',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-muted">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{course.title}</div>
              <div className="truncate text-sm text-muted-foreground">
                {course.shortDescription ||
                  course.description?.substring(0, 60) + '...'}
              </div>
              <div className="mt-1 flex items-center gap-2">
                {getLevelBadge(course.level)}
                {course.featured && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="mr-1 h-3 w-3" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'teacher',
      header: 'Instructor',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={course.teacher?.avatarUrl}
                alt={course.teacher?.displayName}
              />
              <AvatarFallback>
                {course.teacher?.displayName?.charAt(0) || 'T'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {course.teacher?.displayName || 'Unknown'}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {course.teacher?.email || ''}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'metrics',
      header: 'Metrics',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <BookOpen className="h-3 w-3" />
              <span>{course.totalLessons} lessons</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3" />
              <span>
                {course.durationHours}h {course.durationMinutes}m
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Users className="h-3 w-3" />
              <span>{course.totalEnrollments} enrolled</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'pricing',
      header: 'Pricing',
      cell: ({ row }) => getPricingBadge(row.original),
    },
    {
      accessorKey: 'quality',
      header: 'Quality Score',
      cell: ({ row }) => {
        const course = row.original;
        const qualityScore = getQualityScore(course);

        let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
          'outline';
        if (qualityScore >= 80) variant = 'default';
        else if (qualityScore >= 60) variant = 'secondary';
        else if (qualityScore < 40) variant = 'destructive';

        return (
          <div className="flex items-center gap-2">
            <Progress value={qualityScore} className="w-16" />
            <Badge variant={variant} className="text-xs">
              {qualityScore}%
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCourseSelect(course.id)}
            >
              <Eye className="mr-1 h-3 w-3" />
              Review
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Course Approval</h2>
        <p className="text-muted-foreground">
          Review and approve courses submitted by instructors
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">{coursesData?.total || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  This Week
                </p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Review Time
                </p>
                <p className="text-2xl font-bold">2.5d</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Approval Rate
                </p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses Awaiting Approval</CardTitle>
          <CardDescription>
            Review course submissions and make approval decisions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={coursesData?.courses || []}
            loading={coursesLoading}
            pagination={{
              pageIndex: queryParams.page - 1,
              pageSize: queryParams.limit,
              pageCount: coursesData?.totalPages || 0,
              onPageChange: page =>
                setQueryParams(prev => ({ ...prev, page: page + 1 })),
            }}
          />
        </CardContent>
      </Card>

      {/* Course Details Dialog */}
      {selectedCourse && courseDetails && (
        <Dialog
          open={!!selectedCourse}
          onOpenChange={() => setSelectedCourse(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Course Review: {courseDetails.title}</DialogTitle>
              <DialogDescription>
                Review all aspects of this course before making an approval
                decision
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="quality">Quality</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Course Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                        {courseDetails.thumbnailUrl ? (
                          <img
                            src={courseDetails.thumbnailUrl}
                            alt={courseDetails.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold">{courseDetails.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {courseDetails.shortDescription}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {getLevelBadge(courseDetails.level)}
                        <Badge variant="outline">
                          {courseDetails.language}
                        </Badge>
                        {courseDetails.hasCertificate && (
                          <Badge variant="secondary">Certificate</Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Duration:</span>
                          <span className="text-sm font-medium">
                            {courseDetails.durationHours}h{' '}
                            {courseDetails.durationMinutes}m
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Lessons:</span>
                          <span className="text-sm font-medium">
                            {courseDetails.totalLessons}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Sections:</span>
                          <span className="text-sm font-medium">
                            {courseDetails.totalSections}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Instructor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={courseDetails.teacher?.avatarUrl} />
                          <AvatarFallback>
                            {courseDetails.teacher?.displayName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {courseDetails.teacher?.displayName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {courseDetails.teacher?.email}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Previous Courses:</span>
                          <span className="text-sm font-medium">5</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Student Rating:</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">4.8</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Students:</span>
                          <span className="text-sm font-medium">1,234</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Course Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm">
                      {courseDetails.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        What You'll Learn
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {courseDetails.whatYouWillLearn.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {courseDetails.requirements.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tags & Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {courseDetails.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {courseDetails.trailerVideoUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preview Video</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <video
                          src={courseDetails.trailerVideoUrl}
                          controls
                          className="h-full w-full"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Bot className="h-5 w-5" />
                        AI Quality Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Overall Score:</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={getQualityScore(courseDetails)}
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {getQualityScore(courseDetails)}%
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Content Quality:</span>
                          <Badge variant="default">Good</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Structure:</span>
                          <Badge variant="secondary">Excellent</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Completeness:</span>
                          <Badge variant="outline">Fair</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5" />
                        Content Verification
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Plagiarism Check:</span>
                          <Badge variant="default" className="text-green-600">
                            Clean (2% similarity)
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Content Guidelines:</span>
                          <Badge variant="default">Compliant</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Technical Review:</span>
                          <Badge variant="secondary">Passed</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Copyright Issues:</span>
                          <Badge variant="default">None Found</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Course Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        Course analytics will be displayed here once available
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setSelectedCourse(null)}>
                Close
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setReviewAction('reject');
                    setShowReviewDialog(true);
                  }}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>

                <Button
                  onClick={() => {
                    setReviewAction('approve');
                    setShowReviewDialog(true);
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Decision Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Course' : 'Reject Course'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'This will approve the course and make it available to students.'
                : 'This will reject the course and notify the instructor.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {reviewAction === 'reject' && (
              <div>
                <label className="text-sm font-medium">
                  Rejection Reason *
                </label>
                <Textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection..."
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">
                {reviewAction === 'approve' ? 'Approval Notes' : 'Feedback'}
              </label>
              <Textarea
                value={reviewFeedback}
                onChange={e => setReviewFeedback(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Optional notes for the instructor...'
                    : 'Provide detailed feedback for improvement...'
                }
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={reviewAction === 'reject' && !rejectionReason.trim()}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {reviewAction === 'approve' ? 'Approve Course' : 'Reject Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseApprovalWorkflow;
