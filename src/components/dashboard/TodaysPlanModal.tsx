'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BookOpen,
  Calendar,
  Target,
  Clock,
  Star,
  CheckCircle2,
  PlayCircle,
  Award,
  Brain,
  Zap,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface LessonPlan {
  completionRate: string;
  courseTitle: string;
  courseSlug: string;
  lesson: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  trend_prediction: 'up' | 'down' | 'stable';
}

interface TodaysPlanData {
  lesson: LessonPlan[];
}

interface TodaysPlanModalProps {
  children: React.ReactNode;
}

const TodaysPlanModal: React.FC<TodaysPlanModalProps> = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [todaysPlan, setTodaysPlan] = useState<TodaysPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaysPlan = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            user_id: user.id,
          },
        }),
      });

      const result = await response.json();

      console.log('result', result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch today's plan");
      }

      if (result.success) {
        setTodaysPlan(result.data);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error("Error fetching today's plan:", err);
      setError(err.message || "Failed to load today's plan");
      toast.error("Failed to load today's plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !todaysPlan) {
      fetchTodaysPlan();
    }
  };

  const handleStartLearning = (lesson: LessonPlan) => {
    if (lesson.courseSlug) {
      // Close modal first
      setIsOpen(false);
      // Navigate to course page
      router.push(`/student/my-courses/${lesson.courseSlug}`);
    } else {
      toast.error('Course not available');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return <Star className="h-4 w-4" />;
      case 'intermediate':
        return <TrendingUp className="h-4 w-4" />;
      case 'advanced':
        return <Award className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCompletionStatus = (completionRate: string) => {
    const rate = parseFloat(completionRate);
    if (rate === 0) return 'not-started';
    if (rate < 100) return 'in-progress';
    return 'completed';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'down':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stable':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderLessonCard = (lesson: LessonPlan, index: number) => {
    const completionRate = parseFloat(lesson.completionRate || '0');
    const status = getCompletionStatus(lesson.completionRate || '0');

    return (
      <motion.div
        key={`${lesson.courseTitle || 'unknown'}-${lesson.lesson || index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className="border-l-4 border-l-blue-500 transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status === 'completed' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : status === 'in-progress' ? (
                  <PlayCircle className="h-5 w-5 text-blue-600" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {lesson.lesson || 'Untitled Lesson'}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`${getLevelColor(lesson.level || 'beginner')} flex items-center gap-1`}
                >
                  {getLevelIcon(lesson.level || 'beginner')}
                  <span className="capitalize">
                    {lesson.level || 'beginner'}
                  </span>
                </Badge>
                <Badge
                  variant="outline"
                  className={`${getTrendColor(lesson.trend_prediction || 'stable')} flex items-center gap-1`}
                >
                  {getTrendIcon(lesson.trend_prediction || 'stable')}
                  <span className="text-xs capitalize">
                    {lesson.trend_prediction || 'stable'}
                  </span>
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Course Title */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Course:</span>
                <span className="font-medium text-blue-700">
                  {lesson.courseTitle || 'Unknown Course'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Progress</span>
                  <span className="font-semibold text-blue-600">
                    {completionRate}%
                  </span>
                </div>
                <Progress value={completionRate} className="h-2 bg-gray-200" />

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  {status === 'completed' && (
                    <Badge
                      variant="default"
                      className="bg-green-600 text-white"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  )}
                  {status === 'in-progress' && (
                    <Badge variant="default" className="bg-blue-600 text-white">
                      <PlayCircle className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  )}
                  {status === 'not-started' && (
                    <Badge
                      variant="outline"
                      className="border-gray-300 text-gray-600"
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      Not Started
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button
                variant={status === 'not-started' ? 'default' : 'outline'}
                size="sm"
                className="mt-3 w-full"
                onClick={() => handleStartLearning(lesson)}
              >
                {status === 'completed' ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Review Lesson
                  </>
                ) : status === 'in-progress' ? (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Learning
                  </>
                )}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="border-l-4 border-l-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded" />
              </div>
              <Skeleton className="h-8 w-full rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Today's Learning Plan
              </DialogTitle>
              <DialogDescription className="mt-1 text-gray-600">
                AI-powered personalized lessons curated just for you
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Insight Header */}
          <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
            <div className="rounded-full bg-purple-100 p-2">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">
                AI Curated Learning Path
              </h3>
              <p className="text-sm text-purple-700">
                Based on your progress and learning patterns
              </p>
            </div>
            <div className="ml-auto">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
          </div>

          {/* Content */}
          {isLoading && renderLoadingSkeleton()}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchTodaysPlan}
                  className="ml-4"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {todaysPlan && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Statistics */}
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {todaysPlan.lesson.length}
                  </div>
                  <div className="text-sm text-blue-700">Lessons Planned</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      todaysPlan.lesson.filter(
                        l => parseFloat(l.completionRate) === 100
                      ).length
                    }
                  </div>
                  <div className="text-sm text-green-700">Completed</div>
                </div>
                <div className="rounded-lg bg-orange-50 p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {
                      todaysPlan.lesson.filter(
                        l =>
                          parseFloat(l.completionRate) > 0 &&
                          parseFloat(l.completionRate) < 100
                      ).length
                    }
                  </div>
                  <div className="text-sm text-orange-700">In Progress</div>
                </div>
              </div>

              {/* Lessons List */}
              {todaysPlan.lesson.length > 0 ? (
                <div className="space-y-4">
                  {todaysPlan.lesson.map((lesson, index) =>
                    renderLessonCard(lesson, index)
                  )}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 p-4">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No lessons planned for today
                  </h3>
                  <p className="mb-4 text-gray-600">
                    Your AI tutor is preparing personalized content for you
                  </p>
                  <Button variant="outline" onClick={fetchTodaysPlan}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Plan
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TodaysPlanModal;
