'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  BookOpen,
  FileText,
  Coffee,
  Target,
  Lightbulb,
  TrendingUp,
  Clock,
  X,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Sparkles,
  Filter,
  MoreHorizontal,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGetAIRecommendationsQuery,
  useDismissAIRecommendationMutation,
} from '@/lib/redux/api/student-dashboard-api';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setRecommendationsFilter,
  dismissRecommendation,
} from '@/lib/redux/slices/dashboard-slice';
import { useRouter } from 'next/navigation';

const recommendationIcons = {
  next_lesson: BookOpen,
  review_content: TrendingUp,
  practice_quiz: FileText,
  supplementary_material: Lightbulb,
  study_break: Coffee,
  course_recommendation: Target,
};

const recommendationColors = {
  next_lesson: 'text-blue-600 bg-blue-100',
  review_content: 'text-orange-600 bg-orange-100',
  practice_quiz: 'text-green-600 bg-green-100',
  supplementary_material: 'text-purple-600 bg-purple-100',
  study_break: 'text-yellow-600 bg-yellow-100',
  course_recommendation: 'text-pink-600 bg-pink-100',
};

const confidenceColors = {
  high: 'text-green-700 bg-green-100',
  medium: 'text-yellow-700 bg-yellow-100',
  low: 'text-red-700 bg-red-100',
};

export const AIRecommendationsWidget: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: recommendations = [], isLoading } =
    useGetAIRecommendationsQuery({ limit: 5 });
  const [dismissRecommendationMutation] = useDismissAIRecommendationMutation();
  const { recommendationsFilter, dismissedRecommendations } = useAppSelector(
    state => state.dashboard
  );

  const filteredRecommendations = recommendations.filter(rec => {
    if (dismissedRecommendations.includes(rec.id)) return false;
    if (recommendationsFilter === 'all') return true;
    if (recommendationsFilter === 'learning')
      return ['next_lesson', 'course_recommendation'].includes(rec.type);
    if (recommendationsFilter === 'review')
      return ['review_content', 'supplementary_material'].includes(rec.type);
    if (recommendationsFilter === 'practice')
      return rec.type === 'practice_quiz';
    return true;
  });

  const handleRecommendationClick = (recommendation: any) => {
    if (recommendation.href) {
      router.push(recommendation.href);
    }
  };

  const handleDismiss = async (
    recommendationId: string,
    reason: string = 'not_interested'
  ) => {
    try {
      await dismissRecommendationMutation({
        recommendationId,
        reason,
      }).unwrap();
      dispatch(dismissRecommendation(recommendationId));
    } catch (error) {
      console.error('Failed to dismiss recommendation:', error);
    }
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-20 rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>AI Recommendations</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Personalized suggestions to boost your learning
            </CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {recommendationsFilter === 'all'
                    ? 'All'
                    : recommendationsFilter === 'learning'
                      ? 'Learning'
                      : recommendationsFilter === 'review'
                        ? 'Review'
                        : 'Practice'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => dispatch(setRecommendationsFilter('all'))}
                >
                  All Recommendations
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setRecommendationsFilter('learning'))}
                >
                  Learning Path
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setRecommendationsFilter('review'))}
                >
                  Review & Study
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setRecommendationsFilter('practice'))}
                >
                  Practice & Quiz
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Feedback on recommendations</DropdownMenuItem>
                <DropdownMenuItem>Customize preferences</DropdownMenuItem>
                <DropdownMenuItem>View all dismissed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredRecommendations.length === 0 ? (
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-muted-foreground">
              No recommendations available
            </p>
            <p className="text-sm text-muted-foreground">
              Continue learning to get personalized AI suggestions
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/student/courses')}
            >
              Start Learning
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation, index) => {
              const IconComponent =
                recommendationIcons[recommendation.type] || Brain;
              const confidenceLevel = getConfidenceLevel(
                recommendation.confidence
              );

              return (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative rounded-lg border border-primary/20 bg-gradient-to-r from-primary/5 to-transparent p-4 transition-all duration-200 hover:from-primary/10 hover:to-primary/5"
                >
                  {/* Dismiss button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={e => {
                      e.stopPropagation();
                      handleDismiss(recommendation.id);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div
                    className="cursor-pointer"
                    onClick={() => handleRecommendationClick(recommendation)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Recommendation icon */}
                      <div
                        className={`rounded-lg p-3 ${recommendationColors[recommendation.type] || 'bg-gray-100 text-gray-600'}`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>

                      {/* Recommendation content */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-primary transition-colors group-hover:text-primary/80">
                              {recommendation.title}
                            </h4>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {recommendation.description}
                            </p>
                          </div>
                        </div>

                        {/* AI reasoning */}
                        <div className="mb-3 rounded-lg bg-muted/50 p-3">
                          <div className="flex items-start space-x-2">
                            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                            <div>
                              <p className="mb-1 text-sm font-medium text-muted-foreground">
                                Why we recommend this:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {recommendation.reason}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Metadata and actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {/* Confidence badge */}
                            <Badge
                              variant="outline"
                              className={`text-xs ${confidenceColors[confidenceLevel]}`}
                            >
                              {Math.round(recommendation.confidence * 100)}%
                              confidence
                            </Badge>

                            {/* Estimated time */}
                            {recommendation.metadata?.estimatedTime && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {recommendation.metadata.estimatedTime} min
                                </span>
                              </div>
                            )}

                            {/* Created time */}
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <span>
                                {formatTimeAgo(recommendation.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={e => {
                                e.stopPropagation();
                                // Handle feedback - could implement rating system
                              }}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                              onClick={e => {
                                e.stopPropagation();
                                handleDismiss(recommendation.id, 'not_helpful');
                              }}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </Button>

                            {recommendation.href && (
                              <Button
                                size="sm"
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                {recommendation.actionText || 'Take Action'}
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* AI powered footer */}
            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Brain className="h-4 w-4" />
                  <span>Powered by AI learning analytics</span>
                </div>
                <Button variant="ghost" size="sm">
                  View All Recommendations
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
