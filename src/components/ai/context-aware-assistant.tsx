'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle,
  Zap,
  MessageSquare,
  Settings,
  X,
  Star,
  ArrowRight,
  RotateCcw,
  Eye,
  Activity,
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import {
  useGetAdaptiveContentMutation,
  useAdjustContentDifficultyMutation,
  useGetContentRecommendationsQuery,
  useGetLearningStyleProfileQuery,
  useAdaptTutoringStrategyMutation,
} from '@/lib/redux/api/intelligent-tutoring-api';
import { useAuth } from '@/hooks/use-auth';

interface ContextAwareAssistantProps {
  currentContext: {
    courseId?: string;
    lessonId?: string;
    assessmentId?: string;
    currentTopic?: string;
    difficulty?: number;
    timeSpent?: number;
    performanceScore?: number;
    strugglingConcepts?: string[];
    completedConcepts?: string[];
  };
  learningObjectives?: string[];
  isVisible?: boolean;
  onToggleVisibility?: () => void;
  onContentSelect?: (content: any) => void;
  className?: string;
}

interface AdaptiveContent {
  id: string;
  type: 'explanation' | 'example' | 'practice' | 'hint' | 'review';
  title: string;
  content: string;
  difficulty: number;
  estimatedTime: number;
  prerequisites: string[];
  objectives: string[];
  adaptationReason: string;
  effectiveness: number;
}

interface LearningHint {
  id: string;
  type: 'conceptual' | 'procedural' | 'strategic';
  content: string;
  difficulty: number;
  effectiveness: number;
  timing: 'immediate' | 'delayed' | 'on_request';
}

