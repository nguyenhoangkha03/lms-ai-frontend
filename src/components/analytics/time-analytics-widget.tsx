'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Calendar,
  TrendingUp,
  BarChart3,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TimeAnalyticsData {
  dailyStudyTime: { date: string; minutes: number }[];
  weeklyProgress: { week: string; progress: number }[];
  monthlyComparison: { month: string; hours: number; courses: number }[];
  studyPatterns: {
    mostActiveDay: string;
    mostActiveHour: number;
    averageSessionLength: number;
    preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
  };
}

interface TimeAnalyticsWidgetProps {
  data?: TimeAnalyticsData;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

const timeOfDayIcons = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

const timeOfDayColors = {
  morning: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  afternoon: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  evening: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  night: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
};

export const TimeAnalyticsWidget: React.FC<TimeAnalyticsWidgetProps> = ({
  data,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Analytics</span>
          </CardTitle>
          <CardDescription>
            Analyze your study time patterns and habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 rounded bg-muted" />
              ))}
            </div>
            <div className="h-64 rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('minutes') || entry.name === 'Study Time'
                ? ' min'
                : entry.name.includes('hours') || entry.name === 'Study Hours'
                  ? 'h'
                  : entry.name.includes('Progress')
                    ? '%'
                    : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate total study time for the period
  const totalMinutes = data.dailyStudyTime.reduce(
    (sum, day) => sum + day.minutes,
    0
  );
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const averageDailyMinutes = Math.round(
    totalMinutes / data.dailyStudyTime.length
  );

  // Calculate consistency (days with study time)
  const activeDays = data.dailyStudyTime.filter(day => day.minutes > 0).length;
  const consistencyRate = Math.round(
    (activeDays / data.dailyStudyTime.length) * 100
  );

  // Prepare hourly distribution data (mock data for demonstration)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    minutes: Math.random() * 60, // This should come from real data
    isActive: hour >= 6 && hour <= 23,
  }));

  // Day of week distribution (mock data)
  const weeklyData = [
    { day: 'Mon', minutes: 120 },
    { day: 'Tue', minutes: 90 },
    { day: 'Wed', minutes: 150 },
    { day: 'Thu', minutes: 110 },
    { day: 'Fri', minutes: 80 },
    { day: 'Sat', minutes: 200 },
    { day: 'Sun', minutes: 180 },
  ];

  const PreferredTimeIcon =
    timeOfDayIcons[data.studyPatterns.preferredStudyTime];

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-blue-500" />
            <p className="text-lg font-bold">{totalHours}h</p>
            <p className="text-xs text-muted-foreground">Total Study Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="mx-auto mb-2 h-6 w-6 text-green-500" />
            <p className="text-lg font-bold">{averageDailyMinutes}m</p>
            <p className="text-xs text-muted-foreground">Daily Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="mx-auto mb-2 h-6 w-6 text-purple-500" />
            <p className="text-lg font-bold">{consistencyRate}%</p>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent
            className={`rounded-lg p-4 text-center ${timeOfDayColors[data.studyPatterns.preferredStudyTime]}`}
          >
            <PreferredTimeIcon className="mx-auto mb-2 h-6 w-6" />
            <p className="text-lg font-bold capitalize">
              {data.studyPatterns.preferredStudyTime}
            </p>
            <p className="text-xs opacity-75">Best Time</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Study Patterns Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Study Patterns</span>
            </CardTitle>
            <CardDescription>
              Your learning habits and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Most Active Day</span>
                  <Badge variant="secondary">
                    {data.studyPatterns.mostActiveDay}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Peak Hour</span>
                  <Badge variant="outline">
                    {data.studyPatterns.mostActiveHour}:00
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avg Session</span>
                  <span className="text-sm font-semibold">
                    {Math.round(data.studyPatterns.averageSessionLength)} min
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Days</span>
                  <span className="text-sm font-semibold">
                    {activeDays}/{data.dailyStudyTime.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="mb-2 text-sm font-medium">
                  Consistency Score
                </div>
                <Progress value={consistencyRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {consistencyRate >= 80
                    ? 'Excellent consistency!'
                    : consistencyRate >= 60
                      ? 'Good consistency'
                      : consistencyRate >= 40
                        ? 'Moderate consistency'
                        : 'Room for improvement'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Time Analytics</span>
            </CardTitle>
            <CardDescription>
              Detailed breakdown of your study time patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="daily">Daily Trend</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Pattern</TabsTrigger>
                <TabsTrigger value="hourly">Hourly Distribution</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.dailyStudyTime.slice(-14)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                      />
                      <YAxis
                        label={{
                          value: 'Minutes',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        name="Study Time"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Daily Trend Tab */}
              <TabsContent value="daily" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyStudyTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                      />
                      <YAxis
                        label={{
                          value: 'Minutes',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                        name="Study Time"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Weekly Pattern Tab */}
              <TabsContent value="weekly" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis
                        label={{
                          value: 'Minutes',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="minutes"
                        fill="#82ca9d"
                        name="Study Time"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Hourly Distribution Tab */}
              <TabsContent value="hourly" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="hour"
                        interval={2}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis
                        label={{
                          value: 'Minutes',
                          angle: -90,
                          position: 'insideLeft',
                        }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="minutes"
                        fill="#8884d8"
                        name="Study Time"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Peak Hours Summary */}
                <div className="mt-4 rounded-lg bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">Peak Study Hours</h4>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="text-center">
                      <Sunrise className="mx-auto mb-1 h-4 w-4 text-yellow-500" />
                      <p className="text-xs text-muted-foreground">Morning</p>
                      <p className="text-sm font-semibold">6-12 AM</p>
                    </div>
                    <div className="text-center">
                      <Sun className="mx-auto mb-1 h-4 w-4 text-orange-500" />
                      <p className="text-xs text-muted-foreground">Afternoon</p>
                      <p className="text-sm font-semibold">12-6 PM</p>
                    </div>
                    <div className="text-center">
                      <Sunset className="mx-auto mb-1 h-4 w-4 text-purple-500" />
                      <p className="text-xs text-muted-foreground">Evening</p>
                      <p className="text-sm font-semibold">6-10 PM</p>
                    </div>
                    <div className="text-center">
                      <Moon className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                      <p className="text-xs text-muted-foreground">Night</p>
                      <p className="text-sm font-semibold">10-12 AM</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Comparison */}
      {data.monthlyComparison && data.monthlyComparison.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Monthly Comparison</span>
              </CardTitle>
              <CardDescription>
                Compare your study hours and course completion across months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      yAxisId="left"
                      label={{
                        value: 'Hours',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{
                        value: 'Courses',
                        angle: 90,
                        position: 'insideRight',
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      yAxisId="left"
                      dataKey="hours"
                      fill="#8884d8"
                      name="Study Hours"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="courses"
                      fill="#82ca9d"
                      name="Courses Completed"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Study Habits Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Study Habits Insights</CardTitle>
            <CardDescription>
              AI-powered insights about your learning patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Habit Analysis */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">
                    Positive Patterns
                  </h4>
                  <ul className="space-y-2">
                    {consistencyRate >= 70 && (
                      <li className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                        <span className="text-sm">
                          Excellent study consistency
                        </span>
                      </li>
                    )}
                    {data.studyPatterns.averageSessionLength >= 45 && (
                      <li className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                        <span className="text-sm">
                          Good session duration for deep learning
                        </span>
                      </li>
                    )}
                    {totalHours >= 10 && (
                      <li className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500" />
                        <span className="text-sm">
                          Strong time commitment to learning
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-orange-600">
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {consistencyRate < 50 && (
                      <li className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                        <span className="text-sm">
                          Try to study more consistently
                        </span>
                      </li>
                    )}
                    {data.studyPatterns.averageSessionLength < 30 && (
                      <li className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                        <span className="text-sm">
                          Consider longer study sessions for better retention
                        </span>
                      </li>
                    )}
                    {averageDailyMinutes < 30 && (
                      <li className="flex items-start space-x-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-500" />
                        <span className="text-sm">
                          Increase daily study time for better progress
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-400">
                  Personalized Recommendations
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Your peak performance time is{' '}
                      {data.studyPatterns.preferredStudyTime}. Schedule
                      important study sessions during this period.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {data.studyPatterns.mostActiveDay} is your most productive
                      day. Consider tackling challenging topics on this day.
                    </span>
                  </div>
                  {consistencyRate < 70 && (
                    <div className="flex items-start space-x-2">
                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Set a daily minimum study time of 30 minutes to improve
                        consistency.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
