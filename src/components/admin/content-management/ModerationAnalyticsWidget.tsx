'use client';

import React, { useState } from 'react';
import {
  Clock,
  Check,
  X,
  Flag,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ModerationAnalyticsWidgetProps {
  className?: string;
}

const ModerationAnalyticsWidget: React.FC<ModerationAnalyticsWidgetProps> = ({
  className,
}) => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data - in real implementation, this would come from API
  const moderationStats = {
    totalItems: 1247,
    pendingItems: 89,
    approvedItems: 1024,
    rejectedItems: 97,
    flaggedItems: 37,
    averageResponseTime: 2.4, // hours
    approvalRate: 82.1, // percentage
    moderatorCount: 12,
    todayProcessed: 156,
    weeklyGrowth: 12.5,
  };

  const moderationTrend = [
    { date: '2024-01-01', pending: 45, approved: 89, rejected: 12, flagged: 8 },
    { date: '2024-01-02', pending: 52, approved: 94, rejected: 15, flagged: 6 },
    {
      date: '2024-01-03',
      pending: 38,
      approved: 112,
      rejected: 18,
      flagged: 9,
    },
    {
      date: '2024-01-04',
      pending: 67,
      approved: 98,
      rejected: 22,
      flagged: 11,
    },
    {
      date: '2024-01-05',
      pending: 71,
      approved: 105,
      rejected: 19,
      flagged: 7,
    },
    {
      date: '2024-01-06',
      pending: 59,
      approved: 118,
      rejected: 16,
      flagged: 12,
    },
    {
      date: '2024-01-07',
      pending: 89,
      approved: 124,
      rejected: 21,
      flagged: 13,
    },
  ];

  const contentTypeDistribution = [
    { name: 'Courses', value: 45, color: '#8884d8' },
    { name: 'Lessons', value: 32, color: '#82ca9d' },
    { name: 'Forum Posts', value: 18, color: '#ffc658' },
    { name: 'Comments', value: 5, color: '#ff7c7c' },
  ];

  const moderatorPerformance = [
    { name: 'Admin 1', processed: 156, avgTime: 1.8, approvalRate: 87 },
    { name: 'Admin 2', processed: 142, avgTime: 2.1, approvalRate: 91 },
    { name: 'Admin 3', processed: 134, avgTime: 2.3, approvalRate: 85 },
    { name: 'Admin 4', processed: 128, avgTime: 1.9, approvalRate: 89 },
    { name: 'Admin 5', processed: 119, avgTime: 2.7, approvalRate: 83 },
  ];

  const responseTimeData = [
    { timeRange: '0-1h', count: 245 },
    { timeRange: '1-2h', count: 389 },
    { timeRange: '2-4h', count: 287 },
    { timeRange: '4-8h', count: 156 },
    { timeRange: '8-24h', count: 98 },
    { timeRange: '24h+', count: 72 },
  ];

  const getStatCard = (
    title: string,
    value: string | number,
    icon: React.ComponentType<{ className?: string }>,
    change?: number,
    changeLabel?: string,
    color?: string
  ) => {
    const IconComponent = icon;
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <div className="mt-1 flex items-center gap-1">
                  {change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {Math.abs(change)}% {changeLabel}
                  </span>
                </div>
              )}
            </div>
            <div className={`rounded-lg p-2 ${color || 'bg-muted'}`}>
              <IconComponent
                className={`h-5 w-5 ${color ? 'text-white' : 'text-muted-foreground'}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Moderation Analytics</h3>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {getStatCard(
            'Pending Review',
            moderationStats.pendingItems,
            Clock,
            5.2,
            'from yesterday',
            'bg-yellow-500'
          )}

          {getStatCard(
            'Approved Today',
            moderationStats.todayProcessed,
            Check,
            12.3,
            'from yesterday',
            'bg-green-500'
          )}

          {getStatCard(
            'Approval Rate',
            `${moderationStats.approvalRate}%`,
            TrendingUp,
            2.1,
            'this week',
            'bg-blue-500'
          )}

          {getStatCard(
            'Avg Response Time',
            `${moderationStats.averageResponseTime}h`,
            Activity,
            -8.5,
            'improvement',
            'bg-purple-500'
          )}
        </div>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="content">Content Types</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="response">Response Times</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Activity Trends</CardTitle>
              <CardDescription>
                Daily moderation activity over the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moderationTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={value =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={value =>
                        new Date(value).toLocaleDateString()
                      }
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="approved"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      name="Approved"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      name="Pending"
                    />
                    <Area
                      type="monotone"
                      dataKey="rejected"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      name="Rejected"
                    />
                    <Area
                      type="monotone"
                      dataKey="flagged"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      name="Flagged"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Content Type Distribution</CardTitle>
                <CardDescription>
                  Breakdown of content types being moderated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={contentTypeDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent! * 100).toFixed(0)}%`
                        }
                      >
                        {contentTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Status Summary</CardTitle>
                <CardDescription>
                  Current status of all moderated content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={82.1} className="w-20" />
                      <span className="text-sm font-medium">
                        {moderationStats.approvedItems}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={7.1} className="w-20" />
                      <span className="text-sm font-medium">
                        {moderationStats.pendingItems}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={7.8} className="w-20" />
                      <span className="text-sm font-medium">
                        {moderationStats.rejectedItems}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Flagged</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={3.0} className="w-20" />
                      <span className="text-sm font-medium">
                        {moderationStats.flaggedItems}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderator Performance</CardTitle>
              <CardDescription>
                Performance metrics for individual moderators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moderatorPerformance.map((moderator, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{moderator.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {moderator.processed} items processed
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {moderator.avgTime}h
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Time
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium">
                          {moderator.approvalRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Approval Rate
                        </div>
                      </div>

                      <Badge
                        variant={
                          moderator.approvalRate > 85 ? 'default' : 'secondary'
                        }
                      >
                        {moderator.approvalRate > 85 ? 'Excellent' : 'Good'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
              <CardDescription>
                How quickly content is being moderated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeRange" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">64%</div>
                <div className="text-sm text-muted-foreground">
                  Within 2 hours
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">23%</div>
                <div className="text-sm text-muted-foreground">2-8 hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">13%</div>
                <div className="text-sm text-muted-foreground">
                  Over 8 hours
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationAnalyticsWidget;
