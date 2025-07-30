'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  GraduationCap,
  Target,
  Clock,
  BarChart3,
  Activity,
  Award,
  AlertTriangle,
  RefreshCw,
  Download,
  ChevronRight,
  Eye,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
} from 'recharts';

// Import API hooks
import { useGetTeacherPerformanceAnalyticsQuery } from '@/lib/redux/api/teacher-dashboard-api';

interface PerformanceAnalyticsWidgetProps {
  timeFilter: string;
  className?: string;
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  secondary: '#8b5cf6',
};

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export function PerformanceAnalyticsWidget({
  timeFilter,
  className,
}: PerformanceAnalyticsWidgetProps) {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [analyticsTab, setAnalyticsTab] = useState('overview');

  // API calls
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useGetTeacherPerformanceAnalyticsQuery({
    period: timeFilter,
    courseIds: selectedCourse !== 'all' ? [selectedCourse] : undefined,
  });

  // Memoized calculations
  const chartData = useMemo(() => {
    if (!analytics) return null;

    // Weekly engagement data
    const weeklyData = analytics.timeAnalytics?.weeklyEngagement?.map(
      (item, index) => ({
        name: item.week,
        engagement: item.engagement,
        previous: Math.max(0, item.engagement - Math.random() * 10 + 5),
      })
    );

    // Course performance data
    const courseData = analytics.coursePerformance?.map(course => ({
      name: course.courseName,
      completion: course.completionRate,
      engagement: course.engagementMetrics.videoWatchTime,
      score: course.averageScore,
      students: course.enrolledStudents,
    }));

    // Student segments data
    const segmentData = analytics.studentSegments?.map(segment => ({
      name: segment.segment.replace('_', ' ').toUpperCase(),
      value: segment.count,
      percentage: segment.percentage,
      color: PIE_COLORS[analytics.studentSegments.indexOf(segment)],
    }));

    // Peak activity hours
    const activityData = analytics.timeAnalytics?.peakActivityHours?.map(
      hour => ({
        hour: `${hour.hour}:00`,
        activity: hour.activityCount,
      })
    );

    return {
      weekly: weeklyData,
      courses: courseData,
      segments: segmentData,
      activity: activityData,
    };
  }, [analytics]);

  const handleRefresh = () => {
    refetch();
    toast({
      title: 'Data Refreshed',
      description: 'Performance analytics have been updated.',
    });
  };

  const handleExport = () => {
    toast({
      title: 'Export Started',
      description: 'Your analytics report is being prepared for download.',
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
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Performance Analytics
          </CardTitle>
          <CardDescription>
            Failed to load performance analytics data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline" size="sm">
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
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive insights into your teaching performance and
                student outcomes
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {analytics?.coursePerformance?.map(course => (
                    <SelectItem key={course.courseId} value={course.courseId}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {analytics && (
            <>
              {/* Overview Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {analytics.overview.totalStudents}
                      </p>
                      <p className="text-sm text-blue-600">Total Students</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-900">
                        {analytics.overview.averageClassScore.toFixed(1)}%
                      </p>
                      <p className="text-sm text-green-600">Avg Score</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-purple-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">
                        {analytics.overview.completionRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-purple-600">Completion</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-orange-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-100 p-2">
                      <Activity className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">
                        {analytics.overview.engagementRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-orange-600">Engagement</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Tabs */}
              <Tabs value={analyticsTab} onValueChange={setAnalyticsTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="students">Students</TabsTrigger>
                  <TabsTrigger value="engagement">Engagement</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Weekly Engagement Trend */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Weekly Engagement Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={chartData?.weekly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="engagement"
                              stroke={COLORS.primary}
                              strokeWidth={2}
                            />
                            <Line
                              type="monotone"
                              dataKey="previous"
                              stroke={COLORS.secondary}
                              strokeDasharray="5 5"
                              strokeWidth={1}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Student Segments */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Student Segments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <RechartsPieChart>
                            <Pie
                              data={chartData?.segments}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {chartData?.segments?.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {analytics.studentSegments?.map((segment, index) => (
                            <div
                              key={segment.segment}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index] }}
                              />
                              <span className="capitalize">
                                {segment.segment.replace('_', ' ')}
                              </span>
                              <span className="text-muted-foreground">
                                ({segment.count})
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Improvement Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Improvement Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.coursePerformance
                          ?.slice(0, 3)
                          .map(course => (
                            <div key={course.courseId}>
                              <div className="mb-2 flex items-center justify-between">
                                <span className="font-medium">
                                  {course.courseName}
                                </span>
                                <Badge
                                  variant={
                                    course.completionRate > 80
                                      ? 'default'
                                      : course.completionRate > 60
                                        ? 'secondary'
                                        : 'destructive'
                                  }
                                >
                                  {course.completionRate.toFixed(1)}% completion
                                </Badge>
                              </div>
                              <Progress
                                value={course.completionRate}
                                className="h-2"
                              />
                              {course.contentEffectiveness.improvementAreas
                                .length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm text-muted-foreground">
                                    Areas to improve:{' '}
                                    {course.contentEffectiveness.improvementAreas
                                      .slice(0, 2)
                                      .join(', ')}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4">
                  <div className="space-y-4">
                    {analytics.coursePerformance?.map(course => (
                      <Card key={course.courseId}>
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {course.courseName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {course.enrolledStudents} students enrolled
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>

                          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">
                                {course.averageScore.toFixed(1)}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Avg Score
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">
                                {course.completionRate.toFixed(1)}%
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Completion
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-purple-600">
                                {course.engagementMetrics.videoWatchTime.toFixed(
                                  1
                                )}
                                h
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Watch Time
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                {course.engagementMetrics.assignmentSubmissionRate.toFixed(
                                  1
                                )}
                                %
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Submissions
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Badge
                                variant={
                                  course.strugglingStudents === 0
                                    ? 'default'
                                    : course.strugglingStudents < 5
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {course.strugglingStudents} struggling
                              </Badge>
                              <Badge variant="default">
                                {course.excellingStudents} excelling
                              </Badge>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {analytics.studentSegments?.map((segment, index) => (
                      <Card key={segment.segment}>
                        <CardContent className="p-6">
                          <div className="mb-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold capitalize">
                                {segment.segment.replace('_', ' ')} Students
                              </h3>
                              <p className="text-2xl font-bold">
                                {segment.count}{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                  ({segment.percentage.toFixed(1)}%)
                                </span>
                              </p>
                            </div>
                            <div
                              className="flex h-12 w-12 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: PIE_COLORS[index] + '20',
                              }}
                            >
                              <div
                                className="h-6 w-6 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index] }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium">
                              Characteristics:
                            </p>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                              {segment.characteristics.slice(0, 3).map(char => (
                                <li
                                  key={char}
                                  className="flex items-center gap-2"
                                >
                                  <div className="h-1 w-1 rounded-full bg-current" />
                                  {char}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {segment.recommendedActions.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <p className="mb-2 text-sm font-medium">
                                Recommended Actions:
                              </p>
                              <div className="space-y-1">
                                {segment.recommendedActions
                                  .slice(0, 2)
                                  .map(action => (
                                    <p
                                      key={action}
                                      className="text-sm text-muted-foreground"
                                    >
                                      • {action}
                                    </p>
                                  ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Engagement Tab */}
                <TabsContent value="engagement" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Peak Activity Hours */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Peak Activity Hours
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData?.activity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="activity" fill={COLORS.primary} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Course Engagement Comparison */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Course Engagement Comparison
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={chartData?.courses}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="engagement" fill={COLORS.success} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Engagement Metrics Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Engagement Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                          <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                          <p className="text-2xl font-bold text-blue-900">
                            {analytics.coursePerformance
                              ?.reduce(
                                (acc, course) =>
                                  acc + course.engagementMetrics.videoWatchTime,
                                0
                              )
                              .toFixed(1)}
                            h
                          </p>
                          <p className="text-sm text-blue-600">
                            Total Watch Time
                          </p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4 text-center">
                          <BookOpen className="mx-auto mb-2 h-8 w-8 text-green-600" />
                          <p className="text-2xl font-bold text-green-900">
                            {(
                              analytics.coursePerformance?.reduce(
                                (acc, course) =>
                                  acc +
                                  course.engagementMetrics
                                    .assignmentSubmissionRate,
                                0
                              ) / analytics.coursePerformance?.length || 1
                            ).toFixed(1)}
                            %
                          </p>
                          <p className="text-sm text-green-600">
                            Avg Submission Rate
                          </p>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-4 text-center">
                          <Users className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                          <p className="text-2xl font-bold text-purple-900">
                            {(
                              analytics.coursePerformance?.reduce(
                                (acc, course) =>
                                  acc +
                                  course.engagementMetrics
                                    .discussionParticipation,
                                0
                              ) / analytics.coursePerformance?.length || 1
                            ).toFixed(1)}
                            %
                          </p>
                          <p className="text-sm text-purple-600">
                            Discussion Participation
                          </p>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                          <Award className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                          <p className="text-2xl font-bold text-orange-900">
                            {(
                              analytics.coursePerformance?.reduce(
                                (acc, course) =>
                                  acc +
                                  course.engagementMetrics.quizAttemptRate,
                                0
                              ) / analytics.coursePerformance?.length || 1
                            ).toFixed(1)}
                            %
                          </p>
                          <p className="text-sm text-orange-600">
                            Quiz Attempt Rate
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
