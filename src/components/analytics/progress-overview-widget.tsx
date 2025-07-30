'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar,
  BarChart3,
  ArrowUp,
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
import { Separator } from '@/components/ui/separator';
import { PerformanceAnalytics } from '@/lib/redux/api/student-analytics-api';

interface ProgressOverviewWidgetProps {
  data?: PerformanceAnalytics;
}

export const ProgressOverviewWidget: React.FC<ProgressOverviewWidgetProps> = ({
  data,
}) => {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progress Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
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

  const { overview } = data;
  const progressPercentage =
    (overview.completedCourses / overview.totalCourses) * 100 || 0;

  const stats = [
    {
      label: 'Total Courses',
      value: overview.totalCourses,
      icon: BookOpen,
      color: 'blue',
    },
    {
      label: 'Completed',
      value: overview.completedCourses,
      icon: Award,
      color: 'green',
    },
    {
      label: 'Study Hours',
      value: `${overview.totalStudyHours}h`,
      icon: Clock,
      color: 'orange',
    },
    {
      label: 'Avg Score',
      value: `${overview.averageScore}%`,
      icon: Target,
      color: 'purple',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Progress Overview</span>
        </CardTitle>
        <CardDescription>Your learning journey at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {overview.completedCourses} of {overview.totalCourses} courses
            completed
          </p>
        </div>

        <Separator />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 rounded-lg bg-muted/50 p-3"
              >
                <div
                  className={`rounded-full p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}
                >
                  <Icon
                    className={`h-4 w-4 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Separator />

        {/* Recent Performance */}
        <div className="space-y-3">
          <h4 className="flex items-center space-x-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            <span>Recent Performance</span>
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current Streak</span>
              <div className="flex items-center space-x-1">
                <ArrowUp className="h-3 w-3 text-green-500" />
                <span className="text-sm font-medium">
                  {overview.currentStreak} days
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Longest Streak</span>
              <Badge variant="outline" className="text-xs">
                {overview.longestStreak} days
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Achievements</span>
              <div className="flex items-center space-x-1">
                <Award className="h-3 w-3 text-yellow-500" />
                <span className="text-sm font-medium">
                  {overview.totalAchievements}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Study Patterns */}
        <div className="space-y-3">
          <h4 className="flex items-center space-x-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>Study Patterns</span>
          </h4>

          {data.timeAnalytics?.studyPatterns && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Most Active</span>
                <span className="font-medium">
                  {data.timeAnalytics.studyPatterns.mostActiveDay}s at{' '}
                  {data.timeAnalytics.studyPatterns.mostActiveHour}:00
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Session</span>
                <span className="font-medium">
                  {Math.round(
                    data.timeAnalytics.studyPatterns.averageSessionLength
                  )}{' '}
                  min
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Preferred Time</span>
                <Badge variant="secondary" className="text-xs capitalize">
                  {data.timeAnalytics.studyPatterns.preferredStudyTime}
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="pt-2">
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>On Track</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>Needs Attention</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <span>At Risk</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
