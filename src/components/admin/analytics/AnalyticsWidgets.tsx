'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Eye,
  MousePointer,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  timeRange: '1h' | '24h' | '7d' | '30d' | '90d';
  metrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
    totalSessions: number;
    avgSessionDuration: number;
    bounceRate: number;
    pageViews: number;
    uniquePageViews: number;
    conversionRate: number;
  };
  revenue: {
    total: number;
    growth: number;
    transactions: number;
    avgOrderValue: number;
  };
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    uptime: number;
  };
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
    avgTime: number;
  }>;
  userActivity: Array<{
    hour: string;
    users: number;
    sessions: number;
  }>;
  revenueByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

interface AlertMetric {
  id: string;
  title: string;
  value: number;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  change: number;
  lastUpdated: string;
}

interface AnalyticsWidgetsProps {
  className?: string;
}

export const AnalyticsWidgets: React.FC<AnalyticsWidgetsProps> = ({
  className,
}) => {
  const [timeRange, setTimeRange] = useState<
    '1h' | '24h' | '7d' | '30d' | '90d'
  >('24h');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [alertMetrics, setAlertMetrics] = useState<AlertMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual endpoints
      const mockData: AnalyticsData = {
        timeRange,
        metrics: {
          totalUsers: 12450,
          activeUsers: 3250,
          newUsers: 89,
          userGrowth: 12.5,
          totalSessions: 8934,
          avgSessionDuration: 42.3,
          bounceRate: 28.5,
          pageViews: 45678,
          uniquePageViews: 23456,
          conversionRate: 3.4,
        },
        revenue: {
          total: 142800,
          growth: 18.7,
          transactions: 456,
          avgOrderValue: 313.16,
        },
        performance: {
          responseTime: 145,
          throughput: 1250,
          errorRate: 0.12,
          uptime: 99.98,
        },
        topPages: [
          { path: '/courses', views: 12453, uniqueViews: 8901, avgTime: 3.2 },
          { path: '/dashboard', views: 9876, uniqueViews: 7543, avgTime: 4.1 },
          { path: '/login', views: 8765, uniqueViews: 6432, avgTime: 1.8 },
          { path: '/register', views: 5432, uniqueViews: 4321, avgTime: 2.1 },
          { path: '/pricing', views: 4321, uniqueViews: 3210, avgTime: 2.8 },
        ],
        userActivity: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i.toString().padStart(2, '0')}:00`,
          users: Math.floor(Math.random() * 500) + 100,
          sessions: Math.floor(Math.random() * 300) + 50,
        })),
        revenueByDay: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          revenue: Math.floor(Math.random() * 5000) + 1000,
          orders: Math.floor(Math.random() * 50) + 10,
        })).reverse(),
      };

      const mockAlerts: AlertMetric[] = [
        {
          id: '1',
          title: 'Response Time',
          value: 145,
          threshold: 200,
          status: 'normal',
          trend: 'down',
          change: -8.3,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Error Rate',
          value: 0.12,
          threshold: 1.0,
          status: 'normal',
          trend: 'stable',
          change: 0.02,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'CPU Usage',
          value: 78,
          threshold: 80,
          status: 'warning',
          trend: 'up',
          change: 15.4,
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '4',
          title: 'Memory Usage',
          value: 92,
          threshold: 90,
          status: 'critical',
          trend: 'up',
          change: 8.7,
          lastUpdated: new Date().toISOString(),
        },
      ];

      setAnalyticsData(mockData);
      setAlertMetrics(mockAlerts);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const MetricCard = ({
    title,
    value,
    change,
    icon: Icon,
    color,
    trend,
    suffix = '',
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    suffix?: string;
  }) => {
    const TrendIcon = getTrendIcon(trend || 'stable');

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl font-bold">
                {value}
                {suffix}
              </p>
              {change !== undefined && (
                <div
                  className={cn(
                    'mt-1 flex items-center text-xs',
                    change > 0
                      ? 'text-green-600'
                      : change < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                  )}
                >
                  <TrendIcon className="mr-1 h-3 w-3" />
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            <Icon className={cn('h-8 w-8', color)} />
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading || !analyticsData) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted"></div>
                  <div className="h-8 w-1/2 rounded bg-muted"></div>
                  <div className="h-3 w-1/3 rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Real-time system analytics and metrics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={value => setTimeRange(value as typeof timeRange)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={analyticsData.metrics.totalUsers.toLocaleString()}
          change={analyticsData.metrics.userGrowth}
          icon={Users}
          color="text-blue-600"
          trend="up"
        />

        <MetricCard
          title="Active Users"
          value={analyticsData.metrics.activeUsers.toLocaleString()}
          change={15.2}
          icon={Activity}
          color="text-green-600"
          trend="up"
        />

        <MetricCard
          title="Total Revenue"
          value={`$${analyticsData.revenue.total.toLocaleString()}`}
          change={analyticsData.revenue.growth}
          icon={DollarSign}
          color="text-orange-600"
          trend="up"
        />

        <MetricCard
          title="Avg Session"
          value={analyticsData.metrics.avgSessionDuration}
          icon={Clock}
          color="text-purple-600"
          suffix="min"
        />

        <MetricCard
          title="Page Views"
          value={analyticsData.metrics.pageViews.toLocaleString()}
          change={8.4}
          icon={Eye}
          color="text-indigo-600"
          trend="up"
        />

        <MetricCard
          title="Conversion Rate"
          value={analyticsData.metrics.conversionRate}
          change={2.1}
          icon={MousePointer}
          color="text-cyan-600"
          trend="up"
          suffix="%"
        />

        <MetricCard
          title="Response Time"
          value={analyticsData.performance.responseTime}
          change={-8.3}
          icon={Zap}
          color="text-yellow-600"
          trend="down"
          suffix="ms"
        />

        <MetricCard
          title="Uptime"
          value={analyticsData.performance.uptime}
          icon={Server}
          color="text-green-600"
          suffix="%"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Performance Alerts
            </CardTitle>
            <CardDescription>
              Real-time system performance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {alertMetrics.map(alert => {
                  const TrendIcon = getTrendIcon(alert.trend);
                  const StatusIcon =
                    alert.status === 'normal' ? CheckCircle : AlertTriangle;

                  return (
                    <div key={alert.id} className="rounded-lg border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {alert.title}
                        </span>
                        <Badge
                          className={cn(
                            'text-xs',
                            getStatusColor(alert.status)
                          )}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {alert.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Current:{' '}
                          <span className="font-medium">
                            {alert.value}
                            {alert.title.includes('Rate')
                              ? '%'
                              : alert.title.includes('Time')
                                ? 'ms'
                                : ''}
                          </span>
                        </span>
                        <div
                          className={cn(
                            'flex items-center',
                            alert.change > 0 ? 'text-red-600' : 'text-green-600'
                          )}
                        >
                          <TrendIcon className="mr-1 h-3 w-3" />
                          {Math.abs(alert.change)}%
                        </div>
                      </div>

                      <Progress
                        value={(alert.value / alert.threshold) * 100}
                        className="mt-2 h-1"
                      />

                      <div className="mt-1 text-xs text-muted-foreground">
                        Threshold: {alert.threshold}
                        {alert.title.includes('Rate')
                          ? '%'
                          : alert.title.includes('Time')
                            ? 'ms'
                            : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Top Pages
            </CardTitle>
            <CardDescription>
              Most visited pages in the selected time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {analyticsData.topPages.map((page, index) => (
                  <div key={page.path} className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {page.path}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{page.views.toLocaleString()} views</span>
                        <span>{page.avgTime}min avg</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {page.uniqueViews.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        unique
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Real-time Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Real-time Activity
            </CardTitle>
            <CardDescription>
              Live user activity and system metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.performance.throughput}
                  </div>
                  <p className="text-xs text-muted-foreground">Requests/min</p>
                </div>

                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.metrics.totalSessions.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active Sessions
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Database Connections
                  </span>
                  <span className="font-medium">85/200</span>
                </div>
                <Progress value={42.5} className="h-1" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cache Hit Rate</span>
                  <span className="font-medium">94.8%</span>
                </div>
                <Progress value={94.8} className="h-1" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Error Rate</span>
                  <span className="font-medium">
                    {analyticsData.performance.errorRate}%
                  </span>
                </div>
                <Progress
                  value={analyticsData.performance.errorRate}
                  className="h-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue and Business Metrics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Revenue Metrics
            </CardTitle>
            <CardDescription>
              Financial performance and transaction data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${analyticsData.revenue.total.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <div className="mt-1 flex items-center justify-center text-xs text-green-600">
                  <TrendingUp className="mr-1 h-3 w-3" />+
                  {analyticsData.revenue.growth}%
                </div>
              </div>

              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.revenue.transactions}
                </div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <div className="mt-1 text-xs text-muted-foreground">
                  ${analyticsData.revenue.avgOrderValue.toFixed(2)} avg
                </div>
              </div>
            </div>

            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
              <div className="text-center">
                <LineChart className="mx-auto mb-1 h-8 w-8 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Revenue chart placeholder
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Engagement
            </CardTitle>
            <CardDescription>
              User behavior and engagement analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {analyticsData.metrics.newUsers}
                  </div>
                  <p className="text-xs text-muted-foreground">New Users</p>
                </div>

                <div>
                  <div className="text-lg font-bold text-green-600">
                    {analyticsData.metrics.bounceRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Bounce Rate</p>
                </div>

                <div>
                  <div className="text-lg font-bold text-purple-600">
                    {analyticsData.metrics.conversionRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Session Duration
                  </span>
                  <span className="font-medium">
                    {analyticsData.metrics.avgSessionDuration} min
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Page Views/Session
                  </span>
                  <span className="font-medium">
                    {(
                      analyticsData.metrics.pageViews /
                      analyticsData.metrics.totalSessions
                    ).toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unique Visitors</span>
                  <span className="font-medium">
                    {analyticsData.metrics.uniquePageViews.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                <div className="text-center">
                  <PieChart className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Engagement chart
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="mr-2 h-5 w-5" />
            System Health Monitoring
          </CardTitle>
          <CardDescription>
            Infrastructure performance and resource utilization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <Database className="mr-2 h-4 w-4" />
                Database
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Query Performance</span>
                  <span className="font-medium">23ms avg</span>
                </div>
                <Progress value={15} className="h-1" />

                <div className="flex justify-between text-sm">
                  <span>Connections</span>
                  <span className="font-medium">85/200</span>
                </div>
                <Progress value={42.5} className="h-1" />

                <div className="flex justify-between text-sm">
                  <span>Storage</span>
                  <span className="font-medium">2.4GB</span>
                </div>
                <Progress value={60} className="h-1" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <Zap className="mr-2 h-4 w-4" />
                Cache
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Hit Rate</span>
                  <span className="font-medium text-green-600">94.8%</span>
                </div>
                <Progress value={94.8} className="h-1" />

                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="font-medium">78%</span>
                </div>
                <Progress value={78} className="h-1" />

                <div className="flex justify-between text-sm">
                  <span>Evictions</span>
                  <span className="font-medium">12</span>
                </div>
                <Progress value={20} className="h-1" />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <Activity className="mr-2 h-4 w-4" />
                Server
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-1" />

                <div className="flex justify-between text-sm">
                  <span>Memory</span>
                  <span className="font-medium">72%</span>
                </div>
                <Progress value={72} className="h-1" />

                <div className="flex justify-between text-sm">
                  <span>Disk I/O</span>
                  <span className="font-medium">45%</span>
                </div>
                <Progress value={45} className="h-1" />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 text-center md:grid-cols-4">
            <div className="rounded-lg border p-3">
              <div className="text-lg font-bold text-green-600">
                {analyticsData.performance.uptime}%
              </div>
              <p className="text-xs text-muted-foreground">Uptime</p>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-lg font-bold text-blue-600">
                {analyticsData.performance.responseTime}ms
              </div>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-lg font-bold text-purple-600">
                {analyticsData.performance.throughput}
              </div>
              <p className="text-xs text-muted-foreground">Requests/min</p>
            </div>

            <div className="rounded-lg border p-3">
              <div className="text-lg font-bold text-red-600">
                {analyticsData.performance.errorRate}%
              </div>
              <p className="text-xs text-muted-foreground">Error Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsWidgets;
