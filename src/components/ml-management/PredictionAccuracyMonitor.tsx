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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Target,
  TrendingUp,
  TrendingDown,
  Eye,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Search,
  ArrowRight,
  Zap,
  Clock,
  Users,
  Database,
  Gauge,
  Brain,
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
  PieChart as RechartsPieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  useGetPredictionAccuracyQuery,
  useGetPredictionStatsQuery,
} from '@/lib/redux/api/ml-model-api';
import { cn } from '@/lib/utils';

interface PredictionAccuracyMonitorProps {
  className?: string;
}

interface PredictionRecord {
  id: string;
  modelId: string;
  modelName: string;
  predictionType: string;
  inputData: any;
  prediction: any;
  actualOutcome?: any;
  confidence: number;
  accuracy?: number;
  timestamp: string;
  processingTime: number;
  wasCorrect?: boolean;
  userId?: string;
  contextData?: any;
}

interface AccuracyMetrics {
  overall: number;
  byModel: Array<{
    modelId: string;
    modelName: string;
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
    confidence: number;
  }>;
  byTimeRange: Array<{
    date: string;
    accuracy: number;
    predictions: number;
    avgConfidence: number;
  }>;
  byPredictionType: Array<{
    type: string;
    accuracy: number;
    count: number;
    avgProcessingTime: number;
  }>;
  confidenceDistribution: Array<{
    range: string;
    count: number;
    accuracy: number;
  }>;
}

const mockPredictionData: PredictionRecord[] = [
  {
    id: 'pred-1',
    modelId: 'dropout-predictor',
    modelName: 'Dropout Risk Predictor',
    predictionType: 'dropout_risk',
    inputData: {
      studentId: 'student-123',
      engagementScore: 0.75,
      assignmentCompletion: 0.82,
      lastActivity: '2024-01-14T10:00:00Z',
    },
    prediction: {
      risk: 'low',
      probability: 0.23,
      factors: ['high_engagement', 'consistent_activity'],
    },
    actualOutcome: {
      didDropout: false,
      verifiedAt: '2024-01-28T00:00:00Z',
    },
    confidence: 0.89,
    accuracy: 1.0,
    timestamp: '2024-01-14T10:30:00Z',
    processingTime: 45,
    wasCorrect: true,
    userId: 'student-123',
  },
  {
    id: 'pred-2',
    modelId: 'performance-forecaster',
    modelName: 'Performance Forecaster',
    predictionType: 'grade_prediction',
    inputData: {
      studentId: 'student-456',
      currentGrade: 78,
      studyHours: 15,
      quizScores: [85, 79, 82],
    },
    prediction: {
      finalGrade: 84,
      confidence: 0.76,
      suggestedActions: ['increase_study_time'],
    },
    actualOutcome: {
      finalGrade: 86,
      verifiedAt: '2024-01-30T00:00:00Z',
    },
    confidence: 0.76,
    accuracy: 0.95,
    timestamp: '2024-01-14T11:15:00Z',
    processingTime: 32,
    wasCorrect: true,
    userId: 'student-456',
  },
  {
    id: 'pred-3',
    modelId: 'learning-pattern',
    modelName: 'Learning Pattern Recognizer',
    predictionType: 'learning_style',
    inputData: {
      studentId: 'student-789',
      completionPattern: 'evening',
      contentPreference: 'visual',
      interactionData: {},
    },
    prediction: {
      primaryStyle: 'visual',
      secondaryStyle: 'kinesthetic',
      confidence: 0.82,
    },
    actualOutcome: {
      selfReportedStyle: 'visual',
      verifiedAt: '2024-01-20T00:00:00Z',
    },
    confidence: 0.82,
    accuracy: 1.0,
    timestamp: '2024-01-14T12:45:00Z',
    processingTime: 67,
    wasCorrect: true,
    userId: 'student-789',
  },
];

