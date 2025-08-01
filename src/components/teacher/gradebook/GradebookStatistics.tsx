'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Award, AlertTriangle, Target } from 'lucide-react';

interface GradebookStatisticsProps {
  gradebook: any;
  statistics: any;
  students: any[];
  assessments: any[];
  grades: any[];
}

export function GradebookStatistics({
  gradebook,
  statistics,
  students,
  assessments,
  grades,
}: GradebookStatisticsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Mock statistical data - in real implementation, this would be calculated from actual data
  const statsData = {
    overview: {
      classAverage: gradebook?.classAverage || 82.5,
      median: 85.0,
      standardDeviation: 12.3,
      passingRate: 89.2,
      totalStudents: students?.length || 0,
      totalAssessments: assessments?.length || 0,
    },
    distribution: [
      { range: '90-100', count: 45, percentage: 20.5, color: '#22c55e' },
      { range: '80-89', count: 78, percentage: 35.5, color: '#3b82f6' },
      { range: '70-79', count: 55, percentage: 25.0, color: '#f59e0b' },
      { range: '60-69', count: 32, percentage: 14.5, color: '#f97316' },
      { range: '50-59', count: 8, percentage: 3.6, color: '#ef4444' },
      { range: '0-49', count: 2, percentage: 0.9, color: '#dc2626' },
    ],
    trends: [
      { week: 'Week 1', average: 75.2, submissions: 45 },
      { week: 'Week 2', average: 78.1, submissions: 52 },
      { week: 'Week 3', average: 81.5, submissions: 48 },
      { week: 'Week 4', average: 82.5, submissions: 55 },
      { week: 'Week 5', average: 84.2, submissions: 45 },
    ],
    assessmentPerformance:
      assessments?.map((assessment, index) => ({
        name: assessment.title,
        average: 75 + index * 5,
        submissions: assessment.submissionCount || 0,
        difficulty:
          index % 3 === 0 ? 'Hard' : index % 2 === 0 ? 'Medium' : 'Easy',
      })) || [],
    studentSegments: [
      { segment: 'Excelling', count: 45, percentage: 20.5 },
      { segment: 'On Track', count: 120, percentage: 54.5 },
      { segment: 'At Risk', count: 35, percentage: 15.9 },
      { segment: 'Struggling', count: 20, percentage: 9.1 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.overview.classAverage}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +2.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Median Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.overview.median}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              Standard Dev: {statsData.overview.standardDeviation}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.overview.passingRate}%
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +1.2% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              At Risk Students
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsData.studentSegments.find(s => s.segment === 'At Risk')
                ?.count || 0}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {
                statsData.studentSegments.find(s => s.segment === 'At Risk')
                  ?.percentage
              }
              % of class
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="assessments">Assessment Analysis</TabsTrigger>
          <TabsTrigger value="students">Student Segments</TabsTrigger>
        </TabsList>

        {/* Score Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statsData.distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statsData.distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percentage }) =>
                        `${range}: ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statsData.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statsData.distribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.range}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Progress value={item.percentage} className="w-24" />
                      <span className="w-16 text-sm text-muted-foreground">
                        {item.count} students
                      </span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Trends */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={statsData.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assessment Analysis */}
        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={statsData.assessmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {statsData.assessmentPerformance.map((assessment, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-medium">{assessment.name}</h4>
                    <Badge variant="outline">{assessment.difficulty}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Score:</span>
                      <span className="font-medium">{assessment.average}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Submissions:</span>
                      <span className="font-medium">
                        {assessment.submissions}
                      </span>
                    </div>
                    <Progress value={assessment.average} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Student Segments */}
        <TabsContent value="students" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Student Performance Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statsData.studentSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ segment, percentage }) =>
                        `${segment}: ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {statsData.studentSegments.map((entry, index) => {
                        const colors = [
                          '#22c55e',
                          '#3b82f6',
                          '#f59e0b',
                          '#ef4444',
                        ];
                        return (
                          <Cell key={`cell-${index}`} fill={colors[index]} />
                        );
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Segment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statsData.studentSegments.map((segment, index) => {
                    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
                    const icons = [Award, Users, AlertTriangle, AlertTriangle];
                    const Icon = icons[index];

                    return (
                      <div key={index} className="flex items-center gap-3">
                        <Icon
                          className="h-5 w-5"
                          style={{ color: colors[index] }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {segment.segment}
                            </span>
                            <Badge variant="outline">
                              {segment.count} ({segment.percentage}%)
                            </Badge>
                          </div>
                          <Progress
                            value={segment.percentage}
                            className="mt-1 h-2"
                            style={
                              {
                                '--progress-background': colors[index],
                              } as React.CSSProperties
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <h4 className="mb-1 font-medium text-green-800 dark:text-green-300">
                    Excelling Students (20.5%)
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Consider providing advanced challenges or peer tutoring
                    opportunities.
                  </p>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                  <h4 className="mb-1 font-medium text-yellow-800 dark:text-yellow-300">
                    At Risk Students (15.9%)
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Schedule one-on-one meetings and provide additional support
                    resources.
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                  <h4 className="mb-1 font-medium text-red-800 dark:text-red-300">
                    Struggling Students (9.1%)
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Immediate intervention required. Consider tutoring programs
                    or modified assignments.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
