'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

interface CourseProgressData {
  courseId: string;
  courseName: string;
  progress: number;
  averageScore: number;
  timeSpent: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastActivity: string;
  performanceLevel: string;
  strugglingAreas: string[];
  strongAreas: string[];
}

interface CourseProgressWidgetProps {
  courses?: CourseProgressData[];
}

export const CourseProgressWidget: React.FC<CourseProgressWidgetProps> = ({
  courses = [],
}) => {
  const router = useRouter();

  const getPerformanceColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'good':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'average':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'below_average':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
      case 'poor':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPerformanceBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'average':
        return 'outline';
      case 'below_average':
        return 'destructive';
      case 'poor':
        return 'destructive';
      default:
        return 'outline';
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

  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Course Progress</span>
          </CardTitle>
          <CardDescription>
            Track your progress across enrolled courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              No Courses in Progress
            </h3>
            <p className="mb-4 text-muted-foreground">
              Enroll in courses to start tracking your progress
            </p>
            <Button onClick={() => router.push('/courses')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Courses
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall stats
  const totalProgress =
    courses.reduce((sum, course) => sum + course.progress, 0) / courses.length;
  const totalTimeSpent = courses.reduce(
    (sum, course) => sum + course.timeSpent,
    0
  );
  const averageScore =
    courses.reduce((sum, course) => sum + course.averageScore, 0) /
    courses.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Course Progress</span>
        </CardTitle>
        <CardDescription>
          Your progress across {courses.length} active course
          {courses.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-blue-600">
              {Math.round(totalProgress)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Progress</div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-green-600">
              {totalTimeSpent}h
            </div>
            <div className="text-xs text-muted-foreground">Total Time</div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.round(averageScore)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </div>
        </div>

        <Separator />

        {/* Course List */}
        <div className="space-y-4">
          {courses.slice(0, 5).map((course, index) => (
            <motion.div
              key={course.courseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:bg-muted/50"
              onClick={() => router.push(`/student/courses/${course.courseId}`)}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <h4 className="truncate text-sm font-medium">
                      {course.courseName}
                    </h4>
                    <Badge
                      variant={getPerformanceBadgeVariant(
                        course.performanceLevel
                      )}
                      className="text-xs"
                    >
                      {course.performanceLevel.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{course.timeSpent}h spent</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{course.averageScore}% avg</span>
                    </div>
                    <span>
                      Last active: {formatLastActivity(course.lastActivity)}
                    </span>
                  </div>
                </div>

                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress</span>
                  <span className="font-medium">
                    {Math.round(course.progress)}%
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {course.lessonsCompleted}/{course.totalLessons} lessons
                  </span>
                  <div className="flex items-center space-x-1">
                    {course.progress === 100 ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Completed</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3 w-3 text-blue-500" />
                        <span>
                          {course.totalLessons - course.lessonsCompleted}{' '}
                          remaining
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Areas of Focus */}
              <div className="space-y-2">
                {/* Struggling Areas */}
                {course.strugglingAreas.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-orange-500" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-orange-600">
                        Focus areas:
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {course.strugglingAreas.slice(0, 2).join(', ')}
                        {course.strugglingAreas.length > 2 &&
                          ` +${course.strugglingAreas.length - 2} more`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Strong Areas */}
                {course.strongAreas.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-green-600">
                        Strengths:
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {course.strongAreas.slice(0, 2).join(', ')}
                        {course.strongAreas.length > 2 &&
                          ` +${course.strongAreas.length - 2} more`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Show More Button */}
        {courses.length > 5 && (
          <div className="pt-2 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/student/courses')}
            >
              View All Courses ({courses.length})
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <Separator />

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/courses')}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Browse More Courses
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/student/analytics')}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
