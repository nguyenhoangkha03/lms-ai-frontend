'use client';

import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  ArrowRight,
  Play,
  Plus,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import {
  useAIRecommendations,
  type LessonRecommendation,
} from '@/lib/redux/api/ai-integration-api';

interface AILessonRecommendationsProps {
  userId: string;
  assessmentAttemptId: string;
  className?: string;
  onLessonSelect?: (lessonId: string) => void;
}

export default function AILessonRecommendations({
  userId,
  assessmentAttemptId,
  className = '',
  onLessonSelect,
}: AILessonRecommendationsProps) {
  const [showAll, setShowAll] = useState(false);

  const {
    getLessonRecommendations,
    recommendations,
    strategy,
    strategyConfidence,
    totalRecommendations,
    isLoading,
    error,
    aiAvailable,
  } = useAIRecommendations();

  React.useEffect(() => {
    if (userId && assessmentAttemptId) {
      getLessonRecommendations({
        user_id: userId,
        assessment_attemp_id: assessmentAttemptId,
      });
    }
  }, [userId, assessmentAttemptId, getLessonRecommendations]);

  // Priority colors and icons
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <AlertCircle className="h-4 w-4" />,
          label: 'Critical',
          description: 'Requires immediate attention',
        };
      case 'HIGH':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <TrendingUp className="h-4 w-4" />,
          label: 'High Priority',
          description: 'Should be addressed soon',
        };
      case 'MEDIUM':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <Target className="h-4 w-4" />,
          label: 'Medium Priority',
          description: 'Good to review when possible',
        };
      case 'LOW':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Low Priority',
          description: 'Optional enhancement',
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <BookOpen className="h-4 w-4" />,
          label: 'Standard',
          description: 'Regular review recommended',
        };
    }
  };

  if (!aiAvailable) {
    return (
      <Card className={`border-2 border-dashed ${className}`}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-600">
            AI Recommendations Unavailable
          </h3>
          <p className="text-center text-gray-500">
            AI recommendation service is currently unavailable. Please try again
            later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="space-y-3 rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  <div className="h-6 w-16 rounded-full bg-gray-200"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-gray-200"></div>
                  <div className="h-3 w-2/3 rounded bg-gray-200"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendations.length) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Lightbulb className="mb-4 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-600">
            Great Job!
          </h3>
          <p className="text-center text-gray-500">
            No specific lesson recommendations needed. You're doing well! Keep
            up the good work.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayRecommendations = showAll
    ? recommendations
    : recommendations.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-2">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                AI Study Recommendations
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                Based on your assessment performance, here's what you should
                focus on next 🎯
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              AI Generated
            </Badge>
          </div>

          {/* Strategy Info */}
          {strategy && (
            <Alert className="mt-4 border-blue-200 bg-blue-50">
              <Target className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Recommended Strategy:</strong>{' '}
                {strategy.replace(/_/g, ' ')}
                <span className="ml-2 text-sm">
                  (Confidence: {Math.round(strategyConfidence * 100)}%)
                </span>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {displayRecommendations.map((recommendation, index) => {
            const priorityConfig = getPriorityConfig(
              recommendation.priority_rank
            );

            return (
              <motion.div
                key={recommendation.lesson_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`rounded-2xl border-2 ${priorityConfig.borderColor} ${priorityConfig.bgColor} p-6 transition-all duration-300 hover:shadow-md`}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex flex-1 items-start gap-3">
                    <div
                      className={`${priorityConfig.color} flex-shrink-0 rounded-xl p-2 text-white`}
                    >
                      {priorityConfig.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 text-lg font-bold text-gray-800">
                        {recommendation.lesson_title}
                      </h3>
                      <p className="mb-2 text-sm text-gray-600">
                        Course: {recommendation.course_title}
                      </p>
                      <Badge
                        className={`${priorityConfig.color} text-xs text-white`}
                      >
                        {priorityConfig.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      {recommendation.priority_score.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Priority Score</div>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-white p-3 text-center">
                    <div className="text-lg font-bold text-red-600">
                      {recommendation.lesson_wrong_total_ratio}
                    </div>
                    <div className="text-xs text-gray-500">Wrong/Total</div>
                  </div>
                  <div className="rounded-xl border bg-white p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {recommendation.lesson_accuracy_percentage}
                    </div>
                    <div className="text-xs text-gray-500">Accuracy</div>
                  </div>
                </div>

                {/* Reason */}
                <Alert className="mb-4 border-0 bg-white">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <AlertDescription className="text-gray-700">
                    <strong>Why you should study this:</strong>{' '}
                    {recommendation.reason}
                  </AlertDescription>
                </Alert>

                {/* Wrong Questions */}
                {recommendation.questions_wrong &&
                  recommendation.questions_wrong.length > 0 && (
                    <div className="mb-4">
                      <h4 className="mb-2 text-sm font-semibold text-gray-800">
                        Questions you got wrong:
                      </h4>
                      <div className="space-y-2">
                        {recommendation.questions_wrong
                          .slice(0, 2)
                          .map((question, qIndex) => (
                            <div
                              key={qIndex}
                              className="rounded-lg border bg-white p-2 text-sm text-gray-600"
                            >
                              <span className="font-medium">
                                Q{question.orderIndex + 1}:
                              </span>{' '}
                              {question.title}
                            </div>
                          ))}
                        {recommendation.questions_wrong.length > 2 && (
                          <div className="text-center text-xs text-gray-500">
                            +{recommendation.questions_wrong.length - 2} more
                            questions
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => onLessonSelect?.(recommendation.lesson_id)}
                    className={`flex-1 ${priorityConfig.color} text-white hover:opacity-90`}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Learning
                  </Button>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add to Playlist
                  </Button>
                </div>
              </motion.div>
            );
          })}

          {/* Show More Button */}
          {recommendations.length > 3 && (
            <div className="pt-4 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
                className="border-purple-200 bg-white text-purple-700 hover:bg-purple-50"
              >
                {showAll
                  ? 'Show Less'
                  : `Show ${recommendations.length - 3} More Recommendations`}
                <ArrowRight
                  className={`ml-2 h-4 w-4 transition-transform ${showAll ? 'rotate-90' : ''}`}
                />
              </Button>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 rounded-xl border border-purple-200 bg-white p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Total recommendations: {totalRecommendations}</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span>
                  Strategy confidence: {Math.round(strategyConfidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
