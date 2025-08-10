'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  Users,
  BarChart3,
  Activity,
  RefreshCw,
  Download,
  Award,
  Eye,
  Bell,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Import predictive analytics components
import { PerformanceForecastWidget } from '@/components/analytics/predictive/performance-forecast-widget';
import { LearningPatternVisualization } from '@/components/analytics/predictive/learning-pattern-visualization';
import { InterventionRecommendationsWidget } from '@/components/analytics/predictive/intervention-recommendations-widget';
import { ResourceOptimizationWidget } from '@/components/analytics/predictive/resource-optimization-widget';
import { PredictiveModelMetrics } from '@/components/analytics/predictive/predictive-model-metrics';

import {
  useGetDashboardAnalyticsQuery,
  useGetHighRiskStudentsQuery,
  useRunComprehensiveAnalysisMutation,
  useGetSystemHealthQuery,
} from '@/lib/redux/api/predictive-analytics-api';
import { useAuth } from '@/hooks/use-auth';

export default function TeacherPredictiveAnalyticsPage() {
  const { user } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [riskThreshold, setRiskThreshold] = useState(0.7);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardAnalyticsQuery({
    entityType: 'instructor',
    entityId: user?.id,
  });

  const {
    data: highRiskStudents,
    isLoading: isLoadingRiskStudents,
    refetch: refetchRiskStudents,
  } = useGetHighRiskStudentsQuery({
    courseId: selectedCourse === 'all' ? undefined : selectedCourse,
    threshold: riskThreshold,
  });

  const { data: systemHealth, isLoading: isHealthLoading } =
    useGetSystemHealthQuery();

  const [runAnalysis, { isLoading: isAnalyzing }] =
    useRunComprehensiveAnalysisMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchDashboard(), refetchRiskStudents()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRunClassAnalysis = async () => {
    if (!user) return;

    try {
      // In a real app, this would analyze all students in the class
      console.log('Running comprehensive class analysis...');
      await refetchDashboard();
    } catch (error) {
      console.error('Failed to run class analysis:', error);
    }
  };

  const exportData = () => {
    // Implementation for exporting analytics data
    console.log('Exporting teacher analytics data...');
  };

  if (isDashboardLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>
            Unable to load predictive analytics data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Class Predictive Analytics
            </h1>
            <p className="text-muted-foreground">
              AI-powered insights to help your students succeed
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="course1">Mathematics 101</SelectItem>
                <SelectItem value="course2">Physics 201</SelectItem>
                <SelectItem value="course3">Chemistry 301</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRunClassAnalysis}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Analyze Class
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>

            <Button variant="outline" size="sm" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* System Health Indicator */}
        {systemHealth && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  systemHealth.status === 'healthy'
                    ? 'bg-green-500'
                    : systemHealth.status === 'degraded'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-muted-foreground">
                AI System: {systemHealth.status} | Accuracy:{' '}
                {Math.round(systemHealth.modelAccuracy * 100)}%
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Class Overview Cards */}
      {dashboardData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboardData.studentAnalytics?.totalStudents || 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Across all courses
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
                    At-Risk Students
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardData.studentAnalytics?.atRiskStudents || 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Need immediate attention
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    High Performers
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.studentAnalytics?.highPerformers || 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Exceeding expectations
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Interventions
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData.interventionEffectiveness
                      ?.totalInterventions || 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {Math.round(
                      (dashboardData.interventionEffectiveness?.successRate ||
                        0) * 100
                    )}
                    % success rate
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* At-Risk Students Alert */}
      {highRiskStudents && highRiskStudents.students.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 dark:text-red-600">
              Urgent: Students Need Attention
            </AlertTitle>
            <AlertDescription className="text-red-700 dark:text-red-500">
              {highRiskStudents.students.length} student
              {highRiskStudents.students.length > 1 ? 's' : ''} have been
              identified as at high risk of dropping out.
              <Button
                variant="link"
                className="ml-1 h-auto p-0 text-red-700 dark:text-red-500"
              >
                View details below
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="at-risk" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              At-Risk Students
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Learning Patterns
            </TabsTrigger>
            <TabsTrigger
              value="interventions"
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              Interventions
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Models
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Class Performance Forecast
                  </CardTitle>
                  <CardDescription>
                    Predicted outcomes for your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceForecastWidget
                    courseId={
                      selectedCourse === 'all' ? undefined : selectedCourse
                    }
                    timeRange={timeRange}
                    compact={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Risk Distribution
                  </CardTitle>
                  <CardDescription>
                    Current risk levels across your class
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {highRiskStudents && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {highRiskStudents.riskDistribution?.low || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Low Risk
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-600">
                            {highRiskStudents.riskDistribution?.medium || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Medium Risk
                          </p>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-red-600">
                            {highRiskStudents.riskDistribution?.high || 0}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            High Risk
                          </p>
                        </div>
                      </div>
                      <Progress
                        value={
                          ((highRiskStudents.riskDistribution?.high || 0) /
                            (highRiskStudents.total || 1)) *
                          100
                        }
                        className="h-2"
                      />
                      <p className="text-center text-xs text-muted-foreground">
                        {Math.round(
                          ((highRiskStudents.riskDistribution?.high || 0) /
                            (highRiskStudents.total || 1)) *
                            100
                        )}
                        % of students are at high risk
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <ResourceOptimizationWidget
              courseId={selectedCourse === 'all' ? undefined : selectedCourse}
              showDetails={false}
            />
          </TabsContent>

          {/* At-Risk Students Tab */}
          <TabsContent value="at-risk" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Students Requiring Immediate Attention
                </h3>
                <p className="text-muted-foreground">
                  Students with dropout risk above{' '}
                  {Math.round(riskThreshold * 100)}%
                </p>
              </div>
              <Select
                value={riskThreshold.toString()}
                onValueChange={value => setRiskThreshold(parseFloat(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">50% Risk</SelectItem>
                  <SelectItem value="0.6">60% Risk</SelectItem>
                  <SelectItem value="0.7">70% Risk</SelectItem>
                  <SelectItem value="0.8">80% Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoadingRiskStudents ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : highRiskStudents && highRiskStudents.students.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {highRiskStudents.students.map((student: any) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              {student.name?.charAt(0) || 'S'}
                            </div>
                            <div>
                              <p className="font-medium">
                                {student.name || 'Anonymous Student'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{student.courseName || 'General'}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student.riskLevel === 'high'
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/20'
                                : student.riskLevel === 'medium'
                                  ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20'
                                  : 'bg-green-100 text-green-600 dark:bg-green-900/20'
                            }
                          >
                            {student.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600">
                              {Math.round(student.riskScore * 100)}%
                            </span>
                            <Progress
                              value={student.riskScore * 100}
                              className="h-2 w-16"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.lastActivity
                            ? new Date(
                                student.lastActivity
                              ).toLocaleDateString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button size="sm">
                              <Bell className="mr-1 h-4 w-4" />
                              Contact
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No students currently at high risk
                </p>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Course-level performance forecasts could go here */}
              <PerformanceForecastWidget
                courseId={selectedCourse === 'all' ? undefined : selectedCourse}
                timeRange={timeRange}
                showScenarios={true}
                showConfidenceScores={true}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Class Trends</CardTitle>
                  <CardDescription>
                    Overall performance trends for your students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Performance</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-600">+3.2%</span>
                      </div>
                    </div>
                    <Progress value={78} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Engagement Rate</span>
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-red-600">-1.8%</span>
                      </div>
                    </div>
                    <Progress value={65} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-600">+5.1%</span>
                      </div>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <LearningPatternVisualization
              showClustering={true}
              interactiveMode={true}
            />
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="space-y-6">
            <InterventionRecommendationsWidget
              courseId={selectedCourse === 'all' ? undefined : selectedCourse}
              showPending={true}
              allowScheduling={true}
            />
          </TabsContent>

          {/* AI Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <PredictiveModelMetrics
              showAccuracy={true}
              showPerformance={true}
              allowRetraining={true}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
