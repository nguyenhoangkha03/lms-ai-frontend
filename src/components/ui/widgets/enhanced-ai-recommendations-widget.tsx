'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  Star,
  Play,
  ChevronDown,
  ChevronUp,
  Zap,
  Calendar,
  Users,
  Award,
  BookmarkPlus,
  Share2,
  MessageSquare,
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useGetComprehensiveRecommendationsQuery,
  useInteractWithRecommendationMutation,
  useProvideFeedbackMutation,
  useGenerateRecommendationsMutation,
} from '@/lib/redux/api/ai-recommendation-api';
import { AIRecommendation } from '@/lib/types/ai-recommendation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const recommendationIcons = {
  next_lesson: BookOpen,
  review_content: TrendingUp,
  practice_quiz: FileText,
  supplementary_material: Lightbulb,
  course_recommendation: Target,
  study_schedule: Calendar,
  learning_path: Brain,
  skill_improvement: Award,
  peer_study_group: Users,
  tutor_session: MessageSquare,
  break_suggestion: Coffee,
  difficulty_adjustment: Zap,
};

const recommendationColors = {
  next_lesson: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  review_content: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  practice_quiz: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  supplementary_material: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  course_recommendation: 'text-pink-600 bg-pink-100 dark:bg-pink-900/20',
  study_schedule: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20',
  learning_path: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20',
  skill_improvement: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  peer_study_group: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20',
  tutor_session: 'text-violet-600 bg-violet-100 dark:bg-violet-900/20',
  break_suggestion: 'text-amber-600 bg-amber-100 dark:bg-amber-900/20',
  difficulty_adjustment: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

const priorityColors = {
  low: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  high: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  urgent: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

interface EnhancedAIRecommendationsWidgetProps {
  className?: string;
  maxItems?: number;
  showTabs?: boolean;
  showFilters?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const EnhancedAIRecommendationsWidget: React.FC<
  EnhancedAIRecommendationsWidgetProps
> = ({
  className,
  maxItems = 6,
  showTabs = true,
  showFilters = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  // Local state
  const [activeTab, setActiveTab] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [viewedItems, setViewedItems] = useState<Set<string>>(new Set());

  // API hooks
  const {
    data: recommendations = [],
    isLoading,
    isError,
    refetch,
  } = useGetComprehensiveRecommendationsQuery();

  const [interactWithRecommendation] = useInteractWithRecommendationMutation();
  const [provideFeedback] = useProvideFeedbackMutation();
  const [generateRecommendations] = useGenerateRecommendationsMutation();

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refetch]);

  // Filter recommendations
  const filteredRecommendations = recommendations.filter(rec => {
    if (activeTab !== 'all' && rec.recommendationType !== activeTab) {
      return false;
    }
    if (selectedPriority !== 'all' && rec.priority !== selectedPriority) {
      return false;
    }
    return (
      rec.isActive &&
      (!rec.dismissedAt || new Date(rec.dismissedAt) < new Date())
    );
  });

  // Sort by priority and confidence
  const sortedRecommendations = filteredRecommendations
    .sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.confidence - a.confidence;
    })
    .slice(0, maxItems);

  // Handle recommendation click
  const handleRecommendationClick = async (
    recommendation: AIRecommendation
  ) => {
    try {
      // Record interaction
      await interactWithRecommendation({
        id: recommendation.id,
        action: 'click',
        metadata: { timestamp: new Date().toISOString() },
      });

      // Navigate based on recommendation type
      const { metadata } = recommendation;
      if (metadata.targetUrl) {
        router.push(metadata.targetUrl);
      } else {
        switch (recommendation.recommendationType) {
          case 'next_lesson':
            if (metadata.courseId && metadata.lessonId) {
              router.push(
                `/student/courses/${metadata.courseId}/lessons/${metadata.lessonId}`
              );
            }
            break;
          case 'practice_quiz':
            if (metadata.assessmentId) {
              router.push(`/student/assessments/${metadata.assessmentId}/take`);
            }
            break;
          case 'course_recommendation':
            if (metadata.courseId) {
              router.push(`/courses/${metadata.courseId}`);
            }
            break;
          default:
            router.push('/student/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to navigate to recommendation',
        variant: 'destructive',
      });
    }
  };

  // Handle feedback
  const handleFeedback = async (
    recommendationId: string,
    feedback: 'positive' | 'negative',
    comment?: string
  ) => {
    try {
      await provideFeedback({
        id: recommendationId,
        feedback,
        comment,
      });
      toast({
        title: 'Thank you for your feedback!',
        description: 'This helps us improve our recommendations.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    }
  };

  // Handle dismiss
  const handleDismiss = async (recommendationId: string) => {
    try {
      await interactWithRecommendation({
        id: recommendationId,
        action: 'dismiss',
      });
      toast({
        title: 'Recommendation dismissed',
        description: "We won't show this recommendation again.",
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss recommendation',
        variant: 'destructive',
      });
    }
  };

  // Toggle expanded view
  const toggleExpanded = (recommendationId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(recommendationId)) {
      newExpanded.delete(recommendationId);
    } else {
      newExpanded.add(recommendationId);
    }
    setExpandedItems(newExpanded);
  };

  // Mark as viewed
  const markAsViewed = async (recommendationId: string) => {
    if (!viewedItems.has(recommendationId)) {
      setViewedItems(new Set([...viewedItems, recommendationId]));
      try {
        await interactWithRecommendation({
          id: recommendationId,
          action: 'view',
        });
      } catch (error) {
        // Silent fail for view tracking
      }
    }
  };

  // Get confidence level display
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8)
      return {
        level: 'high',
        color: 'text-green-600',
        label: 'High Confidence',
      };
    if (confidence >= 0.6)
      return {
        level: 'medium',
        color: 'text-yellow-600',
        label: 'Medium Confidence',
      };
    return { level: 'low', color: 'text-red-600', label: 'Low Confidence' };
  };

  // Get recommendation categories for tabs
  const recommendationCategories = [
    { id: 'all', label: 'All', count: recommendations.length },
    {
      id: 'next_lesson',
      label: 'Continue Learning',
      count: recommendations.filter(r => r.recommendationType === 'next_lesson')
        .length,
    },
    {
      id: 'practice_quiz',
      label: 'Practice',
      count: recommendations.filter(
        r => r.recommendationType === 'practice_quiz'
      ).length,
    },
    {
      id: 'course_recommendation',
      label: 'Discover',
      count: recommendations.filter(
        r => r.recommendationType === 'course_recommendation'
      ).length,
    },
    {
      id: 'skill_improvement',
      label: 'Improve',
      count: recommendations.filter(
        r => r.recommendationType === 'skill_improvement'
      ).length,
    },
  ];

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 animate-pulse text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
              <CardDescription>
                Loading personalized suggestions...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-4">
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Brain className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
                <CardDescription>
                  Failed to load recommendations
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Recommendations</CardTitle>
                <CardDescription>
                  Personalized suggestions powered by AI
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {showFilters && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority('all')}
                      className={selectedPriority === 'all' ? 'bg-accent' : ''}
                    >
                      All Priorities
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority('urgent')}
                      className={
                        selectedPriority === 'urgent' ? 'bg-accent' : ''
                      }
                    >
                      <Badge variant="destructive" className="mr-2 h-4">
                        Urgent
                      </Badge>
                      Urgent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority('high')}
                      className={selectedPriority === 'high' ? 'bg-accent' : ''}
                    >
                      <Badge variant="secondary" className="mr-2 h-4">
                        High
                      </Badge>
                      High Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority('medium')}
                      className={
                        selectedPriority === 'medium' ? 'bg-accent' : ''
                      }
                    >
                      <Badge variant="outline" className="mr-2 h-4">
                        Medium
                      </Badge>
                      Medium Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSelectedPriority('low')}
                      className={selectedPriority === 'low' ? 'bg-accent' : ''}
                    >
                      <Badge variant="outline" className="mr-2 h-4">
                        Low
                      </Badge>
                      Low Priority
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh recommendations</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {showTabs && (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-5">
                {recommendationCategories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="relative"
                  >
                    {category.label}
                    {category.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-4 px-1 text-xs"
                      >
                        {category.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {sortedRecommendations.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-medium">
                No recommendations available
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Continue learning to get personalized AI suggestions
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/student/courses')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Courses
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {sortedRecommendations.map((recommendation, index) => {
                  const IconComponent =
                    recommendationIcons[recommendation.recommendationType] ||
                    Brain;
                  const confidence = getConfidenceLevel(
                    recommendation.confidence
                  );
                  const isExpanded = expandedItems.has(recommendation.id);
                  const isViewed = viewedItems.has(recommendation.id);

                  return (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.3,
                        ease: 'easeOut',
                      }}
                      className={cn(
                        'group relative overflow-hidden rounded-xl border transition-all duration-300',
                        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10',
                        'bg-gradient-to-br from-background to-muted/20',
                        !isViewed && 'ring-2 ring-primary/20 ring-offset-2'
                      )}
                      onViewportEnter={() => markAsViewed(recommendation.id)}
                    >
                      {/* Priority indicator */}
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full w-1 transition-colors',
                          priorityColors[recommendation.priority].split(' ')[1]
                        )}
                      />

                      {/* Dismiss button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={e => {
                          e.stopPropagation();
                          handleDismiss(recommendation.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div
                        className="cursor-pointer p-6"
                        onClick={() =>
                          handleRecommendationClick(recommendation)
                        }
                      >
                        <div className="flex items-start space-x-4">
                          {/* Icon */}
                          <div
                            className={cn(
                              'rounded-xl p-3 transition-transform group-hover:scale-110',
                              recommendationColors[
                                recommendation.recommendationType
                              ] || 'bg-gray-100 text-gray-600'
                            )}
                          >
                            <IconComponent className="h-6 w-6" />
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <h4 className="mb-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                                  {recommendation.title}
                                </h4>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                  {recommendation.description}
                                </p>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="mb-4 flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs',
                                  priorityColors[recommendation.priority]
                                )}
                              >
                                {recommendation.priority} priority
                              </Badge>

                              <Badge
                                variant="outline"
                                className={cn('text-xs', confidence.color)}
                              >
                                <Star className="mr-1 h-3 w-3" />
                                {confidence.label}
                              </Badge>

                              {recommendation.estimatedDuration && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {recommendation.estimatedDuration} min
                                </Badge>
                              )}

                              {recommendation.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {recommendation.category}
                                </Badge>
                              )}
                            </div>

                            {/* AI Reasoning */}
                            <div className="mb-4 rounded-lg bg-muted/50 p-4">
                              <div className="flex items-start space-x-3">
                                <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                                  <Sparkles className="h-3 w-3 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                                    AI Insight:
                                  </p>
                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                    {recommendation.reason}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Confidence Progress */}
                            <div className="mb-4">
                              <div className="mb-1 flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Confidence Score
                                </span>
                                <span
                                  className={cn(
                                    'text-xs font-medium',
                                    confidence.color
                                  )}
                                >
                                  {Math.round(recommendation.confidence * 100)}%
                                </span>
                              </div>
                              <Progress
                                value={recommendation.confidence * 100}
                                className="h-2"
                              />
                            </div>

                            {/* Expandable details */}
                            {recommendation.metadata &&
                              Object.keys(recommendation.metadata).length >
                                0 && (
                                <div className="mb-4">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                    onClick={e => {
                                      e.stopPropagation();
                                      toggleExpanded(recommendation.id);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="mr-1 h-3 w-3" />
                                        Hide Details
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="mr-1 h-3 w-3" />
                                        Show Details
                                      </>
                                    )}
                                  </Button>

                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-2 space-y-2 overflow-hidden"
                                      >
                                        {recommendation.metadata.aiModel && (
                                          <div className="text-xs">
                                            <span className="font-medium text-muted-foreground">
                                              AI Model:
                                            </span>
                                            <span className="ml-2 text-foreground">
                                              {recommendation.metadata.aiModel}
                                            </span>
                                          </div>
                                        )}
                                        {recommendation.metadata
                                          .algorithmVersion && (
                                          <div className="text-xs">
                                            <span className="font-medium text-muted-foreground">
                                              Algorithm:
                                            </span>
                                            <span className="ml-2 text-foreground">
                                              v
                                              {
                                                recommendation.metadata
                                                  .algorithmVersion
                                              }
                                            </span>
                                          </div>
                                        )}
                                        {recommendation.metadata.features && (
                                          <div className="text-xs">
                                            <span className="font-medium text-muted-foreground">
                                              Key Features:
                                            </span>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                              {Object.entries(
                                                recommendation.metadata.features
                                              )
                                                .slice(0, 3)
                                                .map(([key, value]) => (
                                                  <Badge
                                                    key={key}
                                                    variant="outline"
                                                    className="text-xs"
                                                  >
                                                    {key}:{' '}
                                                    {typeof value === 'number'
                                                      ? value.toFixed(2)
                                                      : value}
                                                  </Badge>
                                                ))}
                                            </div>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )}

                            {/* Action buttons */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  className="group/btn relative overflow-hidden"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRecommendationClick(recommendation);
                                  }}
                                >
                                  <span className="relative z-10 flex items-center">
                                    <Play className="mr-2 h-3 w-3" />
                                    Start Now
                                    <ArrowRight className="ml-2 h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                  </span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover/btn:opacity-100" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation();
                                    // Add to bookmarks/wishlist logic
                                  }}
                                >
                                  <BookmarkPlus className="h-3 w-3" />
                                </Button>
                              </div>

                              {/* Feedback buttons */}
                              <div className="flex items-center space-x-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-50 hover:text-green-600 hover:opacity-100"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleFeedback(
                                          recommendation.id,
                                          'positive'
                                        );
                                      }}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    This was helpful
                                  </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-50 hover:text-red-600 hover:opacity-100"
                                      onClick={e => {
                                        e.stopPropagation();
                                        handleFeedback(
                                          recommendation.id,
                                          'negative'
                                        );
                                      }}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Not helpful</TooltipContent>
                                </Tooltip>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
                                    >
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => {
                                        // Share recommendation logic
                                      }}
                                    >
                                      <Share2 className="mr-2 h-4 w-4" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDismiss(recommendation.id)
                                      }
                                      className="text-red-600"
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Dismiss
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {sortedRecommendations.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {sortedRecommendations.length} of{' '}
                {filteredRecommendations.length} recommendations
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/student/recommendations')}
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
