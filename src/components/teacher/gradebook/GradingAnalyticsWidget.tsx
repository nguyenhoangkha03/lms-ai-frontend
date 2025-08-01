'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';

import { useGetGradingAnalyticsQuery } from '@/lib/redux/api/gradebook-api';

interface GradingAnalyticsWidgetProps {
  assessmentId?: string;
  courseId?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export function GradingAnalyticsWidget({
  assessmentId,
  courseId,
  timeRange = '30d',
}: GradingAnalyticsWidgetProps) {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  // Mock data - in real implementation, this would come from API
  const analyticsData = {
    overview: {
      totalSubmissions: 245,
      gradedSubmissions: 220,
      averageScore: 82.5,
      medianScore: 85.0,
      standardDeviation: 12.3,
      passingRate: 89.2,
      gradingTime: {
        average: 15.5,
        median: 12.0,
        total: 3410,
      },
    },
    scoreDistribution: [
      { range: '90-100', count: 45, percentage: 20.5 },
      { range: '80-89', count: 78, percentage: 35.5 },
      { range: '70-79', count: 55, percentage: 25.0 },
      { range: '60-69', count: 32, percentage: 14.5 },
      { range: '50-59', count: 8, percentage: 3.6 },
      { range: '0-49', count: 2, percentage: 0.9 },
    ],
    gradeDistribution: [
      { grade: 'A', count: 45, percentage: 20.5, color: '#22c55e' },
      { grade: 'B', count: 78, percentage: 35.5, color: '#3b82f6' },
      { grade: 'C', count: 55, percentage: 25.0, color: '#f59e0b' },
      { grade: 'D', count: 32, percentage: 14.5, color: '#f97316' },
      { grade: 'F', count: 10, percentage: 4.5, color: '#ef4444' },
    ],
    performanceTrends: [
      { week: 'Week 1', average: 75.2, submissions: 45 },
      { week: 'Week 2', average: 78.1, submissions: 52 },
      { week: 'Week 3', average: 81.5, submissions: 48 },
      { week: 'Week 4', average: 82.5, submissions: 55 },
      { week: 'Week 5', average: 84.2, submissions: 45 },
    ],
    difficultyAnalysis: [
      {
        questionId: 'q1',
        title: 'Question 1: Basic Concepts',
        averageScore: 92.5,
        difficulty: 'easy',
        discriminationIndex: 0.65,
      },
      {
        questionId: 'q2',
        title: 'Question 2: Application',
        averageScore: 78.3,
        difficulty: 'medium',
        discriminationIndex: 0.72,
      },
      {
        questionId: 'q3',
        title: 'Question 3: Analysis',
        averageScore: 65.8,
        difficulty: 'hard',
        discriminationIndex: 0.58,
      },
      {
        questionId: 'q4',
        title: 'Question 4: Synthesis',
        averageScore: 58.2,
        difficulty: 'hard',
        discriminationIndex: 0.45,
      },
    ],
    gradingEfficiency: {
      aiGradedPercentage: 65.5,
      manualReviewRate: 23.2,
      averageConfidence: 87.3,
      flaggedSubmissions: 15,
    },
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#22c55e';
      case 'medium':
        return '#f59e0b';
      case 'hard':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getDiscriminationQuality = (index: number) => {
    if (index >= 0.7) return { label: 'Excellent', color: '#22c55e' };
    if (index >= 0.4) return { label: 'Good', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Grading Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Performance insights and grading statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedTimeRange}
            onValueChange={value =>
              setSelectedTimeRange(value as '7d' | '30d' | '90d' | '1y')
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.averageScore}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +2.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.passingRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +1.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Grading Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.gradingTime.average}m
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 text-green-500" />
              -3.5m from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI Grading Rate
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.gradingEfficiency.aiGradedPercentage}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +8.2% from last period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs
        value={selectedMetric}
        onValueChange={setSelectedMetric}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name}: ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Statistical Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Statistical Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Mean Score:</span>
                    <span className="text-sm">
                      {analyticsData.overview.averageScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Median Score:</span>
                    <span className="text-sm">
                      {analyticsData.overview.medianScore}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Standard Deviation:
                    </span>
                    <span className="text-sm">
                      {analyticsData.overview.standardDeviation}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Total Submissions:
                    </span>
                    <span className="text-sm">
                      {analyticsData.overview.totalSubmissions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Graded:</span>
                    <span className="text-sm">
                      {analyticsData.overview.gradedSubmissions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Passing Rate:</span>
                    <span className="text-sm">
                      {analyticsData.overview.passingRate}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Avg. Grading Time:
                    </span>
                    <span className="text-sm">
                      {analyticsData.overview.gradingTime.average}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">
                      Total Grading Time:
                    </span>
                    <span className="text-sm">
                      {Math.round(
                        analyticsData.overview.gradingTime.total / 60
                      )}
                      h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">AI Confidence:</span>
                    <span className="text-sm">
                      {analyticsData.gradingEfficiency.averageConfidence}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Ranges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.scoreDistribution.map((range, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {range.range}%
                      </span>
                      <div className="mx-3 flex flex-1 items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{ width: `${range.percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-sm text-muted-foreground">
                          {range.count}
                        </span>
                      </div>
                      <Badge variant="outline">{range.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Letter Grades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.gradeDistribution.map((grade, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: grade.color }}
                        />
                        <span className="text-sm font-medium">
                          Grade {grade.grade}
                        </span>
                      </div>
                      <div className="mx-3 flex flex-1 items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${grade.percentage}%`,
                              backgroundColor: grade.color,
                            }}
                          />
                        </div>
                        <span className="w-12 text-sm text-muted-foreground">
                          {grade.count}
                        </span>
                      </div>
                      <Badge variant="outline">{grade.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analyticsData.performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    name="Average Score"
                  />
                  <Line
                    type="monotone"
                    dataKey="submissions"
                    stroke="#f59e0b"
                    name="Submissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Question Analysis Tab */}
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Question Difficulty Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.difficultyAnalysis.map((question, index) => {
                  const discriminationQuality = getDiscriminationQuality(
                    question.discriminationIndex
                  );

                  return (
                    <div key={index} className="rounded-lg border p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium">{question.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            style={{
                              backgroundColor: getDifficultyColor(
                                question.difficulty
                              ),
                              color: 'white',
                            }}
                          >
                            {question.difficulty}
                          </Badge>
                          <Badge
                            style={{
                              backgroundColor: discriminationQuality.color,
                              color: 'white',
                            }}
                          >
                            {discriminationQuality.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Average Score
                          </div>
                          <div className="text-lg font-semibold">
                            {question.averageScore}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            Discrimination Index
                          </div>
                          <div className="text-lg font-semibold">
                            {question.discriminationIndex.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
