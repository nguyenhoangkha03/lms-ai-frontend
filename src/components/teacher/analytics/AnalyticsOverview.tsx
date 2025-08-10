'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Target,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PerformanceAnalytics } from '@/lib/redux/api/teacher-analytics-api';

interface AnalyticsOverviewProps {
  data: PerformanceAnalytics;
  isLoading?: boolean;
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  trend?: { direction: 'up' | 'down' | 'stable'; percentage: number };
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-200/30 text-blue-800',
    green: 'from-green-500/10 to-green-600/10 border-green-200/30 text-green-800',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-200/30 text-purple-800',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-200/30 text-orange-800',
    red: 'from-red-500/10 to-red-600/10 border-red-200/30 text-red-800',
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };

  return (
    <Card className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-lg shadow-xl`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs opacity-70 mt-1">{subtitle}</p>
            {trend && (
              <div className="flex items-center mt-2">
                {trend.direction === 'up' && <TrendingUp className="h-3 w-3 text-green-500 mr-1" />}
                {trend.direction === 'down' && <TrendingDown className="h-3 w-3 text-red-500 mr-1" />}
                {trend.direction === 'stable' && <div className="h-3 w-3 bg-gray-400 rounded-full mr-1" />}
                <span className={`text-xs font-medium ${
                  trend.direction === 'up' ? 'text-green-600' :
                  trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                </span>
              </div>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/20`}>
            <Icon className={`h-6 w-6 ${iconColors[color]}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function AnalyticsOverview({ data, isLoading = false }: AnalyticsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-8 w-8 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Performance Indicators */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Students"
          value={data.overview.totalStudents}
          subtitle="Across all courses"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Class Average"
          value={`${data.overview.averageClassScore}%`}
          subtitle="Overall performance"
          icon={Target}
          trend={{ direction: 'up', percentage: data.overview.improvementRate }}
          color="green"
        />
        <StatCard
          title="Completion Rate"
          value={`${data.overview.completionRate}%`}
          subtitle="Course completion"
          icon={CheckCircle}
          color="purple"
        />
        <StatCard
          title="Engagement Rate"
          value={`${data.overview.engagementRate}%`}
          subtitle="Student engagement"
          icon={Activity}
          color="orange"
        />
      </motion.div>

      {/* Student Performance Segments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-500" />
              Student Performance Distribution
            </CardTitle>
            <CardDescription>
              How your students are performing across different levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {data.studentSegments.map((segment, index) => (
                <motion.div
                  key={segment.segment}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold capitalize text-slate-700">
                      {segment.segment.replace('_', ' ')}
                    </h4>
                    <Badge
                      variant={
                        segment.segment === 'excelling' ? 'default' :
                        segment.segment === 'on_track' ? 'secondary' :
                        segment.segment === 'at_risk' ? 'outline' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {segment.percentage}%
                    </Badge>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-2xl font-bold text-slate-800">
                      {segment.count}
                    </div>
                    <div className="text-sm text-slate-600">students</div>
                  </div>

                  <Progress
                    value={segment.percentage}
                    className="h-2 mb-3"
                  />

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-700">Key Traits:</p>
                    {segment.characteristics.slice(0, 2).map((trait, idx) => (
                      <p key={idx} className="text-xs text-slate-600">• {trait}</p>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-medium text-slate-700 mb-1">Suggested Actions:</p>
                    {segment.recommendedActions.slice(0, 1).map((action, idx) => (
                      <p key={idx} className="text-xs text-blue-600">• {action}</p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-green-500" />
              Course Performance Highlights
            </CardTitle>
            <CardDescription>
              Performance metrics for your top courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.coursePerformance.slice(0, 2).map((course, index) => (
                <motion.div
                  key={course.courseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-800">
                        {course.courseName}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {course.enrolledStudents} students enrolled
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {course.averageScore}% avg
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                    <div className="text-center">
                      <div className="text-sm text-slate-600">Completion</div>
                      <div className="text-xl font-bold text-green-600">
                        {course.completionRate}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-600">Struggling</div>
                      <div className="text-xl font-bold text-red-600">
                        {course.strugglingStudents}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-600">Excelling</div>
                      <div className="text-xl font-bold text-green-600">
                        {course.excellingStudents}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-600">Engagement</div>
                      <div className="text-xl font-bold text-blue-600">
                        {Math.round(
                          (course.engagementMetrics.videoWatchTime +
                           course.engagementMetrics.assignmentSubmissionRate +
                           course.engagementMetrics.discussionParticipation +
                           course.engagementMetrics.quizAttemptRate) / 4
                        )}%
                      </div>
                    </div>
                  </div>

                  <Progress value={course.completionRate} className="mb-4" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-700 font-medium mb-2">Strong Areas:</p>
                      <div className="space-y-1">
                        {course.contentEffectiveness.topPerformingLessons.slice(0, 2).map((lesson, idx) => (
                          <div key={idx} className="flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            <span className="text-slate-600 text-xs">{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium mb-2">Needs Attention:</p>
                      <div className="space-y-1">
                        {course.contentEffectiveness.lessonsWithHighDrop.slice(0, 2).map((lesson, idx) => (
                          <div key={idx} className="flex items-center">
                            <AlertTriangle className="h-3 w-3 text-amber-500 mr-2" />
                            <span className="text-slate-600 text-xs">{lesson}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Time Analytics Quick View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-purple-500" />
              Activity Patterns
            </CardTitle>
            <CardDescription>
              When your students are most active
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-slate-700 mb-3">Peak Activity Hours</h4>
                <div className="space-y-2">
                  {data.timeAnalytics.peakActivityHours.slice(0, 3).map((peak, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        {peak.hour}:00 - {peak.hour + 1}:00
                      </span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-slate-200 rounded-full mr-3 overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${(peak.activityCount / 50) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {peak.activityCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-700 mb-3">Weekly Engagement Trend</h4>
                <div className="space-y-2">
                  {data.timeAnalytics.weeklyEngagement.map((week, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{week.week}</span>
                      <div className="flex items-center">
                        <div className="w-20 h-2 bg-slate-200 rounded-full mr-3 overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${week.engagement}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-800">
                          {week.engagement}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}