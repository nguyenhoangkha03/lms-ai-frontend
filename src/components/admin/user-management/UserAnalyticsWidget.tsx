'use client';

import React, { useState } from 'react';
import { Users, Globe } from 'lucide-react';
import { useGetUserStatsQuery } from '@/lib/redux/api/user-management-api';
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

interface UserAnalyticsWidgetProps {
  className?: string;
}

export const UserAnalyticsWidget: React.FC<UserAnalyticsWidgetProps> = ({
  className,
}) => {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: userStats, isLoading } = useGetUserStatsQuery();

  if (isLoading || !userStats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-2 w-full rounded bg-muted"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const userGrowthData = [
    { name: 'Jan', users: 1200, newUsers: 120 },
    { name: 'Feb', users: 1350, newUsers: 150 },
    { name: 'Mar', users: 1520, newUsers: 170 },
    { name: 'Apr', users: 1680, newUsers: 160 },
    { name: 'May', users: 1850, newUsers: 170 },
    { name: 'Jun', users: 2020, newUsers: 170 },
  ];

  const userTypeData = [
    {
      name: 'Students',
      value: userStats.userTypeDistribution.students,
      color: '#8884d8',
    },
    {
      name: 'Teachers',
      value: userStats.userTypeDistribution.teachers,
      color: '#82ca9d',
    },
    {
      name: 'Admins',
      value: userStats.userTypeDistribution.admins,
      color: '#ffc658',
    },
  ];

  const deviceData = [
    {
      name: 'Desktop',
      value: userStats.deviceAnalytics.desktop,
      color: '#8884d8',
    },
    {
      name: 'Mobile',
      value: userStats.deviceAnalytics.mobile,
      color: '#82ca9d',
    },
    {
      name: 'Tablet',
      value: userStats.deviceAnalytics.tablet,
      color: '#ffc658',
    },
  ];

  const engagementData = [
    {
      name: 'Daily Active',
      value: userStats.engagementMetrics.dailyActiveUsers,
    },
    {
      name: 'Weekly Active',
      value: userStats.engagementMetrics.weeklyActiveUsers,
    },
    {
      name: 'Monthly Active',
      value: userStats.engagementMetrics.monthlyActiveUsers,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Analytics
            </CardTitle>
            <CardDescription>
              Comprehensive user behavior and growth analytics
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 days</SelectItem>
              <SelectItem value="30d">30 days</SelectItem>
              <SelectItem value="90d">90 days</SelectItem>
              <SelectItem value="1y">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Users</span>
                  <Badge variant="outline">
                    +{userStats.userGrowth.monthly}%
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {userStats.totalUsers.toLocaleString()}
                </div>
                <Progress
                  value={(userStats.activeUsers / userStats.totalUsers) * 100}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  {userStats.activeUsers.toLocaleString()} active users
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Users</span>
                  <Badge variant="outline">
                    +{userStats.userGrowth.weekly}%
                  </Badge>
                </div>
                <div className="text-2xl font-bold">
                  {userStats.newUsers.toLocaleString()}
                </div>
                <Progress
                  value={userStats.userGrowth.daily > 0 ? 75 : 25}
                  className="h-2"
                />
                <div className="text-xs text-muted-foreground">
                  +{userStats.userGrowth.daily}% today
                </div>
              </div>
            </div>

            {/* User Type Distribution */}
            <div>
              <h4 className="mb-3 font-medium">User Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent! * 100).toFixed(0)}%`
                      }
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="growth" className="space-y-4">
            <div>
              <h4 className="mb-3 font-medium">User Growth Trend</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke="#8884d8"
                      fill="#8884d8"
                      name="Total Users"
                    />
                    <Area
                      type="monotone"
                      dataKey="newUsers"
                      stackId="2"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      name="New Users"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  +{userStats.userGrowth.daily}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Daily Growth
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  +{userStats.userGrowth.weekly}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Weekly Growth
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  +{userStats.userGrowth.monthly}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Monthly Growth
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div>
              <h4 className="mb-3 font-medium">User Engagement</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Session Duration</span>
                <span className="font-medium">
                  {Math.round(
                    userStats.engagementMetrics.averageSessionDuration / 60
                  )}{' '}
                  min
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Daily Active Users</span>
                <span className="font-medium">
                  {userStats.engagementMetrics.dailyActiveUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Weekly Active Users</span>
                <span className="font-medium">
                  {userStats.engagementMetrics.weeklyActiveUsers.toLocaleString()}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            <div>
              <h4 className="mb-3 font-medium">Device Usage</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent! * 100).toFixed(0)}%`
                      }
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-medium">Geographic Distribution</h4>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {userStats.geographicDistribution
                  .slice(0, 10)
                  .map((country, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        <span className="text-sm">{country.country}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={
                            (country.userCount / userStats.totalUsers) * 100
                          }
                          className="h-2 w-16"
                        />
                        <span className="w-8 text-xs text-muted-foreground">
                          {country.userCount}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
