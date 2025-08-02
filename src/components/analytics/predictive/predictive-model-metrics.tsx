'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Settings,
  RefreshCw,
  Download,
  PlayCircle,
  PauseCircle,
  MoreHorizontal,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  Cell,
} from 'recharts';

import { useGetSystemHealthQuery } from '@/lib/redux/api/predictive-analytics-api';

interface PredictiveModelMetricsProps {
  showAccuracy?: boolean;
  showPerformance?: boolean;
  allowRetraining?: boolean;
  className?: string;
}

interface ModelMetrics {
  modelName: string;
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  predictions: number;
  status: 'active' | 'training' | 'disabled';
  trainingTime: number;
  dataSize: number;
}

// Mock data - in real app this would come from API
const mockModelMetrics: ModelMetrics[] = [
  {
    modelName: 'Dropout Risk Predictor',
    version: '2.1.0',
    accuracy: 0.89,
    precision: 0.87,
    recall: 0.85,
    f1Score: 0.86,
    lastTrained: '2024-01-15T10:30:00Z',
    predictions: 15247,
    status: 'active',
    trainingTime: 4.2,
    dataSize: 45000,
  },
  {
    modelName: 'Performance Forecaster',
    version: '1.8.3',
    accuracy: 0.82,
    precision: 0.84,
    recall: 0.79,
    f1Score: 0.81,
    lastTrained: '2024-01-12T14:20:00Z',
    predictions: 8934,
    status: 'active',
    trainingTime: 2.8,
    dataSize: 32000,
  },
  {
    modelName: 'Learning Pattern Recognizer',
    version: '3.0.1',
    accuracy: 0.91,
    precision: 0.93,
    recall: 0.88,
    f1Score: 0.9,
    lastTrained: '2024-01-10T09:15:00Z',
    predictions: 22156,
    status: 'active',
    trainingTime: 6.1,
    dataSize: 67000,
  },
  {
    modelName: 'Intervention Optimizer',
    version: '1.5.2',
    accuracy: 0.76,
    precision: 0.78,
    recall: 0.74,
    f1Score: 0.76,
    lastTrained: '2024-01-08T16:45:00Z',
    predictions: 5621,
    status: 'training',
    trainingTime: 3.5,
    dataSize: 28000,
  },
];

