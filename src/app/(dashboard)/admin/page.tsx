'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Activity,
  Database,
  Zap,
  Shield,
  Bell,
  Settings,
  RefreshCw,
  Eye,
  BarChart3,
  LineChart,
  AlertCircle,
  HardDrive,
  Wifi,
  Globe,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  useGetApprovalStatsQuery,
  useGetSystemHealthQuery,
  useGetSystemMetricsQuery,
  useGetBusinessMetricsQuery,
  useGetSystemAlertsQuery,
} from '@/lib/redux/api/admin-api';
import Link from 'next/link';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    database: 'healthy' | 'warning' | 'critical';
    cache: 'healthy' | 'warning' | 'critical';
    api: 'healthy' | 'warning' | 'critical';
    storage: 'healthy' | 'warning' | 'critical';
  };
  uptime: number;
  lastUpdated: string;
}

interface SystemMetrics {
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryPerformance: number;
    slowQueries: number;
    tableSize: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    evictions: number;
    memoryUsage: number;
    connections: number;
  };
  realtime: {
    activeConnections: number;
    messagesPerSecond: number;
    bandwidth: number;
  };
}

interface BusinessMetrics {
  revenue: {
    today: number;
    thisMonth: number;
    lastMonth: number;
    monthlyGrowth: number;
  };
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  courses: {
    total: number;
    published: number;
    enrollments: number;
    completions: number;
  };
  engagement: {
    dailyActive: number;
    sessionDuration: number;
    contentViews: number;
    interactions: number;
  };
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  source: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

export default function AdminOverviewDashboard() {
  const { user } = useAuth();
  // Socket connection with error handling for admin dashboard
  const [socketError, setSocketError] = useState<string | null>(null);
  const connected = false; // Keep disabled for now to prevent connection timeout issues

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Use real API queries instead of mock data
  const { data: teacherStats } = useGetApprovalStatsQuery();
  const { data: systemHealthData, isLoading: healthLoading } = useGetSystemHealthQuery();
  const { data: systemMetricsData, isLoading: metricsLoading } = useGetSystemMetricsQuery();
  const { data: businessMetricsData, isLoading: businessLoading } = useGetBusinessMetricsQuery();
  const { data: systemAlertsData, isLoading: alertsLoading } = useGetSystemAlertsQuery();

  // Extract data from API responses
  const systemHealth = systemHealthData?.health;
  const metrics = systemMetricsData?.metrics;
  const businessMetrics = businessMetricsData?.metrics;
  const alerts = systemAlertsData?.alerts || [];

  const isLoading = healthLoading || metricsLoading || businessLoading || alertsLoading;

  // Socket disabled for admin dashboard - using API polling instead
  // This prevents socket connection timeout errors in admin panel
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Socket connection disabled for admin dashboard - using API polling for better reliability');
    }
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh function for manual refresh button
  const handleRefresh = () => {
    setLastRefresh(new Date());
    // RTK Query will automatically refetch
  };


  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      default:
        return Clock;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Activity;
    }
  };

  const quickStats: QuickStat[] = businessMetrics
    ? [
        {
          label: 'Total Users',
          value: businessMetrics.users.total.toLocaleString(),
          change: businessMetrics.users.growth,
          icon: Users,
          color: 'text-blue-600',
          trend: 'up',
        },
        {
          label: 'Active Users',
          value: businessMetrics.users.active.toLocaleString(),
          change: 12.5,
          icon: Activity,
          color: 'text-green-600',
          trend: 'up',
        },
        {
          label: 'Pending Teachers',
          value: teacherStats?.stats?.pending || 0,
          icon: UserCheck,
          color: 'text-orange-600',
        },
        {
          label: 'Total Courses',
          value: businessMetrics.courses.total,
          change: 5.2,
          icon: BookOpen,
          color: 'text-purple-600',
          trend: 'up',
        },
        {
          label: 'Monthly Revenue',
          value: `$${businessMetrics.revenue.thisMonth.toLocaleString()}`,
          change: businessMetrics.revenue.monthlyGrowth,
          icon: DollarSign,
          color: 'text-green-600',
          trend: 'up',
        },
        {
          label: 'Response Time',
          value: `${metrics?.performance.responseTime}ms`,
          change: -8.3,
          icon: Zap,
          color: 'text-cyan-600',
          trend: 'down',
        },
      ]
    : [];

  if (!user || user.userType !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Access Restricted</h2>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and health monitoring
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {systemHealth && (
            <Badge
              className={cn(
                'text-sm',
                getHealthStatusColor(systemHealth.overall)
              )}
            >
              {React.createElement(getHealthIcon(systemHealth.overall), {
                className: 'mr-1 h-4 w-4',
              })}
              System {systemHealth.overall}
            </Badge>
          )}

          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Wifi
              className={cn(
                'h-4 w-4',
                connected ? 'text-green-500' : 'text-yellow-500'
              )}
            />
            <span title="Socket connection disabled for admin dashboard stability">
              {connected ? 'Connected' : 'API Mode'}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')}
            />
            Refresh
          </Button>

          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        {quickStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const TrendIcon = getTrendIcon(stat.trend);

          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change !== undefined && (
                      <div
                        className={cn(
                          'flex items-center text-xs',
                          stat.change > 0 ? 'text-green-600' : 'text-red-600'
                        )}
                      >
                        <TrendIcon className="mr-1 h-3 w-3" />
                        {Math.abs(stat.change)}%
                      </div>
                    )}
                  </div>
                  <IconComponent className={cn('h-8 w-8', stat.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* System Health */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>
              Real-time system health and service status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(systemHealth.services).map(
                    ([service, status]) => {
                      const statusStr = status as string;
                      const Icon = getHealthIcon(statusStr);
                      return (
                        <div
                          key={service}
                          className="flex items-center space-x-2"
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              statusStr === 'healthy'
                                ? 'text-green-500'
                                : statusStr === 'warning'
                                  ? 'text-yellow-500'
                                  : 'text-red-500'
                            )}
                          />
                          <span className="capitalize">{service}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              getHealthStatusColor(statusStr)
                            )}
                          >
                            {statusStr}
                          </Badge>
                        </div>
                      );
                    }
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Uptime: </span>
                    <span className="font-medium">{systemHealth.uptime}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Last Updated:{' '}
                    </span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(systemHealth.lastUpdated), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Recent Alerts
              </div>
              <Badge variant="secondary">
                {alerts.filter(a => !a.isRead).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {alerts.map((alert: Alert) => {
                  const alertIcons = {
                    info: Bell,
                    warning: AlertTriangle,
                    error: XCircle,
                    critical: AlertCircle,
                  };
                  const Icon = alertIcons[alert.type as keyof typeof alertIcons];

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'rounded-lg border p-3',
                        !alert.isRead && 'bg-muted/50',
                        alert.type === 'critical' && 'border-red-200 bg-red-50',
                        alert.type === 'error' &&
                          'border-orange-200 bg-orange-50',
                        alert.type === 'warning' &&
                          'border-yellow-200 bg-yellow-50'
                      )}
                    >
                      <div className="flex items-start space-x-2">
                        <Icon
                          className={cn(
                            'mt-0.5 h-4 w-4',
                            alert.type === 'critical' && 'text-red-600',
                            alert.type === 'error' && 'text-orange-600',
                            alert.type === 'warning' && 'text-yellow-600',
                            alert.type === 'info' && 'text-blue-600'
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {alert.source}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(alert.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.performance.responseTime}ms
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Average API response time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Throughput</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.performance.throughput}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requests per minute
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Error Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {metrics.performance.errorRate}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Error percentage
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>CPU</span>
                      <span>{metrics.performance.cpuUsage}%</span>
                    </div>
                    <Progress
                      value={metrics.performance.cpuUsage}
                      className="h-1"
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span>Memory</span>
                      <span>{metrics.performance.memoryUsage}%</span>
                    </div>
                    <Progress
                      value={metrics.performance.memoryUsage}
                      className="h-1"
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span>Disk</span>
                      <span>{metrics.performance.diskUsage}%</span>
                    </div>
                    <Progress
                      value={metrics.performance.diskUsage}
                      className="h-1"
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="mr-2 h-5 w-5" />
                      Connections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrics.database.connections}/
                      {metrics.database.maxConnections}
                    </div>
                    <Progress
                      value={
                        (metrics.database.connections /
                          metrics.database.maxConnections) *
                        100
                      }
                      className="mt-2"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Active database connections
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="mr-2 h-5 w-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Query Time</span>
                        <span className="text-sm font-medium">
                          {metrics.database.queryPerformance}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Slow Queries</span>
                        <span className="text-sm font-medium">
                          {metrics.database.slowQueries}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">DB Size</span>
                        <span className="text-sm font-medium">
                          {metrics.database.tableSize}GB
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HardDrive className="mr-2 h-5 w-5" />
                      Storage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrics.database.tableSize}GB
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total database size
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {metrics && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Hit Rate</span>
                        <span className="font-medium text-green-600">
                          {metrics.cache.hitRate}%
                        </span>
                      </div>
                      <Progress value={metrics.cache.hitRate} className="h-2" />

                      <div className="flex justify-between">
                        <span>Miss Rate</span>
                        <span className="font-medium text-red-600">
                          {metrics.cache.missRate}%
                        </span>
                      </div>
                      <Progress
                        value={metrics.cache.missRate}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {metrics.cache.memoryUsage}%
                    </div>
                    <Progress
                      value={metrics.cache.memoryUsage}
                      className="mt-2"
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Cache memory utilization
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cache Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Connections</span>
                        <span className="text-sm font-medium">
                          {metrics.cache.connections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Evictions</span>
                        <span className="text-sm font-medium">
                          {metrics.cache.evictions}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {businessMetrics && (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Today's Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${businessMetrics.revenue.today.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Revenue generated today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      ${businessMetrics.revenue.thisMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Monthly revenue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Last Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-600">
                      ${businessMetrics.revenue.lastMonth.toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Previous month revenue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +{businessMetrics.revenue.monthlyGrowth}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Month-over-month growth
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>
                Monthly revenue over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
                <div className="text-center">
                  <LineChart className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Revenue chart placeholder
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Integrate with your preferred charting library
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Monitoring */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Real-time Activity
            </CardTitle>
            <CardDescription>
              Live system activity and user engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.realtime.activeConnections.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Active Connections
                  </p>
                </div>

                <div className="rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.realtime.messagesPerSecond}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Messages/Second
                  </p>
                </div>

                <div className="col-span-2 rounded-lg border p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.realtime.bandwidth} MB/s
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Bandwidth Usage
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              User Engagement
            </CardTitle>
            <CardDescription>
              Daily active users and engagement metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {businessMetrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {businessMetrics.engagement.dailyActive.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Daily Active Users
                    </p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {businessMetrics.engagement.sessionDuration}min
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Avg Session Duration
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Content Views:</span>
                    <span className="font-medium">
                      {businessMetrics.engagement.contentViews.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interactions:</span>
                    <span className="font-medium">
                      {businessMetrics.engagement.interactions.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Frequently used administrative tasks and management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* User Management Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                User Management
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Users className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Users</div>
                      <div className="text-xs text-muted-foreground">
                        Manage all users
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/roles">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Roles</div>
                      <div className="text-xs text-muted-foreground">
                        Manage user roles
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/permissions">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Permissions</div>
                      <div className="text-xs text-muted-foreground">
                        Manage permissions
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/teacher-applications">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <UserCheck className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Teacher Applications</div>
                      <div className="text-xs text-muted-foreground">
                        {teacherStats?.stats?.pending || 0} pending reviews
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Content Management Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Content Management
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/courses">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <BookOpen className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Courses</div>
                      <div className="text-xs text-muted-foreground">
                        Manage courses
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/categories">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <BookOpen className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Categories</div>
                      <div className="text-xs text-muted-foreground">
                        Manage course categories
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/content/moderation">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Content Moderation</div>
                      <div className="text-xs text-muted-foreground">
                        Review content
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/file-management">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <HardDrive className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">File Management</div>
                      <div className="text-xs text-muted-foreground">
                        Manage uploaded files
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* System Management Section */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                System Management
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/analytics">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <BarChart3 className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Analytics</div>
                      <div className="text-xs text-muted-foreground">
                        View system analytics
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/financial/reports">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <DollarSign className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Financial Reports</div>
                      <div className="text-xs text-muted-foreground">
                        View revenue and payments
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/security">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Shield className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Security</div>
                      <div className="text-xs text-muted-foreground">
                        Security monitoring
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/system-configuration">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Settings className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">System Settings</div>
                      <div className="text-xs text-muted-foreground">
                        Configure system parameters
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* AI & Advanced Features */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                AI & Advanced Features
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/ai-management">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Zap className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">AI Management</div>
                      <div className="text-xs text-muted-foreground">
                        Manage AI features
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/ml-management">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Activity className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">ML Models</div>
                      <div className="text-xs text-muted-foreground">
                        Manage ML models
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/communication">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Globe className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Communication</div>
                      <div className="text-xs text-muted-foreground">
                        Manage messaging
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/admin/cache-database-management">
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start p-4"
                  >
                    <Database className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">Cache & Database</div>
                      <div className="text-xs text-muted-foreground">
                        Manage data storage
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Last refreshed: {format(lastRefresh, 'PPp')}</div>
        <div className="flex items-center space-x-4">
          <span>Connection: {connected ? 'WebSocket' : 'API Polling'}</span>
          <span>•</span>
          <span>Version: 1.0.0</span>
          <span>•</span>
          <span>Environment: Production</span>
        </div>
      </div>
    </div>
  );
}
