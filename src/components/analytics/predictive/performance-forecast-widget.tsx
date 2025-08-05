'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Activity,
  Brain,
  Zap,
  MoreHorizontal,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  Legend,
} from 'recharts';

import {
  useGetPerformancePredictionsQuery,
  useGeneratePerformancePredictionMutation,
  useGetPerformanceTrendsQuery,
} from '@/lib/redux/api/predictive-analytics-api';

interface PerformanceForecastWidgetProps {
  studentId?: string;
  courseId?: string;
  timeRange?: string;
  compact?: boolean;
  showScenarios?: boolean;
  showConfidenceScores?: boolean;
  className?: string;
}

export function PerformanceForecastWidget({
  studentId,
  courseId,
  timeRange = '30d',
  compact = false,
  showScenarios = false,
  showConfidenceScores = false,
  className = '',
}: PerformanceForecastWidgetProps) {
  const [selectedOutcomeType, setSelectedOutcomeType] =
    useState('grade_prediction');
  const [selectedScenario, setSelectedScenario] = useState('optimistic');

  const {
    data: predictions,
    isLoading: isLoadingPredictions,
    error: predictionsError,
  } = useGetPerformancePredictionsQuery({
    studentId,
    courseId,
    outcomeType: selectedOutcomeType,
  });

  const { data: trends, isLoading: isLoadingTrends } =
    useGetPerformanceTrendsQuery(studentId!, {
      skip: !studentId,
    });

  const [generatePrediction, { isLoading: isGenerating }] =
    useGeneratePerformancePredictionMutation();

  const currentPrediction = predictions?.[0];

  const handleGeneratePrediction = async () => {
    if (!studentId) return;

    try {
      await generatePrediction({
        studentId,
        courseId: courseId || 'overall',
        outcomeType: selectedOutcomeType,
      }).unwrap();
    } catch (error) {
      console.error('Failed to generate prediction:', error);
    }
  };

  const getOutcomeIcon = (outcomeType: string) => {
    switch (outcomeType) {
      case 'grade_prediction':
        return <Award className="h-4 w-4" />;
      case 'course_completion':
        return <CheckCircle className="h-4 w-4" />;
      case 'time_to_complete':
        return <Clock className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8)
      return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (confidence >= 0.6)
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const formatPredictedScore = (score: number, outcomeType: string) => {
    switch (outcomeType) {
      case 'grade_prediction':
        return `${Math.round(score)}%`;
      case 'course_completion':
        return `${Math.round(score * 100)}%`;
      case 'time_to_complete':
        return `${Math.round(score)} days`;
      default:
        return score.toFixed(1);
    }
  };

  // Generate forecast data for charts
  const forecastData =
    currentPrediction?.scenarios?.map((scenario: any, index: number) => ({
      week: `Week ${index + 1}`,
      current: scenario.currentTrajectory,
      optimistic: scenario.optimisticTrajectory,
      realistic: scenario.realisticTrajectory,
      pessimistic: scenario.pessimisticTrajectory,
      confidence: scenario.confidence,
    })) || [];

  if (isLoadingPredictions) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Performance Forecast
            </CardTitle>
            <CardDescription>
              AI-powered predictions of learning outcomes and performance
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedOutcomeType}
              onValueChange={setSelectedOutcomeType}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grade_prediction">
                  Grade Prediction
                </SelectItem>
                <SelectItem value="course_completion">
                  Course Completion
                </SelectItem>
                <SelectItem value="time_to_complete">
                  Time to Complete
                </SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleGeneratePrediction}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Zap className="mr-2 h-4 w-4 animate-pulse" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Generate New Prediction
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Review
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!currentPrediction ? (
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No predictions available for this outcome type
            </p>
            <Button
              onClick={handleGeneratePrediction}
              disabled={isGenerating}
              className="mx-auto"
            >
              {isGenerating ? (
                <>
                  <Zap className="mr-2 h-4 w-4 animate-pulse" />
                  Generating Prediction...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Prediction
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Main Prediction Display */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  {getOutcomeIcon(selectedOutcomeType)}
                  <span className="ml-2 text-sm font-medium">
                    Predicted Outcome
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatPredictedScore(
                    currentPrediction.predictedScore,
                    selectedOutcomeType
                  )}
                </div>
                {showConfidenceScores && (
                  <Badge
                    variant="outline"
                    className={`mt-2 ${getConfidenceColor(currentPrediction.confidence)}`}
                  >
                    {Math.round(currentPrediction.confidence * 100)}% confidence
                  </Badge>
                )}
              </div>

              <div className="rounded-lg border p-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                  <span className="ml-2 text-sm font-medium">Target Date</span>
                </div>
                <div className="text-lg font-semibold">
                  {new Date(currentPrediction.targetDate).toLocaleDateString()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {currentPrediction.estimatedDaysToCompletion} days remaining
                </div>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                  <span className="ml-2 text-sm font-medium">
                    Progress Rate
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  {trends?.progressRate
                    ? `${Math.round(trends.progressRate)}%/week`
                    : 'N/A'}
                </div>
                <div className="mt-1 flex items-center justify-center">
                  {trends?.trend === 'improving' ? (
                    <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  ) : trends?.trend === 'declining' ? (
                    <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                  ) : null}
                  <span className="text-sm capitalize text-muted-foreground">
                    {trends?.trend || 'stable'}
                  </span>
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            {!compact && forecastData.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    Performance Trajectory
                  </h4>
                  {showScenarios && (
                    <Select
                      value={selectedScenario}
                      onValueChange={setSelectedScenario}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="optimistic">Optimistic</SelectItem>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="pessimistic">Pessimistic</SelectItem>
                        <SelectItem value="all">All Scenarios</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {showScenarios && selectedScenario === 'all' ? (
                      <ComposedChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" fontSize={12} />
                        <YAxis fontSize={12} />
                        <RechartsTooltip
                          formatter={(value, name) => {
                            const label = String(name);
                            return [
                              formatPredictedScore(
                                value as number,
                                selectedOutcomeType
                              ),
                              label.charAt(0).toUpperCase() + label.slice(1),
                            ];
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="pessimistic"
                          stackId="1"
                          stroke="#ef4444"
                          fill="#ef4444"
                          fillOpacity={0.1}
                          name="Pessimistic"
                        />
                        <Area
                          type="monotone"
                          dataKey="realistic"
                          stackId="2"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.2}
                          name="Realistic"
                        />
                        <Area
                          type="monotone"
                          dataKey="optimistic"
                          stackId="3"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.1}
                          name="Optimistic"
                        />
                        <Line
                          type="monotone"
                          dataKey="current"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          name="Current Trajectory"
                        />
                      </ComposedChart>
                    ) : (
                      <LineChart data={forecastData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" fontSize={12} />
                        <YAxis fontSize={12} />
                        <RechartsTooltip
                          formatter={value => [
                            formatPredictedScore(
                              value as number,
                              selectedOutcomeType
                            ),
                            'Predicted Score',
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey={
                            showScenarios ? selectedScenario : 'realistic'
                          }
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Key Factors */}
            {!compact && currentPrediction.factors?.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4" />
                  Key Performance Factors
                </h4>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {currentPrediction.factors
                    .slice(0, 4)
                    .map((factor: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              factor.impact > 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {factor.name}
                          </span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline">
                                {factor.impact > 0 ? '+' : ''}
                                {Math.round(factor.impact * 100)}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Impact on predicted outcome</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {currentPrediction.recommendations?.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4" />
                  AI Recommendations
                </h4>
                <div className="space-y-2">
                  {currentPrediction.recommendations
                    .slice(0, compact ? 2 : 4)
                    .map((rec: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 rounded-lg border bg-blue-50 p-3 text-sm dark:bg-blue-900/20"
                      >
                        <Zap className="mt-0.5 h-3 w-3 text-blue-500" />
                        <span className="text-blue-700 dark:text-blue-300">
                          {rec}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Milestones Progress */}
            {!compact && trends?.milestones?.length > 0 && (
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  Upcoming Milestones
                </h4>
                <div className="space-y-2">
                  {trends.milestones
                    .slice(0, 3)
                    .map((milestone: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{milestone.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Due:{' '}
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Progress
                            value={milestone.completionProbability * 100}
                            className="mb-1 w-20"
                          />
                          <span className="text-xs text-muted-foreground">
                            {Math.round(milestone.completionProbability * 100)}%
                            likely
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Prediction Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Prediction generated:{' '}
                {new Date(
                  currentPrediction.predictionDate
                ).toLocaleDateString()}
              </span>
              {showConfidenceScores && (
                <span>
                  Model accuracy:{' '}
                  {Math.round((trends?.modelAccuracy || 0.85) * 100)}%
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PerformanceForecastWidget;
