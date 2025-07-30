'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  FileText,
  Code,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Timer,
  User,
  Search,
  RefreshCw,
  Eye,
  Download,
  Star,
  Bot,
  MoreHorizontal,
  GraduationCap,
  Play,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Import API hooks
import { useGetGradingQueueQuery } from '@/lib/redux/api/teacher-dashboard-api';

interface GradingQueueWidgetProps {
  gradingItems?: any[];
  isLoading?: boolean;
  className?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'assignment':
      return <FileText className="h-4 w-4" />;
    case 'quiz':
      return <ClipboardList className="h-4 w-4" />;
    case 'exam':
      return <GraduationCap className="h-4 w-4" />;
    case 'project':
      return <BookOpen className="h-4 w-4" />;
    case 'code':
      return <Code className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'assignment':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'quiz':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'exam':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'project':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'code':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: string, isOverdue: boolean) => {
  if (isOverdue) return 'bg-red-100 text-red-800 border-red-200';

  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

const formatEstimatedTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export function GradingQueueWidget({
  gradingItems: propItems,
  isLoading: propLoading,
  className,
}: GradingQueueWidgetProps) {
  const { toast } = useToast();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [queueTab, setQueueTab] = useState('all');

  // API calls
  const {
    data: apiItems,
    isLoading: apiLoading,
    error,
    refetch,
  } = useGetGradingQueueQuery({
    type: typeFilter !== 'all' ? typeFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    limit: 50,
  });

  const allItems = propItems || apiItems || [];
  const isLoading = propLoading || apiLoading;

  const filteredItems = useMemo(() => {
    let filtered = allItems.filter(item => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab =
        queueTab === 'all' ||
        (queueTab === 'overdue' && item.isOverdue) ||
        (queueTab === 'priority' && item.priority === 'high') ||
        (queueTab === 'ai-ready' && item.hasAIPreGrade);

      return matchesSearch && matchesTab;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'submittedAt':
          return (
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
          );
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (
            priorityOrder[b.priority as keyof typeof priorityOrder] -
            priorityOrder[a.priority as keyof typeof priorityOrder]
          );
        case 'estimatedTime':
          return a.estimatedGradingTime - b.estimatedGradingTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allItems, searchQuery, queueTab, sortBy]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const overdueCount = allItems.filter(item => item.isOverdue).length;
    const highPriorityCount = allItems.filter(
      item => item.priority === 'high'
    ).length;
    const aiReadyCount = allItems.filter(item => item.hasAIPreGrade).length;
    const totalEstimatedTime = allItems.reduce(
      (sum, item) => sum + item.estimatedGradingTime,
      0
    );

    return {
      total: allItems.length,
      overdue: overdueCount,
      highPriority: highPriorityCount,
      aiReady: aiReadyCount,
      estimatedTime: totalEstimatedTime,
    };
  }, [allItems]);

  const handleStartGrading = (item: any) => {
    toast({
      title: 'Starting Grading Session',
      description: `Opening ${item.title} for grading...`,
    });
    // Navigate to grading interface
    // window.open(`/teacher/grading/${item.id}`, '_blank');
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: 'Bulk Action',
      description: `Performing ${action} on selected items...`,
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Grading Queue
          </CardTitle>
          <CardDescription>Failed to load grading queue data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-purple-600" />
                Grading Queue
                {summaryStats.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {summaryStats.total}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage and prioritize submissions awaiting grades
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Bulk Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction('grade-ai')}
                  >
                    <Bot className="mr-2 h-4 w-4" />
                    AI Pre-Grade Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Queue
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBulkAction('mark-priority')}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Mark as Priority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Summary Stats */}
          {summaryStats.total > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-lg font-bold text-red-900">
                      {summaryStats.overdue}
                    </p>
                    <p className="text-xs text-red-600">Overdue</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-lg font-bold text-orange-900">
                      {summaryStats.highPriority}
                    </p>
                    <p className="text-xs text-orange-600">High Priority</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-lg font-bold text-blue-900">
                      {summaryStats.aiReady}
                    </p>
                    <p className="text-xs text-blue-600">AI Ready</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-purple-50 p-3">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-lg font-bold text-purple-900">
                      {formatEstimatedTime(summaryStats.estimatedTime)}
                    </p>
                    <p className="text-xs text-purple-600">Est. Time</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="submittedAt">Submitted</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="estimatedTime">Est. Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Queue Tabs */}
          <Tabs value={queueTab} onValueChange={setQueueTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({summaryStats.total})</TabsTrigger>
              <TabsTrigger value="overdue">
                Overdue ({summaryStats.overdue})
              </TabsTrigger>
              <TabsTrigger value="priority">
                Priority ({summaryStats.highPriority})
              </TabsTrigger>
              <TabsTrigger value="ai-ready">
                AI Ready ({summaryStats.aiReady})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Grading Queue Items */}
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-lg font-medium text-green-900">
                All Caught Up!
              </h3>
              <p className="text-green-600">
                {searchQuery || queueTab !== 'all'
                  ? 'No items match your current filters.'
                  : 'No submissions are waiting for grading.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  className={`rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
                    item.isOverdue ? 'border-red-200 bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Submission Type Icon */}
                    <div
                      className={`rounded-lg border p-2 ${getTypeColor(item.type)}`}
                    >
                      {getTypeIcon(item.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-lg font-semibold">
                            {item.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {item.courseName}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          {item.hasAIPreGrade && (
                            <Badge
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-blue-700"
                            >
                              <Bot className="mr-1 h-3 w-3" />
                              AI Ready
                              {item.aiConfidence && (
                                <span className="ml-1">
                                  ({item.aiConfidence}%)
                                </span>
                              )}
                            </Badge>
                          )}
                          <Badge
                            className={`border ${getPriorityColor(item.priority, item.isOverdue)}`}
                            variant="outline"
                          >
                            {item.isOverdue
                              ? 'OVERDUE'
                              : item.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Student Info */}
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {item.studentName
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {item.studentName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatTimeAgo(item.submittedAt)}
                          </p>
                        </div>
                      </div>

                      {/* Submission Details */}
                      <div className="mb-3 grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Due Date</p>
                            <p
                              className={`text-xs ${item.isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}
                            >
                              {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Est. Time</p>
                            <p className="text-xs text-muted-foreground">
                              {formatEstimatedTime(item.estimatedGradingTime)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Type</p>
                            <p className="text-xs capitalize text-muted-foreground">
                              {item.submissionType}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <ClipboardList className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Status</p>
                            <p className="text-xs text-muted-foreground">
                              Pending Grade
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-2">
                          {item.isOverdue && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="mr-1 h-3 w-3" />
                              Overdue by{' '}
                              {Math.floor(
                                (new Date().getTime() -
                                  new Date(item.dueDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{' '}
                              days
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </Button>

                          {item.hasAIPreGrade && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              <Bot className="mr-2 h-4 w-4" />
                              View AI Grade
                            </Button>
                          )}

                          <Button
                            onClick={() => handleStartGrading(item)}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Grading
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download Files
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="mr-2 h-4 w-4" />
                                Mark Priority
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Contact Student
                              </DropdownMenuItem>
                              {!item.hasAIPreGrade && (
                                <DropdownMenuItem>
                                  <Bot className="mr-2 h-4 w-4" />
                                  Request AI Pre-Grade
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Calendar className="mr-2 h-4 w-4" />
                                Extend Deadline
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredItems.length > 0 &&
            filteredItems.length < allItems.length && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => {}}>
                  Load More Items
                </Button>
              </div>
            )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
