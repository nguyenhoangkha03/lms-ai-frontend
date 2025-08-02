'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  RefreshCw,
  Download,
  Calendar,
  Gauge,
  Brain,
  Database,
  Server,
  Timer,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  useGetModelPerformanceQuery,
  useGetModelHealthQuery,
} from '@/lib/redux/api/ml-model-api';
import { cn } from '@/lib/utils';

interface ModelPerformanceTrackerProps {
  className?: string;
}

interface PerformanceMetric {
  timestamp: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage?: number;
  predictionCount: number;
  confidenceScore: number;
}

interface ModelHealth {
  modelId: string;
  modelName: string;
  version: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  lastUpdate: string;
  uptime: number;
  errorRate: number;
  avgLatency: number;
  throughput: number;
  accuracy: number;
  dataQuality: number;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
}

const mockPerformanceData: PerformanceMetric[] = [
  {
    timestamp: '2024-01-10T00:00:00Z',
    accuracy: 89.2,
    precision: 87.5,
    recall: 85.3,
    f1Score: 86.4,
    latency: 45,
    throughput: 125,
    errorRate: 0.8,
    memoryUsage: 68,
    cpuUsage: 35,
    gpuUsage: 42,
    predictionCount: 1247,
    confidenceScore: 0.92,
  },
  {
    timestamp: '2024-01-11T00:00:00Z',
    accuracy: 89.8,
    precision: 88.1,
    recall: 86.2,
    f1Score: 87.1,
    latency: 43,
    throughput: 132,
    errorRate: 0.6,
    memoryUsage: 72,
    cpuUsage: 38,
    gpuUsage: 45,
    predictionCount: 1398,
    confidenceScore: 0.94,
  },
  {
    timestamp: '2024-01-12T00:00:00Z',
    accuracy: 90.1,
    precision: 88.9,
    recall: 87.1,
    f1Score: 88.0,
    latency: 41,
    throughput: 138,
    errorRate: 0.4,
    memoryUsage: 69,
    cpuUsage: 33,
    gpuUsage: 41,
    predictionCount: 1502,
    confidenceScore: 0.95,
  },
  {
    timestamp: '2024-01-13T00:00:00Z',
    accuracy: 89.5,
    precision: 87.8,
    recall: 85.9,
    f1Score: 86.8,
    latency: 47,
    throughput: 128,
    errorRate: 1.2,
    memoryUsage: 71,
    cpuUsage: 39,
    gpuUsage: 46,
    predictionCount: 1289,
    confidenceScore: 0.91,
  },
  {
    timestamp: '2024-01-14T00:00:00Z',
    accuracy: 90.3,
    precision: 89.2,
    recall: 87.8,
    f1Score: 88.5,
    latency: 42,
    throughput: 135,
    errorRate: 0.5,
    memoryUsage: 70,
    cpuUsage: 36,
    gpuUsage: 43,
    predictionCount: 1456,
    confidenceScore: 0.96,
  },
];

const mockModelHealth: ModelHealth[] = [
  {
    modelId: 'dropout-predictor',
    modelName: 'Dropout Risk Predictor',
    version: '2.1.4',
    status: 'healthy',
    lastUpdate: '2024-01-14T10:30:00Z',
    uptime: 99.7,
    errorRate: 0.5,
    avgLatency: 42,
    throughput: 135,
    accuracy: 90.3,
    dataQuality: 94.2,
    alerts: [
      {
        id: 'alert-1',
        type: 'info',
        message: 'Model retrained successfully with new data',
        timestamp: '2024-01-14T10:30:00Z',
      },
    ],
  },
  {
    modelId: 'performance-forecaster',
    modelName: 'Performance Forecaster',
    version: '1.8.7',
    status: 'degraded',
    lastUpdate: '2024-01-14T09:15:00Z',
    uptime: 98.2,
    errorRate: 2.1,
    avgLatency: 68,
    throughput: 89,
    accuracy: 82.7,
    dataQuality: 91.8,
    alerts: [
      {
        id: 'alert-2',
        type: 'warning',
        message: 'Increased latency detected - consider scaling resources',
        timestamp: '2024-01-14T09:15:00Z',
      },
      {
        id: 'alert-3',
        type: 'warning',
        message: 'Error rate above threshold (2.0%)',
        timestamp: '2024-01-14T08:45:00Z',
      },
    ],
  },
  {
    modelId: 'learning-pattern',
    modelName: 'Learning Pattern Recognizer',
    version: '3.0.2',
    status: 'critical',
    lastUpdate: '2024-01-14T08:00:00Z',
    uptime: 95.1,
    errorRate: 5.2,
    avgLatency: 120,
    throughput: 45,
    accuracy: 78.4,
    dataQuality: 88.5,
    alerts: [
      {
        id: 'alert-4',
        type: 'error',
        message: 'Model accuracy dropped below 80% threshold',
        timestamp: '2024-01-14T08:00:00Z',
      },
      {
        id: 'alert-5',
        type: 'error',
        message: 'High error rate detected (5.2%)',
        timestamp: '2024-01-14T07:30:00Z',
      },
      {
        id: 'alert-6',
        type: 'warning',
        message: 'Throughput significantly degraded',
        timestamp: '2024-01-14T07:15:00Z',
      },
    ],
  },
];

const getHealthStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    case 'offline':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getHealthStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4" />;
    case 'critical':
      return <XCircle className="h-4 w-4" />;
    case 'offline':
      return <RefreshCw className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />;
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ModelPerformanceTracker({
  className,
}: ModelPerformanceTrackerProps) {
  const [selectedModel, setSelectedModel] = useState('dropout-predictor');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');

  const { data: performanceData, isLoading: isLoadingPerformance } =
    useGetModelPerformanceQuery({
      modelId: selectedModel,
      timeRange,
    });

  const { data: healthData, isLoading: isLoadingHealth } =
    useGetModelHealthQuery(selectedModel);

  const selectedModelHealth = mockModelHealth.find(
    model => model.modelId === selectedModel
  );

  const healthyModels = mockModelHealth.filter(
    model => model.status === 'healthy'
  ).length;
  const degradedModels = mockModelHealth.filter(
    model => model.status === 'degraded'
  ).length;
  const criticalModels = mockModelHealth.filter(
    model => model.status === 'critical'
  ).length;
  const totalAlerts = mockModelHealth.reduce(
    (sum, model) => sum + model.alerts.length,
    0
  );

  if (isLoadingPerformance || isLoadingHealth) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Model Performance Tracker
          </h1>
          <p className="text-muted-foreground">
            Monitor real-time performance metrics and health status of ML models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Healthy Models
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {healthyModels}
            </div>
            <p className="text-xs text-muted-foreground">Operating normally</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Degraded Models
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {degradedModels}
            </div>
            <p className="text-xs text-muted-foreground">Performance issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Models
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalModels}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
            <p className="text-xs text-muted-foreground">Across all models</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Model Selection & Health */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Model Health Status
            </CardTitle>
            <CardDescription>
              Current status and alerts for all models
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockModelHealth.map(model => (
              <div
                key={model.modelId}
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-colors',
                  selectedModel === model.modelId
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => setSelectedModel(model.modelId)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{model.modelName}</h4>
                    <p className="text-xs text-muted-foreground">
                      v{model.version}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'text-xs',
                      getHealthStatusColor(model.status)
                    )}
                  >
                    {getHealthStatusIcon(model.status)}
                    <span className="ml-1 capitalize">{model.status}</span>
                  </Badge>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="ml-1 font-medium">{model.uptime}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-1 font-medium">{model.accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latency:</span>
                    <span className="ml-1 font-medium">
                      {model.avgLatency}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Error Rate:</span>
                    <span className="ml-1 font-medium">{model.errorRate}%</span>
                  </div>
                </div>

                {model.alerts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium">Recent Alerts:</div>
                    {model.alerts.slice(0, 2).map(alert => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-2 text-xs"
                      >
                        {getAlertIcon(alert.type)}
                        <span className="line-clamp-2 flex-1">
                          {alert.message}
                        </span>
                      </div>
                    ))}
                    {model.alerts.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{model.alerts.length - 2} more alerts
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Real-time monitoring for {selectedModelHealth?.modelName}
                </CardDescription>
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accuracy">Accuracy</SelectItem>
                  <SelectItem value="latency">Response Time</SelectItem>
                  <SelectItem value="throughput">Throughput</SelectItem>
                  <SelectItem value="errorRate">Error Rate</SelectItem>
                  <SelectItem value="resources">Resource Usage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedMetric}
              onValueChange={setSelectedMetric}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="accuracy">Accuracy</TabsTrigger>
                <TabsTrigger value="latency">Latency</TabsTrigger>
                <TabsTrigger value="throughput">Throughput</TabsTrigger>
                <TabsTrigger value="errorRate">Errors</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="accuracy" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis domain={[80, 95]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Accuracy (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="precision"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Precision (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="recall"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Recall (%)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="latency" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="latency"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Response Time (ms)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="throughput" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="throughput"
                        fill="#10b981"
                        name="Throughput (req/min)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="errorRate" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="errorRate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Error Rate (%)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="cpuUsage"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="CPU Usage (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="memoryUsage"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Memory Usage (%)"
                      />
                      <Line
                        type="monotone"
                        dataKey="gpuUsage"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="GPU Usage (%)"
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Accuracy
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedModelHealth?.accuracy.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +0.8% from yesterday
            </div>
            <Progress
              value={selectedModelHealth?.accuracy || 0}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedModelHealth?.avgLatency}ms
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
              -5ms from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Throughput</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedModelHealth?.throughput}/min
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12 req/min from yesterday
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedModelHealth?.errorRate.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {selectedModelHealth?.errorRate &&
              selectedModelHealth.errorRate > 2 ? (
                <>
                  <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
                  Above threshold
                </>
              ) : (
                <>
                  <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                  Within limits
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {selectedModelHealth && selectedModelHealth.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Current issues and recommendations for{' '}
              {selectedModelHealth.modelName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedModelHealth.alerts.map(alert => (
              <Alert
                key={alert.id}
                className={cn(
                  alert.type === 'error'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : alert.type === 'warning'
                      ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                      : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                )}
              >
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    Dismiss
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
