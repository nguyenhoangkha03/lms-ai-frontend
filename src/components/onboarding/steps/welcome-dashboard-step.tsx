'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Trophy,
  Target,
  Brain,
  TrendingUp,
  CheckCircle,
  Play,
  Calendar,
  Users,
  ArrowRight,
  Star,
  Zap,
  Settings,
  Coffee,
  Moon,
  Sun,
  Headphones,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppSelector } from '@/lib/redux/hooks';
import { useRouter } from 'next/navigation';

interface WelcomeDashboardStepProps {
  onComplete: () => void;
}

export const WelcomeDashboardStep: React.FC<WelcomeDashboardStepProps> = ({
  onComplete,
}) => {
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);
  const { selectedPath, preferences, assessmentResult, totalTimeSpent } =
    useAppSelector(state => state.onboarding);

  // Mock data for demonstration
  const mockStats = {
    coursesEnrolled: selectedPath?.courses.length || 0,
    hoursPlanned: preferences?.availableHoursPerWeek || 5,
    skillsToLearn: selectedPath?.skills.length || 0,
    completionTarget: '3 months',
  };

  const upcomingTasks = [
    {
      id: '1',
      title: 'Complete Profile Setup',
      description: 'Add your bio and profile picture',
      type: 'setup',
      priority: 'high',
      estimatedTime: '5 min',
    },
    {
      id: '2',
      title: `Start "${selectedPath?.courses[0]?.title || 'First Course'}"`,
      description: 'Begin your learning journey',
      type: 'learning',
      priority: 'medium',
      estimatedTime: '30 min',
    },
    {
      id: '3',
      title: 'Join Student Community',
      description: 'Connect with fellow learners',
      type: 'community',
      priority: 'low',
      estimatedTime: '10 min',
    },
  ];

  const achievements = [
    {
      id: '1',
      title: 'Onboarding Complete',
      description: 'Successfully completed the setup process',
      icon: <CheckCircle className="h-6 w-6" />,
      earned: true,
      points: 50,
    },
    {
      id: '2',
      title: 'Assessment Master',
      description: 'Completed skill assessment',
      icon: <Brain className="h-6 w-6" />,
      earned: true,
      points: 100,
    },
    {
      id: '3',
      title: 'Path Finder',
      description: 'Selected learning path',
      icon: <Target className="h-6 w-6" />,
      earned: true,
      points: 75,
    },
    {
      id: '4',
      title: 'First Lesson',
      description: 'Complete your first lesson',
      icon: <Play className="h-6 w-6" />,
      earned: false,
      points: 25,
    },
  ];

  const quickActions = [
    {
      title: 'Start Learning',
      description: 'Jump into your first course',
      icon: <Play className="h-5 w-5" />,
      color: 'bg-primary',
      href: '/student/courses',
      primary: true,
    },
    {
      title: 'View Schedule',
      description: 'See your learning calendar',
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-blue-500',
      href: '/student/schedule',
    },
    {
      title: 'AI Tutor',
      description: 'Get personalized help',
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-purple-500',
      href: '/student/ai-tutor',
    },
    {
      title: 'Join Community',
      description: 'Connect with peers',
      icon: <Users className="h-5 w-5" />,
      color: 'bg-green-500',
      href: '/student/community',
    },
  ];

  // Get learning style icon
  const getLearningStyleIcon = (style: string) => {
    switch (style) {
      case 'visual':
        return <Star className="h-4 w-4" />;
      case 'auditory':
        return <Headphones className="h-4 w-4" />;
      case 'kinesthetic':
        return <Zap className="h-4 w-4" />;
      case 'reading':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  // Get study time icon
  const getStudyTimeIcon = (time: string) => {
    switch (time) {
      case 'morning':
        return <Sun className="h-4 w-4" />;
      case 'afternoon':
        return <Coffee className="h-4 w-4" />;
      case 'evening':
        return <Coffee className="h-4 w-4" />;
      case 'night':
        return <Moon className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Format time spent
  const formatTimeSpent = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} minutes`;
  };

  const handleActionClick = (href: string) => {
    router.push(href);
  };

  const handleGetStarted = () => {
    onComplete();
    router.push('/student/dashboard');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 text-center"
      >
        <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
          <Trophy className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h3 className="mb-2 text-3xl font-bold">
            🎉 Welcome to Your Learning Journey, {user?.firstName}!
          </h3>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Your personalized learning environment is ready. Here's what we've
            set up for you based on your preferences.
          </p>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {mockStats.coursesEnrolled}
                </p>
                <p className="text-sm text-muted-foreground">
                  Courses Enrolled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{mockStats.hoursPlanned}</p>
                <p className="text-sm text-muted-foreground">
                  Hours/Week Planned
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{mockStats.skillsToLearn}</p>
                <p className="text-sm text-muted-foreground">Skills to Learn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {mockStats.completionTarget}
                </p>
                <p className="text-sm text-muted-foreground">Target Timeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Your Learning Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Your Learning Profile</span>
              </CardTitle>
              <CardDescription>
                Based on your assessment and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Path */}
              {selectedPath && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{selectedPath.title}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedPath.description}
                      </p>
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{selectedPath.courses.length} courses</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{selectedPath.estimatedDuration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Summary */}
              {preferences && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getLearningStyleIcon(preferences.preferredLearningStyle)}
                      <span className="text-sm font-medium">
                        Learning Style
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {preferences.preferredLearningStyle}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStudyTimeIcon(preferences.studyTimePreference)}
                      <span className="text-sm font-medium">
                        Best Study Time
                      </span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {preferences.studyTimePreference}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Session Length
                      </span>
                    </div>
                    <Badge variant="outline">
                      {preferences.sessionDuration} min
                    </Badge>
                  </div>
                </div>
              )}

              {/* Assessment Score */}
              {assessmentResult && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Overall Assessment Score
                    </span>
                    <Badge variant="secondary">
                      {Math.round(assessmentResult.overallScore)}/100
                    </Badge>
                  </div>
                  <Progress
                    value={assessmentResult.overallScore}
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Quick Actions</span>
              </CardTitle>
              <CardDescription>
                Jump into your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Button
                    variant={action.primary ? 'default' : 'outline'}
                    className="h-auto w-full justify-start p-4"
                    onClick={() => handleActionClick(action.href)}
                  >
                    <div
                      className={`rounded-lg p-2 ${action.color} mr-3 text-white`}
                    >
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Next Steps</span>
            </CardTitle>
            <CardDescription>
              Recommended actions to get the most out of your learning
              experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted/70"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      task.priority === 'high'
                        ? 'bg-red-500'
                        : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.estimatedTime}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Your Achievements</span>
            </CardTitle>
            <CardDescription>
              You've earned {achievements.filter(a => a.earned).length}{' '}
              achievements so far!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className={`rounded-lg border p-3 ${
                    achievement.earned
                      ? 'border-primary/20 bg-primary/5'
                      : 'border-muted bg-muted/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`rounded-lg p-2 ${
                        achievement.earned
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <Badge
                      variant={achievement.earned ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      +{achievement.points} XP
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Setup Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4 text-center"
      >
        <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
          <h4 className="mb-2 text-lg font-semibold">Setup Complete! 🎊</h4>
          <p className="mb-4 text-muted-foreground">
            You spent {formatTimeSpent(totalTimeSpent)} setting up your profile.
            Your AI-powered learning journey is now ready to begin!
          </p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/student/profile')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Modify Settings
            </Button>
            <Button onClick={handleGetStarted} size="lg">
              <Play className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