const mockAccuracyMetrics: AccuracyMetrics = {
  overall: 87.4,
  byModel: [
    {
      modelId: 'dropout-predictor',
      modelName: 'Dropout Risk Predictor',
      accuracy: 89.5,
      totalPredictions: 15247,
      correctPredictions: 13646,
      confidence: 0.92,
    },
    {
      modelId: 'performance-forecaster',
      modelName: 'Performance Forecaster',
      accuracy: 84.7,
      totalPredictions: 8934,
      correctPredictions: 7567,
      confidence: 0.85,
    },
    {
      modelId: 'learning-pattern',
      modelName: 'Learning Pattern Recognizer',
      accuracy: 91.2,
      totalPredictions: 22156,
      correctPredictions: 20194,
      confidence: 0.96,
    },
  ],
  byTimeRange: [
    {
      date: '2024-01-10',
      accuracy: 86.2,
      predictions: 1247,
      avgConfidence: 0.89,
    },
    {
      date: '2024-01-11',
      accuracy: 87.1,
      predictions: 1398,
      avgConfidence: 0.91,
    },
    {
      date: '2024-01-12',
      accuracy: 88.0,
      predictions: 1502,
      avgConfidence: 0.93,
    },
    {
      date: '2024-01-13',
      accuracy: 86.8,
      predictions: 1289,
      avgConfidence: 0.88,
    },
    {
      date: '2024-01-14',
      accuracy: 87.4,
      predictions: 1456,
      avgConfidence: 0.9,
    },
  ],
  byPredictionType: [
    {
      type: 'dropout_risk',
      accuracy: 89.5,
      count: 15247,
      avgProcessingTime: 45,
    },
    {
      type: 'grade_prediction',
      accuracy: 84.7,
      count: 8934,
      avgProcessingTime: 32,
    },
    {
      type: 'learning_style',
      accuracy: 91.2,
      count: 22156,
      avgProcessingTime: 67,
    },
    {
      type: 'content_recommendation',
      accuracy: 76.3,
      count: 18943,
      avgProcessingTime: 28,
    },
  ],
  confidenceDistribution: [
    { range: '0.0-0.2', count: 1247, accuracy: 45.2 },
    { range: '0.2-0.4', count: 2893, accuracy: 62.1 },
    { range: '0.4-0.6', count: 5672, accuracy: 74.8 },
    { range: '0.6-0.8', count: 12456, accuracy: 85.3 },
    { range: '0.8-1.0', count: 24067, accuracy: 94.7 },
  ],
};

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

