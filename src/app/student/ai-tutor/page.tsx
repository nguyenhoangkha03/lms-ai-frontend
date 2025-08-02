'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  MessageSquare,
  BookOpen,
  Target,
  TrendingUp,
  Settings,
  Play,
  BarChart3,
  Clock,
  Award,
  Lightbulb,
  Network,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Import AI Tutoring Components
import { AITutorInterface } from '@/components/ai/ai-tutor-interface';
import { KnowledgeGraphVisualization } from '@/components/ai/knowledge-graph-visualization';
import { ContextAwareAssistant } from '@/components/ai/context-aware-assistant';

import {
  useGetTutoringSessionsQuery,
  useCreateTutoringSessionMutation,
  useGetLearningStyleProfileQuery,
  useGetSessionAnalyticsQuery,
} from '@/lib/redux/api/intelligent-tutoring-api';
import { useAuth } from '@/hooks/use-auth';

export default function IntelligentTutoringPage() {
  const { user } = useAuth();

  // State management
  const [tutorMode, setTutorMode] = useState<
    'adaptive' | 'guided' | 'exploratory' | 'assessment'
  >('adaptive');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const [isTutorMinimized, setIsTutorMinimized] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [learningContext, setLearningContext] = useState({
    courseId: '',
    lessonId: '',
    currentTopic: '',
    difficulty: 2,
    timeSpent: 0,
    performanceScore: 0.75,
    strugglingConcepts: ['derivatives', 'integrals'],
    completedConcepts: ['functions', 'limits'],
  });

  // API hooks
  const {
    data: tutoringSessions,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useGetTutoringSessionsQuery({
    status: 'active',
    limit: 10,
  });

  const { data: learningProfile, isLoading: isLoadingProfile } =
    useGetLearningStyleProfileQuery();

  const { data: sessionAnalytics } = useGetSessionAnalyticsQuery(
    activeSession!,
    {
      skip: !activeSession,
    }
  );

  const [createTutoringSession] = useCreateTutoringSessionMutation();

  // Effects
  useEffect(() => {
    // Update time spent every minute
    const timer = setInterval(() => {
      setLearningContext(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
      }));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleStartNewSession = async () => {
    try {
      const session = await createTutoringSession({
        mode: tutorMode,
        topic: currentTopic,
        context: {
          currentCourse: learningContext.courseId,
          currentLesson: learningContext.lessonId,
          difficulty: learningContext.difficulty,
          learningObjectives: [
            'understand_concepts',
            'solve_problems',
            'apply_knowledge',
          ],
        },
      }).unwrap();

      setActiveSession(session.id);
      await refetchSessions();
    } catch (error) {
      console.error('Failed to start tutoring session:', error);
    }
  };

  const handleContentSelect = (content: any) => {
    // Handle content selection from assistant
    setLearningContext(prev => ({
      ...prev,
      currentTopic: content.title,
      difficulty: content.difficulty || prev.difficulty,
    }));
  };

  if (isLoadingSessions || isLoadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <div>
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
              <Brain className="h-8 w-8 text-blue-500" />
              AI Tutoring System
            </h1>
            <p className="text-muted-foreground">
              Intelligent, personalized learning assistance powered by advanced
              AI
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={tutorMode}
              onValueChange={(value: any) => setTutorMode(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adaptive">Adaptive</SelectItem>
                <SelectItem value="guided">Guided</SelectItem>
                <SelectItem value="exploratory">Exploratory</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
              </SelectContent>
            </Select>

            <Select value={currentTopic} onValueChange={setCurrentTopic}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select topic..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calculus">Calculus</SelectItem>
                <SelectItem value="algebra">Algebra</SelectItem>
                <SelectItem value="geometry">Geometry</SelectItem>
                <SelectItem value="statistics">Statistics</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleStartNewSession} className="gap-2">
              <Play className="h-4 w-4" />
              Start Session
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowAssistant(!showAssistant)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Assistant
            </Button>
          </div>
        </div>

        {/* Session Status */}
        {activeSession && sessionAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-blue-600">
                {Math.round(
                  sessionAnalytics.insights?.understandingLevel * 100
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">Understanding</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {Math.round(sessionAnalytics.insights?.engagementLevel * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">Engagement</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {sessionAnalytics.sessionMetrics?.conceptsExplained || 0}
              </div>
              <p className="text-xs text-muted-foreground">Concepts</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-orange-600">
                {Math.round(sessionAnalytics.sessionMetrics?.duration / 60) ||
                  0}
                min
              </div>
              <p className="text-xs text-muted-foreground">Duration</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs defaultValue="tutor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tutor" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              AI Tutor
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Knowledge Graph
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Sessions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* AI Tutor Tab */}
          <TabsContent value="tutor" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Main Tutor Interface */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-blue-500" />
                          AI Tutor Chat
                        </CardTitle>
                        <CardDescription>
                          Interactive learning with your personal AI tutor
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {tutorMode} Mode
                        </Badge>
                        {currentTopic && (
                          <Badge variant="secondary">{currentTopic}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="h-full p-0">
                    <div className="relative h-full">
                      {/* Embedded AI Tutor Interface */}
                      <div className="absolute inset-0 p-4">
                        <AITutorInterface
                          mode={tutorMode}
                          courseId={learningContext.courseId}
                          lessonId={learningContext.lessonId}
                          isMinimized={false}
                          showVoiceControls={true}
                          showSettings={true}
                          className="relative h-full w-full"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Learning Profile & Context */}
              <div className="space-y-6">
                {/* Learning Style Profile */}
                {learningProfile && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Learning Profile
                      </CardTitle>
                      <CardDescription>
                        Your personalized learning characteristics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Visual Learning</span>
                            <span>
                              {Math.round(learningProfile.visualLearner * 100)}%
                            </span>
                          </div>
                          <Progress
                            value={learningProfile.visualLearner * 100}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Auditory Learning</span>
                            <span>
                              {Math.round(
                                learningProfile.auditoryLearner * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={learningProfile.auditoryLearner * 100}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Kinesthetic Learning</span>
                            <span>
                              {Math.round(
                                learningProfile.kinestheticLearner * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={learningProfile.kinestheticLearner * 100}
                            className="h-2"
                          />
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span>Reading/Writing</span>
                            <span>
                              {Math.round(
                                learningProfile.readingWritingLearner * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={learningProfile.readingWritingLearner * 100}
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-sm font-medium">
                              Preferred Pace
                            </p>
                            <Badge variant="outline" className="capitalize">
                              {learningProfile.preferredPace}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              Attention Span
                            </p>
                            <Badge variant="outline">
                              {learningProfile.attentionSpan}min
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Context */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Learning Context</CardTitle>
                    <CardDescription>
                      Current session information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Time Spent</span>
                        <span>{learningContext.timeSpent} minutes</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Performance Score</span>
                        <span>
                          {Math.round(learningContext.performanceScore * 100)}%
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span>Difficulty Level</span>
                        <Badge variant="outline">
                          Level {learningContext.difficulty}
                        </Badge>
                      </div>
                    </div>

                    {learningContext.strugglingConcepts.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium">
                          Struggling With:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {learningContext.strugglingConcepts.map(
                            (concept, index) => (
                              <Badge
                                key={index}
                                variant="destructive"
                                className="text-xs"
                              >
                                {concept}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {learningContext.completedConcepts.length > 0 && (
                      <div>
                        <p className="mb-2 text-sm font-medium">Mastered:</p>
                        <div className="flex flex-wrap gap-1">
                          {learningContext.completedConcepts.map(
                            (concept, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {concept}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Knowledge Graph Tab */}
          <TabsContent value="knowledge" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <KnowledgeGraphVisualization
                  topic={currentTopic}
                  depth={3}
                  interactive={true}
                  showControls={true}
                  onNodeSelect={nodeId => {
                    setLearningContext(prev => ({
                      ...prev,
                      currentTopic: nodeId,
                    }));
                  }}
                  onPathFound={path => {
                    console.log('Learning path found:', path);
                  }}
                />
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Graph Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
                      <Network className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                      <p className="text-sm font-medium">
                        Interactive Knowledge Map
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click on nodes to explore concepts and their
                        relationships
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Concepts</span>
                        <span className="font-medium">42</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mastered</span>
                        <span className="font-medium text-green-600">18</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>In Progress</span>
                        <span className="font-medium text-yellow-600">12</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Not Started</span>
                        <span className="font-medium text-gray-600">12</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <Progress value={43} className="mb-2" />
                      <p className="text-center text-xs text-muted-foreground">
                        43% Overall Progress
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recommended Path</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Functions', 'Limits', 'Derivatives', 'Integrals'].map(
                        (concept, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className={`h-2 w-2 rounded-full ${
                                index < 2
                                  ? 'bg-green-500'
                                  : index === 2
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-300'
                              }`}
                            />
                            <span
                              className={
                                index < 2
                                  ? 'text-muted-foreground line-through'
                                  : ''
                              }
                            >
                              {concept}
                            </span>
                            {index === 2 && (
                              <Badge variant="outline" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tutoring Sessions</CardTitle>
                    <CardDescription>
                      Your learning sessions with the AI tutor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tutoringSessions?.map(session => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg border p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {session.mode}
                              </Badge>
                              <Badge
                                variant={
                                  session.status === 'active'
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {session.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(session.startedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {session.topic && (
                            <p className="mb-2 font-medium">{session.topic}</p>
                          )}

                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="text-center">
                              <p className="text-lg font-bold">
                                {Math.round(
                                  session.sessionMetrics.duration / 60
                                )}
                                min
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Duration
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">
                                {session.sessionMetrics.conceptsExplained}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Concepts
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">
                                {session.sessionMetrics.hintsProvided}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Hints
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold">
                                {Math.round(
                                  (session.insights.understandingLevel || 0) *
                                    100
                                )}
                                %
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Understanding
                              </p>
                            </div>
                          </div>

                          {session.status === 'active' && (
                            <div className="mt-3 border-t pt-3">
                              <Button size="sm" className="w-full">
                                Continue Session
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}

                      {(!tutoringSessions || tutoringSessions.length === 0) && (
                        <div className="py-8 text-center">
                          <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            No tutoring sessions yet
                          </p>
                          <Button
                            onClick={handleStartNewSession}
                            className="mt-4"
                          >
                            Start Your First Session
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4 text-center dark:from-blue-900/20 dark:to-purple-900/20">
                      <Clock className="mx-auto mb-2 h-8 w-8 text-blue-500" />
                      <p className="text-2xl font-bold">
                        {tutoringSessions?.reduce(
                          (sum, s) => sum + s.sessionMetrics.duration,
                          0
                        ) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Minutes
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xl font-bold text-green-600">
                          {tutoringSessions?.reduce(
                            (sum, s) =>
                              sum + s.sessionMetrics.conceptsExplained,
                            0
                          ) || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Concepts Learned
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {tutoringSessions?.reduce(
                            (sum, s) => sum + s.sessionMetrics.problemsSolved,
                            0
                          ) || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Problems Solved
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Understanding</span>
                          <span className="font-medium">
                            {Math.round(
                              ((tutoringSessions?.reduce(
                                (sum, s) =>
                                  sum + (s.insights.understandingLevel || 0),
                                0
                              ) || 0) /
                                (tutoringSessions?.length || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg Engagement</span>
                          <span className="font-medium">
                            {Math.round(
                              ((tutoringSessions?.reduce(
                                (sum, s) =>
                                  sum + (s.insights.engagementLevel || 0),
                                0
                              ) || 0) /
                                (tutoringSessions?.length || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button onClick={handleStartNewSession} className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      New Session
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Get Hints
                    </Button>
                    <Button variant="outline" className="w-full">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Review Concepts
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Learning Hours
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.round(
                          (tutoringSessions?.reduce(
                            (sum, s) => sum + s.sessionMetrics.duration,
                            0
                          ) || 0) / 60
                        )}
                        h
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Concepts Mastered
                      </p>
                      <p className="text-2xl font-bold">
                        {learningContext.completedConcepts.length}
                      </p>
                    </div>
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Success Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {Math.round(learningContext.performanceScore * 100)}%
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Improvement
                      </p>
                      <p className="text-2xl font-bold text-green-600">+15%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress Over Time</CardTitle>
                <CardDescription>
                  Track your understanding and performance improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Learning analytics chart would be displayed here</p>
                    <p className="text-sm">
                      Integration with charting library needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Context-Aware Assistant */}
      <ContextAwareAssistant
        currentContext={learningContext}
        learningObjectives={[
          'understand_concepts',
          'solve_problems',
          'apply_knowledge',
        ]}
        isVisible={showAssistant}
        onToggleVisibility={() => setShowAssistant(!showAssistant)}
        onContentSelect={handleContentSelect}
      />
    </div>
  );
}
