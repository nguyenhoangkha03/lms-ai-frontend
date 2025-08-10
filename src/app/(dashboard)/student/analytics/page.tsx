'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
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
import { PerformanceChartsWidget } from '@/components/analytics/performance-charts-widget';
import { TimeAnalyticsWidget } from '@/components/analytics/time-analytics-widget';

// Import API hooks
import {
  useGetPerformanceAnalyticsQuery,
  useGetComprehensiveAnalyticsQuery,
  useGetLearningPatternsQuery,
  useGetDropoutRiskPredictionQuery,
  useGetPeerComparisonQuery,
  useExportAnalyticsDataMutation,
} from '@/lib/redux/api/student-analytics-api';

export default function StudentAnalyticsPage() {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState('month');
  const [activeTab, setActiveTab] = useState('performance');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>(
    'pdf'
  );

  // API queries
  const {
    data: performanceData,
    isLoading: isLoadingPerformance,
    error: performanceError,
    refetch: refetchPerformance,
  } = useGetPerformanceAnalyticsQuery({ period: timeFilter });

  const {
    data: comprehensiveData,
    isLoading: isLoadingComprehensive,
    error: comprehensiveError,
  } = useGetComprehensiveAnalyticsQuery('current-user-id'); // This should be dynamic

  const { data: learningPatternsData, isLoading: isLoadingPatterns } =
    useGetLearningPatternsQuery('current-user-id');

  const { data: dropoutRiskData, isLoading: isLoadingRisk } =
    useGetDropoutRiskPredictionQuery('current-user-id');

  const { data: peerComparisonData, isLoading: isLoadingComparison } =
    useGetPeerComparisonQuery('current-user-id');

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
      link.download = `analytics-detailed-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export Successful',
        description: `Your detailed analytics have been exported as ${exportFormat.toUpperCase()}.`,
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
    refetchPerformance();
    toast({
      title: 'Data Refreshed',
      description: 'Your analytics data has been updated.',
    });
  };

  // Loading state
  if (isLoadingPerformance || isLoadingComprehensive) {
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
  if (performanceError || comprehensiveError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Unable to Load Analytics
              </h3>
              <p className="mb-4 text-muted-foreground">
                There was an error loading your detailed analytics data.
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Detailed Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your learning performance and patterns
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

      {/* Risk Assessment Alert */}
      {dropoutRiskData && dropoutRiskData.risk_score > 0.7 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-600">
                    Attention Needed
                  </h4>
                  <p className="text-sm text-orange-700 dark:text-orange-500">
                    Our AI has detected some patterns that suggest you might
                    benefit from additional support. Check the recommendations
                    below.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics Overview */}
      {performanceData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Learning Velocity
                  </p>
                  <p className="text-2xl font-bold">
                    {performanceData.overview.totalStudyHours /
                      (performanceData.overview.completedCourses || 1)}
                    h/course
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Engagement Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (performanceData.overview.completedCourses /
                        performanceData.overview.totalCourses) *
                        100
                    )}
                    %
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
                    Consistency Score
                  </p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (performanceData.overview.currentStreak / 30) * 100
                    )}
                    %
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Peer Ranking
                  </p>
                  <p className="text-2xl font-bold">
                    {peerComparisonData?.percentile || 'N/A'}
                    {peerComparisonData?.percentile && '%'}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Analytics Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger
              value="performance"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Time Analysis
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Learning Patterns
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Peer Comparison
            </TabsTrigger>
            <TabsTrigger
              value="predictions"
              className="flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Risk Assessment
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceChartsWidget
              data={performanceData}
              timeFilter={timeFilter}
            />
          </TabsContent>

          {/* Time Analysis Tab */}
          <TabsContent value="time" className="space-y-6">
            <TimeAnalyticsWidget data={performanceData?.timeAnalytics} />
          </TabsContent>

          {/* Learning Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Pattern Analysis</CardTitle>
                <CardDescription>
                  AI-identified patterns in your learning behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingPatterns ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : learningPatternsData ? (
                  <div className="space-y-4">
                    {learningPatternsData.patterns?.map(
                      (pattern: any, index: number) => (
                        <div key={index} className="rounded-lg border p-4">
                          <h4 className="mb-2 font-semibold">{pattern.name}</h4>
                          <p className="mb-2 text-sm text-muted-foreground">
                            {pattern.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              Confidence: {Math.round(pattern.confidence * 100)}
                              %
                            </Badge>
                            <Badge variant="secondary">
                              Impact: {pattern.impact}
                            </Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No pattern data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Peer Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Peer Performance Comparison</CardTitle>
                <CardDescription>
                  See how you compare with other learners
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingComparison ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : peerComparisonData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {peerComparisonData.percentile}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Percentile Rank
                        </p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {peerComparisonData.above_average ? 'Above' : 'Below'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg Performance
                        </p>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {peerComparisonData.improvement_potential}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Growth Potential
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No comparison data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Assessment Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dropout Risk Assessment</CardTitle>
                <CardDescription>
                  AI-powered early warning system for learning challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRisk ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : dropoutRiskData ? (
                  <div className="space-y-6">
                    {/* Risk Score */}
                    <div className="rounded-lg border p-6 text-center">
                      <div
                        className={`mb-2 text-4xl font-bold ${
                          dropoutRiskData.risk_score < 0.3
                            ? 'text-green-600'
                            : dropoutRiskData.risk_score < 0.7
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {Math.round(dropoutRiskData.risk_score * 100)}%
                      </div>
                      <p className="text-muted-foreground">
                        Dropout Risk Score
                      </p>
                      <Badge
                        variant={
                          dropoutRiskData.risk_score < 0.3
                            ? 'default'
                            : dropoutRiskData.risk_score < 0.7
                              ? 'secondary'
                              : 'destructive'
                        }
                        className="mt-2"
                      >
                        {dropoutRiskData.risk_score < 0.3
                          ? 'Low Risk'
                          : dropoutRiskData.risk_score < 0.7
                            ? 'Medium Risk'
                            : 'High Risk'}
                      </Badge>
                    </div>

                    {/* Risk Factors */}
                    {dropoutRiskData.risk_factors && (
                      <div>
                        <h4 className="mb-3 font-semibold">Key Risk Factors</h4>
                        <div className="space-y-2">
                          {dropoutRiskData.risk_factors.map(
                            (factor: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded border p-3"
                              >
                                <span className="text-sm">{factor.factor}</span>
                                <Badge variant="outline">
                                  Impact: {Math.round(factor.impact * 100)}%
                                </Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {dropoutRiskData.recommendations && (
                      <div>
                        <h4 className="mb-3 font-semibold">Recommendations</h4>
                        <div className="space-y-2">
                          {dropoutRiskData.recommendations.map(
                            (rec: string, index: number) => (
                              <div
                                key={index}
                                className="flex items-start space-x-2 rounded bg-blue-50 p-3 dark:bg-blue-900/10"
                              >
                                <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                                <span className="text-sm">{rec}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No risk assessment data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
