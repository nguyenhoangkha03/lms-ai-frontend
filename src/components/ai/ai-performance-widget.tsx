'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Activity,
  Sparkles,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  useGetAIPerformanceTrackingQuery,
  useGetStudentAttitudeQuery,
  useCheckAIHealthQuery,
} from '@/lib/redux/api/ai-integration-api';

interface AIPerformanceWidgetProps {
  courseId?: string;
  showFullDetails?: boolean;
  className?: string;
}

export default function AIPerformanceWidget({
  courseId,
  showFullDetails = true,
  className = '',
}: AIPerformanceWidgetProps) {
  const { user } = useAuth();

  // AI API queries
  const { data: aiHealth } = useCheckAIHealthQuery();
  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
  } = useGetAIPerformanceTrackingQuery(
    { user_id: user?.id || '', course_id: courseId || '' },
    { skip: !user?.id || !courseId }
  );
  const { data: attitudeData, isLoading: attitudeLoading } =
    useGetStudentAttitudeQuery(
      { user_id: user?.id || '' },
      { skip: !user?.id }
    );

  const isAIAvailable = aiHealth?.ai_api_available || false;
  const isLoading = performanceLoading || attitudeLoading;

  // Performance level colors and icons
  const getPerformanceConfig = (level: string) => {
    switch (level) {
      case 'excellent':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          icon: <CheckCircle className="h-5 w-5" />,
          label: 'Excellent',
        };
      case 'good':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          icon: <Target className="h-5 w-5" />,
          label: 'Good',
        };
      case 'average':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          icon: <Activity className="h-5 w-5" />,
          label: 'Intermediate',
        };
      case 'poor':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          icon: <AlertTriangle className="h-5 w-5" />,
          label: 'Needs improvement',
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          icon: <Brain className="h-5 w-5" />,
          label: 'Not determined',
        };
    }
  };

  // Attitude colors and messages
  const getAttitudeConfig = (attitude: string) => {
    switch (attitude) {
      case 'Active':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          label: 'Positive',
          message: 'You are very active in your studies! 🚀',
        };
      case 'Moderate':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          label: 'Neutral',
          message: 'You are making progress but could do better! 💪',
        };
      case 'Give_up':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          label: 'Negative',
          message:
            "You are giving up! Don't give up! Please contact your teacher for support. 💬",
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          label: 'Not determined',
          message:
            'Please study more to allow AI to provide a more accurate assessment.',
        };
    }
  };

  // Trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'tăng':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'giảm':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'ổn định':
        return <Minus className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isAIAvailable) {
    return (
      <Card className={`border-2 border-dashed ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-600">
            AI Analysis Unavailable
          </h3>
          <p className="text-center text-gray-500">
            AI service is currently unavailable. Performance insights will be
            shown when the service is restored.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200"></div>
              <div className="h-8 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performanceConfig = getPerformanceConfig(
    performanceData?.data?.performance_level || ''
  );
  const attitudeConfig = getAttitudeConfig(
    attitudeData?.data?.predicted_attitude || ''
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                AI Performance Insights
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                AI-powered analysis of your learning progress and behavior 🤖
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700"
            >
              <Zap className="mr-1 h-3 w-3" />
              AI Powered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Performance Level */}
          {performanceData?.data && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`rounded-2xl ${performanceConfig.bgColor} border border-opacity-20 p-4`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`${performanceConfig.color} rounded-xl p-2 text-white`}
                  >
                    {performanceConfig.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Performance Level
                    </h3>
                    <p
                      className={`text-sm ${performanceConfig.textColor} font-medium`}
                    >
                      {performanceConfig.label}
                    </p>
                  </div>
                </div>
                <Badge className={`${performanceConfig.color} text-white`}>
                  {Math.round(performanceData.data.predicted_score * 10) / 10}
                  /10
                </Badge>
              </div>

              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Trend:</span>
                {getTrendIcon(performanceData.data.trend_prediction)}
                <span className="text-sm font-medium capitalize">
                  {performanceData.data.trend_prediction}
                </span>
              </div>

              <Progress
                value={(performanceData.data.predicted_score / 10) * 100}
                className="h-3"
              />
            </motion.div>
          )}

          {/* Learning Attitude */}
          {attitudeData?.data && showFullDetails && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-2xl ${attitudeConfig.bgColor} border border-opacity-20 p-4`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`${attitudeConfig.color} rounded-xl p-2 text-white`}
                  >
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Learning Attitude
                    </h3>
                    <p
                      className={`text-sm ${attitudeConfig.textColor} font-medium`}
                    >
                      {attitudeConfig.label}
                    </p>
                  </div>
                </div>
                <Badge className={`${attitudeConfig.color} text-white`}>
                  {Math.round((attitudeData.data.confidence || 0) * 100)}%
                </Badge>
              </div>

              <Alert className={`border-0 ${attitudeConfig.bgColor}`}>
                <AlertDescription className="text-sm">
                  {attitudeConfig.message}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* AI Suggestions */}
          {showFullDetails && (performanceData?.data || attitudeData?.data) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-4"
            >
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                AI Suggestions
              </h3>

              <div className="space-y-2">
                {performanceData?.data?.trend_prediction === 'giảm' && (
                  <p className="text-sm text-gray-600">
                    • Consider reviewing previous lessons to strengthen your
                    foundation
                  </p>
                )}

                {attitudeData?.data?.predicted_attitude === 'Give_up' && (
                  <p className="text-sm text-gray-600">
                    • Take breaks when needed and don't hesitate to ask for help
                  </p>
                )}

                {performanceData?.data?.performance_level === 'excellent' && (
                  <p className="text-sm text-gray-600">
                    • Great job! Consider exploring advanced topics or helping
                    other students
                  </p>
                )}

                <p className="text-sm text-gray-600">
                  • Chat with AI Tutor for personalized study recommendations
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
              >
                <Brain className="mr-2 h-4 w-4" />
                Get AI Study Plan
              </Button>
            </motion.div>
          )}

          {/* Error States */}
          {performanceError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Unable to load AI performance data. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
