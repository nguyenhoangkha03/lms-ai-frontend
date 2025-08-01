'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle2,
  Circle,
  Lock,
  Play,
  SkipForward,
  RotateCcw,
  Target,
  TrendingUp,
  Clock,
  Award,
  BookOpen,
  FileText,
  Video,
  Users,
  Lightbulb,
  Zap,
  Settings,
  BarChart3,
  Star,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Eye,
  Calendar,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useGetCurrentLearningPathQuery,
  useAdaptLearningPathMutation,
  useGenerateLearningPathMutation,
} from '@/lib/redux/api/ai-recommendation-api';
import { LearningPathStep, AIAdaptation } from '@/lib/types/ai-recommendation';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const stepTypeIcons = {
  lesson: BookOpen,
  assessment: FileText,
  practice: Target,
  project: Users,
  review: RotateCcw,
  milestone: Award,
};

const stepTypeColors = {
  lesson: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  assessment: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  practice: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  project: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  review: 'text-teal-600 bg-teal-100 dark:bg-teal-900/20',
  milestone: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
};

const statusColors = {
  locked: 'text-gray-400 bg-gray-100 dark:bg-gray-800',
  available: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  in_progress: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
  completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  skipped: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
};

const difficultyColors = {
  beginner: 'text-green-600 bg-green-100',
  intermediate: 'text-yellow-600 bg-yellow-100',
  advanced: 'text-red-600 bg-red-100',
};

interface AdaptiveLearningPathProps {
  className?: string;
  pathId?: string;
  showDetails?: boolean;
  showAdaptations?: boolean;
}

