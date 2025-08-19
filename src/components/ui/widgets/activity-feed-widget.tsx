'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  CheckCircle,
  Trophy,
  FileText,
  Star,
  Clock,
  ArrowRight,
  Filter,
  MoreHorizontal,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetActivityFeedQuery } from '@/lib/redux/api/student-dashboard-api';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setActivityFeedFilter,
  markActivityViewed,
} from '@/lib/redux/slices/dashboard-slice';

const activityIcons = {
  lesson_completed: CheckCircle,
  quiz_taken: FileText,
  achievement_earned: Trophy,
  course_enrolled: BookOpen,
  milestone_reached: Star,
};

const activityColors = {
  lesson_completed: 'text-green-600 bg-green-100',
  quiz_taken: 'text-blue-600 bg-blue-100',
  achievement_earned: 'text-yellow-600 bg-yellow-100',
  course_enrolled: 'text-purple-600 bg-purple-100',
  milestone_reached: 'text-orange-600 bg-orange-100',
};

export const ActivityFeedWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: activities = [], isLoading } = useGetActivityFeedQuery({
    limit: 10,
  });
  const { activityFeedFilter, viewedActivities } = useAppSelector(
    state => state.dashboard
  );

  const filteredActivities = activities.filter(activity => {
    if (activityFeedFilter === 'all') return true;
    if (activityFeedFilter === 'courses')
      return ['lesson_completed', 'course_enrolled'].includes(activity.type);
    if (activityFeedFilter === 'achievements')
      return ['achievement_earned', 'milestone_reached'].includes(
        activity.type
      );
    if (activityFeedFilter === 'assessments')
      return activity.type === 'quiz_taken';
    return true;
  });

  const handleActivityClick = (activityId: string) => {
    if (!viewedActivities.includes(activityId)) {
      dispatch(markActivityViewed(activityId));
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="flex animate-pulse items-center space-x-3"
              >
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
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
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Your learning journey updates</CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {activityFeedFilter === 'all'
                    ? 'All'
                    : activityFeedFilter === 'courses'
                      ? 'Courses'
                      : activityFeedFilter === 'achievements'
                        ? 'Achievements'
                        : 'Assessments'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => dispatch(setActivityFeedFilter('all'))}
                >
                  All Activities
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setActivityFeedFilter('courses'))}
                >
                  Courses
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    dispatch(setActivityFeedFilter('achievements'))
                  }
                >
                  Achievements
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => dispatch(setActivityFeedFilter('assessments'))}
                >
                  Assessments
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Mark all as read</DropdownMenuItem>
                <DropdownMenuItem>Clear activity</DropdownMenuItem>
                <DropdownMenuItem>Export activity</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-2 text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">
              Start learning to see your progress here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => {
              const IconComponent = activityIcons[activity.type] || Activity;
              const isUnread = !viewedActivities.includes(activity.id);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-all duration-200 ${
                    isUnread
                      ? 'border border-primary/20 bg-primary/5 hover:bg-primary/10'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleActivityClick(activity.id)}
                >
                  {/* Activity icon */}
                  <div
                    className={`rounded-full p-2 ${activityColors[activity.type] || 'bg-gray-100 text-gray-600'}`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>

                  {/* Activity content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}
                        >
                          {activity.title}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>

                      {isUnread && (
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      )}
                    </div>

                    {/* Activity metadata */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </span>

                        {/* Score badge for quiz activities */}
                        {activity.type === 'quiz_taken' &&
                          activity.metadata?.score && (
                            <Badge variant="secondary" className="text-xs">
                              {activity.metadata.score}%
                            </Badge>
                          )}
                      </div>

                      {/* Action button */}
                      <div className="opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Load more button */}
            {activities.length >= 10 && (
              <div className="pt-4 text-center">
                <Button variant="outline" size="sm">
                  Load More Activities
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Quick stats footer */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredActivities.length} recent activities</span>
              <Button variant="ghost" size="sm">
                View All Activity
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
