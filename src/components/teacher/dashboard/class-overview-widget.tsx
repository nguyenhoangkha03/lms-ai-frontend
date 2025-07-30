'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  TrendingUp,
  AlertTriangle,
  FileText,
  MoreHorizontal,
  Play,
  Edit,
  Archive,
  Eye,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  ClassOverview,
  useUpdateCourseStatusMutation,
} from '@/lib/redux/api/teacher-dashboard-api';

interface ClassOverviewWidgetProps {
  classes?: ClassOverview[];
  isLoading: boolean;
  timeFilter: string;
}

export const ClassOverviewWidget: React.FC<ClassOverviewWidgetProps> = ({
  classes = [],
  isLoading,
  timeFilter,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [updateCourseStatus, { isLoading: isUpdating }] =
    useUpdateCourseStatusMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleCourseAction = async (courseId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/teacher/courses/${courseId}`);
          break;
        case 'edit':
          router.push(`/teacher/courses/${courseId}/edit`);
          break;
        case 'analytics':
          router.push(`/teacher/courses/${courseId}/analytics`);
          break;
        case 'archive':
          await updateCourseStatus({ courseId, status: 'archived' }).unwrap();
          toast({
            title: 'Course Archived',
            description: 'The course has been successfully archived.',
          });
          break;
        case 'activate':
          await updateCourseStatus({ courseId, status: 'active' }).unwrap();
          toast({
            title: 'Course Activated',
            description: 'The course is now active.',
          });
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform action. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="h-6 w-48 rounded bg-muted" />
                  <div className="h-6 w-16 rounded bg-muted" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(j => (
                    <div key={j} className="h-12 rounded bg-muted" />
                  ))}
                </div>
                <div className="h-2 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No Classes Found</h3>
          <p className="mb-4 text-center text-muted-foreground">
            You haven't created any courses yet. Start by creating your first
            course.
          </p>
          <Button onClick={() => router.push('/teacher/courses/create')}>
            <BookOpen className="mr-2 h-4 w-4" />
            Create First Course
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="mx-auto mb-2 h-6 w-6 text-blue-500" />
            <p className="text-lg font-bold">
              {classes.filter(c => c.status === 'active').length}
            </p>
            <p className="text-xs text-muted-foreground">Active Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="mx-auto mb-2 h-6 w-6 text-green-500" />
            <p className="text-lg font-bold">
              {classes.reduce((sum, c) => sum + c.totalStudents, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-purple-500" />
            <p className="text-lg font-bold">
              {Math.round(
                classes.reduce((sum, c) => sum + c.averageScore, 0) /
                  classes.length || 0
              )}
              %
            </p>
            <p className="text-xs text-muted-foreground">Avg Class Score</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-orange-500" />
            <p className="text-lg font-bold">
              {classes.reduce((sum, c) => sum + c.strugglingStudents, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Students At Risk</p>
          </CardContent>
        </Card>
      </div>

      {/* Class Cards */}
      <div className="space-y-4">
        {classes.map((classItem, index) => (
          <motion.div
            key={classItem.courseId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="transition-shadow duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {classItem.courseImage && (
                      <img
                        src={classItem.courseImage}
                        alt={classItem.courseName}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">
                          {classItem.courseName}
                        </h3>
                        <Badge className={getStatusColor(classItem.status)}>
                          {classItem.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{classItem.totalStudents} students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Active: {formatLastActivity(classItem.lastActivity)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{classItem.upcomingDeadlines} deadlines</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          handleCourseAction(classItem.courseId, 'view')
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Course
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleCourseAction(classItem.courseId, 'edit')
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleCourseAction(classItem.courseId, 'analytics')
                        }
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      {classItem.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() =>
                            handleCourseAction(classItem.courseId, 'archive')
                          }
                        >
                          <Archive className="mr-2 h-4 w-4" />
                          Archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            handleCourseAction(classItem.courseId, 'activate')
                          }
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Activate
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress and Stats */}
                <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(classItem.averageProgress)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Progress
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {Math.round(classItem.averageScore)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Score
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(classItem.completionRate)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completion
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-3 text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {classItem.activeStudents}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active This Week
                    </div>
                  </div>
                </div>

                {/* Student Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Student Performance</span>
                    <span>{classItem.totalStudents} total students</span>
                  </div>
                  <div className="flex space-x-1">
                    <div
                      className="h-2 rounded-l bg-green-500"
                      style={{
                        width: `${(classItem.excellingStudents / classItem.totalStudents) * 100}%`,
                      }}
                    />
                    <div
                      className="h-2 bg-blue-500"
                      style={{
                        width: `${((classItem.totalStudents - classItem.excellingStudents - classItem.strugglingStudents) / classItem.totalStudents) * 100}%`,
                      }}
                    />
                    <div
                      className="h-2 rounded-r bg-orange-500"
                      style={{
                        width: `${(classItem.strugglingStudents / classItem.totalStudents) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded bg-green-500" />
                      <span>{classItem.excellingStudents} excelling</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded bg-blue-500" />
                      <span>
                        {classItem.totalStudents -
                          classItem.excellingStudents -
                          classItem.strugglingStudents}{' '}
                        on track
                      </span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <div className="h-2 w-2 rounded bg-orange-500" />
                      <span>{classItem.strugglingStudents} at risk</span>
                    </span>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/teacher/courses/${classItem.courseId}/students`
                      )
                    }
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Manage Students
                  </Button>

                  {classItem.recentSubmissions > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/teacher/courses/${classItem.courseId}/grading`
                        )
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Grade ({classItem.recentSubmissions})
                    </Button>
                  )}

                  {classItem.strugglingStudents > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/teacher/courses/${classItem.courseId}/students?filter=at-risk`
                        )
                      }
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      At Risk ({classItem.strugglingStudents})
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/teacher/courses/${classItem.courseId}/analytics`
                      )
                    }
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
