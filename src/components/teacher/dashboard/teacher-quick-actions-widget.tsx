'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  FileText,
  AlertTriangle,
  BookOpen,
  Video,
  MessageSquare,
  Clock,
  Users,
  PlusCircle,
  Zap,
  ArrowRight,
  CheckCircle,
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
import { useRouter } from 'next/navigation';
import { TeacherQuickAction } from '@/lib/redux/api/teacher-dashboard-api';

interface TeacherQuickActionsWidgetProps {
  actions?: TeacherQuickAction[];
  isLoading: boolean;
}

const actionIcons = {
  grade_assignments: ClipboardList,
  review_submissions: FileText,
  contact_struggling_students: AlertTriangle,
  update_course_content: BookOpen,
  schedule_live_session: Video,
  respond_to_questions: MessageSquare,
};

const actionColors = {
  grade_assignments: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
  review_submissions: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  contact_struggling_students: 'text-red-600 bg-red-50 dark:bg-red-900/20',
  update_course_content: 'text-green-600 bg-green-50 dark:bg-green-900/20',
  schedule_live_session: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  respond_to_questions: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
};

export const TeacherQuickActionsWidget: React.FC<
  TeacherQuickActionsWidgetProps
> = ({ actions = [], isLoading }) => {
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

  const formatEstimatedTime = (minutes?: number) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="flex animate-pulse items-center space-x-3 rounded-lg border p-3"
              >
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
                <div className="h-8 w-20 rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Prioritized tasks based on your current teaching needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h3 className="mb-2 text-lg font-semibold">All Caught Up!</h3>
            <p className="mb-4 text-muted-foreground">
              No urgent actions required at the moment.
            </p>
            <Button onClick={() => router.push('/teacher/courses')}>
              <BookOpen className="mr-2 h-4 w-4" />
              Manage Courses
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
        <CardDescription>
          Prioritized tasks based on your current teaching needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => {
          const IconComponent =
            actionIcons[action.type as keyof typeof actionIcons] || PlusCircle;
          const colorClass =
            actionColors[action.type as keyof typeof actionColors] ||
            'text-gray-600 bg-gray-50';

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div
                className="flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all duration-200 hover:bg-muted/50"
                onClick={() => router.push(action.href)}
              >
                <div className={`rounded-full p-2 ${colorClass}`}>
                  <IconComponent className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center space-x-2">
                    <h3 className="text-sm font-semibold">{action.title}</h3>
                    <Badge
                      variant={getPriorityColor(action.priority)}
                      className="text-xs"
                    >
                      {action.priority}
                    </Badge>
                    {action.urgent && (
                      <Badge
                        variant="destructive"
                        className="animate-pulse text-xs"
                      >
                        Urgent
                      </Badge>
                    )}
                  </div>

                  <p className="mb-2 text-xs text-muted-foreground">
                    {action.description}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    {action.count && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">{action.count}</span>
                        <span>items</span>
                      </div>
                    )}
                    {action.estimatedTime && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatEstimatedTime(action.estimatedTime)}</span>
                      </div>
                    )}
                    {action.metadata?.studentCount && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{action.metadata.studentCount} students</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    {action.actionText}
                  </Button>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Quick Create Actions */}
        <div className="border-t pt-4">
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Quick Create
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/teacher/courses/create')}
              className="justify-start"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              New Course
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/teacher/assessments/create')}
              className="justify-start"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              New Quiz
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/teacher/live-sessions/create')}
              className="justify-start"
            >
              <Video className="mr-2 h-4 w-4" />
              Live Session
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/teacher/announcements/create')}
              className="justify-start"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Announcement
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