export function PredictionAccuracyMonitor({
  className,
}: PredictionAccuracyMonitorProps) {
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: accuracyData, isLoading: isLoadingAccuracy } =
    useGetPredictionAccuracyQuery({
      modelId: selectedModel,
      timeRange,
      predictionType: selectedType,
    });

  const { data: predictionStats, isLoading: isLoadingStats } =
    useGetPredictionStatsQuery();

  const filteredPredictions = mockPredictionData.filter(prediction => {
    const matchesModel =
      selectedModel === 'all' || prediction.modelId === selectedModel;
    const matchesType =
      selectedType === 'all' || prediction.predictionType === selectedType;
    const matchesSearch =
      searchTerm === '' ||
      prediction.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.predictionType
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesModel && matchesType && matchesSearch;
  });

  const totalPredictions = mockAccuracyMetrics.byModel.reduce(
    (sum, model) => sum + model.totalPredictions,
    0
  );
  const totalCorrect = mockAccuracyMetrics.byModel.reduce(
    (sum, model) => sum + model.correctPredictions,
    0
  );
  const avgConfidence =
    mockAccuracyMetrics.byModel.reduce(
      (sum, model) => sum + model.confidence,
      0
    ) / mockAccuracyMetrics.byModel.length;

  if (isLoadingAccuracy || isLoadingStats) {
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
            Prediction Accuracy Monitor
          </h1>
          <p className="text-muted-foreground">
            Track and analyze the accuracy of ML model predictions over time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search predictions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-64 pl-8"
            />
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Accuracy
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAccuracyMetrics.overall}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +2.1% from last week
            </div>
            <Progress value={mockAccuracyMetrics.overall} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Predictions
            </CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPredictions.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +847 today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Correct Predictions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCorrect.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
              {((totalCorrect / totalPredictions) * 100).toFixed(1)}% success
              rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Confidence
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(avgConfidence * 100).toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +1.3% confidence
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="model-filter">Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Models</SelectItem>
                  {mockAccuracyMetrics.byModel.map(model => (
                    <SelectItem key={model.modelId} value={model.modelId}>
                      {model.modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type-filter">Prediction Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {mockAccuracyMetrics.byPredictionType.map(type => (
                    <SelectItem key={type.type} value={type.type}>
                      {type.type
                        .replace('_', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Accuracy Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Accuracy Trends</CardTitle>
            <CardDescription>
              Prediction accuracy over time across all models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timeline" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockAccuracyMetrics.byTimeRange}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString()
                        }
                      />
                      <YAxis domain={[80, 95]} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Accuracy (%)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAccuracyMetrics.byModel}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="modelName"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="accuracy"
                        fill="#3b82f6"
                        name="Accuracy (%)"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Confidence vs Accuracy Analysis</CardTitle>
            <CardDescription>
              Relationship between prediction confidence and actual accuracy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="distribution" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
                <TabsTrigger value="correlation">Correlation</TabsTrigger>
              </TabsList>

              <TabsContent value="distribution" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockAccuracyMetrics.confidenceDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="count"
                        fill="#10b981"
                        name="Prediction Count"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="accuracy"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Accuracy (%)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="correlation" className="space-y-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={mockPredictionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="confidence" domain={[0, 1]} />
                      <YAxis dataKey="accuracy" domain={[0, 1]} />
                      <Tooltip />
                      <Legend />
                      <Scatter
                        name="Predictions"
                        dataKey="accuracy"
                        fill="#3b82f6"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Model Performance Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Breakdown</CardTitle>
          <CardDescription>
            Detailed accuracy metrics for each model
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockAccuracyMetrics.byModel.map((model, index) => (
              <div key={model.modelId} className="rounded-lg border p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{model.modelName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {model.totalPredictions.toLocaleString()} total
                      predictions
                    </p>
                  </div>
                  <Badge variant="outline">
                    {model.accuracy.toFixed(1)}% accuracy
                  </Badge>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {model.correctPredictions.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {(
                        model.totalPredictions - model.correctPredictions
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Incorrect
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {(model.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg Confidence
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {model.accuracy.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Accuracy
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Accuracy</span>
                    <span>{model.accuracy.toFixed(1)}%</span>
                  </div>
                  <Progress value={model.accuracy} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span>{(model.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={model.confidence * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
          <CardDescription>
            Latest prediction results with accuracy validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPredictions.slice(0, 10).map(prediction => (
              <div key={prediction.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      {prediction.modelName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {prediction.predictionType
                        .replace('_', ' ')
                        .replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        prediction.wasCorrect ? 'default' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {prediction.wasCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {(prediction.confidence * 100).toFixed(0)}% conf
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">Predicted:</span>
                    <div className="font-medium">
                      {typeof prediction.prediction === 'object'
                        ? JSON.stringify(prediction.prediction).substring(
                            0,
                            50
                          ) + '...'
                        : prediction.prediction}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actual:</span>
                    <div className="font-medium">
                      {prediction.actualOutcome
                        ? typeof prediction.actualOutcome === 'object'
                          ? JSON.stringify(prediction.actualOutcome).substring(
                              0,
                              50
                            ) + '...'
                          : prediction.actualOutcome
                        : 'Pending verification'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Processing:</span>
                    <div className="font-medium">
                      {prediction.processingTime}ms
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(prediction.timestamp).toLocaleString()}</span>
                  <Button variant="ghost" size="sm" className="h-6">
                    <Eye className="mr-1 h-3 w-3" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
