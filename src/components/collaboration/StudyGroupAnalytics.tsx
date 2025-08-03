'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Award,
  Calendar,
  Activity,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Star,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from 'recharts';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { collaborativeApi } from '@/lib/redux/api/collaborative-api';

interface StudyGroupAnalyticsProps {
  groupId: string;
  canView: boolean;
}

interface AnalyticsData {
  overview: {
    totalMembers: number;
    activeMembers: number;
    totalSessions: number;
    totalNotes: number;
    totalProjects: number;
    avgRating: number;
    engagementRate: number;
    growthRate: number;
  };
  activityTrend: Array<{
    date: string;
    sessions: number;
    notes: number;
    messages: number;
    activeUsers: number;
  }>;
  memberContributions: Array<{
    id: string;
    name: string;
    avatar?: string;
    contributionScore: number;
    notesCreated: number;
    projectsCompleted: number;
    sessionsAttended: number;
    lastActive: string;
  }>;
  projectProgress: Array<{
    id: string;
    name: string;
    progress: number;
    status: string;
    dueDate: string;
    memberCount: number;
  }>;
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    avgSessionDuration: number;
    messagesSent: number;
    notesShared: number;
  };
  learningOutcomes: Array<{
    goal: string;
    progress: number;
    completedBy: number;
    totalMembers: number;
  }>;
}

export function StudyGroupAnalytics({
  groupId,
  canView,
}: StudyGroupAnalyticsProps) {
  const dispatch = useAppDispatch();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'custom'>(
    '30d'
  );
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'members' | 'projects'
  >('overview');

  // RTK Query hooks
  const {
    data: analyticsData,
    isLoading,
    refetch,
  } = collaborativeApi.useGetStudyGroupAnalyticsQuery({
    groupId,
    timeRange,
    dateFrom: customDateFrom?.toISOString(),
    dateTo: customDateTo?.toISOString(),
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const exportAnalytics = () => {
    // Create and download analytics report
    const reportData = {
      groupId,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analyticsData,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `study-group-analytics-${groupId}-${timeRange}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Eye className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium">Access Restricted</h3>
          <p className="text-gray-600">
            You don't have permission to view group analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 rounded bg-gray-200"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-2xl font-bold">Group Analytics</h2>
          <p className="text-gray-600">
            Track engagement, progress, and collaboration metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={timeRange}
            onValueChange={value => setTimeRange(value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {timeRange === 'custom' && (
            <>
              <DatePicker
                date={customDateFrom}
                onDateChange={setCustomDateFrom}
                placeholder="From"
              />
              <DatePicker
                date={customDateTo}
                onDateChange={setCustomDateTo}
                placeholder="To"
                minDate={customDateFrom}
              />
            </>
          )}

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={exportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Members
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData?.overview.totalMembers || 0}
                    </p>
                    <p className="text-xs text-green-600">
                      +{analyticsData?.overview.growthRate || 0}% this period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Members
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData?.overview.activeMembers || 0}
                    </p>
                    <p className="text-xs text-blue-600">
                      {analyticsData?.overview.engagementRate || 0}% engagement
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Sessions
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData?.overview.totalSessions || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {analyticsData?.engagementMetrics.avgSessionDuration || 0}
                      min avg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-yellow-100 p-2">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Avg Rating
                    </p>
                    <p className="text-2xl font-bold">
                      {analyticsData?.overview.avgRating || 0}
                    </p>
                    <p className="text-xs text-gray-500">out of 5.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={analyticsData?.activityTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#8884d8"
                    name="Sessions"
                  />
                  <Line
                    type="monotone"
                    dataKey="notes"
                    stroke="#82ca9d"
                    name="Notes"
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#ffc658"
                    name="Messages"
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#ff7300"
                    name="Active Users"
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Learning Outcomes Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Learning Outcomes Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.learningOutcomes?.map(
                  (outcome: any, index: any) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{outcome.goal}</span>
                        <span>
                          {outcome.completedBy}/{outcome.totalMembers} completed
                        </span>
                      </div>
                      <Progress value={outcome.progress} className="h-2" />
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Daily Active Users
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analyticsData?.engagementMetrics.dailyActiveUsers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Weekly Active Users
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {analyticsData?.engagementMetrics.weeklyActiveUsers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">
                    Monthly Active Users
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analyticsData?.engagementMetrics.monthlyActiveUsers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={[
                        {
                          name: 'Messages',
                          value:
                            analyticsData?.engagementMetrics.messagesSent || 0,
                        },
                        {
                          name: 'Notes',
                          value:
                            analyticsData?.engagementMetrics.notesShared || 0,
                        },
                        {
                          name: 'Sessions',
                          value: analyticsData?.overview.totalSessions || 0,
                        },
                        {
                          name: 'Projects',
                          value: analyticsData?.overview.totalProjects || 0,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }: any) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={analyticsData?.activityTrend?.slice(-7) || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#8884d8" name="Sessions" />
                    <Bar dataKey="notes" fill="#82ca9d" name="Notes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {/* Member Contributions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Member Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.memberContributions?.map(
                  (member: any, index: any) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">#{index + 1}</span>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-500">
                            Last active {formatTimeAgo(member.lastActive)}
                          </p>
                        </div>
                      </div>

                      <div className="grid flex-1 grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            {member.contributionScore}
                          </p>
                          <p className="text-xs text-gray-500">
                            Contribution Score
                          </p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">
                            {member.notesCreated}
                          </p>
                          <p className="text-xs text-gray-500">Notes Created</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">
                            {member.projectsCompleted}
                          </p>
                          <p className="text-xs text-gray-500">
                            Projects Completed
                          </p>
                        </div>
                      </div>

                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        {index < 3 ? 'Top Contributor' : 'Active Member'}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Project Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Project Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.projectProgress?.map((project: any) => (
                  <div key={project.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-500">
                          Due {new Date(project.dueDate).toLocaleDateString()} •{' '}
                          {project.memberCount} members
                        </p>
                      </div>
                      <Badge
                        className={
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