export const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
  className,
  pathId,
  showDetails = true,
  showAdaptations = true,
}) => {
  const router = useRouter();
  const { toast } = useToast();

  // Local state
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showAdaptationHistory, setShowAdaptationHistory] = useState(false);
  const [selectedStep, setSelectedStep] = useState<LearningPathStep | null>(
    null
  );

  // API hooks
  const {
    data: learningPath,
    isLoading,
    isError,
    refetch,
  } = useGetCurrentLearningPathQuery();

  const [adaptPath] = useAdaptLearningPathMutation();
  const [generatePath] = useGenerateLearningPathMutation();

  // Toggle step expansion
  const toggleStepExpansion = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  // Handle step click
  const handleStepClick = (step: LearningPathStep) => {
    if (step.status === 'locked') {
      toast({
        title: 'Step Locked',
        description: 'Complete previous steps to unlock this one.',
        variant: 'destructive',
      });
      return;
    }

    // Navigate based on step type
    switch (step.type) {
      case 'lesson':
        if (step.resources.length > 0) {
          const lessonResource = step.resources.find(
            r => r.type === 'video' || r.type === 'interactive'
          );
          if (lessonResource) {
            router.push(lessonResource.url);
          }
        }
        break;
      case 'assessment':
        if (step.assessment) {
          router.push(`/student/assessments/${step.id}/take`);
        }
        break;
      case 'practice':
        router.push(`/student/practice/${step.id}`);
        break;
      case 'project':
        router.push(`/student/projects/${step.id}`);
        break;
      default:
        router.push(`/student/learning-path/step/${step.id}`);
    }
  };

  // Handle path adaptation
  const handleAdaptPath = async () => {
    if (!learningPath) return;

    try {
      await adaptPath({
        pathId: learningPath.id,
        performance: {
          // This would come from actual performance data
          averageScore: 0.85,
          completionRate: 0.9,
          timeSpent: 120,
          strugglingAreas: ['advanced_concepts'],
        },
        preferences: {
          preferredDifficulty: 'adaptive',
          learningStyle: 'visual',
        },
      });

      toast({
        title: 'Learning Path Adapted',
        description: 'Your path has been optimized based on your progress.',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Adaptation Failed',
        description: 'Unable to adapt your learning path. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get step status icon
  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Play className="h-5 w-5 text-orange-600" />;
      case 'locked':
        return <Lock className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-blue-600" />;
    }
  };

  // Get learning style preferences
  const getLearningStyleDisplay = (learningStyle: any) => {
    const styles = [];
    if (learningStyle.visualPreference > 0.7) styles.push('Visual');
    if (learningStyle.auditoryPreference > 0.7) styles.push('Auditory');
    if (learningStyle.kinestheticPreference > 0.7) styles.push('Kinesthetic');
    if (learningStyle.readingPreference > 0.7) styles.push('Reading');
    return styles.length > 0 ? styles.join(', ') : 'Adaptive';
  };

  // Render step details
  const renderStepDetails = (step: LearningPathStep) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 space-y-4 border-t pt-4"
    >
      {/* Learning objectives */}
      {step.learningObjectives.length > 0 && (
        <div>
          <h5 className="mb-2 text-sm font-medium text-muted-foreground">
            Learning Objectives:
          </h5>
          <ul className="space-y-1">
            {step.learningObjectives.map((objective, index) => (
              <li key={index} className="flex items-start space-x-2">
                <Target className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                <span className="text-sm text-foreground">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Prerequisites */}
      {step.prerequisites.length > 0 && (
        <div>
          <h5 className="mb-2 text-sm font-medium text-muted-foreground">
            Prerequisites:
          </h5>
          <div className="flex flex-wrap gap-2">
            {step.prerequisites.map((prereq, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {prereq}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Resources */}
      {step.resources.length > 0 && (
        <div>
          <h5 className="mb-2 text-sm font-medium text-muted-foreground">
            Resources:
          </h5>
          <div className="space-y-2">
            {step.resources.map(resource => {
              const ResourceIcon =
                resource.type === 'video'
                  ? Video
                  : resource.type === 'article'
                    ? FileText
                    : resource.type === 'interactive'
                      ? Zap
                      : BookOpen;

              return (
                <div
                  key={resource.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  <div className="flex items-center space-x-3">
                    <ResourceIcon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      {resource.description && (
                        <p className="text-xs text-muted-foreground">
                          {resource.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {resource.duration && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {resource.duration}m
                      </Badge>
                    )}
                    {resource.isRequired && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assessment info */}
      {step.assessment && (
        <div className="rounded-lg bg-muted/50 p-4">
          <h5 className="mb-2 text-sm font-medium text-muted-foreground">
            Assessment Details:
          </h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Type:</span>
              <Badge variant="outline">{step.assessment.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Passing Score:</span>
              <span className="text-sm font-medium">
                {step.assessment.passingScore}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Max Attempts:</span>
              <span className="text-sm font-medium">
                {step.assessment.maxAttempts}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      {step.aiRecommendations.length > 0 && (
        <div className="to-purple/5 rounded-lg bg-gradient-to-r from-primary/5 p-4">
          <div className="mb-2 flex items-center space-x-2">
            <Brain className="h-4 w-4 text-primary" />
            <h5 className="text-sm font-medium text-primary">
              AI Recommendations:
            </h5>
          </div>
          <ul className="space-y-1">
            {step.aiRecommendations.map((rec, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                • {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Completion info */}
      {step.completedAt && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                Completed
              </span>
            </div>
            <span className="text-sm text-green-600">
              {new Date(step.completedAt).toLocaleDateString()}
            </span>
          </div>
          {step.score && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-sm">
                <span>Score:</span>
                <span className="font-medium">{step.score}%</span>
              </div>
              <Progress value={step.score} className="mt-1 h-2" />
            </div>
          )}
          {step.feedback && (
            <div className="mt-2">
              <p className="text-sm text-green-700">{step.feedback}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );

  // Render adaptation item
  const renderAdaptation = (adaptation: AIAdaptation) => (
    <div key={adaptation.id} className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-orange-600" />
          <span className="text-sm font-medium text-orange-600">
            {adaptation.adaptationType
              .replace('_', ' ')
              .replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(adaptation.timestamp).toLocaleString()}
        </span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{adaptation.reason}</p>
      <div className="space-y-2">
        <div className="rounded bg-red-50 p-2 dark:bg-red-900/20">
          <p className="mb-1 text-xs font-medium text-red-600">Before:</p>
          <p className="text-xs text-red-700">
            {JSON.stringify(adaptation.beforeState, null, 2)}
          </p>
        </div>
        <div className="rounded bg-green-50 p-2 dark:bg-green-900/20">
          <p className="mb-1 text-xs font-medium text-green-600">After:</p>
          <p className="text-xs text-green-700">
            {JSON.stringify(adaptation.afterState, null, 2)}
          </p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Badge variant="outline" className="text-xs">
          Confidence: {Math.round(adaptation.confidence * 100)}%
        </Badge>
        {adaptation.effectiveness && (
          <Badge variant="outline" className="text-xs">
            Effectiveness: {Math.round(adaptation.effectiveness * 100)}%
          </Badge>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 animate-pulse text-primary" />
            </div>
            <div>
              <CardTitle>Adaptive Learning Path</CardTitle>
              <CardDescription>
                Loading your personalized learning journey...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex animate-pulse items-center space-x-4"
              >
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !learningPath) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                <Brain className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <CardTitle>Adaptive Learning Path</CardTitle>
                <CardDescription>
                  Failed to load your learning path
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="mb-4 text-muted-foreground">
              We couldn't load your learning path. You can create a new one
              based on your goals.
            </p>
            <Button
              onClick={() => {
                // Generate new learning path
                generatePath({
                  goals: ['Complete current course', 'Improve skills'],
                  preferences: { learningStyle: 'adaptive' },
                });
              }}
            >
              <Brain className="mr-2 h-4 w-4" />
              Generate New Path
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStep = learningPath.steps.find(
    s => s.order === learningPath.progress.currentStep
  );
  const nextStep = learningPath.steps.find(
    s => s.order === learningPath.progress.currentStep + 1
  );

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{learningPath.title}</CardTitle>
                <CardDescription>{learningPath.description}</CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={cn(difficultyColors[learningPath.difficulty])}
              >
                {learningPath.difficulty}
              </Badge>
              <Badge
                variant={
                  learningPath.status === 'active' ? 'default' : 'secondary'
                }
              >
                {learningPath.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Overview */}
          <div className="to-purple/10 rounded-lg bg-gradient-to-r from-primary/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Learning Progress</h3>
              <Button variant="outline" size="sm" onClick={handleAdaptPath}>
                <Zap className="mr-2 h-4 w-4" />
                Adapt Path
              </Button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {learningPath.progress.percentageComplete}%
                </div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {learningPath.progress.completedSteps}
                </div>
                <div className="text-sm text-muted-foreground">Steps Done</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {learningPath.progress.totalSteps -
                    learningPath.progress.completedSteps}
                </div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    learningPath.progress.estimatedTimeRemaining / 60
                  )}
                  h
                </div>
                <div className="text-sm text-muted-foreground">Est. Time</div>
              </div>
            </div>

            <Progress
              value={learningPath.progress.percentageComplete}
              className="mb-4 h-3"
            />

            {/* Current & Next Steps */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentStep && (
                <div className="rounded-lg border bg-background p-4">
                  <div className="mb-2 flex items-center space-x-2">
                    <Play className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-600">
                      Current Step
                    </span>
                  </div>
                  <h4 className="font-medium">{currentStep.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentStep.description}
                  </p>
                  <Button
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => handleStepClick(currentStep)}
                  >
                    Continue Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {nextStep && (
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="mb-2 flex items-center space-x-2">
                    <SkipForward className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Next Step
                    </span>
                  </div>
                  <h4 className="font-medium">{nextStep.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {nextStep.description}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      ~{nextStep.estimatedDuration} minutes
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Learning Analytics */}
          {showDetails && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Performance */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Performance</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Overall Score
                    </span>
                    <span className="font-medium">
                      {Math.round(learningPath.performance.overallScore * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Consistency
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        learningPath.performance.consistencyScore * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Engagement
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        learningPath.performance.engagementScore * 100
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Learning Style */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Learning Style</h4>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Preference: </span>
                    <span className="font-medium">
                      {getLearningStyleDisplay(learningPath.learningStyle)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Pace: </span>
                    <span className="font-medium">
                      {learningPath.learningStyle.pace}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Best Time: </span>
                    <span className="font-medium">
                      {learningPath.learningStyle.preferredTimeOfDay}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      Session Length:{' '}
                    </span>
                    <span className="font-medium">
                      {learningPath.learningStyle.sessionDuration}min
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Recommendation */}
              <div className="to-purple/5 rounded-lg border bg-gradient-to-br from-primary/5 p-4">
                <div className="mb-3 flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-primary">
                    AI Recommendation
                  </h4>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  {learningPath.nextRecommendation.reason}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    Confidence:{' '}
                    {Math.round(
                      learningPath.nextRecommendation.confidence * 100
                    )}
                    %
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Difficulty:{' '}
                    {learningPath.nextRecommendation.estimatedDifficulty.toFixed(
                      1
                    )}
                    /5
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Learning Path Steps */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Learning Steps</h3>
              <div className="text-sm text-muted-foreground">
                {learningPath.progress.completedSteps} of{' '}
                {learningPath.progress.totalSteps} completed
              </div>
            </div>

            <div className="space-y-3">
              {learningPath.steps
                .sort((a, b) => a.order - b.order)
                .map((step, index) => {
                  const StepIcon = stepTypeIcons[step.type] || BookOpen;
                  const isExpanded = expandedSteps.has(step.id);
                  const isLast = index === learningPath.steps.length - 1;

                  return (
                    <div key={step.id} className="relative">
                      {/* Connection line */}
                      {!isLast && (
                        <div className="absolute left-5 top-12 h-8 w-0.5 bg-border" />
                      )}

                      <div
                        className={cn(
                          'group relative rounded-lg border transition-all duration-200',
                          'hover:border-primary/30 hover:shadow-md',
                          step.status === 'completed' &&
                            'border-green-200 bg-green-50 dark:bg-green-900/10',
                          step.status === 'in_progress' &&
                            'border-orange-200 bg-orange-50 dark:bg-orange-900/10',
                          step.status === 'locked' &&
                            'border-gray-200 bg-gray-50 opacity-60 dark:bg-gray-900/10'
                        )}
                      >
                        <div
                          className="cursor-pointer p-4"
                          onClick={() =>
                            step.status !== 'locked' && handleStepClick(step)
                          }
                        >
                          <div className="flex items-start space-x-4">
                            {/* Step status icon */}
                            <div className="relative flex-shrink-0">
                              {getStepStatusIcon(step.status)}
                              <div className="absolute -bottom-1 -right-1">
                                <div
                                  className={cn(
                                    'rounded-full p-1',
                                    stepTypeColors[step.type] ||
                                      'bg-gray-100 text-gray-600'
                                  )}
                                >
                                  <StepIcon className="h-2 w-2" />
                                </div>
                              </div>
                            </div>

                            {/* Step content */}
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <h4
                                    className={cn(
                                      'font-medium transition-colors',
                                      step.status !== 'locked' &&
                                        'group-hover:text-primary'
                                    )}
                                  >
                                    {step.order}. {step.title}
                                  </h4>
                                  <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {step.description}
                                  </p>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                  onClick={e => {
                                    e.stopPropagation();
                                    toggleStepExpansion(step.id);
                                  }}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-3 w-3" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>

                              {/* Step metadata */}
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    statusColors[step.status]
                                  )}
                                >
                                  {step.status.replace('_', ' ')}
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    stepTypeColors[step.type]
                                  )}
                                >
                                  {step.type}
                                </Badge>

                                <Badge variant="outline" className="text-xs">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {step.estimatedDuration}min
                                </Badge>

                                <Badge variant="outline" className="text-xs">
                                  Difficulty: {step.difficulty}/5
                                </Badge>

                                {step.score && (
                                  <Badge variant="outline" className="text-xs">
                                    <Star className="mr-1 h-3 w-3" />
                                    {step.score}%
                                  </Badge>
                                )}
                              </div>

                              {/* Step actions */}
                              {step.status !== 'locked' && (
                                <div className="mt-3 flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant={
                                      step.status === 'completed'
                                        ? 'outline'
                                        : 'default'
                                    }
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleStepClick(step);
                                    }}
                                  >
                                    {step.status === 'completed'
                                      ? 'Review'
                                      : step.status === 'in_progress'
                                        ? 'Continue'
                                        : 'Start'}
                                    <ArrowRight className="ml-2 h-3 w-3" />
                                  </Button>

                                  {step.resources.length > 0 && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={e => {
                                            e.stopPropagation();
                                            toggleStepExpansion(step.id);
                                          }}
                                        >
                                          <BookOpen className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        View Resources
                                      </TooltipContent>
                                    </Tooltip>
                                  )}

                                  {step.assessment && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={e => {
                                            e.stopPropagation();
                                            // Navigate to assessment
                                          }}
                                        >
                                          <FileText className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Take Assessment
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && renderStepDetails(step)}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Strengths and Improvements */}
          {showDetails && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Strength Areas */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium text-green-600">Strength Areas</h4>
                </div>
                {learningPath.performance.strengthAreas.length > 0 ? (
                  <div className="space-y-2">
                    {learningPath.performance.strengthAreas.map(
                      (area, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{area}</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Keep learning to identify your strengths!
                  </p>
                )}
              </div>

              {/* Improvement Areas */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <h4 className="font-medium text-orange-600">
                    Areas for Improvement
                  </h4>
                </div>
                {learningPath.performance.improvementAreas.length > 0 ? (
                  <div className="space-y-2">
                    {learningPath.performance.improvementAreas.map(
                      (area, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Target className="h-3 w-3 text-orange-600" />
                          <span className="text-sm">{area}</span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You're doing great! No major areas for improvement
                    identified.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* AI Adaptations History */}
          {showAdaptations && learningPath.aiAdaptations.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">AI Adaptations</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setShowAdaptationHistory(!showAdaptationHistory)
                  }
                >
                  {showAdaptationHistory ? 'Hide' : 'Show'} History
                  <ChevronDown
                    className={cn(
                      'ml-2 h-4 w-4 transition-transform',
                      showAdaptationHistory && 'rotate-180'
                    )}
                  />
                </Button>
              </div>

              <AnimatePresence>
                {showAdaptationHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {learningPath.aiAdaptations
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .slice(0, 5)
                      .map(renderAdaptation)}

                    {learningPath.aiAdaptations.length > 5 && (
                      <div className="text-center">
                        <Button variant="outline" size="sm">
                          View All Adaptations
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Path Actions */}
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Export learning path
                const dataStr = JSON.stringify(learningPath, null, 2);
                const dataUri =
                  'data:application/json;charset=utf-8,' +
                  encodeURIComponent(dataStr);
                const exportFileDefaultName = `learning-path-${learningPath.id}.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Export Path
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                // Share learning path
                if (navigator.share) {
                  navigator.share({
                    title: learningPath.title,
                    text: learningPath.description,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: 'Link Copied',
                    description: 'Learning path link copied to clipboard',
                  });
                }
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Share Path
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setSelectedStep(null);
                // Open settings dialog
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              Path Settings
            </Button>

            <div className="flex-1" />

            <Button onClick={handleAdaptPath}>
              <Zap className="mr-2 h-4 w-4" />
              Optimize Path
            </Button>
          </div>

          {/* Path Statistics */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <div className="text-lg font-bold text-primary">
                  {learningPath.estimatedDuration}h
                </div>
                <div className="text-xs text-muted-foreground">
                  Total Duration
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {learningPath.aiAdaptations.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  AI Adaptations
                </div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {learningPath.steps.filter(s => s.type === 'lesson').length}
                </div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  {
                    learningPath.steps.filter(s => s.type === 'assessment')
                      .length
                  }
                </div>
                <div className="text-xs text-muted-foreground">Assessments</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Detail Dialog */}
      <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedStep && (
                <>
                  {React.createElement(
                    stepTypeIcons[selectedStep.type] || BookOpen,
                    {
                      className: 'h-5 w-5',
                    }
                  )}
                  <span>{selectedStep.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>{selectedStep?.description}</DialogDescription>
          </DialogHeader>

          {selectedStep && (
            <div className="space-y-4">
              {renderStepDetails(selectedStep)}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedStep(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleStepClick(selectedStep);
                    setSelectedStep(null);
                  }}
                >
                  Start Step
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
