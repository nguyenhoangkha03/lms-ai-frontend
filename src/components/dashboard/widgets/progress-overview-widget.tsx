'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Target,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useGetProgressOverviewQuery } from '@/lib/redux/api/student-dashboard-api';
import { useRouter } from 'next/navigation';

export const ProgressOverviewWidget: React.FC = () => {
  const router = useRouter();
  const { data: progressData = [], isLoading } = useGetProgressOverviewQuery();

  const handleContinueLearning = (courseId: string, lessonId?: string) => {
    if (lessonId) {
      router.push(`/student/courses/${courseId}/lessons/${lessonId}`);
    } else {
      router.push(`/student/courses/${courseId}`);
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Learning Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                <div className="mb-4 h-2 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const inProgressCourses = progressData.filter(course => !course.isCompleted);
  const completedCourses = progressData.filter(course => course.isCompleted);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Learning Progress</span>
            </CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/courses')}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {inProgressCourses.length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {completedCourses.length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(
                progressData.reduce(
                  (acc, course) => acc + course.progressPercentage,
                  0
                ) / progressData.length || 0
              )}
              %
            </div>
            <div className="text-xs text-muted-foreground">Avg Progress</div>
          </div>
        </div>

        {/* Current courses */}
        <div className="space-y-4">
          <h4 className="flex items-center text-sm font-medium">
            <Play className="mr-2 h-4 w-4" />
            Continue Learning
          </h4>

          {inProgressCourses.length === 0 ? (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">
                No courses in progress
              </p>
              <Button onClick={() => router.push('/courses')}>
                Browse Courses
              </Button>
            </div>
          ) : (
            inProgressCourses.slice(0, 3).map((course, index) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer rounded-lg bg-muted/30 p-4 transition-all duration-200 hover:bg-muted/50"
                onClick={() =>
                  handleContinueLearning(course.courseId, course.nextLesson?.id)
                }
              >
                <div className="flex items-center space-x-4">
                  {/* Course image */}
                  <div className="relative">
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarImage
                        src={course.courseImage}
                        alt={course.courseName}
                      />
                      <AvatarFallback className="rounded-lg">
                        {course.courseName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-primary-foreground">
                      <Play className="h-3 w-3" />
                    </div>
                  </div>

                  {/* Course details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h5 className="truncate font-medium transition-colors group-hover:text-primary">
                          {course.courseName}
                        </h5>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {course.lessonsCompleted}/{course.totalLessons}{' '}
                            lessons
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(course.progressPercentage)}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <Progress
                        value={course.progressPercentage}
                        className="h-2"
                      />
                    </div>

                    {/* Next lesson & last activity */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {course.nextLesson && (
                          <>
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Next: {course.nextLesson.title}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatLastActivity(course.lastActivity)}</span>
                      </div>
                    </div>

                    {/* Estimated time */}
                    {course.nextLesson && (
                      <div className="mt-2 flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          ~{course.nextLesson.estimatedDuration} min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Continue button */}
                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Completed courses summary */}
        {completedCourses.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {completedCourses.length} course
                  {completedCourses.length !== 1 ? 's' : ''} completed
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/student/achievements')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Achievements
              </Button>
            </div>
          </div>
        )}

        {/* Show more courses link */}
        {inProgressCourses.length > 3 && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/student/courses')}
            >
              View {inProgressCourses.length - 3} more courses
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
