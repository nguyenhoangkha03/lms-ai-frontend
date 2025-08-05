'use client';

import React, { useState } from 'react';
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Download,
  Brain,
  Eye,
} from 'lucide-react';

import { useGetAssessmentStatisticsQuery } from '@/lib/redux/api/assessment-creation-api';
import { Checkbox } from '@radix-ui/react-checkbox';

interface AssessmentAnalyticsProps {
  assessmentId: string;
  onBack: () => void;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

export const AssessmentAnalytics: React.FC<AssessmentAnalyticsProps> = ({
  assessmentId,
  onBack,
}) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // API queries
  const {
    data: statistics,
    isLoading,
    error,
  } = useGetAssessmentStatisticsQuery(assessmentId);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !statistics) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-red-500" />
        <p className="text-red-600">Failed to load analytics data</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Process data for charts
  const difficultyData = Object.entries(statistics.difficultyDistribution).map(
    ([difficulty, count]) => ({
      name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      value: count,
      percentage: Math.round((count / statistics.totalAttempts) * 100),
    })
  );

  const performanceData = statistics.performanceTrends.map(trend => ({
    date: new Date(trend.date).toLocaleDateString(),
    avgScore: Math.round(trend.avgScore),
    attempts: trend.attempts,
  }));

  const questionAnalyticsData = statistics.questionAnalytics.map(
    (q, index) => ({
      question: `Q${index + 1}`,
      avgScore: Math.round(q.avgScore),
      correctRate: Math.round(q.correctAnswerRate * 100),
      timeSpent: Math.round(q.timeSpent / 60), // Convert to minutes
      difficulty: Math.round((1 - q.difficultyIndex) * 100),
    })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Assessment Analytics</h2>
            <p className="text-muted-foreground">
              Performance insights and statistics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Attempts
                </p>
                <p className="text-2xl font-bold">{statistics.totalAttempts}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                +12% from last month
              </span>
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
                  {Math.round(statistics.averageScore)}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                +5% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(statistics.completionRate * 100)}%
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-600" />
              <span className="text-xs text-red-600">-2% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Avg Time Spent
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(statistics.averageTimeSpent / 60)}m
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">
                +8% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Difficulty Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Difficulty Distribution
                </CardTitle>
                <CardDescription>
                  Distribution of questions by difficulty level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { hour: '00', attempts: 2 },
                        { hour: '03', attempts: 1 },
                        { hour: '06', attempts: 3 },
                        { hour: '09', attempts: 12 },
                        { hour: '12', attempts: 8 },
                        { hour: '15', attempts: 15 },
                        { hour: '18', attempts: 18 },
                        { hour: '21', attempts: 10 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="attempts"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>
                Assessment activity by day of the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: 'Mon', attempts: 15, avgScore: 78 },
                      { day: 'Tue', attempts: 22, avgScore: 82 },
                      { day: 'Wed', attempts: 18, avgScore: 75 },
                      { day: 'Thu', attempts: 25, avgScore: 80 },
                      { day: 'Fri', attempts: 12, avgScore: 77 },
                      { day: 'Sat', attempts: 8, avgScore: 85 },
                      { day: 'Sun', attempts: 10, avgScore: 83 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="attempts"
                      fill="#3b82f6"
                      name="Attempts"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="avgScore"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Avg Score"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations for your assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Insights */}
              <div className="space-y-4">
                <h4 className="font-medium">Key Insights</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                      <div>
                        <h5 className="font-medium text-green-900">
                          Strong Performance
                        </h5>
                        <p className="mt-1 text-sm text-green-700">
                          Students are performing well overall with an average
                          score of {Math.round(statistics.averageScore)}%. The
                          assessment difficulty appears well-calibrated.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
                      <div>
                        <h5 className="font-medium text-amber-900">
                          Time Management
                        </h5>
                        <p className="mt-1 text-sm text-amber-700">
                          Average completion time is{' '}
                          {Math.round(statistics.averageTimeSpent / 60)}{' '}
                          minutes. Consider if the time limit needs adjustment
                          based on student performance.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-start gap-3">
                      <Target className="mt-0.5 h-5 w-5 text-blue-600" />
                      <div>
                        <h5 className="font-medium text-blue-900">
                          Question Balance
                        </h5>
                        <p className="mt-1 text-sm text-blue-700">
                          {
                            questionAnalyticsData.filter(
                              q => q.correctRate < 30
                            ).length
                          }{' '}
                          questions may be too difficult, while{' '}
                          {
                            questionAnalyticsData.filter(
                              q => q.correctRate > 90
                            ).length
                          }{' '}
                          may be too easy.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 text-purple-600" />
                      <div>
                        <h5 className="font-medium text-purple-900">
                          Engagement Level
                        </h5>
                        <p className="mt-1 text-sm text-purple-700">
                          {Math.round(statistics.completionRate * 100)}%
                          completion rate indicates
                          {statistics.completionRate > 0.8
                            ? ' high'
                            : statistics.completionRate > 0.6
                              ? ' moderate'
                              : ' low'}
                          student engagement with the assessment.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-4">
                <h4 className="font-medium">AI Recommendations</h4>
                <div className="space-y-3">
                  {statistics.averageScore < 70 && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                      <div className="text-sm">
                        <p className="font-medium text-red-900">
                          Consider Review Materials
                        </p>
                        <p className="mt-1 text-red-700">
                          Low average score suggests students may need
                          additional study materials or preparatory content.
                        </p>
                      </div>
                    </div>
                  )}

                  {questionAnalyticsData.filter(q => q.correctRate < 30)
                    .length > 0 && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <Eye className="mt-0.5 h-4 w-4 text-amber-600" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-900">
                          Review Difficult Questions
                        </p>
                        <p className="mt-1 text-amber-700">
                          Questions with less than 30% correct rate may need
                          clarification or content review.
                        </p>
                      </div>
                    </div>
                  )}

                  {statistics.completionRate < 0.7 && (
                    <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <Clock className="mt-0.5 h-4 w-4 text-blue-600" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">
                          Optimize Time Allocation
                        </p>
                        <p className="mt-1 text-blue-700">
                          Low completion rate may indicate insufficient time or
                          overly complex questions.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium text-green-900">
                        Add Practice Mode
                      </p>
                      <p className="mt-1 text-green-700">
                        Consider creating a practice version to help students
                        prepare and improve performance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Predictive Analytics */}
              <div className="space-y-4">
                <h4 className="font-medium">Predictive Insights</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(statistics.totalAttempts * 1.15)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Projected attempts next month
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.min(100, Math.round(statistics.averageScore + 5))}
                        %
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expected avg score improvement
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.min(
                          100,
                          Math.round(statistics.completionRate * 100 + 10)
                        )}
                        %
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Projected completion rate
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-4">
                <h4 className="font-medium">Suggested Actions</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox />
                    <span className="text-sm">
                      Review and update questions with less than 30% correct
                      rate
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      High Priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox />
                    <span className="text-sm">
                      Create additional practice materials for struggling topics
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      Medium Priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox />
                    <span className="text-sm">
                      Consider adjusting time limit based on completion patterns
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      Low Priority
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-gray-50">
                    <Checkbox />
                    <span className="text-sm">
                      Add more challenging questions for high-performing
                      students
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      Enhancement
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentAnalytics;
