'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Users,
  BookOpen,
  Target,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Sparkles,
  BarChart3,
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
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  TeachingInsight,
  useGenerateTeachingRecommendationsMutation,
  useRateTeachingInsightMutation,
} from '@/lib/redux/api/teacher-dashboard-api';

interface TeachingInsightsWidgetProps {
  insights?: TeachingInsight[];
  isLoading: boolean;
  detailed?: boolean;
}

const insightTypeConfig = {
  class_performance: {
    icon: BarChart3,
    label: 'Class Performance',
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  student_engagement: {
    icon: Users,
    label: 'Student Engagement',
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  content_effectiveness: {
    icon: BookOpen,
    label: 'Content Effectiveness',
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  teaching_recommendation: {
    icon: Lightbulb,
    label: 'Teaching Recommendation',
    color: 'orange',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  improvement_suggestion: {
    icon: Target,
    label: 'Improvement Suggestion',
    color: 'red',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
  },
};

export const TeachingInsightsWidget: React.FC<TeachingInsightsWidgetProps> = ({
  insights = [],
  isLoading,
  detailed = false,
}) => {
  const { toast } = useToast();
  const [selectedInsight, setSelectedInsight] =
    useState<TeachingInsight | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);

  const [generateInsights, { isLoading: isGenerating }] =
    useGenerateTeachingRecommendationsMutation();
  const [rateInsight, { isLoading: isRating }] =
    useRateTeachingInsightMutation();

  const handleGenerateInsights = async () => {
    try {
      await generateInsights({}).unwrap();
      toast({
        title: 'AI Insights Generated',
        description: 'New teaching insights have been generated for you.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate insights. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRateInsight = async (insightId: string, rating: number) => {
    try {
      await rateInsight({ insightId, rating, feedback }).unwrap();
      setIsFeedbackDialogOpen(false);
      setFeedback('');
      setSelectedInsight(null);
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for helping us improve our AI insights.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatGeneratedTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const InsightCard = ({
    insight,
    index,
  }: {
    insight: TeachingInsight;
    index: number;
  }) => {
    const config =
      insightTypeConfig[insight.type] ||
      insightTypeConfig.teaching_recommendation;
    const Icon = config.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${config.bgColor} ${config.borderColor} border`}
          onClick={() => setSelectedInsight(insight)}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div
                className={`rounded-full bg-white p-2 shadow-sm dark:bg-gray-800`}
              >
                <Icon className={`h-4 w-4 text-${config.color}-600`} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{insight.title}</h3>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(insight.confidence * 100)}%
                    </Badge>
                    <ChevronRight className="h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

                <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
                  {insight.description}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatGeneratedTime(insight.generatedAt)}
                  </span>
                </div>

                {!detailed && insight.recommendations.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {insight.recommendations.length} recommendation
                    {insight.recommendations.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (!detailed && insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Teaching Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              No Insights Available
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate AI-powered teaching insights based on your class data.
            </p>
            <Button onClick={handleGenerateInsights} disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Insights'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Teaching Insights</span>
              </CardTitle>
              <CardDescription>
                Personalized teaching recommendations powered by AI analysis
              </CardDescription>
            </div>

            <Button
              variant="outline"
              onClick={handleGenerateInsights}
              disabled={isGenerating}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`}
              />
              {isGenerating ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>

        {detailed && (
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {Object.entries(insightTypeConfig).map(([type, config]) => {
                const count = insights.filter(i => i.type === type).length;
                const Icon = config.icon;

                return (
                  <div key={type} className="text-center">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor} mb-2`}
                    >
                      <Icon className={`h-6 w-6 text-${config.color}-600`} />
                    </div>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {config.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insights Grid */}
      {!isLoading && (
        <div
          className={`grid grid-cols-1 ${detailed ? 'lg:grid-cols-2' : ''} gap-4`}
        >
          <AnimatePresence>
            {insights.map((insight, index) => (
              <InsightCard key={insight.id} insight={insight} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {insights.length === 0 && !isLoading && detailed && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              No Insights Available
            </h3>
            <p className="mb-4 text-center text-muted-foreground">
              We need more class data to generate personalized teaching insights
              for you.
            </p>
            <Button onClick={handleGenerateInsights} disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Generate Insights'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Insight Detail Modal */}
      <Dialog
        open={!!selectedInsight}
        onOpenChange={() => setSelectedInsight(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          {selectedInsight && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {React.createElement(
                    insightTypeConfig[selectedInsight.type]?.icon || Brain,
                    {
                      className: `h-5 w-5 text-${insightTypeConfig[selectedInsight.type]?.color || 'blue'}-600`,
                    }
                  )}
                  <span>{selectedInsight.title}</span>
                  <Badge variant="outline">
                    {Math.round(selectedInsight.confidence * 100)}% confidence
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedInsight.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Key Insights */}
                <div className="space-y-3">
                  <h4 className="flex items-center space-x-2 text-sm font-semibold">
                    <Lightbulb className="h-4 w-4" />
                    <span>Key Insights</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedInsight.insights.map((insight, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommendations */}
                {selectedInsight.recommendations.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="flex items-center space-x-2 text-sm font-semibold">
                        <Target className="h-4 w-4" />
                        <span>Recommendations</span>
                      </h4>
                      <div className="space-y-3">
                        {selectedInsight.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="rounded-lg border bg-muted/50 p-3"
                          >
                            <div className="mb-2 flex items-start justify-between">
                              <h5 className="text-sm font-medium">
                                {rec.action}
                              </h5>
                              <Badge
                                variant={getPriorityColor(rec.priority)}
                                className="text-xs"
                              >
                                {rec.priority}
                              </Badge>
                            </div>
                            <p className="mb-2 text-xs text-muted-foreground">
                              Expected Impact: {rec.expectedImpact}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Implementation: {rec.implementation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Data Sources */}
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Data Sources</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedInsight.dataSource.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Generated:{' '}
                    {new Date(selectedInsight.generatedAt).toLocaleDateString()}
                  </span>
                  {selectedInsight.courseId && (
                    <span>Course-specific insight</span>
                  )}
                </div>

                {/* Feedback Section */}
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRateInsight(selectedInsight.id, 1)}
                    disabled={isRating}
                  >
                    <ThumbsUp className="mr-1 h-3 w-3" />
                    Helpful
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFeedbackDialogOpen(true)}
                  >
                    <ThumbsDown className="mr-1 h-3 w-3" />
                    Not Helpful
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog
        open={isFeedbackDialogOpen}
        onOpenChange={setIsFeedbackDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Help us improve our AI teaching insights by sharing your feedback.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What could be improved about this insight?"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsFeedbackDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  selectedInsight && handleRateInsight(selectedInsight.id, 0)
                }
                disabled={isRating}
              >
                {isRating ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
