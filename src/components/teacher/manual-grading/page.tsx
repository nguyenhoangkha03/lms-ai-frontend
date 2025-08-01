'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Zap,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowRight,
  Bot,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';

import { ManualGradingInterface } from '@/components/teacher/gradebook/ManualGradingInterface';
import { BulkGradingActions } from '@/components/teacher/gradebook/BulkGradingActions';

import {
  useGetManualGradingQueueQuery,
  useGetManualGradingSubmissionQuery,
  useGetManualGradingStatisticsQuery,
} from '@/lib/redux/api/gradebook-api';

import {
  ManualGradingQueue,
  ManualGradingSubmission,
} from '@/lib/types/gradebook';
import { Checkbox } from '@radix-ui/react-checkbox';

export default function ManualGradingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // URL state
  const selectedSubmissionId = searchParams.get('submission');

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedSubmissions, setSelectedSubmissions] = useState<string[]>([]);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);

  // API queries
  const {
    data: queueData,
    isLoading: isLoadingQueue,
    refetch: refetchQueue,
  } = useGetManualGradingQueueQuery({
    search: searchQuery,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const { data: submissionData, isLoading: isLoadingSubmission } =
    useGetManualGradingSubmissionQuery(selectedSubmissionId || '', {
      skip: !selectedSubmissionId,
    });

  const { data: statisticsData } = useGetManualGradingStatisticsQuery();

  // Get flattened submissions list for navigation
  const allSubmissions =
    queueData?.flatMap(
      (queue: ManualGradingQueue) =>
        queue.submissions?.map(sub => ({ ...sub, queueInfo: queue })) || []
    ) || [];

  const handleSubmissionSelect = (submissionId: string) => {
    router.push(`/teacher/manual-grading?submission=${submissionId}`);
  };

  const handleNextSubmission = () => {
    if (currentSubmissionIndex < allSubmissions.length - 1) {
      const nextSubmission = allSubmissions[currentSubmissionIndex + 1];
      setCurrentSubmissionIndex(currentSubmissionIndex + 1);
      handleSubmissionSelect(nextSubmission.id);
    }
  };

  const handlePreviousSubmission = () => {
    if (currentSubmissionIndex > 0) {
      const prevSubmission = allSubmissions[currentSubmissionIndex - 1];
      setCurrentSubmissionIndex(currentSubmissionIndex - 1);
      handleSubmissionSelect(prevSubmission.id);
    }
  };

  const handleGradingComplete = () => {
    toast({
      title: 'Grade Submitted',
      description: 'Grade has been successfully submitted.',
    });
    refetchQueue();

    // Auto-navigate to next submission
    if (currentSubmissionIndex < allSubmissions.length - 1) {
      handleNextSubmission();
    } else {
      router.push('/teacher/manual-grading');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      case 'exam':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (selectedSubmissionId && submissionData) {
    return (
      <ManualGradingInterface
        submission={submissionData}
        onComplete={handleGradingComplete}
        onNext={
          currentSubmissionIndex < allSubmissions.length - 1
            ? handleNextSubmission
            : undefined
        }
        onPrevious={
          currentSubmissionIndex > 0 ? handlePreviousSubmission : undefined
        }
        currentIndex={currentSubmissionIndex + 1}
        totalCount={allSubmissions.length}
        onClose={() => router.push('/teacher/manual-grading')}
      />
    );
  }

  if (isLoadingQueue) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manual Grading Queue
          </h1>
          <p className="text-muted-foreground">
            Review and grade submissions requiring manual attention
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push('/teacher/gradebook')}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Back to Gradebook
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statisticsData?.totalPending || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Submissions awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Grading Time
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statisticsData?.avgGradingTime
                ? `${Math.round(statisticsData.avgGradingTime)}m`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Per submission</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statisticsData?.completionRate
                ? `${Math.round(statisticsData.completionRate * 100)}%`
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {queueData?.filter(q => q.priority === 'urgent').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Priority
                    {priorityFilter !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {priorityFilter}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPriorityFilter('all')}>
                    All Priorities
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('urgent')}>
                    Urgent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('high')}>
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('medium')}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPriorityFilter('low')}>
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Type
                    {typeFilter !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {typeFilter}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                    All Types
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('assignment')}>
                    Assignments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('quiz')}>
                    Quizzes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('exam')}>
                    Exams
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter('project')}>
                    Projects
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedSubmissions.length > 0 && (
              <BulkGradingActions
                selectedSubmissions={selectedSubmissions}
                onComplete={() => {
                  setSelectedSubmissions([]);
                  refetchQueue();
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions Queue</CardTitle>
        </CardHeader>
        <CardContent>
          {queueData && queueData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedSubmissions.length === allSubmissions.length
                      }
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedSubmissions(allSubmissions.map(s => s.id));
                        } else {
                          setSelectedSubmissions([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Est. Time</TableHead>
                  <TableHead>AI Pre-grade</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allSubmissions.map(submission => {
                  const isSelected = selectedSubmissions.includes(
                    submission.id
                  );
                  const isOverdue =
                    submission.queueInfo.dueDate &&
                    new Date(submission.queueInfo.dueDate) < new Date();

                  return (
                    <TableRow
                      key={submission.id}
                      className={isSelected ? 'bg-muted/50' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={checked => {
                            if (checked) {
                              setSelectedSubmissions([
                                ...selectedSubmissions,
                                submission.id,
                              ]);
                            } else {
                              setSelectedSubmissions(
                                selectedSubmissions.filter(
                                  id => id !== submission.id
                                )
                              );
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-xs font-medium">
                              {submission.studentName
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium">
                            {submission.studentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {submission.queueInfo.assessmentTitle}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {submission.queueInfo.courseTitle}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(submission.queueInfo.type)}
                          <span className="capitalize">
                            {submission.queueInfo.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPriorityColor(
                            submission.queueInfo.priority
                          )}
                        >
                          {submission.queueInfo.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {new Date(
                              submission.submittedAt
                            ).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              submission.submittedAt
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`flex flex-col ${isOverdue ? 'text-red-600' : ''}`}
                        >
                          <span className="text-sm">
                            {submission.queueInfo.dueDate
                              ? new Date(
                                  submission.queueInfo.dueDate
                                ).toLocaleDateString()
                              : 'No due date'}
                          </span>
                          {isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          ~{submission.estimatedGradingTime}m
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.aiPreGrade ? (
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-blue-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {submission.aiPreGrade.score.toFixed(1)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {(
                                  submission.aiPreGrade.confidence * 100
                                ).toFixed(0)}
                                % conf.
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleSubmissionSelect(submission.id)
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Grade
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleSubmissionSelect(submission.id)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Grade Submission
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview Only
                              </DropdownMenuItem>
                              {submission.aiPreGrade && (
                                <DropdownMenuItem>
                                  <Bot className="mr-2 h-4 w-4" />
                                  View AI Analysis
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-12 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-semibold">All Caught Up!</h3>
              <p className="text-muted-foreground">
                No submissions are currently pending manual grading.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats by Assessment */}
      {statisticsData?.byAssessment &&
        statisticsData.byAssessment.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Grading Progress by Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statisticsData.byAssessment.map((assessment: any) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <h4 className="font-medium">{assessment.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {assessment.courseName}
                          </p>
                        </div>
                        <Badge
                          className={getPriorityColor(assessment.priority)}
                        >
                          {assessment.priority}
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>Grading Progress</span>
                          <span>
                            {assessment.gradedCount}/
                            {assessment.totalSubmissions}
                          </span>
                        </div>
                        <Progress
                          value={
                            (assessment.gradedCount /
                              assessment.totalSubmissions) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm text-muted-foreground">
                        Est. remaining time
                      </div>
                      <div className="font-medium">
                        {Math.round(assessment.estimatedRemainingTime / 60)}h{' '}
                        {assessment.estimatedRemainingTime % 60}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
