'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  GraduationCap,
  Video,
  Star,
  Target,
  FileText,
  Download,
  Activity,
  UserCircle,
  Award,
  MessageSquare,
  FileCheck,
  Settings,
  Bell,
  Search,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';

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
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('week');

  const { user, isAuthenticated, isLoading } = useAuth();

  // Debug auth state
  console.log('🔍 Auth Debug in Dashboard:', {
    user: user,
    isAuthenticated: isAuthenticated,
    isLoading: isLoading,
    hasTeacherProfile: !!user?.teacherProfile,
    teacherProfile: user?.teacherProfile,
  });

  // Use auth context user directly
  const currentUser = user;
  const isApproved = currentUser?.teacherProfile?.isApproved;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Modern Clean Header */}
      <div className="sticky top-0 z-40 border-b border-white/20 bg-white/80 backdrop-blur-xl dark:bg-slate-900/80">
        <div className="container mx-auto px-6 py-5">
          <motion.div
            variants={itemVariants}
            className="flex min-h-[60px] items-center justify-between"
          >
            {/* Left side - Logo and Title with more space */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold leading-tight text-slate-800 dark:text-white">
                    LMS Teacher Portal
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Welcome back, {currentUser?.firstName || 'Teacher'}
                  </p>
                </div>
              </div>

              {/* Quick Navigation with more space */}
              <nav className="ml-12 hidden items-center space-x-1 xl:flex">
                <Button
                  onClick={() => router.push('/teacher/courses')}
                  variant="ghost"
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Courses
                </Button>
                <Button
                  onClick={() => router.push('/teacher/students')}
                  variant="ghost"
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Students
                </Button>
                <Button
                  onClick={() => router.push('/teacher/submissions')}
                  variant="ghost"
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Submissions
                </Button>
                <Button
                  onClick={() => router.push('/teacher/analytics')}
                  variant="ghost"
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </nav>
            </div>

            {/* Right side - Search, Icons, Profile */}
            <div className="flex items-center space-x-5">
              {/* Search Bar */}
              <div className="relative hidden lg:flex">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses, students..."
                  className="w-72 rounded-lg border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm backdrop-blur-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Time Filter */}
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="h-10 w-36 border-slate-200 bg-white/80 text-sm shadow-sm backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              {/* Icon Group */}
              <div className="flex items-center space-x-2">
                {/* Notification Bell */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2.5 hover:bg-slate-100/70"
                  >
                    <Bell className="h-5 w-5 text-slate-600" />
                    <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-red-500 p-0 text-xs text-white">
                      3
                    </Badge>
                  </Button>
                </div>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2.5 hover:bg-slate-100/70"
                  onClick={() => router.push('/teacher/messages')}
                >
                  <MessageSquare className="h-5 w-5 text-slate-600" />
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-blue-500 p-0 text-xs text-white">
                    2
                  </Badge>
                </Button>

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-2.5 hover:bg-slate-100/70"
                    >
                      <Settings className="h-5 w-5 text-slate-600" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/assignments')}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      <span>Assignments</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/gradebook')}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      <span>Gradebook</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/live-sessions')}
                    >
                      <Video className="mr-2 h-4 w-4" />
                      <span>Live Sessions</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/reports')}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Reports</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push('/teacher/predictive-analytics')
                      }
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      <span>AI Analytics</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/files')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>File Manager</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-slate-200"></div>

              {/* Profile & Action Group */}
              <div className="flex items-center space-x-3">
                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative p-1 hover:bg-slate-100/70"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={currentUser?.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-sm text-white">
                          {currentUser?.firstName?.[0]}
                          {currentUser?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <div className="flex items-center justify-start gap-3 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={currentUser?.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                          {currentUser?.firstName?.[0]}
                          {currentUser?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </p>
                        <p className="text-xs text-slate-600">
                          {currentUser?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/profile')}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push('/teacher/settings')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Quick Action Button */}
                <Button
                  onClick={() => router.push('/teacher/live-sessions/create')}
                  className="hidden bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 shadow-lg hover:from-blue-600 hover:to-indigo-700 xl:flex"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Start Live Class
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <motion.div
        className="container mx-auto space-y-8 px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Stats Cards with Glass Effect */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {dashboardStats?.totalStudents || 0}
                  </p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <p className="text-xs font-medium text-emerald-600">
                      +{dashboardStats?.thisMonthEnrollments || 0} this month
                    </p>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Active Courses
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {dashboardStats?.activeCourses || 0}
                  </p>
                  <p className="text-xs text-slate-500">
                    of {dashboardStats?.totalCourses || 0} total courses
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Pending Grading
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {dashboardStats?.pendingGrading || 0}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3 text-amber-500" />
                    <p className="text-xs font-medium text-amber-600">
                      {dashboardStats?.completedAssignments || 0} completed
                    </p>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/30 bg-gradient-to-br from-white/90 to-white/60 shadow-xl backdrop-blur-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Class Performance
                  </p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {Math.round(dashboardStats?.averageClassPerformance || 0)}%
                  </p>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-violet-500" />
                    <p className="text-xs font-medium text-violet-600">
                      Average score
                    </p>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Tabs with Modern Design */}
        <motion.div variants={itemVariants}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="rounded-2xl border border-white/30 bg-white/80 p-2 shadow-lg backdrop-blur-xl">
              <TabsList className="grid w-full grid-cols-2 gap-1 bg-transparent lg:grid-cols-6">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="classes"
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <BookOpen className="h-4 w-4" />
                  Classes
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Users className="h-4 w-4" />
                  Students
                </TabsTrigger>
                <TabsTrigger
                  value="grading"
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <ClipboardList className="h-4 w-4" />
                  Grading
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger
                  value="insights"
                  className="flex items-center gap-2 rounded-xl transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Brain className="h-4 w-4" />
                  AI Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enhanced Tab Content */}
            <div className="mt-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <TeacherQuickActionsWidget
                      actions={quickActions}
                      isLoading={isLoadingActions}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TeacherActivityFeedWidget
                      activities={activityFeed}
                      isLoading={isLoadingActivity}
                    />
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <AtRiskStudentsWidget
                      students={atRiskStudents}
                      isLoading={isLoadingRisk}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <TeachingInsightsWidget
                      insights={teachingInsights}
                      isLoading={isLoadingInsights}
                    />
                  </motion.div>
                </div>
              </TabsContent>

              {/* Classes Tab */}
              <TabsContent value="classes" className="mt-0 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <ClassOverviewWidget
                    classes={classOverview}
                    isLoading={isLoadingClasses}
                    timeFilter={timeFilter}
                  />
                </motion.div>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students" className="mt-0 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <StudentManagementWidget timeFilter={timeFilter} />
                </motion.div>
              </TabsContent>

              {/* Grading Tab */}
              <TabsContent value="grading" className="mt-0 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GradingQueueWidget
                    gradingItems={gradingQueue}
                    isLoading={isLoadingGrading}
                  />
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <PerformanceAnalyticsWidget timeFilter={timeFilter} />

                  {/* Quick Analytics Actions */}
                  <Card className="border-white/30 bg-white/80 shadow-xl backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <div className="text-center sm:text-left">
                          <h3 className="text-lg font-semibold text-slate-800">
                            Detailed Analytics & Reports
                          </h3>
                          <p className="text-slate-600">
                            Access comprehensive analytics dashboard and
                            generate detailed reports
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={() => router.push('/teacher/analytics')}
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                          >
                            <Activity className="mr-2 h-4 w-4" />
                            View Analytics
                          </Button>
                          <Button
                            onClick={() => router.push('/teacher/reports')}
                            variant="outline"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Generate Report
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="insights" className="mt-0 space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <TeachingInsightsWidget
                    insights={teachingInsights}
                    isLoading={isLoadingInsights}
                    detailed
                  />
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