export function ContextAwareAssistant({
  currentContext,
  learningObjectives = [],
  isVisible = true,
  onToggleVisibility,
  onContentSelect,
  className = '',
}: ContextAwareAssistantProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // State management
  const [assistantMode, setAssistantMode] = useState<
    'adaptive' | 'guided' | 'minimal'
  >('adaptive');
  const [activeTab, setActiveTab] = useState<
    'suggestions' | 'hints' | 'optimization' | 'insights'
  >('suggestions');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adaptiveContent, setAdaptiveContent] = useState<AdaptiveContent[]>([]);
  const [currentHints, setCurrentHints] = useState<LearningHint[]>([]);

  // Assistant settings
  const [assistantSettings, setAssistantSettings] = useState({
    autoAdapt: true,
    showHints: true,
    proactiveAssistance: true,
    difficultyAdjustment: true,
    contextTracking: true,
    learningOptimization: true,
    interventionThreshold: 0.7,
    adaptationFrequency: 'high' as 'low' | 'medium' | 'high',
  });

  // API hooks
  const [getAdaptiveContent] = useGetAdaptiveContentMutation();
  const [adjustContentDifficulty] = useAdjustContentDifficultyMutation();
  const [adaptTutoringStrategy] = useAdaptTutoringStrategyMutation();

  const { data: contentRecommendations, refetch: refetchRecommendations } =
    useGetContentRecommendationsQuery({
      type: 'contextual',
      limit: 5,
    });

  const { data: learningProfile } = useGetLearningStyleProfileQuery();

  // Context analysis and adaptation
  useEffect(() => {
    if (assistantSettings.autoAdapt && currentContext) {
      analyzeContextAndAdapt();
    }
  }, [currentContext, assistantSettings.autoAdapt]);

  // Generate contextual hints
  useEffect(() => {
    if (
      assistantSettings.showHints &&
      currentContext.strugglingConcepts?.length
    ) {
      generateContextualHints();
    }
  }, [currentContext.strugglingConcepts, assistantSettings.showHints]);

  const analyzeContextAndAdapt = async () => {
    try {
      // Analyze current performance and context
      const needsAdaptation = assessNeedForAdaptation();

      if (needsAdaptation) {
        // Get adaptive content based on current context
        const adaptedContent = await getAdaptiveContent({
          currentTopic: currentContext.currentTopic || '',
          studentLevel: currentContext.difficulty || 1,
          learningStyle: learningProfile?.visualLearner ? 'visual' : 'text',
          performance: {
            score: currentContext.performanceScore || 0,
            timeSpent: currentContext.timeSpent || 0,
            strugglingConcepts: currentContext.strugglingConcepts || [],
          },
        }).unwrap();

        setAdaptiveContent(adaptedContent.content || []);

        // Adapt tutoring strategy if needed
        if (assistantSettings.learningOptimization) {
          await adaptTutoringStrategy({
            performance: {
              currentScore: currentContext.performanceScore || 0,
              strugglingAreas: currentContext.strugglingConcepts || [],
              strongAreas: currentContext.completedConcepts || [],
            },
            learningPatterns: {
              preferredDifficulty: currentContext.difficulty || 1,
              timeSpent: currentContext.timeSpent || 0,
              engagementLevel: calculateEngagementLevel(),
            },
            preferences: {
              learningStyle: learningProfile?.visualLearner ? 'visual' : 'text',
              pace: learningProfile?.preferredPace || 'medium',
            },
          }).unwrap();
        }
      }
    } catch (error) {
      console.error('Failed to analyze context and adapt:', error);
    }
  };

  const assessNeedForAdaptation = (): boolean => {
    const {
      performanceScore = 0,
      timeSpent = 0,
      strugglingConcepts = [],
    } = currentContext;

    // Check if student is struggling
    if (performanceScore < assistantSettings.interventionThreshold) return true;

    // Check if student is spending too much time
    if (timeSpent > 30 && performanceScore < 0.7) return true;

    // Check if there are struggling concepts
    if (strugglingConcepts.length > 2) return true;

    return false;
  };

  const calculateEngagementLevel = (): number => {
    const { timeSpent = 0, performanceScore = 0 } = currentContext;

    // Simple engagement calculation based on time and performance
    const timeScore = Math.min(timeSpent / 20, 1); // Normalize to 20 minutes
    const performanceScore_ = performanceScore || 0;

    return (timeScore + performanceScore_) / 2;
  };

  const generateContextualHints = () => {
    const { strugglingConcepts = [], currentTopic } = currentContext;

    const hints: LearningHint[] = strugglingConcepts.map((concept, index) => ({
      id: `hint-${index}`,
      type:
        index % 3 === 0
          ? 'conceptual'
          : index % 3 === 1
            ? 'procedural'
            : 'strategic',
      content: `Try breaking down "${concept}" into smaller parts. Focus on understanding the core principle first.`,
      difficulty: currentContext.difficulty || 1,
      effectiveness: 0.8,
      timing: 'immediate',
    }));

    setCurrentHints(hints);
  };

  const handleDifficultyAdjustment = async (
    direction: 'increase' | 'decrease'
  ) => {
    if (!currentContext.currentTopic) return;

    try {
      const currentDifficulty = currentContext.difficulty || 1;
      const targetDifficulty =
        direction === 'increase'
          ? Math.min(currentDifficulty + 0.5, 3)
          : Math.max(currentDifficulty - 0.5, 1);

      await adjustContentDifficulty({
        contentId: currentContext.lessonId || '',
        currentDifficulty,
        targetDifficulty,
        performance: {
          score: currentContext.performanceScore || 0,
          timeSpent: currentContext.timeSpent || 0,
        },
      }).unwrap();

      toast({
        title: 'Difficulty Adjusted',
        description: `Content difficulty has been ${direction}d to better match your current level.`,
      });
    } catch (error) {
      console.error('Failed to adjust difficulty:', error);
      toast({
        title: 'Adjustment Failed',
        description: 'Unable to adjust content difficulty. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const renderSuggestions = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Smart Suggestions</h4>
        <Badge variant="outline">
          {contentRecommendations?.length || 0} available
        </Badge>
      </div>

      {contentRecommendations?.map(recommendation => (
        <motion.div
          key={recommendation.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border p-3 transition-colors hover:bg-muted/50"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <div className="rounded bg-blue-100 p-1 dark:bg-blue-900">
                  {recommendation.type === 'next_lesson' && (
                    <BookOpen className="h-3 w-3 text-blue-600" />
                  )}
                  {recommendation.type === 'review_content' && (
                    <RotateCcw className="h-3 w-3 text-orange-600" />
                  )}
                  {recommendation.type === 'practice_exercise' && (
                    <Target className="h-3 w-3 text-green-600" />
                  )}
                  {recommendation.type === 'supplementary_material' && (
                    <Star className="h-3 w-3 text-purple-600" />
                  )}
                  {recommendation.type === 'assessment' && (
                    <CheckCircle className="h-3 w-3 text-indigo-600" />
                  )}
                </div>
                <h5 className="text-sm font-medium">
                  {recommendation.content.title}
                </h5>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(recommendation.confidence * 100)}%
                </Badge>
              </div>

              <p className="mb-2 text-xs text-muted-foreground">
                {recommendation.content.description}
              </p>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⏱️ {recommendation.content.estimatedTime}min</span>
                <span>📊 Level {recommendation.content.difficulty}</span>
                <span className="capitalize">
                  🎯 {recommendation.type.replace('_', ' ')}
                </span>
              </div>

              <p className="mt-2 rounded bg-muted p-2 text-xs italic">
                💡 {recommendation.reasoning}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => onContentSelect?.(recommendation.content)}
              className="ml-2"
            >
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      ))}

      {adaptiveContent.length > 0 && (
        <div className="space-y-3">
          <Separator />
          <h5 className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-4 w-4 text-yellow-500" />
            Adaptive Content
          </h5>

          {adaptiveContent.map(content => (
            <motion.div
              key={content.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/10"
            >
              <div className="mb-2 flex items-center justify-between">
                <h6 className="text-sm font-medium">{content.title}</h6>
                <Badge variant="outline" className="text-xs">
                  Adapted
                </Badge>
              </div>

              <p className="mb-2 text-xs text-muted-foreground">
                {content.adaptationReason}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-2 text-xs">
                  <span>⏱️ {content.estimatedTime}min</span>
                  <span>📊 Level {content.difficulty}</span>
                  <span>
                    ✨ {Math.round(content.effectiveness * 100)}% effective
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="default"
                  onClick={() => onContentSelect?.(content)}
                >
                  Start
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderHints = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Learning Hints</h4>
        <Badge variant="outline">{currentHints.length} available</Badge>
      </div>

      {currentHints.length === 0 ? (
        <div className="py-6 text-center text-muted-foreground">
          <Lightbulb className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">No hints needed right now!</p>
          <p className="text-xs">You're doing great. Keep up the good work!</p>
        </div>
      ) : (
        currentHints.map(hint => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-3 dark:from-blue-900/20 dark:to-indigo-900/20"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-blue-100 p-1 dark:bg-blue-800">
                <Lightbulb className="h-3 w-3 text-blue-600" />
              </div>

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {hint.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(hint.effectiveness * 100)}% helpful
                  </Badge>
                </div>

                <p className="text-sm">{hint.content}</p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Difficulty: Level {hint.difficulty}
                  </span>

                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      👍 Helpful
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 text-xs">
                      👎 Not helpful
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderOptimization = () => (
    <div className="space-y-4">
      <h4 className="font-medium">Learning Optimization</h4>

      {/* Difficulty Adjustment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Difficulty Level</span>
          <Badge variant="outline">
            Level {currentContext.difficulty || 1}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDifficultyAdjustment('decrease')}
            disabled={
              !assistantSettings.difficultyAdjustment ||
              (currentContext.difficulty || 1) <= 1
            }
          >
            Make Easier
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDifficultyAdjustment('increase')}
            disabled={
              !assistantSettings.difficultyAdjustment ||
              (currentContext.difficulty || 1) >= 3
            }
          >
            Make Harder
          </Button>
        </div>
      </div>

      <Separator />

      {/* Performance Metrics */}
      <div className="space-y-3">
        <h5 className="text-sm font-medium">Current Performance</h5>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Score</span>
            <span>
              {Math.round((currentContext.performanceScore || 0) * 100)}%
            </span>
          </div>
          <Progress
            value={(currentContext.performanceScore || 0) * 100}
            className="h-2"
          />

          <div className="flex items-center justify-between text-sm">
            <span>Time Efficiency</span>
            <span
              className={cn(
                (currentContext.timeSpent || 0) > 30
                  ? 'text-orange-600'
                  : 'text-green-600'
              )}
            >
              {currentContext.timeSpent || 0} min
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span>Struggling Concepts</span>
            <Badge
              variant={
                (currentContext.strugglingConcepts?.length || 0) > 2
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {currentContext.strugglingConcepts?.length || 0}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Learning Style Adaptation */}
      {learningProfile && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium">Learning Style</h5>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-muted p-2 text-center">
              <div className="font-medium">Visual</div>
              <div>{Math.round(learningProfile.visualLearner * 100)}%</div>
            </div>
            <div className="rounded bg-muted p-2 text-center">
              <div className="font-medium">Auditory</div>
              <div>{Math.round(learningProfile.auditoryLearner * 100)}%</div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Preferred pace:{' '}
            <span className="capitalize">{learningProfile.preferredPace}</span>
          </p>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      <h4 className="font-medium">Learning Insights</h4>

      <div className="space-y-3">
        {/* Engagement Analysis */}
        <div className="rounded-lg border p-3">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Engagement Level</span>
          </div>

          <div className="space-y-2">
            <Progress
              value={calculateEngagementLevel() * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground">
              {calculateEngagementLevel() > 0.7
                ? "Excellent engagement! You're actively learning."
                : calculateEngagementLevel() > 0.4
                  ? 'Good engagement. Consider taking a short break if needed.'
                  : 'Low engagement detected. Try switching to a different learning style.'}
            </p>
          </div>
        </div>

        {/* Progress Analysis */}
        <div className="rounded-lg border p-3">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Progress Trends</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Completed Concepts</span>
              <span className="font-medium">
                {currentContext.completedConcepts?.length || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Learning Velocity</span>
              <span className="font-medium">
                {currentContext.timeSpent
                  ? Math.round(
                      (currentContext.completedConcepts?.length || 0) /
                        (currentContext.timeSpent / 60)
                    )
                  : 0}{' '}
                concepts/hour
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="rounded-lg border p-3">
          <div className="mb-2 flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">AI Recommendations</span>
          </div>

          <ul className="space-y-1 text-xs">
            {(currentContext.performanceScore || 0) < 0.6 && (
              <li className="flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>
                  Consider reviewing fundamental concepts before proceeding
                </span>
              </li>
            )}
            {(currentContext.timeSpent || 0) > 45 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Take a 10-15 minute break to improve focus</span>
              </li>
            )}
            {(currentContext.strugglingConcepts?.length || 0) > 2 && (
              <li className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>
                  Request help from an instructor for struggling concepts
                </span>
              </li>
            )}
            {(currentContext.performanceScore || 0) > 0.8 && (
              <li className="flex items-start gap-2">
                <span className="text-green-500">•</span>
                <span>
                  Great progress! Consider advancing to more challenging content
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleVisibility}
        className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full p-0 shadow-lg"
      >
        <Brain className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn('fixed right-4 top-20 z-30 w-80', className)}
    >
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <div>
                <CardTitle className="text-sm">Learning Assistant</CardTitle>
                <CardDescription className="text-xs">
                  Context-aware AI guidance
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assistant Settings</DialogTitle>
                    <DialogDescription>
                      Customize your learning assistant experience
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Auto-adaptation</Label>
                      <Switch
                        checked={assistantSettings.autoAdapt}
                        onCheckedChange={checked =>
                          setAssistantSettings(prev => ({
                            ...prev,
                            autoAdapt: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Show hints</Label>
                      <Switch
                        checked={assistantSettings.showHints}
                        onCheckedChange={checked =>
                          setAssistantSettings(prev => ({
                            ...prev,
                            showHints: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Proactive assistance</Label>
                      <Switch
                        checked={assistantSettings.proactiveAssistance}
                        onCheckedChange={checked =>
                          setAssistantSettings(prev => ({
                            ...prev,
                            proactiveAssistance: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Difficulty adjustment</Label>
                      <Switch
                        checked={assistantSettings.difficultyAdjustment}
                        onCheckedChange={checked =>
                          setAssistantSettings(prev => ({
                            ...prev,
                            difficultyAdjustment: checked,
                          }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Context tracking</Label>
                      <Switch
                        checked={assistantSettings.contextTracking}
                        onCheckedChange={checked =>
                          setAssistantSettings(prev => ({
                            ...prev,
                            contextTracking: checked,
                          }))
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {onToggleVisibility && (
                <Button variant="ghost" size="sm" onClick={onToggleVisibility}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Context Status */}
          {currentContext.currentTopic && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>Topic: {currentContext.currentTopic}</span>
              {currentContext.performanceScore && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(currentContext.performanceScore * 100)}%
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {/* Tab Navigation */}
          <div className="flex border-b">
            {[
              { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
              { id: 'hints', label: 'Hints', icon: MessageSquare },
              { id: 'optimization', label: 'Optimize', icon: TrendingUp },
              { id: 'insights', label: 'Insights', icon: Eye },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1 p-2 text-xs transition-colors',
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-900/20'
                    : 'hover:bg-muted/50'
                )}
              >
                <tab.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-96 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'suggestions' && renderSuggestions()}
                {activeTab === 'hints' && renderHints()}
                {activeTab === 'optimization' && renderOptimization()}
                {activeTab === 'insights' && renderInsights()}
              </motion.div>
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
