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
  Sparkles,
  Heart,
  Plus,
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
import { cn } from '@/lib/utils';

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

  const { user, isAuthenticated, isLoading, checkAuth } = useAuth();

  console.log('🔍 Auth Debug in Dashboard:', {
    user: user,
    isAuthenticated: isAuthenticated,
    isLoading: isLoading,
    hasTeacherProfile: !!user?.teacherProfile,
    teacherProfile: user?.teacherProfile,
  });

  const currentUser = user;
  const isApproved = currentUser?.teacherProfile?.isApproved;

  // Add refresh handler for debugging
  const handleRefreshAuth = async () => {
    console.log('🔄 Manually refreshing auth data...');
    try {
      await checkAuth();
      console.log('✅ Auth data refreshed');
    } catch (error) {
      console.error('❌ Failed to refresh auth:', error);
    }
  };

  // Only redirect if we have confirmed user data and teacher is not approved
  // Prevent redirect during auth loading or token refresh
  if (currentUser && !isLoading && isApproved === false) {
    console.log('🚫 Teacher not approved, redirecting to pending page');
    console.log('🔍 Current teacherProfile:', currentUser.teacherProfile);
    
    // Add a temp button to refresh auth before redirecting
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p>Teacher approval status mismatch detected</p>
          <Button onClick={handleRefreshAuth}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Auth Data
          </Button>
          <Button variant="outline" onClick={() => router.push('/teacher-application-pending')}>
            Go to Pending Page
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while checking approval status or during auth loading
  if (isLoading || (currentUser && isApproved === undefined)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Checking teacher approval status...</p>
        </div>
      </div>
    );
  }

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
    <div className="space-y-8">
      {/* Welcome Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute right-8 top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />

        <div className="relative">
          <div className="mb-6 flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="h-20 w-20 border-4 border-white/20 shadow-xl">
                <AvatarImage src={currentUser?.avatarUrl} />
                <AvatarFallback className="bg-white/10 text-2xl font-bold backdrop-blur">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div>
              <motion.h1
                className="text-4xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome back, {currentUser?.firstName}! 👋
              </motion.h1>
              <motion.p
                className="text-xl text-purple-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Ready to inspire minds today?
              </motion.p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <span className="flex items-center text-sm font-medium">
                <Sparkles className="mr-2 h-4 w-4" />
                Level {Math.floor(Math.random() * 10) + 1} Educator
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <span className="flex items-center text-sm font-medium">
                <Heart className="mr-2 h-4 w-4" />
                {dashboardStats?.totalStudents || 0} Happy Students
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Content */}
      <motion.div
        className="container mx-auto space-y-8 px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Modern Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* Total Students Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-0 bg-white shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/30" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                      <p className="text-sm font-medium text-slate-600">Students</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">
                      {dashboardStats?.totalStudents || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">
                        +{dashboardStats?.thisMonthEnrollments || 0} this month
                      </span>
                    </div>
                  </div>
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Users className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Courses Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-0 bg-white shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-500/30" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                      <p className="text-sm font-medium text-slate-600">Courses</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">
                      {dashboardStats?.activeCourses || 0}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      of {dashboardStats?.totalCourses || 0} total courses
                    </p>
                  </div>
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BookOpen className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Grading Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-0 bg-white shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/30" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <motion.div 
                        className="h-2 w-2 rounded-full bg-amber-500"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-sm font-medium text-slate-600">To Grade</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">
                      {dashboardStats?.pendingGrading || 0}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Target className="h-3 w-3 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">
                        {dashboardStats?.completedAssignments || 0} completed
                      </span>
                    </div>
                  </div>
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ClipboardList className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Class Performance Card */}
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="group relative overflow-hidden border-0 bg-white shadow-xl">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br from-violet-400/20 to-purple-500/30" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
                      <p className="text-sm font-medium text-slate-600">Performance</p>
                    </div>
                    <p className="text-4xl font-bold text-slate-900">
                      {Math.round(dashboardStats?.averageClassPerformance || 0)}%
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-3 w-3 text-violet-500" />
                      <span className="text-sm text-violet-600 font-medium">
                        Class average
                      </span>
                    </div>
                  </div>
                  <motion.div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="h-8 w-8 text-white" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>


        {/* Modern Tabs */}
        <motion.div variants={itemVariants}>
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3, gradient: 'from-blue-500 to-indigo-600' },
              { id: 'classes', label: 'Classes', icon: BookOpen, gradient: 'from-emerald-500 to-green-600' },
              { id: 'students', label: 'Students', icon: Users, gradient: 'from-purple-500 to-violet-600' },
              { id: 'grading', label: 'Grading', icon: ClipboardList, gradient: 'from-amber-500 to-orange-600' },
              { id: 'insights', label: 'AI Insights', icon: Brain, gradient: 'from-pink-500 to-rose-600' },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-105`
                      : "bg-white text-slate-600 hover:bg-slate-50 hover:scale-105 shadow-md"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

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