export function PredictiveModelMetrics({
  showAccuracy = true,
  showPerformance = true,
  allowRetraining = false,
  className = '',
}: PredictiveModelMetricsProps) {
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('accuracy');
  const [timeRange, setTimeRange] = useState('30d');

  const {
    data: systemHealth,
    isLoading: isLoadingHealth,
    refetch: refetchHealth,
  } = useGetSystemHealthQuery();

  const [isRetraining, setIsRetraining] = useState(false);

  const filteredModels =
    selectedModel === 'all'
      ? mockModelMetrics
      : mockModelMetrics.filter(model =>
          model.modelName.toLowerCase().includes(selectedModel.toLowerCase())
        );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'training':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'disabled':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.85) return 'text-green-600';
    if (accuracy >= 0.75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleRetrainModel = async (modelName: string) => {
    setIsRetraining(true);
    try {
      // In real app, this would call the retrain API
      console.log(`Retraining model: ${modelName}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
    } catch (error) {
      console.error('Failed to retrain model:', error);
    } finally {
      setIsRetraining(false);
    }
  };

  // Prepare chart data
  const accuracyTrendData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    accuracy: 85 + Math.random() * 10,
    precision: 83 + Math.random() * 12,
    recall: 80 + Math.random() * 15,
  }));

  const modelComparisonData = filteredModels.map(model => ({
    name: model.modelName.split(' ')[0],
    accuracy: Math.round(model.accuracy * 100),
    precision: Math.round(model.precision * 100),
    recall: Math.round(model.recall * 100),
    f1Score: Math.round(model.f1Score * 100),
  }));

  const performanceData = filteredModels.map(model => ({
    model: model.modelName.split(' ')[0],
    predictions: model.predictions,
    trainingTime: model.trainingTime,
    dataSize: model.dataSize / 1000,
  }));

  if (isLoadingHealth) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-500" />
              ML Model Performance
            </CardTitle>
            <CardDescription>
              Monitor and manage predictive model accuracy and performance
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="dropout">Dropout Risk</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="pattern">Pattern Recognition</SelectItem>
                <SelectItem value="intervention">Intervention</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => refetchHealth()} size="sm" variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* System Health Alert */}
        {systemHealth && systemHealth.status !== 'healthy' && (
          <Alert
            variant={
              systemHealth.status === 'degraded' ? 'default' : 'destructive'
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              System Status: {systemHealth.status}.
              {systemHealth.status === 'degraded' &&
                ' Some models may have reduced accuracy.'}
              {systemHealth.status === 'down' &&
                ' Predictive features are currently unavailable.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {filteredModels.filter(m => m.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground">Active Models</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                (filteredModels.reduce((sum, m) => sum + m.accuracy, 0) /
                  filteredModels.length) *
                  100
              )}
              %
            </div>
            <p className="text-sm text-muted-foreground">Avg Accuracy</p>
          </div>
          <div className="rounded-lg border p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredModels
                .reduce((sum, m) => sum + m.predictions, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Predictions</p>
          </div>
        </div>

        <Tabs defaultValue="models" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models">Model Status</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
          </TabsList>

          {/* Model Status Tab */}
          <TabsContent value="models" className="space-y-4">
            {filteredModels.map((model, index) => (
              <motion.div
                key={model.modelName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-lg border p-4"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{model.modelName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Version {model.version} |{' '}
                        {model.predictions.toLocaleString()} predictions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={getStatusColor(model.status)}
                    >
                      {model.status}
                    </Badge>

                    {allowRetraining && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRetrainModel(model.modelName)}
                            disabled={
                              isRetraining || model.status === 'training'
                            }
                          >
                            {model.status === 'training' ? (
                              <>
                                <PauseCircle className="mr-2 h-4 w-4" />
                                Training...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="mr-2 h-4 w-4" />
                                Retrain Model
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export Metrics
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Model Metrics */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div
                      className={`text-lg font-bold ${getAccuracyColor(model.accuracy)}`}
                    >
                      {Math.round(model.accuracy * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(model.precision * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Precision</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(model.recall * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Recall</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {Math.round(model.f1Score * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">F1 Score</p>
                  </div>
                </div>

                {/* Training Info */}
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Last trained:{' '}
                    {new Date(model.lastTrained).toLocaleDateString()}
                  </span>
                  <span>
                    Training time: {model.trainingTime}h | Data:{' '}
                    {(model.dataSize / 1000).toFixed(1)}k samples
                  </span>
                </div>

                {/* Training Progress for models currently training */}
                {model.status === 'training' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Training Progress</span>
                      <span>73%</span>
                    </div>
                    <Progress value={73} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Estimated completion: 2h 15m
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </TabsContent>

          {/* Accuracy Trends Tab */}
          <TabsContent value="accuracy">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Accuracy Trends ({timeRange})</h4>
                <Select
                  value={selectedMetric}
                  onValueChange={setSelectedMetric}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accuracy">Accuracy</SelectItem>
                    <SelectItem value="precision">Precision</SelectItem>
                    <SelectItem value="recall">Recall</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" fontSize={12} />
                    <YAxis domain={[70, 100]} fontSize={12} />
                    <RechartsTooltip
                      formatter={value => [
                        `${Math.round(value as number)}%`,
                        selectedMetric,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Accuracy Alerts */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">
                      Model Performance Stable
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    All models maintaining accuracy above 75% threshold
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">
                      Recent Improvements
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pattern Recognition model improved by 3.2% this week
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="space-y-4">
              <h4 className="font-semibold">Model Performance Metrics</h4>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Predictions Volume */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Daily Predictions</h5>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" fontSize={11} />
                        <YAxis fontSize={11} />
                        <RechartsTooltip
                          formatter={value => [
                            value.toLocaleString(),
                            'Predictions',
                          ]}
                        />
                        <Bar
                          dataKey="predictions"
                          fill="#8884d8"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Training Time vs Data Size */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium">Training Efficiency</h5>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="dataSize"
                          name="Data Size (k)"
                          fontSize={11}
                        />
                        <YAxis
                          dataKey="trainingTime"
                          name="Training Time (h)"
                          fontSize={11}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => {
                            const label = String(name); // ép kiểu
                            return [
                              `${value}${label.includes('Time') ? 'h' : 'k'}`,
                              label,
                            ];
                          }}
                          labelFormatter={label =>
                            `Model: ${performanceData[label]?.model || ''}`
                          }
                        />
                        <Scatter dataKey="trainingTime" fill="#82ca9d" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {systemHealth?.processingLatency || 245}ms
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Avg Response Time
                  </p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-green-600">
                    {systemHealth?.activeModels || 4}
                  </div>
                  <p className="text-xs text-muted-foreground">Active Models</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">98.5%</div>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {filteredModels
                      .reduce((sum, m) => sum + m.trainingTime, 0)
                      .toFixed(1)}
                    h
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total Training Time
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Model Comparison Tab */}
          <TabsContent value="comparison">
            <div className="space-y-4">
              <h4 className="font-semibold">Model Performance Comparison</h4>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelComparisonData} barGap={10}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis domain={[0, 100]} fontSize={11} />
                    <RechartsTooltip formatter={value => [`${value}%`, '']} />
                    <Bar
                      dataKey="accuracy"
                      fill="#3b82f6"
                      name="Accuracy"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="precision"
                      fill="#10b981"
                      name="Precision"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="recall"
                      fill="#f59e0b"
                      name="Recall"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="f1Score"
                      fill="#8b5cf6"
                      name="F1 Score"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Best Performing Model */}
              <div className="rounded-lg border bg-gradient-to-r from-green-50 to-blue-50 p-4 dark:from-green-900/20 dark:to-blue-900/20">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="font-semibold">Best Performing Model</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {
                    filteredModels.reduce((best, current) =>
                      current.accuracy > best.accuracy ? current : best
                    ).modelName
                  }{' '}
                  -{' '}
                  {Math.round(
                    filteredModels.reduce((best, current) =>
                      current.accuracy > best.accuracy ? current : best
                    ).accuracy * 100
                  )}
                  % accuracy
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-xs text-muted-foreground">
            Last updated:{' '}
            {systemHealth?.lastModelUpdate
              ? new Date(systemHealth.lastModelUpdate).toLocaleString()
              : new Date().toLocaleString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            {allowRetraining && (
              <Button
                size="sm"
                onClick={() => handleRetrainModel('all')}
                disabled={isRetraining}
              >
                {isRetraining ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Retraining...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Retrain All Models
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
