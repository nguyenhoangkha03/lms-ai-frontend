'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Brain,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

// Import teacher dashboard components
import { ClassOverviewWidget } from '@/components/teacher/dashboard/class-overview-widget';
import { StudentManagementWidget } from '@/components/teacher/dashboard/student-management-widget';
import { TeacherActivityFeedWidget } from '@/components/teacher/dashboard/teacher-activity-feed-widget';
import { TeacherQuickActionsWidget } from '@/components/teacher/dashboard/teacher-quick-actions-widget';
import { TeachingInsightsWidget } from '@/components/teacher/dashboard/teaching-insights-widget';
import { PerformanceAnalyticsWidget } from '@/components/teacher/dashboard/performance-analytics-widget';
import { AtRiskStudentsWidget } from '@/components/teacher/dashboard/at-risk-students-widget';
import { GradingQueueWidget } from '@/components/teacher/dashboard/grading-queue-widget';

// Import API hooks
import {
  useGetTeacherDashboardStatsQuery,
  useGetClassOverviewQuery,
  useGetTeacherActivityFeedQuery,
  useGetTeacherQuickActionsQuery,
  useGetTeachingInsightsQuery,
  useGetAtRiskStudentsQuery,
  useGetGradingQueueQuery,
} from '@/lib/redux/api/teacher-dashboard-api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function TeacherDashboardPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('week');

  // API queries
  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetTeacherDashboardStatsQuery();

  const {
    data: classOverview,
    isLoading: isLoadingClasses,
    error: classesError,
  } = useGetClassOverviewQuery();

  const { data: activityFeed, isLoading: isLoadingActivity } =
    useGetTeacherActivityFeedQuery({ limit: 10 });

  const { data: quickActions, isLoading: isLoadingActions } =
    useGetTeacherQuickActionsQuery();

  const { data: teachingInsights, isLoading: isLoadingInsights } =
    useGetTeachingInsightsQuery({ limit: 5 });

  const { data: atRiskStudents, isLoading: isLoadingRisk } =
    useGetAtRiskStudentsQuery({ limit: 8 });

  const { data: gradingQueue, isLoading: isLoadingGrading } =
    useGetGradingQueueQuery({ limit: 10 });

  const handleRefreshData = () => {
    refetchStats();
    toast({
      title: 'Data Refreshed',
      description: 'Your dashboard data has been updated.',
    });
  };

  // Loading state
  if (isLoadingStats || isLoadingClasses) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (statsError || classesError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="mb-4 h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Unable to Load Dashboard
              </h3>
              <p className="mb-4 text-muted-foreground">
                There was an error loading your dashboard data.
              </p>
              <Button onClick={handleRefreshData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto space-y-6 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your classes, track student progress, and get AI-powered
            teaching insights
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold">
                  {dashboardStats?.totalStudents || 0}
                </p>
                <p className="text-xs text-green-600">
                  +{dashboardStats?.thisMonthEnrollments || 0} this month
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Courses
                </p>
                <p className="text-2xl font-bold">
                  {dashboardStats?.activeCourses || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {dashboardStats?.totalCourses || 0} total
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending Grading
                </p>
                <p className="text-2xl font-bold">
                  {dashboardStats?.pendingGrading || 0}
                </p>
                <p className="text-xs text-orange-600">
                  {dashboardStats?.completedAssignments || 0} completed
                </p>
              </div>
              <ClipboardList className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Class Performance
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(dashboardStats?.averageClassPerformance || 0)}%
                </p>
                <p className="text-xs text-green-600">Average score</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Students
            </TabsTrigger>
            <TabsTrigger value="grading" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Grading
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TeacherQuickActionsWidget
                actions={quickActions}
                isLoading={isLoadingActions}
              />
              <TeacherActivityFeedWidget
                activities={activityFeed}
                isLoading={isLoadingActivity}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AtRiskStudentsWidget
                students={atRiskStudents}
                isLoading={isLoadingRisk}
              />
              <TeachingInsightsWidget
                insights={teachingInsights}
                isLoading={isLoadingInsights}
              />
            </div>
          </TabsContent>

          {/* Classes Tab */}
          <TabsContent value="classes" className="space-y-6">
            <ClassOverviewWidget
              classes={classOverview}
              isLoading={isLoadingClasses}
              timeFilter={timeFilter}
            />
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <StudentManagementWidget timeFilter={timeFilter} />
          </TabsContent>

          {/* Grading Tab */}
          <TabsContent value="grading" className="space-y-6">
            <GradingQueueWidget
              gradingItems={gradingQueue}
              isLoading={isLoadingGrading}
            />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <PerformanceAnalyticsWidget timeFilter={timeFilter} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <TeachingInsightsWidget
              insights={teachingInsights}
              isLoading={isLoadingInsights}
              detailed
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
