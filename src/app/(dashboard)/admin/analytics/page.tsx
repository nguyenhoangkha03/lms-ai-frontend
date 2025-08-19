'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Activity,
  Eye,
  Clock,
  Award,
  RefreshCw,
  Download,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data - in real implementation, this would come from API
  const analyticsData = {
    overview: {
      totalUsers: 12450,
      userGrowth: 8.5,
      totalCourses: 245,
      courseGrowth: 12.3,
      totalRevenue: 142800,
      revenueGrowth: 15.7,
      avgEngagement: 78.5,
      engagementChange: 5.2,
    },
    userAnalytics: {
      activeUsers: {
        daily: 2890,
        weekly: 8420,
        monthly: 12450,
      },
      userTypes: {
        students: 11200,
        teachers: 1180,
        admins: 70,
      },
      retention: {
        day1: 85,
        day7: 67,
        day30: 42,
      },
    },
    courseAnalytics: {
      topCourses: [
        { title: 'JavaScript Fundamentals', enrollments: 1250, completion: 78 },
        { title: 'React Development', enrollments: 980, completion: 82 },
        { title: 'Node.js Backend', enrollments: 756, completion: 71 },
        { title: 'Database Design', enrollments: 642, completion: 69 },
      ],
      completionRates: {
        overall: 74.5,
        technology: 76.2,
        business: 71.8,
        design: 78.9,
      },
    },
    revenueAnalytics: {
      monthlyRevenue: [
        { month: 'Jan', amount: 125000 },
        { month: 'Feb', amount: 132000 },
        { month: 'Mar', amount: 128000 },
        { month: 'Apr', amount: 145000 },
        { month: 'May', amount: 152000 },
        { month: 'Jun', amount: 142800 },
      ],
      subscriptionTypes: {
        premium: 45,
        standard: 35,
        basic: 20,
      },
    },
  };

  const getChangeIcon = (value: number) => {
    return value > 0 ? TrendingUp : TrendingDown;
  };

  const getChangeColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access analytics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Business intelligence and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                <div className={cn('flex items-center text-xs', getChangeColor(analyticsData.overview.userGrowth))}>
                  {React.createElement(getChangeIcon(analyticsData.overview.userGrowth), { className: 'mr-1 h-3 w-3' })}
                  {Math.abs(analyticsData.overview.userGrowth)}%
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalCourses}</p>
                <div className={cn('flex items-center text-xs', getChangeColor(analyticsData.overview.courseGrowth))}>
                  {React.createElement(getChangeIcon(analyticsData.overview.courseGrowth), { className: 'mr-1 h-3 w-3' })}
                  {Math.abs(analyticsData.overview.courseGrowth)}%
                </div>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">${analyticsData.overview.totalRevenue.toLocaleString()}</p>
                <div className={cn('flex items-center text-xs', getChangeColor(analyticsData.overview.revenueGrowth))}>
                  {React.createElement(getChangeIcon(analyticsData.overview.revenueGrowth), { className: 'mr-1 h-3 w-3' })}
                  {Math.abs(analyticsData.overview.revenueGrowth)}%
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Engagement</p>
                <p className="text-2xl font-bold">{analyticsData.overview.avgEngagement}%</p>
                <div className={cn('flex items-center text-xs', getChangeColor(analyticsData.overview.engagementChange))}>
                  {React.createElement(getChangeIcon(analyticsData.overview.engagementChange), { className: 'mr-1 h-3 w-3' })}
                  {Math.abs(analyticsData.overview.engagementChange)}%
                </div>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Daily Active</span>
                    <span className="font-medium">{analyticsData.userAnalytics.activeUsers.daily.toLocaleString()}</span>
                  </div>
                  <Progress value={75} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Weekly Active</span>
                    <span className="font-medium">{analyticsData.userAnalytics.activeUsers.weekly.toLocaleString()}</span>
                  </div>
                  <Progress value={85} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Monthly Active</span>
                    <span className="font-medium">{analyticsData.userAnalytics.activeUsers.monthly.toLocaleString()}</span>
                  </div>
                  <Progress value={95} className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  User Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Students</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.userAnalytics.userTypes.students.toLocaleString()}</span>
                    <Badge variant="secondary">90%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Teachers</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.userAnalytics.userTypes.teachers.toLocaleString()}</span>
                    <Badge variant="secondary">9.5%</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Admins</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{analyticsData.userAnalytics.userTypes.admins}</span>
                    <Badge variant="secondary">0.5%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  User Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Day 1 Retention</span>
                    <span className="font-medium">{analyticsData.userAnalytics.retention.day1}%</span>
                  </div>
                  <Progress value={analyticsData.userAnalytics.retention.day1} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Day 7 Retention</span>
                    <span className="font-medium">{analyticsData.userAnalytics.retention.day7}%</span>
                  </div>
                  <Progress value={analyticsData.userAnalytics.retention.day7} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Day 30 Retention</span>
                    <span className="font-medium">{analyticsData.userAnalytics.retention.day30}%</span>
                  </div>
                  <Progress value={analyticsData.userAnalytics.retention.day30} className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Top Performing Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.courseAnalytics.topCourses.map((course, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{course.title}</span>
                        <span className="text-sm text-muted-foreground">{course.enrollments} students</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Completion Rate</span>
                        <span>{course.completion}%</span>
                      </div>
                      <Progress value={course.completion} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Completion Rates by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Overall</span>
                    <span className="font-medium">{analyticsData.courseAnalytics.completionRates.overall}%</span>
                  </div>
                  <Progress value={analyticsData.courseAnalytics.completionRates.overall} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Technology</span>
                    <span className="font-medium">{analyticsData.courseAnalytics.completionRates.technology}%</span>
                  </div>
                  <Progress value={analyticsData.courseAnalytics.completionRates.technology} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Business</span>
                    <span className="font-medium">{analyticsData.courseAnalytics.completionRates.business}%</span>
                  </div>
                  <Progress value={analyticsData.courseAnalytics.completionRates.business} className="mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Design</span>
                    <span className="font-medium">{analyticsData.courseAnalytics.completionRates.design}%</span>
                  </div>
                  <Progress value={analyticsData.courseAnalytics.completionRates.design} className="mt-1" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.revenueAnalytics.monthlyRevenue.map((data, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{data.month}</span>
                    <span className="text-sm">${data.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Engagement metrics coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}