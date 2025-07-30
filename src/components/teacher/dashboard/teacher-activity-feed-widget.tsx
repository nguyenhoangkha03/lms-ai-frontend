'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  FileText,
  CheckCircle,
  GraduationCap,
  AlertTriangle,
  Award,
  Clock,
  Eye,
  MessageSquare,
  TrendingUp,
  ArrowRight,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { TeacherActivityFeedItem } from '@/lib/redux/api/teacher-dashboard-api';

interface TeacherActivityFeedWidgetProps {
  activities?: TeacherActivityFeedItem[];
  isLoading: boolean;
}

const activityIcons = {
  student_enrolled: UserPlus,
  assignment_submitted: FileText,
  quiz_completed: CheckCircle,
  course_completed: GraduationCap,
  student_struggling: AlertTriangle,
  achievement_earned: Award,
};

const activityColors = {
  student_enrolled: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  assignment_submitted: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  quiz_completed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  course_completed: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  student_struggling: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  achievement_earned: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
};

export const TeacherActivityFeedWidget: React.FC<
  TeacherActivityFeedWidgetProps
> = ({ activities = [], isLoading }) => {
  const router = useRouter();

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

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleActivityClick = (activity: TeacherActivityFeedItem) => {
    switch (activity.type) {
      case 'student_enrolled':
        if (activity.courseId) {
          router.push(`/teacher/courses/${activity.courseId}/students`);
        }
        break;
      case 'assignment_submitted':
        if (activity.metadata?.submissionId) {
          router.push(`/teacher/submissions/${activity.metadata.submissionId}`);
        }
        break;
      case 'quiz_completed':
        if (activity.courseId) {
          router.push(`/teacher/courses/${activity.courseId}/analytics`);
        }
        break;
      case 'course_completed':
        if (activity.studentId) {
          router.push(`/teacher/students/${activity.studentId}`);
        }
        break;
      case 'student_struggling':
        if (activity.studentId) {
          router.push(`/teacher/students/${activity.studentId}`);
        }
        break;
      case 'achievement_earned':
        if (activity.studentId) {
          router.push(`/teacher/students/${activity.studentId}`);
        }
        break;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex animate-pulse items-start space-x-3">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
                <div className="h-3 w-16 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Stay updated with your students' latest activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No Recent Activity</h3>
            <p className="text-muted-foreground">
              Student activities will appear here as they engage with your
              courses.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Stay updated with your students' latest activities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/teacher/activity')}
          >
            <Eye className="mr-2 h-4 w-4" />
            View All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-0">
        <div className="space-y-0">
          {activities.map((activity, index) => {
            const IconComponent =
              activityIcons[activity.type as keyof typeof activityIcons] ||
              MessageSquare;
            const colorClass =
              activityColors[activity.type as keyof typeof activityColors] ||
              'text-gray-600 bg-gray-50';

            return (
              <React.Fragment key={activity.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group cursor-pointer rounded-lg px-2 py-4 transition-colors hover:bg-muted/50"
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`rounded-full p-2 ${colorClass} flex-shrink-0`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="text-sm font-semibold">
                          {activity.title}
                        </h3>
                        <Badge
                          variant={getPriorityColor(activity.priority)}
                          className="text-xs"
                        >
                          {activity.priority}
                        </Badge>
                        {activity.actionRequired && (
                          <Badge variant="destructive" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>

                      <p className="mb-2 text-xs text-muted-foreground">
                        {activity.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {activity.studentName && (
                          <div className="flex items-center space-x-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className="text-xs">
                                {activity.studentName
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{activity.studentName}</span>
                          </div>
                        )}
                        {activity.courseName && (
                          <span className="truncate">
                            {activity.courseName}
                          </span>
                        )}
                        {activity.metadata?.score && (
                          <span className="font-medium">
                            Score: {activity.metadata.score}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center space-x-2">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                </motion.div>

                {index < activities.length - 1 && (
                  <Separator className="mx-2" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {activities.length >= 10 && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => router.push('/teacher/activity')}
            >
              View All Activity
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
