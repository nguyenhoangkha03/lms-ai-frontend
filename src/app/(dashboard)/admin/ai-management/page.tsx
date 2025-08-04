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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
  Pause,
  RefreshCw,
  Upload,
  Edit,
  Trash2,
  BarChart3,
  Target,
  Cpu,
  HardDrive,
  Eye,
  ExternalLink,
  Copy,
  Layers,
  Plus,
} from 'lucide-react';

interface AIModel {
  id: string;
  name: string;
  description: string;
  type:
    | 'recommendation'
    | 'prediction'
    | 'classification'
    | 'nlp'
    | 'computer_vision';
  version: string;
  status:
    | 'active'
    | 'inactive'
    | 'training'
    | 'testing'
    | 'failed'
    | 'deployed';
  accuracy: number;
  lastTrained: string;
  nextTraining?: string;
  trainingProgress?: number;
  deploymentInfo: {
    environment: 'development' | 'staging' | 'production';
    instances: number;
    resources: {
      cpu: string;
      memory: string;
      gpu?: string;
    };
    endpoint: string;
    traffic: number;
  };
  metrics: {
    totalPredictions: number;
    avgResponseTime: number;
    errorRate: number;
    throughput: number;
    accuracyTrend: 'up' | 'down' | 'stable';
  };
  configuration: {
    maxBatchSize: number;
    timeout: number;
    retryAttempts: number;
    autoRetrain: boolean;
    confidenceThreshold: number;
    features: string[];
  };
  dependencies?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const mockAIModels: AIModel[] = [
  {
    id: 'model-1',
    name: 'Dropout Risk Predictor',
    description:
      'Predicts student dropout risk based on engagement patterns and performance metrics',
    type: 'prediction',
    version: '2.1.4',
    status: 'deployed',
    accuracy: 89.5,
    lastTrained: '2024-01-15T10:30:00Z',
    nextTraining: '2024-01-22T02:00:00Z',
    deploymentInfo: {
      environment: 'production',
      instances: 3,
      resources: {
        cpu: '2 vCPU',
        memory: '4 GB',
        gpu: '1 T4',
      },
      endpoint: 'https://api.lms.com/ai/dropout-prediction',
      traffic: 85,
    },
    metrics: {
      totalPredictions: 156789,
      avgResponseTime: 45,
      errorRate: 0.5,
      throughput: 125,
      accuracyTrend: 'up',
    },
    configuration: {
      maxBatchSize: 100,
      timeout: 30000,
      retryAttempts: 3,
      autoRetrain: true,
      confidenceThreshold: 0.8,
      features: [
        'engagement_score',
        'assignment_completion',
        'forum_participation',
        'login_frequency',
      ],
    },
    dependencies: ['student-analytics-service', 'redis-cache'],
    tags: ['predictive-analytics', 'student-success', 'risk-assessment'],
    createdAt: '2023-08-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: 'Dr. Sarah Johnson',
  },
  {
    id: 'model-2',
    name: 'Course Recommendation Engine',
    description:
      'Provides personalized course recommendations based on learning paths and interests',
    type: 'recommendation',
    version: '1.8.2',
    status: 'active',
    accuracy: 92.1,
    lastTrained: '2024-01-12T08:15:00Z',
    nextTraining: '2024-01-19T03:00:00Z',
    deploymentInfo: {
      environment: 'production',
      instances: 5,
      resources: {
        cpu: '4 vCPU',
        memory: '8 GB',
      },
      endpoint: 'https://api.lms.com/ai/recommendations',
      traffic: 65,
    },
    metrics: {
      totalPredictions: 234567,
      avgResponseTime: 32,
      errorRate: 0.2,
      throughput: 180,
      accuracyTrend: 'stable',
    },
    configuration: {
      maxBatchSize: 50,
      timeout: 15000,
      retryAttempts: 2,
      autoRetrain: true,
      confidenceThreshold: 0.75,
      features: [
        'user_preferences',
        'learning_history',
        'skill_gaps',
        'career_goals',
      ],
    },
    dependencies: ['course-catalog-service', 'user-profile-service'],
    tags: ['recommendations', 'personalization', 'machine-learning'],
    createdAt: '2023-06-10T14:20:00Z',
    updatedAt: '2024-01-12T08:15:00Z',
    createdBy: 'Dr. Michael Chen',
  },
  {
    id: 'model-3',
    name: 'Content Quality Analyzer',
    description: 'Analyzes course content quality and suggests improvements',
    type: 'nlp',
    version: '3.0.1',
    status: 'training',
    accuracy: 86.7,
    lastTrained: '2024-01-10T16:45:00Z',
    trainingProgress: 73,
    deploymentInfo: {
      environment: 'development',
      instances: 1,
      resources: {
        cpu: '8 vCPU',
        memory: '16 GB',
        gpu: '2 V100',
      },
      endpoint: 'https://dev-api.lms.com/ai/content-analysis',
      traffic: 0,
    },
    metrics: {
      totalPredictions: 45123,
      avgResponseTime: 280,
      errorRate: 1.2,
      throughput: 45,
      accuracyTrend: 'up',
    },
    configuration: {
      maxBatchSize: 10,
      timeout: 60000,
      retryAttempts: 1,
      autoRetrain: false,
      confidenceThreshold: 0.85,
      features: [
        'text_complexity',
        'readability_score',
        'engagement_metrics',
        'topic_coverage',
      ],
    },
    dependencies: ['nlp-processing-service', 'content-database'],
    tags: ['nlp', 'content-analysis', 'quality-assessment'],
    createdAt: '2023-11-20T09:30:00Z',
    updatedAt: '2024-01-10T16:45:00Z',
    createdBy: 'Dr. Emily Rodriguez',
  },
  {
    id: 'model-4',
    name: 'Performance Forecaster',
    description: 'Forecasts student performance in upcoming assessments',
    type: 'prediction',
    version: '1.5.8',
    status: 'inactive',
    accuracy: 78.3,
    lastTrained: '2024-01-05T12:00:00Z',
    deploymentInfo: {
      environment: 'staging',
      instances: 0,
      resources: {
        cpu: '1 vCPU',
        memory: '2 GB',
      },
      endpoint: 'https://staging-api.lms.com/ai/performance-forecast',
      traffic: 0,
    },
    metrics: {
      totalPredictions: 89456,
      avgResponseTime: 55,
      errorRate: 2.1,
      throughput: 78,
      accuracyTrend: 'down',
    },
    configuration: {
      maxBatchSize: 75,
      timeout: 25000,
      retryAttempts: 3,
      autoRetrain: false,
      confidenceThreshold: 0.7,
      features: [
        'past_performance',
        'study_time',
        'difficulty_level',
        'preparation_time',
      ],
    },
    tags: ['performance-prediction', 'assessment-analytics'],
    createdAt: '2023-09-05T11:15:00Z',
    updatedAt: '2024-01-05T12:00:00Z',
    createdBy: 'Dr. Robert Kim',
  },
];

export default function AIManagementPage() {
  const [models, setModels] = useState<AIModel[]>(mockAIModels);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredModels = models.filter(model => {
    const matchesSearch =
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.tags.some(tag => tag.includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' || model.status === statusFilter;
    const matchesType = typeFilter === 'all' || model.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'training':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'testing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return Target;
      case 'prediction':
        return TrendingUp;
      case 'classification':
        return Layers;
      case 'nlp':
        return Brain;
      case 'computer_vision':
        return Eye;
      default:
        return Brain;
    }
  };

  const handleModelAction = async (modelId: string, action: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setModels(prevModels =>
        prevModels.map(model => {
          if (model.id === modelId) {
            switch (action) {
              case 'deploy':
                return { ...model, status: 'deployed' as const };
              case 'stop':
                return { ...model, status: 'inactive' as const };
              case 'train':
                return {
                  ...model,
                  status: 'training' as const,
                  trainingProgress: 0,
                };
              default:
                return model;
            }
          }
          return model;
        })
      );

      toast.success(`Model ${action} initiated successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} model`);
    } finally {
      setLoading(false);
    }
  };

  const renderModelCard = (model: AIModel) => {
    const TypeIcon = getTypeIcon(model.type);

    return (
      <Card
        key={model.id}
        className="cursor-pointer transition-shadow hover:shadow-lg"
        onClick={() => setSelectedModel(model)}
      >
        <CardContent className="pt-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <TypeIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{model.name}</h3>
                <p className="text-sm text-muted-foreground">
                  v{model.version}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(model.status)}>
                {model.status}
              </Badge>

              {model.status === 'training' && model.trainingProgress && (
                <div className="flex items-center space-x-2">
                  <Progress value={model.trainingProgress} className="w-16" />
                  <span className="text-xs">{model.trainingProgress}%</span>
                </div>
              )}
            </div>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            {model.description}
          </p>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Accuracy</span>
                <span className="text-sm font-medium">{model.accuracy}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Predictions
                </span>
                <span className="text-sm font-medium">
                  {model.metrics.totalPredictions.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Response Time
                </span>
                <span className="text-sm font-medium">
                  {model.metrics.avgResponseTime}ms
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Error Rate
                </span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">
                    {model.metrics.errorRate}%
                  </span>
                  {model.metrics.accuracyTrend === 'up' && (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  )}
                  {model.metrics.accuracyTrend === 'down' && (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {model.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {model.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{model.tags.length - 2} more
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {model.status === 'deployed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={e => {
                    e.stopPropagation();
                    handleModelAction(model.id, 'stop');
                  }}
                  disabled={loading}
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}

              {(model.status === 'inactive' || model.status === 'failed') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={e => {
                    e.stopPropagation();
                    handleModelAction(model.id, 'deploy');
                  }}
                  disabled={loading}
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}

              <Button
                size="sm"
                variant="outline"
                onClick={e => {
                  e.stopPropagation();
                  handleModelAction(model.id, 'train');
                }}
                disabled={loading || model.status === 'training'}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderModelDetails = (model: AIModel) => {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedModel(null)}
              >
                ← Back
              </Button>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{model.name}</span>
                  <Badge className={getStatusColor(model.status)}>
                    {model.status}
                  </Badge>
                </CardTitle>
                <CardDescription>Version {model.version}</CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="deployment">Deployment</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Accuracy
                    </span>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{model.accuracy}%</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {model.metrics.accuracyTrend === 'up' && (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Improving</span>
                      </>
                    )}
                    {model.metrics.accuracyTrend === 'down' && (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">Declining</span>
                      </>
                    )}
                    {model.metrics.accuracyTrend === 'stable' && (
                      <span>Stable</span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Predictions
                    </span>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {model.metrics.totalPredictions.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Since deployment
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Avg Response
                    </span>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">
                    {model.metrics.avgResponseTime}ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last 24 hours
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Error Rate
                    </span>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {model.metrics.errorRate}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last 7 days
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-semibold">Model Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize">{model.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span>{model.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By</span>
                      <span>{model.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Last Trained
                      </span>
                      <span>
                        {new Date(model.lastTrained).toLocaleDateString()}
                      </span>
                    </div>
                    {model.nextTraining && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Next Training
                        </span>
                        <span>
                          {new Date(model.nextTraining).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-semibold">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.configuration.features.map(feature => (
                      <Badge key={feature} variant="outline">
                        {feature.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>

                  <h3 className="mb-4 mt-6 font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {model.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-semibold">Runtime Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Max Batch Size</Label>
                      <Input
                        type="number"
                        value={model.configuration.maxBatchSize}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Timeout (ms)</Label>
                      <Input
                        type="number"
                        value={model.configuration.timeout}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Retry Attempts</Label>
                      <Input
                        type="number"
                        value={model.configuration.retryAttempts}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Confidence Threshold</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={model.configuration.confidenceThreshold}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-semibold">Training Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Auto Retrain</Label>
                      <Switch checked={model.configuration.autoRetrain} />
                    </div>

                    <div>
                      <Label>Training Schedule</Label>
                      <Select defaultValue="weekly">
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="manual">Manual Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Training Data Source</Label>
                      <Input
                        value="student_analytics_db"
                        className="mt-1"
                        readOnly
                      />
                    </div>

                    <div>
                      <Label>Feature Selection</Label>
                      <Textarea
                        rows={3}
                        value={model.configuration.features.join(', ')}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Reset to Default</Button>
                <Button>Save Configuration</Button>
              </div>
            </TabsContent>

            <TabsContent value="deployment" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-4 font-semibold">Deployment Info</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment</span>
                      <Badge
                        className={
                          model.deploymentInfo.environment === 'production'
                            ? 'bg-green-100 text-green-800'
                            : model.deploymentInfo.environment === 'staging'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {model.deploymentInfo.environment}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instances</span>
                      <span>{model.deploymentInfo.instances}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Traffic</span>
                      <div className="flex items-center space-x-2">
                        <span>{model.deploymentInfo.traffic}%</span>
                        <Progress
                          value={model.deploymentInfo.traffic}
                          className="w-16"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-muted-foreground">Endpoint</span>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={model.deploymentInfo.endpoint}
                          readOnly
                          className="text-xs"
                        />
                        <Button size="sm" variant="outline">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-semibold">Resources</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">CPU</span>
                      </div>
                      <span>{model.deploymentInfo.resources.cpu}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Memory</span>
                      </div>
                      <span>{model.deploymentInfo.resources.memory}</span>
                    </div>

                    {model.deploymentInfo.resources.gpu && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">GPU</span>
                        </div>
                        <span>{model.deploymentInfo.resources.gpu}</span>
                      </div>
                    )}
                  </div>

                  {model.dependencies && (
                    <div className="mt-6">
                      <h4 className="mb-2 font-medium">Dependencies</h4>
                      <div className="space-y-1">
                        {model.dependencies.map(dep => (
                          <div
                            key={dep}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{dep}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Scale Up</Button>
                <Button variant="outline">Scale Down</Button>
                <Button variant="destructive">Stop Deployment</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {!selectedModel ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Model Management</h1>
              <p className="text-muted-foreground">
                Monitor and manage AI models and their deployments
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Model
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Model
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Search models..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="deployed">Deployed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="recommendation">
                      Recommendation
                    </SelectItem>
                    <SelectItem value="prediction">Prediction</SelectItem>
                    <SelectItem value="classification">
                      Classification
                    </SelectItem>
                    <SelectItem value="nlp">NLP</SelectItem>
                    <SelectItem value="computer_vision">
                      Computer Vision
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Models Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {filteredModels.map(model => renderModelCard(model))}
          </div>

          {filteredModels.length === 0 && (
            <div className="py-12 text-center">
              <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No models found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </>
      ) : (
        renderModelDetails(selectedModel)
      )}
    </div>
  );
}
