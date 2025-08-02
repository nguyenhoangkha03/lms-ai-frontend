'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  Brain,
  Target,
  BarChart3,
  Activity,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Import the new predictive analytics widgets
import { DropoutRiskWidget } from '@/components/analytics/predictive/dropout-risk-widget';
import { PerformanceForecastWidget } from '@/components/analytics/predictive/performance-forecast-widget';
import { LearningPatternVisualization } from '@/components/analytics/predictive/learning-pattern-visualization';
import { InterventionRecommendationsWidget } from '@/components/analytics/predictive/intervention-recommendations-widget';
import { ResourceOptimizationWidget } from '@/components/analytics/predictive/resource-optimization-widget';
import { PredictiveModelMetrics } from '@/components/analytics/predictive/predictive-model-metrics';

import {
  useGetDashboardAnalyticsQuery,
  useRunComprehensiveAnalysisMutation,
  useGetSystemHealthQuery,
} from '@/lib/redux/api/predictive-analytics-api';
import { useAuth } from '@/hooks/use-auth';

export default function PredictiveAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [analysisScope, setAnalysisScope] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetDashboardAnalyticsQuery({
    entityType: user?.roles?.includes('teacher') ? 'instructor' : 'student',
    entityId: user?.id,
  });

  const { data: systemHealth, isLoading: isHealthLoading } =
    useGetSystemHealthQuery();

  const [runAnalysis, { isLoading: isAnalyzing }] =
    useRunComprehensiveAnalysisMutation();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchDashboard();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!user) return;

    try {
      await runAnalysis({
        studentId: user.id,
        analysisScope: analysisScope === 'all' ? undefined : [analysisScope],
        includePredictions: true,
      }).unwrap();
      await refetchDashboard();
    } catch (error) {
      console.error('Failed to run analysis:', error);
    }
  };

  const exportData = () => {
    // Implementation for exporting analytics data
    console.log('Exporting data...');
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
              Predictive Analytics
            </h1>
            <p className="text-muted-foreground">
              AI-powered insights into your learning journey and performance
              predictions
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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

            <Select value={analysisScope} onValueChange={setAnalysisScope}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Analysis</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="risk">Risk Assessment</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRunAnalysis}
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
                  Run Analysis
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
                System Status: {systemHealth.status} | Model Accuracy:{' '}
                {Math.round(systemHealth.modelAccuracy * 100)}%
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Overview Cards */}
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
                    Students At Risk
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardData.studentAnalytics?.atRiskStudents || 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    of {dashboardData.studentAnalytics?.totalStudents || 0}{' '}
                    total
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
                    Performance Trend
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.studentAnalytics?.trendingUp || 0}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    students improving
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Prediction Accuracy
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (dashboardData.predictionAccuracy?.overall || 0) * 100
                    )}
                    %
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    model reliability
                  </p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
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
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="dropout-risk"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Risk Assessment
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
              Patterns
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
              Models
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DropoutRiskWidget
                studentId={user?.id}
                compact={true}
                showActions={false}
              />
              <PerformanceForecastWidget
                studentId={user?.id}
                timeRange={timeRange}
                compact={true}
              />
            </div>

            <ResourceOptimizationWidget
              studentId={user?.id}
              showDetails={false}
            />
          </TabsContent>

          {/* Dropout Risk Tab */}
          <TabsContent value="dropout-risk" className="space-y-6">
            <DropoutRiskWidget
              studentId={user?.id}
              showInterventions={true}
              allowScheduling={false}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceForecastWidget
              studentId={user?.id}
              timeRange={timeRange}
              showScenarios={true}
              showConfidenceScores={true}
            />
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <LearningPatternVisualization
              studentId={user?.id}
              showClustering={true}
              interactiveMode={true}
            />
          </TabsContent>

          {/* Interventions Tab */}
          <TabsContent value="interventions" className="space-y-6">
            <InterventionRecommendationsWidget
              studentId={user?.id}
              showPending={true}
              allowScheduling={false}
            />
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <PredictiveModelMetrics
              showAccuracy={true}
              showPerformance={true}
              allowRetraining={false}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
