'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  Target,
  Brain,
  Shield,
  ExternalLink,
  RefreshCw,
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  RadialBarChart,
  RadialBar,
} from 'recharts';

import {
  useGetDropoutRiskAssessmentsQuery,
  useAssessDropoutRiskMutation,
  useGetInterventionRecommendationsQuery,
} from '@/lib/redux/api/predictive-analytics-api';

interface DropoutRiskWidgetProps {
  studentId?: string;
  courseId?: string;
  compact?: boolean;
  showActions?: boolean;
  showInterventions?: boolean;
  allowScheduling?: boolean;
  className?: string;
}

export function DropoutRiskWidget({
  studentId,
  courseId,
  compact = false,
  showActions = true,
  showInterventions = false,
  allowScheduling = false,
  className = '',
}: DropoutRiskWidgetProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');

  const {
    data: riskAssessments,
    isLoading: isLoadingRisk,
    error: riskError,
    refetch: refetchRisk,
  } = useGetDropoutRiskAssessmentsQuery({
    studentId,
    courseId,
    limit: compact ? 1 : 10,
  });

  const { data: interventions, isLoading: isLoadingInterventions } =
    useGetInterventionRecommendationsQuery(
      {
        studentId,
        courseId,
        status: 'pending',
      },
      { skip: !showInterventions }
    );

  const [assessRisk, { isLoading: isAssessing }] =
    useAssessDropoutRiskMutation();

  const currentRisk = riskAssessments?.[0];

  const handleReassess = async () => {
    if (!studentId) return;

    try {
      await assessRisk({
        studentId,
        courseId,
        forceReassess: true,
      }).unwrap();
      await refetchRisk();
    } catch (error) {
      console.error('Failed to reassess risk:', error);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const riskTrendData = riskAssessments
    ?.slice(0, 7)
    .reverse()
    .map((assessment, index) => ({
      date: new Date(assessment.assessmentDate).toLocaleDateString(),
      risk: Math.round(assessment.riskProbability * 100),
      index,
    }));

  if (isLoadingRisk) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (riskError || !currentRisk) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Dropout Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Assessment Unavailable</AlertTitle>
            <AlertDescription>
              Unable to load risk assessment data.
              {showActions && (
                <>
                  {' '}
                  <Button
                    variant="link"
                    className="h-auto p-0"
                    onClick={handleReassess}
                    disabled={isAssessing}
                  >
                    {isAssessing ? 'Assessing...' : 'Run assessment'}
                  </Button>
                </>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const riskPercentage = Math.round(currentRisk.riskProbability * 100);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getRiskIcon(currentRisk.riskLevel)}
              Dropout Risk Assessment
            </CardTitle>
            <CardDescription>
              AI-powered early warning system for learning challenges
            </CardDescription>
          </div>

          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleReassess}
                  disabled={isAssessing}
                >
                  {isAssessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reassessing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reassess Risk
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Review
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Score Display */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <ResponsiveContainer width={120} height={120}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                data={[{ value: riskPercentage }]}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill={
                    currentRisk.riskLevel === 'low'
                      ? '#10b981'
                      : currentRisk.riskLevel === 'medium'
                        ? '#f59e0b'
                        : '#ef4444'
                  }
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{riskPercentage}%</span>
              <Badge
                variant="outline"
                className={`mt-1 capitalize ${getRiskColor(currentRisk.riskLevel)}`}
              >
                {currentRisk.riskLevel} Risk
              </Badge>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {!compact && currentRisk.riskFactors?.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Risk Factors
            </h4>
            <div className="space-y-2">
              {currentRisk.riskFactors.slice(0, 3).map((factor, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-2 text-sm dark:border-red-800 dark:bg-red-900/20"
                >
                  <AlertTriangle className="h-3 w-3 text-red-500" />
                  <span className="text-red-700 dark:text-red-300">
                    {factor}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Protective Factors */}
        {!compact && currentRisk.protectiveFactors?.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-green-500" />
              Protective Factors
            </h4>
            <div className="space-y-2">
              {currentRisk.protectiveFactors
                .slice(0, 3)
                .map((factor, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-2 text-sm dark:border-green-800 dark:bg-green-900/20"
                  >
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-700 dark:text-green-300">
                      {factor}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Risk Trend */}
        {!compact && riskTrendData && riskTrendData.length > 1 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" />
              Risk Trend (Last 7 Assessments)
            </h4>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} tick={{ fontSize: 10 }} />
                  <YAxis
                    domain={[0, 100]}
                    fontSize={12}
                    tick={{ fontSize: 10 }}
                  />
                  <RechartsTooltip
                    formatter={value => [`${value}%`, 'Risk Score']}
                    labelFormatter={label => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="risk"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {currentRisk.recommendedInterventions?.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4" />
              Recommended Actions
            </h4>
            <div className="space-y-2">
              {currentRisk.recommendedInterventions
                .slice(0, compact ? 2 : 5)
                .map((intervention, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 rounded-lg border p-3 text-sm"
                  >
                    <Brain className="mt-0.5 h-3 w-3 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-muted-foreground">{intervention}</p>
                      {allowScheduling && (
                        <Button
                          variant="link"
                          size="sm"
                          className="mt-1 h-auto p-0 text-xs"
                        >
                          Schedule intervention
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Interventions Section */}
        {showInterventions && interventions && interventions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4" />
                Pending Interventions ({interventions.length})
              </h4>
              <div className="space-y-2">
                {interventions.slice(0, 3).map(intervention => (
                  <div
                    key={intervention.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{intervention.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Priority: {intervention.priority} | Type:{' '}
                        {intervention.interventionType.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant="outline">{intervention.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Confidence Score */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Assessment Confidence</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-medium">
                  {Math.round((currentRisk.confidence || 0.85) * 100)}%
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI model confidence in this prediction</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground">
          Last assessed: {new Date(currentRisk.assessmentDate).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
