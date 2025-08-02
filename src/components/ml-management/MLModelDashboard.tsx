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
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  PauseCircle,
  RefreshCw,
  Download,
  Upload,
  Layers,
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
  Area,
  AreaChart,
} from 'recharts';
import {
  useGetMLModelsQuery,
  useGetModelMetricsQuery,
  useRetrainModelMutation,
} from '@/lib/redux/api/ml-model-api';
import { cn } from '@/lib/utils';

interface MLModelDashboardProps {
  className?: string;
}

interface ModelMetrics {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'training' | 'disabled' | 'error';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  predictionCount: number;
  avgResponseTime: number;
  lastTrained: string;
  nextRetraining: string;
  confidence: number;
  dataQuality: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  performance: {
    timestamp: string;
    accuracy: number;
    latency: number;
    throughput: number;
  }[];
}

const mockModelData: ModelMetrics[] = [
  {
    id: 'dropout-predictor',
    name: 'Dropout Risk Predictor',
    version: '2.1.4',
    status: 'active',
    accuracy: 89.5,
    precision: 87.2,
    recall: 85.8,
    f1Score: 86.5,
    predictionCount: 15247,
    avgResponseTime: 45,
    lastTrained: '2024-01-15T10:30:00Z',
    nextRetraining: '2024-01-22T02:00:00Z',
    confidence: 0.92,
    dataQuality: 94,
    resourceUsage: {
      cpu: 35,
      memory: 68,
      gpu: 42,
    },
    performance: [
      { timestamp: '2024-01-10', accuracy: 88.2, latency: 48, throughput: 125 },
      { timestamp: '2024-01-11', accuracy: 89.1, latency: 46, throughput: 132 },
      { timestamp: '2024-01-12', accuracy: 89.5, latency: 45, throughput: 128 },
      { timestamp: '2024-01-13', accuracy: 89.8, latency: 44, throughput: 135 },
      { timestamp: '2024-01-14', accuracy: 89.5, latency: 45, throughput: 130 },
    ],
  },
  {
    id: 'performance-forecaster',
    name: 'Performance Forecaster',
    version: '1.8.7',
    status: 'active',
    accuracy: 82.3,
    precision: 84.1,
    recall: 79.5,
    f1Score: 81.7,
    predictionCount: 8934,
    avgResponseTime: 38,
    lastTrained: '2024-01-12T14:20:00Z',
    nextRetraining: '2024-01-19T02:00:00Z',
    confidence: 0.85,
    dataQuality: 91,
    resourceUsage: {
      cpu: 28,
      memory: 52,
      gpu: 38,
    },
    performance: [
      { timestamp: '2024-01-10', accuracy: 81.8, latency: 40, throughput: 98 },
      { timestamp: '2024-01-11', accuracy: 82.0, latency: 39, throughput: 102 },
      { timestamp: '2024-01-12', accuracy: 82.3, latency: 38, throughput: 105 },
      { timestamp: '2024-01-13', accuracy: 82.1, latency: 39, throughput: 100 },
      { timestamp: '2024-01-14', accuracy: 82.3, latency: 38, throughput: 103 },
    ],
  },
  {
    id: 'learning-pattern',
    name: 'Learning Pattern Recognizer',
    version: '3.0.2',
    status: 'training',
    accuracy: 91.2,
    precision: 93.4,
    recall: 88.9,
    f1Score: 91.1,
    predictionCount: 22156,
    avgResponseTime: 52,
    lastTrained: '2024-01-10T09:15:00Z',
    nextRetraining: '2024-01-17T02:00:00Z',
    confidence: 0.96,
    dataQuality: 97,
    resourceUsage: {
      cpu: 62,
      memory: 78,
      gpu: 85,
    },
    performance: [
      { timestamp: '2024-01-10', accuracy: 90.8, latency: 55, throughput: 85 },
      { timestamp: '2024-01-11', accuracy: 91.0, latency: 54, throughput: 88 },
      { timestamp: '2024-01-12', accuracy: 91.2, latency: 52, throughput: 92 },
      { timestamp: '2024-01-13', accuracy: 91.1, latency: 53, throughput: 90 },
      { timestamp: '2024-01-14', accuracy: 91.2, latency: 52, throughput: 91 },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'training':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'disabled':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4" />;
    case 'training':
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    case 'disabled':
      return <PauseCircle className="h-4 w-4" />;
    case 'error':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export function MLModelDashboard({ className }: MLModelDashboardProps) {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('7d');

  const { data: models, isLoading: isLoadingModels } = useGetMLModelsQuery();
  const { data: metrics, isLoading: isLoadingMetrics } =
    useGetModelMetricsQuery(selectedModel);
  const [retrainModel, { isLoading: isRetraining }] = useRetrainModelMutation();

  const handleRetrainModel = async (modelId: string) => {
    try {
      await retrainModel({ modelId }).unwrap();
    } catch (error) {
      console.error('Failed to retrain model:', error);
    }
  };

  const totalPredictions = mockModelData.reduce(
    (sum, model) => sum + model.predictionCount,
    0
  );
  const avgAccuracy =
    mockModelData.reduce((sum, model) => sum + model.accuracy, 0) /
    mockModelData.length;
  const activeModels = mockModelData.filter(
    model => model.status === 'active'
  ).length;

  if (isLoadingModels || isLoadingMetrics) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
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
            ML Model Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage machine learning models performance and lifecycle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Metrics
          </Button>
          <Button size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Deploy Model
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModels}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPredictions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Accuracy
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              +0.8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Models Training
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockModelData.filter(m => m.status === 'training').length}
            </div>
            <p className="text-xs text-muted-foreground">
              1 scheduled for tonight
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Model List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Model Status
            </CardTitle>
            <CardDescription>
              Overview of all ML models and their current status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockModelData.map(model => (
              <div
                key={model.id}
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-colors',
                  selectedModel === model.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">{model.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      v{model.version}
                    </p>
                  </div>
                  <Badge
                    className={cn('text-xs', getStatusColor(model.status))}
                  >
                    {getStatusIcon(model.status)}
                    <span className="ml-1 capitalize">{model.status}</span>
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-1 font-medium">{model.accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Predictions:</span>
                    <span className="ml-1 font-medium">
                      {model.predictionCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Performance</span>
                    <span>{model.accuracy}%</span>
                  </div>
                  <Progress value={model.accuracy} className="h-1" />
                </div>

                {model.status === 'active' && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        handleRetrainModel(model.id);
                      }}
                      disabled={isRetraining}
                    >
                      Retrain
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Charts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Real-time performance monitoring and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="accuracy" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="accuracy">Accuracy Trends</TabsTrigger>
                <TabsTrigger value="latency">Response Time</TabsTrigger>
                <TabsTrigger value="throughput">Throughput</TabsTrigger>
              </TabsList>

              <TabsContent value="accuracy" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockModelData[0].performance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="latency" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={mockModelData[0].performance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="latency"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="throughput" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockModelData[0].performance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="throughput"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Resource Usage
          </CardTitle>
          <CardDescription>
            Monitor system resources consumption across all models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {mockModelData.map(model => (
              <div key={model.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{model.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {model.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>CPU Usage</span>
                    <span>{model.resourceUsage.cpu}%</span>
                  </div>
                  <Progress value={model.resourceUsage.cpu} className="h-2" />

                  <div className="flex justify-between text-xs">
                    <span>Memory Usage</span>
                    <span>{model.resourceUsage.memory}%</span>
                  </div>
                  <Progress
                    value={model.resourceUsage.memory}
                    className="h-2"
                  />

                  {model.resourceUsage.gpu && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span>GPU Usage</span>
                        <span>{model.resourceUsage.gpu}%</span>
                      </div>
                      <Progress
                        value={model.resourceUsage.gpu}
                        className="h-2"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
