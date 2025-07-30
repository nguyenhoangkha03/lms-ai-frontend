'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Target,
  Trophy,
  Brain,
  BarChart3,
  Clock,
  Download,
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

// Import components
import { ProgressOverviewWidget } from '@/components/analytics/progress-overview-widget';
import { PerformanceChartsWidget } from '@/components/analytics/performance-charts-widget';
import { LearningGoalsWidget } from '@/components/analytics/learning-goals-widget';
import { AchievementsWidget } from '@/components/analytics/achievements-widget';
import { StudyStreakWidget } from '@/components/analytics/study-streak-widget';
import { AIInsightsWidget } from '@/components/analytics/ai-insights-widget';
import { CourseProgressWidget } from '@/components/analytics/course-progress-widget';
import { TimeAnalyticsWidget } from '@/components/analytics/time-analytics-widget';
import { SkillAssessmentWidget } from '@/components/analytics/skill-assessment-widget';

// Import API hooks
import {
  useGetProgressDashboardQuery,
  useExportAnalyticsDataMutation,
} from '@/lib/redux/api/student-analytics-api';

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

export default function StudentProgressPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('month');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>(
    'pdf'
  );

  // API queries
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetProgressDashboardQuery();

  const [exportData, { isLoading: isExporting }] =
    useExportAnalyticsDataMutation();

  const handleExportData = async () => {
    try {
      const blob = await exportData({
        format: exportFormat,
        filters: { period: timeFilter },
      }).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-analytics-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Your analytics data has been exported as ${exportFormat.toUpperCase()}.`,
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export analytics data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRefreshData = () => {
    refetch();
    toast({
      title: 'Data Refreshed',
      description: 'Your analytics data has been updated.',
    });
  };

  // Loading state
  if (isLoading) {
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
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Unable to Load Analytics
              </h3>
              <p className="mb-4 text-muted-foreground">
                There was an error loading your progress data.
              </p>
              <Button onClick={() => refetch()}>
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
          <h1 className="text-3xl font-bold">Learning Progress & Analytics</h1>
          <p className="text-muted-foreground">
            Track your learning journey, analyze performance, and achieve your
            goals
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

          <Select
            value={exportFormat}
            onValueChange={(value: 'pdf' | 'excel' | 'csv') =>
              setExportFormat(value)
            }
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>

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
                  Total Study Hours
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData?.performance.overview.totalStudyHours || 0}h
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Score
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData?.performance.overview.averageScore || 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Current Streak
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData?.streak.currentStreak || 0} days
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Achievements
                </p>
                <p className="text-2xl font-bold">
                  {dashboardData?.achievements.filter(a => a.isUnlocked)
                    .length || 0}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-purple-500" />
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
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger
              value="achievements"
              className="flex items-center gap-2"
            >
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Analytics
            </TabsTrigger>
            <TabsTrigger
              value="ai-insights"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ProgressOverviewWidget data={dashboardData?.performance} />
              <StudyStreakWidget data={dashboardData?.streak} />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <CourseProgressWidget
                courses={dashboardData?.performance.coursePerformance}
              />
              <SkillAssessmentWidget
                skills={dashboardData?.performance.skillAssessment}
              />
              <AIInsightsWidget insights={dashboardData?.aiInsights} />
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceChartsWidget
              data={dashboardData?.performance}
              timeFilter={timeFilter}
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <LearningGoalsWidget goals={dashboardData?.goals} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementsWidget achievements={dashboardData?.achievements} />
          </TabsContent>

          {/* Time Analytics Tab */}
          <TabsContent value="time" className="space-y-6">
            <TimeAnalyticsWidget
              data={dashboardData?.performance.timeAnalytics}
            />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <AIInsightsWidget insights={dashboardData?.aiInsights} detailed />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
