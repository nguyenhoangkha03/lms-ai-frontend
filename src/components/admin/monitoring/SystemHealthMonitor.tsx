'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
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
import { Switch } from '@/components/ui/switch';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Server,
  Database,
  Zap,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Shield,
  RefreshCw,
  Bell,
  Settings,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  uptime: number;
  responseTime: number;
  lastCheck: string;
  endpoint?: string;
  dependencies?: string[];
  metrics: {
    cpu?: number;
    memory?: number;
    disk?: number;
    network?: number;
  };
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  service: string;
  title: string;
  description: string;
  timestamp: string;
  isResolved: boolean;
  resolvedAt?: string;
  acknowledgedBy?: string;
  metadata?: Record<string, any>;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface SystemHealthMonitorProps {
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
  className,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const { socket, connected } = useSocket();

  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh);

  // Real-time updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleHealthUpdate = (data: ServiceHealth[]) => {
      setServices(data);
      setLastUpdate(new Date());
    };

    const handleNewAlert = (alert: SystemAlert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);

      if (alert.severity === 'critical' || alert.severity === 'error') {
        toast.error(`${alert.service}: ${alert.title}`);
      }
    };

    const handleMetricsUpdate = (newMetrics: PerformanceMetric[]) => {
      setMetrics(newMetrics);
    };

    socket.on('health:services', handleHealthUpdate);
    socket.on('health:alert', handleNewAlert);
    socket.on('health:metrics', handleMetricsUpdate);

    return () => {
      socket.off('health:services', handleHealthUpdate);
      socket.off('health:alert', handleNewAlert);
      socket.off('health:metrics', handleMetricsUpdate);
    };
  }, [socket]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoRefreshEnabled && refreshInterval > 0) {
      interval = setInterval(loadHealthData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled, refreshInterval]);

  // Initial data load
  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);

      // Simulate API calls - replace with actual endpoints
      const [servicesData, alertsData, metricsData] = await Promise.all([
        // fetch('/api/v1/admin/health/services'),
        // fetch('/api/v1/admin/health/alerts'),
        // fetch('/api/v1/admin/health/metrics'),
        Promise.resolve(mockServicesData()),
        Promise.resolve(mockAlertsData()),
        Promise.resolve(mockMetricsData()),
      ]);

      setServices(servicesData);
      setAlerts(alertsData);
      setMetrics(metricsData);
      setLastUpdate(new Date());
    } catch (error) {
      toast.error('Failed to load health data');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data functions
  const mockServicesData = (): ServiceHealth[] => [
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.98,
      responseTime: 145,
      lastCheck: new Date().toISOString(),
      endpoint: '/api/health',
      dependencies: ['Database', 'Cache'],
      metrics: { cpu: 45, memory: 62, network: 23 },
    },
    {
      name: 'Database',
      status: 'healthy',
      uptime: 99.95,
      responseTime: 23,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 68, memory: 78, disk: 45 },
    },
    {
      name: 'Redis Cache',
      status: 'warning',
      uptime: 99.87,
      responseTime: 8,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 25, memory: 84, network: 15 },
    },
    {
      name: 'File Storage',
      status: 'healthy',
      uptime: 99.99,
      responseTime: 67,
      lastCheck: new Date().toISOString(),
      metrics: { disk: 67, network: 34 },
    },
    {
      name: 'Email Service',
      status: 'critical',
      uptime: 98.23,
      responseTime: 2300,
      lastCheck: new Date().toISOString(),
      metrics: { cpu: 89, memory: 92 },
    },
    {
      name: 'CDN',
      status: 'healthy',
      uptime: 99.97,
      responseTime: 89,
      lastCheck: new Date().toISOString(),
      metrics: { network: 45 },
    },
  ];

  const mockAlertsData = (): SystemAlert[] => [
    {
      id: '1',
      severity: 'critical',
      service: 'Email Service',
      title: 'High Response Time',
      description: 'Email service response time exceeded 2000ms threshold',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      isResolved: false,
    },
    {
      id: '2',
      severity: 'warning',
      service: 'Redis Cache',
      title: 'Memory Usage High',
      description:
        'Cache memory usage is at 84%, approaching warning threshold',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      isResolved: false,
    },
    {
      id: '3',
      severity: 'info',
      service: 'Database',
      title: 'Query Optimization',
      description: 'Slow query detected and optimized automatically',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isResolved: true,
      resolvedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
  ];

  const mockMetricsData = (): PerformanceMetric[] => [
    {
      name: 'CPU Usage',
      value: 68,
      unit: '%',
      threshold: { warning: 80, critical: 90 },
      trend: 'up',
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 40) + 40,
      })),
    },
    {
      name: 'Memory Usage',
      value: 72,
      unit: '%',
      threshold: { warning: 85, critical: 95 },
      trend: 'stable',
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 30) + 60,
      })),
    },
    {
      name: 'Disk Usage',
      value: 45,
      unit: '%',
      threshold: { warning: 80, critical: 90 },
      trend: 'down',
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 20) + 40,
      })),
    },
    {
      name: 'Network I/O',
      value: 234,
      unit: 'MB/s',
      threshold: { warning: 500, critical: 800 },
      trend: 'up',
      history: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 200) + 100,
      })),
    },
  ];

  const getStatusColor = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'offline':
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: ServiceHealth['status']) => {
    switch (status) {
      case 'healthy':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return XCircle;
      case 'offline':
        return Clock;
    }
  };

  const getSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
    }
  };

  const getMetricStatus = (metric: PerformanceMetric) => {
    if (metric.value >= metric.threshold.critical) return 'critical';
    if (metric.value >= metric.threshold.warning) return 'warning';
    return 'normal';
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                acknowledgedBy: 'admin',
                isResolved: true,
                resolvedAt: new Date().toISOString(),
              }
            : alert
        )
      );
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of system services and infrastructure
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={autoRefreshEnabled}
              onCheckedChange={setAutoRefreshEnabled}
            />
            <span className="text-sm">Auto-refresh</span>
          </div>

          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Wifi
              className={cn(
                'h-4 w-4',
                connected ? 'text-green-500' : 'text-red-500'
              )}
            />
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadHealthData}
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Service Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map(service => {
          const StatusIcon = getStatusIcon(service.status);

          return (
            <Card key={service.name}>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <StatusIcon
                      className={cn(
                        'h-5 w-5',
                        service.status === 'healthy'
                          ? 'text-green-500'
                          : service.status === 'warning'
                            ? 'text-yellow-500'
                            : service.status === 'critical'
                              ? 'text-red-500'
                              : 'text-gray-500'
                      )}
                    />
                    <h3 className="font-medium">{service.name}</h3>
                  </div>
                  <Badge
                    className={cn('text-xs', getStatusColor(service.status))}
                  >
                    {service.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="font-medium">{service.uptime}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response:</span>
                    <span className="font-medium">
                      {service.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Check:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(service.lastCheck), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                {Object.keys(service.metrics).length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      {Object.entries(service.metrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="capitalize">{key}</span>
                            <span>{value}%</span>
                          </div>
                          <Progress value={value} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Key system performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map(metric => {
                const status = getMetricStatus(metric);
                const TrendIcon =
                  metric.trend === 'up'
                    ? TrendingUp
                    : metric.trend === 'down'
                      ? TrendingDown
                      : Activity;

                return (
                  <div key={metric.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{metric.name}</span>
                        <TrendIcon
                          className={cn(
                            'h-4 w-4',
                            metric.trend === 'up'
                              ? 'text-red-500'
                              : metric.trend === 'down'
                                ? 'text-green-500'
                                : 'text-gray-500'
                          )}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {metric.value}
                          {metric.unit}
                        </span>
                        <Badge
                          className={cn(
                            'text-xs',
                            status === 'critical'
                              ? 'bg-red-100 text-red-600'
                              : status === 'warning'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-green-100 text-green-600'
                          )}
                        >
                          {status}
                        </Badge>
                      </div>
                    </div>

                    <Progress
                      value={(metric.value / metric.threshold.critical) * 100}
                      className="h-2"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        Warning: {metric.threshold.warning}
                        {metric.unit}
                      </span>
                      <span>
                        Critical: {metric.threshold.critical}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                System Alerts
              </div>
              <Badge variant="secondary">
                {alerts.filter(a => !a.isResolved).length} active
              </Badge>
            </CardTitle>
            <CardDescription>
              Recent system alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {alerts.map(alert => {
                  const severityIcons = {
                    info: Bell,
                    warning: AlertTriangle,
                    error: XCircle,
                    critical: AlertCircle,
                  };
                  const SeverityIcon = severityIcons[alert.severity];

                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'rounded-lg border p-3',
                        !alert.isResolved && 'bg-muted/30',
                        alert.isResolved && 'opacity-60'
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <SeverityIcon
                          className={cn(
                            'mt-0.5 h-4 w-4',
                            alert.severity === 'critical' && 'text-red-600',
                            alert.severity === 'error' && 'text-orange-600',
                            alert.severity === 'warning' && 'text-yellow-600',
                            alert.severity === 'info' && 'text-blue-600'
                          )}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between">
                            <h4 className="text-sm font-medium">
                              {alert.title}
                            </h4>
                            <Badge
                              className={cn(
                                'text-xs',
                                getSeverityColor(alert.severity)
                              )}
                            >
                              {alert.severity}
                            </Badge>
                          </div>

                          <p className="mb-2 text-sm text-muted-foreground">
                            {alert.description}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{alert.service}</span>
                            <span>
                              {formatDistanceToNow(new Date(alert.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>

                          {!alert.isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Acknowledge
                            </Button>
                          )}

                          {alert.isResolved && (
                            <div className="mt-2 flex items-center text-xs text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Resolved{' '}
                              {formatDistanceToNow(
                                new Date(alert.resolvedAt!),
                                { addSuffix: true }
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {alerts.length === 0 && (
                  <div className="py-8 text-center">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
                    <p className="text-sm text-muted-foreground">
                      No active alerts
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Infrastructure Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="mr-2 h-5 w-5" />
            Infrastructure Overview
          </CardTitle>
          <CardDescription>
            Detailed system resource utilization and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <Cpu className="mr-2 h-4 w-4" />
                CPU Performance
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Usage</span>
                  <span className="font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Load Average</span>
                  <span className="font-medium">2.4</span>
                </div>
                <Progress value={48} className="h-2" />

                <div className="text-xs text-muted-foreground">
                  4 cores @ 2.8GHz
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <MemoryStick className="mr-2 h-4 w-4" />
                Memory Usage
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>RAM</span>
                  <span className="font-medium">5.8/8.0 GB</span>
                </div>
                <Progress value={72.5} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Swap</span>
                  <span className="font-medium">0.2/2.0 GB</span>
                </div>
                <Progress value={10} className="h-2" />

                <div className="text-xs text-muted-foreground">
                  DDR4 3200MHz
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <HardDrive className="mr-2 h-4 w-4" />
                Storage
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>System</span>
                  <span className="font-medium">45/100 GB</span>
                </div>
                <Progress value={45} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Data</span>
                  <span className="font-medium">234/500 GB</span>
                </div>
                <Progress value={46.8} className="h-2" />

                <div className="text-xs text-muted-foreground">SSD NVMe</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="flex items-center font-medium">
                <Network className="mr-2 h-4 w-4" />
                Network
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Inbound</span>
                  <span className="font-medium">123 MB/s</span>
                </div>
                <Progress value={24.6} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Outbound</span>
                  <span className="font-medium">87 MB/s</span>
                </div>
                <Progress value={17.4} className="h-2" />

                <div className="text-xs text-muted-foreground">
                  1Gbps Connection
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Service Dependencies */}
          <div className="space-y-4">
            <h4 className="font-medium">Service Dependencies</h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {services
                .filter(s => s.dependencies?.length)
                .map(service => (
                  <div key={service.name} className="rounded-lg border p-3">
                    <div className="mb-2 flex items-center space-x-2">
                      <div
                        className={cn(
                          'h-3 w-3 rounded-full',
                          service.status === 'healthy'
                            ? 'bg-green-500'
                            : service.status === 'warning'
                              ? 'bg-yellow-500'
                              : service.status === 'critical'
                                ? 'bg-red-500'
                                : 'bg-gray-500'
                        )}
                      />
                      <span className="text-sm font-medium">
                        {service.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Depends on: {service.dependencies?.join(', ')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common maintenance and monitoring tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto justify-start p-4">
              <Database className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Database Health</div>
                <div className="text-xs text-muted-foreground">
                  Check DB performance
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto justify-start p-4">
              <Zap className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Cache Management</div>
                <div className="text-xs text-muted-foreground">
                  Manage Redis cache
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto justify-start p-4">
              <Shield className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Security Scan</div>
                <div className="text-xs text-muted-foreground">
                  Run security checks
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto justify-start p-4">
              <Settings className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">System Config</div>
                <div className="text-xs text-muted-foreground">
                  Manage settings
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Last updated: {format(lastUpdate, 'PPp')}</div>
        <div className="flex items-center space-x-4">
          <span>Monitoring: {autoRefreshEnabled ? 'Active' : 'Paused'}</span>
          <span>•</span>
          <span>Refresh: {refreshInterval / 1000}s</span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                connected ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            <span>Real-time {connected ? 'Connected' : 'Disconnected'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
