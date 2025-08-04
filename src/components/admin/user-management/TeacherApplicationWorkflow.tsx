'use client';

import React, { useState, useCallback } from 'react';
import {
  Clock,
  Check,
  X,
  AlertCircle,
  FileText,
  Download,
  Eye,
  User,
  GraduationCap,
  Award,
  IdCard,
} from 'lucide-react';
import {
  useGetTeacherApplicationsQuery,
  useGetTeacherApplicationByIdQuery,
  useApproveTeacherApplicationMutation,
  useRejectTeacherApplicationMutation,
  useReviewTeacherApplicationMutation,
} from '@/lib/redux/api/user-management-api';
import { ColumnDef } from '@tanstack/react-table';
import {
  TeacherApplication,
  TeacherApplicationsQueryParams,
} from '@/types/user-management';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';

interface TeacherApplicationWorkflowProps {
  onApplicationApproved?: (applicationId: string) => void;
  onApplicationRejected?: (applicationId: string) => void;
}

const TeacherApplicationWorkflow: React.FC<TeacherApplicationWorkflowProps> = ({
  onApplicationApproved,
  onApplicationRejected,
}) => {
  const { toast } = useToast();

  // State management
  const [queryParams, setQueryParams] =
    useState<TeacherApplicationsQueryParams>({
      page: 1,
      limit: 20,
      sortBy: 'submittedAt',
      sortOrder: 'desc',
    });
  const [selectedApplication, setSelectedApplication] = useState<string | null>(
    null
  );
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<
    'approve' | 'reject' | 'resubmit'
  >('approve');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: applicationsData, isLoading: applicationsLoading } =
    useGetTeacherApplicationsQuery(queryParams);

  const { data: applicationDetails } = useGetTeacherApplicationByIdQuery(
    selectedApplication!,
    {
      skip: !selectedApplication,
    }
  );

  const [approveApplication] = useApproveTeacherApplicationMutation();
  const [rejectApplication] = useRejectTeacherApplicationMutation();
  const [reviewApplication] = useReviewTeacherApplicationMutation();

  // Handlers
  const handleApplicationSelect = useCallback((applicationId: string) => {
    setSelectedApplication(applicationId);
  }, []);

  const handleReviewSubmit = async () => {
    if (!selectedApplication) return;

    try {
      const reviewData = {
        id: selectedApplication,
        status:
          reviewAction === 'approve'
            ? ('approved' as const)
            : reviewAction === 'reject'
              ? ('rejected' as const)
              : ('resubmission_required' as const),
        rejectionReason:
          reviewAction === 'reject' ? rejectionReason : undefined,
        feedback: reviewFeedback,
      };

      await reviewApplication(reviewData).unwrap();

      toast({
        title: 'Application reviewed successfully',
        description: `Application has been ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'marked for resubmission'}`,
      });

      if (reviewAction === 'approve' && onApplicationApproved) {
        onApplicationApproved(selectedApplication);
      } else if (reviewAction === 'reject' && onApplicationRejected) {
        onApplicationRejected(selectedApplication);
      }

      setShowReviewDialog(false);
      setSelectedApplication(null);
      setReviewFeedback('');
      setRejectionReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to review application',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, text: 'Pending', icon: Clock },
      under_review: {
        variant: 'default' as const,
        text: 'Under Review',
        icon: Eye,
      },
      approved: { variant: 'default' as const, text: 'Approved', icon: Check },
      rejected: { variant: 'destructive' as const, text: 'Rejected', icon: X },
      resubmission_required: {
        variant: 'destructive' as const,
        text: 'Resubmission Required',
        icon: AlertCircle,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getCompletionProgress = (application: TeacherApplication) => {
    const requirements = [
      application.requiredDocuments.resume,
      application.requiredDocuments.degree,
      application.requiredDocuments.certification,
      application.requiredDocuments.identification,
      application.teachingExperience.years > 0,
      application.specializations.length > 0,
    ];

    const completed = requirements.filter(Boolean).length;
    return Math.round((completed / requirements.length) * 100);
  };

  const columns: ColumnDef<TeacherApplication>[] = [
    {
      accessorKey: 'applicant',
      header: 'Applicant',
      cell: ({ row }) => {
        const application = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={application.user.avatarUrl}
                alt={application.user.displayName}
              />
              <AvatarFallback>
                {application.user.firstName?.[0]}
                {application.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{application.user.displayName}</div>
              <div className="text-sm text-muted-foreground">
                {application.user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'applicationStatus',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.applicationStatus),
    },
    {
      accessorKey: 'completeness',
      header: 'Completeness',
      cell: ({ row }) => {
        const progress = getCompletionProgress(row.original);
        return (
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-16" />
            <span className="text-sm">{progress}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'experience',
      header: 'Experience',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.teachingExperience.years} years
        </div>
      ),
    },
    {
      accessorKey: 'specializations',
      header: 'Specializations',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.specializations
            .slice(0, 2)
            .map((spec: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {spec}
              </Badge>
            ))}
          {row.original.specializations.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.specializations.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.submittedAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const application = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplicationSelect(application.id)}
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
        <h2 className="text-2xl font-bold tracking-tight">
          Teacher Applications
        </h2>
        <p className="text-muted-foreground">
          Review and approve teacher applications
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Applications Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <Select
              value={queryParams.status || 'all'}
              onValueChange={value =>
                setQueryParams(prev => ({
                  ...prev,
                  status: value === 'all' ? undefined : value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="resubmission_required">
                  Resubmission Required
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={applicationsData?.applications || []}
            loading={applicationsLoading}
            pagination={{
              pageIndex: queryParams.page! - 1,
              pageSize: queryParams.limit!,
              pageCount: applicationsData?.totalPages || 0,
              onPageChange: page =>
                setQueryParams(prev => ({ ...prev, page: page + 1 })),
            }}
          />
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      {selectedApplication && applicationDetails && (
        <Dialog
          open={!!selectedApplication}
          onOpenChange={() => setSelectedApplication(null)}
        >
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Teacher Application Review</DialogTitle>
              <DialogDescription>
                Review application from {applicationDetails.user.displayName}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="background">Background</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={applicationDetails.user.avatarUrl}
                          />
                          <AvatarFallback>
                            {applicationDetails.user.firstName?.[0]}
                            {applicationDetails.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {applicationDetails.user.displayName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {applicationDetails.user.email}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Phone:
                          </span>
                          <span className="text-sm">
                            {applicationDetails.user.phone || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Location:
                          </span>
                          <span className="text-sm">
                            {applicationDetails.userProfile.city},{' '}
                            {applicationDetails.userProfile.country}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Organization:
                          </span>
                          <span className="text-sm">
                            {applicationDetails.userProfile.organization ||
                              'Not provided'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Application Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        {getStatusBadge(applicationDetails.applicationStatus)}
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Submitted:</span>
                        <span className="text-sm">
                          {new Date(
                            applicationDetails.submittedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      {applicationDetails.reviewedAt && (
                        <div className="flex items-center justify-between">
                          <span>Reviewed:</span>
                          <span className="text-sm">
                            {new Date(
                              applicationDetails.reviewedAt
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span>Completeness:</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={getCompletionProgress(applicationDetails)}
                            className="w-16"
                          />
                          <span className="text-sm">
                            {getCompletionProgress(applicationDetails)}%
                          </span>
                        </div>
                      </div>

                      {applicationDetails.rejectionReason && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Rejection Reason:</strong>{' '}
                            {applicationDetails.rejectionReason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Required Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(applicationDetails.requiredDocuments).map(
                        ([docType, isSubmitted]) => {
                          const documentUrl =
                            applicationDetails.submittedDocuments[
                              `${docType}Url` as keyof typeof applicationDetails.submittedDocuments
                            ];
                          return (
                            <div
                              key={docType}
                              className="flex items-center justify-between rounded-lg border p-3"
                            >
                              <div className="flex items-center gap-2">
                                {docType === 'resume' && (
                                  <FileText className="h-4 w-4" />
                                )}
                                {docType === 'degree' && (
                                  <GraduationCap className="h-4 w-4" />
                                )}
                                {docType === 'certification' && (
                                  <Award className="h-4 w-4" />
                                )}
                                {docType === 'identification' && (
                                  <IdCard className="h-4 w-4" />
                                )}
                                <span className="capitalize">{docType}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {isSubmitted ? (
                                  <>
                                    <Badge
                                      variant="default"
                                      className="text-green-600"
                                    >
                                      <Check className="mr-1 h-3 w-3" />
                                      Submitted
                                    </Badge>
                                    {documentUrl && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <a
                                          href={documentUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <Download className="h-3 w-3" />
                                        </a>
                                      </Button>
                                    )}
                                  </>
                                ) : (
                                  <Badge variant="destructive">
                                    <X className="mr-1 h-3 w-3" />
                                    Missing
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-4">
                <div className="grid grid-cols-1 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Teaching Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">
                            Years of Experience
                          </label>
                          <p className="text-2xl font-bold text-primary">
                            {applicationDetails.teachingExperience.years} years
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Previous Institutions
                          </label>
                          <div className="space-y-1">
                            {applicationDetails.teachingExperience.previousInstitutions.map(
                              (institution, index) => (
                                <Badge key={index} variant="outline">
                                  {institution}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Experience Description
                        </label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {applicationDetails.teachingExperience.description ||
                            'No description provided'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {applicationDetails.specializations.map(
                          (specialization, index) => (
                            <Badge key={index} variant="secondary">
                              {specialization}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Availability & Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">
                          Available Schedule
                        </label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {applicationDetails.availableSchedule.fullTime && (
                            <Badge variant="outline">Full Time</Badge>
                          )}
                          {applicationDetails.availableSchedule.partTime && (
                            <Badge variant="outline">Part Time</Badge>
                          )}
                          {applicationDetails.availableSchedule.weekends && (
                            <Badge variant="outline">Weekends</Badge>
                          )}
                          {applicationDetails.availableSchedule.evenings && (
                            <Badge variant="outline">Evenings</Badge>
                          )}
                        </div>
                      </div>

                      {applicationDetails.expectedSalaryRange && (
                        <div>
                          <label className="text-sm font-medium">
                            Expected Salary Range
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {applicationDetails.expectedSalaryRange.currency}{' '}
                            {applicationDetails.expectedSalaryRange.min.toLocaleString()}{' '}
                            -{' '}
                            {applicationDetails.expectedSalaryRange.max.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="background" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Background Check Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge
                        variant={
                          applicationDetails.backgroundCheckStatus ===
                          'completed'
                            ? 'default'
                            : applicationDetails.backgroundCheckStatus ===
                                'failed'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {applicationDetails.backgroundCheckStatus
                          .replace('_', ' ')
                          .toUpperCase()}
                      </Badge>
                    </div>

                    {applicationDetails.backgroundCheckResults && (
                      <div className="mt-4">
                        <label className="text-sm font-medium">
                          Background Check Results
                        </label>
                        <div className="mt-2 rounded-lg bg-muted p-3">
                          <pre className="text-sm">
                            {JSON.stringify(
                              applicationDetails.backgroundCheckResults,
                              null,
                              2
                            )}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {applicationDetails.interviewSchedule && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Interview Preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">
                          Preferred Dates
                        </label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {applicationDetails.interviewSchedule.preferredDates.map(
                            (date, index) => (
                              <Badge key={index} variant="outline">
                                {new Date(date).toLocaleDateString()}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">
                          Preferred Times
                        </label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {applicationDetails.interviewSchedule.preferredTimes.map(
                            (time, index) => (
                              <Badge key={index} variant="outline">
                                {time}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Timezone</label>
                        <p className="text-sm">
                          {applicationDetails.interviewSchedule.timezone}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
              </div>

              <div className="flex gap-2">
                {applicationDetails.applicationStatus === 'pending' ||
                applicationDetails.applicationStatus === 'under_review' ? (
                  <>
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
                      variant="outline"
                      onClick={() => {
                        setReviewAction('resubmit');
                        setShowReviewDialog(true);
                      }}
                    >
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Request Resubmission
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
                  </>
                ) : (
                  <Badge variant="outline">
                    Application already {applicationDetails.applicationStatus}
                  </Badge>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve'
                ? 'Approve Application'
                : reviewAction === 'reject'
                  ? 'Reject Application'
                  : 'Request Resubmission'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? 'This will approve the teacher application and grant teacher access.'
                : reviewAction === 'reject'
                  ? 'This will reject the teacher application. Please provide a reason.'
                  : 'This will request the applicant to resubmit with corrections.'}
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
                {reviewAction !== 'approve' && ' *'}
              </label>
              <Textarea
                value={reviewFeedback}
                onChange={e => setReviewFeedback(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Optional notes for the approval...'
                    : 'Provide detailed feedback for the applicant...'
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
              disabled={
                (reviewAction === 'reject' && !rejectionReason.trim()) ||
                (reviewAction === 'resubmit' && !reviewFeedback.trim())
              }
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {reviewAction === 'approve'
                ? 'Approve'
                : reviewAction === 'reject'
                  ? 'Reject'
                  : 'Request Resubmission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherApplicationWorkflow;
