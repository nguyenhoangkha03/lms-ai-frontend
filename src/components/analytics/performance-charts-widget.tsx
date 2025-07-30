'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart3, Activity, Calendar } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PerformanceAnalytics } from '@/lib/redux/api/student-analytics-api';

interface PerformanceChartsWidgetProps {
  data?: PerformanceAnalytics;
  timeFilter: string;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export const PerformanceChartsWidget: React.FC<
  PerformanceChartsWidgetProps
> = ({ data, timeFilter }) => {
  const [activeChart, setActiveChart] = useState('progress');

  if (!data) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="mb-2 h-6 w-48 rounded bg-muted" />
                <div className="h-4 w-64 rounded bg-muted" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-64 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Prepare course performance data for pie chart
  const coursePerformanceData = data.coursePerformance.map((course, index) => ({
    name:
      course.courseName.length > 20
        ? course.courseName.substring(0, 20) + '...'
        : course.courseName,
    value: course.progress,
    fullName: course.courseName,
    timeSpent: course.timeSpent,
    averageScore: course.averageScore,
    color: COLORS[index % COLORS.length],
  }));

  // Prepare skill assessment data
  const skillData = data.skillAssessment.map((skill, index) => ({
    name: skill.skillName,
    mastery: skill.masteryPercentage,
    level: skill.currentLevel,
    progress: skill.recentProgress,
    color: COLORS[index % COLORS.length],
  }));

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name.includes('Score') || entry.name.includes('Progress')
                ? '%'
                : entry.name.includes('Time')
                  ? 'h'
                  : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <p className="font-semibold">{data.fullName}</p>
          <p>Progress: {data.value}%</p>
          <p>Time Spent: {data.timeSpent}h</p>
          <p>Avg Score: {data.averageScore}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Time Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Study Time Trends</span>
            </CardTitle>
            <CardDescription>
              Daily study time over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeAnalytics.dailyStudyTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={value =>
                      new Date(value).toLocaleDateString()
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                    name="Study Time (min)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Charts Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Performance Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeChart} onValueChange={setActiveChart}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="progress">Course Progress</TabsTrigger>
                <TabsTrigger value="skills">Skills Mastery</TabsTrigger>
                <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
                <TabsTrigger value="comparison">Monthly Comparison</TabsTrigger>
              </TabsList>

              {/* Course Progress Pie Chart */}
              <TabsContent value="progress" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={coursePerformanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {coursePerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {coursePerformanceData.map((course, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <div
                        className="mr-2 h-2 w-2 rounded-full"
                        style={{ backgroundColor: course.color }}
                      />
                      {course.name}
                    </Badge>
                  ))}
                </div>
              </TabsContent>

              {/* Skills Mastery Bar Chart */}
              <TabsContent value="skills" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={skillData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="mastery"
                        fill="#8884d8"
                        name="Mastery %"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Weekly Progress Line Chart */}
              <TabsContent value="weekly" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeAnalytics.weeklyProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={{ fill: '#8884d8' }}
                        name="Progress %"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Monthly Comparison */}
              <TabsContent value="comparison" className="mt-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.timeAnalytics.monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
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
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Learning Insights</span>
            </CardTitle>
            <CardDescription>
              Key findings from your performance data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Strengths */}
              <div className="space-y-3">
                <h4 className="flex items-center space-x-2 font-semibold text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Strengths</span>
                </h4>
                <div className="space-y-2">
                  {data.learningInsights.strengths.map((strength, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="mb-2 mr-2"
                    >
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Improvement Areas */}
              <div className="space-y-3">
                <h4 className="flex items-center space-x-2 font-semibold text-orange-600">
                  <Activity className="h-4 w-4" />
                  <span>Areas for Improvement</span>
                </h4>
                <div className="space-y-2">
                  {data.learningInsights.improvementAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="mb-2 mr-2">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 space-y-3">
              <h4 className="flex items-center space-x-2 font-semibold text-blue-600">
                <Calendar className="h-4 w-4" />
                <span>Study Recommendations</span>
              </h4>
              <ul className="space-y-2">
                {data.learningInsights.studyRecommendations.map(
                  (recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
                      <span className="text-sm">{recommendation}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
