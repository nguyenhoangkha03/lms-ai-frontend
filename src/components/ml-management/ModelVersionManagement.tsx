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
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  GitBranch,
  Upload,
  Download,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  ArrowRight,
  Tag,
  Calendar,
  Users,
  Database,
  Settings,
  Eye,
  Edit,
  Trash2,
  Copy,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Target,
  Activity,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';
import {
  useGetModelVersionsQuery,
  useCreateModelVersionMutation,
  useDeployModelVersionMutation,
} from '@/lib/redux/api/ml-model-api';
import { cn } from '@/lib/utils';

interface ModelVersionManagementProps {
  className?: string;
}

interface ModelVersion {
  id: string;
  modelId: string;
  modelName: string;
  version: string;
  description: string;
  status: 'draft' | 'training' | 'testing' | 'deployed' | 'archived' | 'failed';
  createdAt: string;
  deployedAt?: string;
  createdBy: string;
  artifacts: {
    modelPath: string;
    dockerImage: string;
    configFile: string;
    weights: string;
  };
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    trainingTime: number;
    modelSize: number;
    inferenceTime: number;
  };
  trainingConfig: {
    dataset: string;
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
  };
  deploymentInfo?: {
    environment: string;
    instances: number;
    resources: {
      cpu: string;
      memory: string;
      gpu?: string;
    };
    traffic: number;
  };
  performanceHistory: Array<{
    date: string;
    accuracy: number;
    latency: number;
    throughput: number;
    errorRate: number;
  }>;
  rollbackInfo?: {
    canRollback: boolean;
    previousVersion?: string;
    rollbackReason?: string;
  };
}

const mockModelVersions: ModelVersion[] = [
  {
    id: 'version-1',
    modelId: 'dropout-predictor',
    modelName: 'Dropout Risk Predictor',
    version: '2.1.4',
    description:
      'Improved feature engineering with student engagement metrics and time-series analysis',
    status: 'deployed',
    createdAt: '2024-01-15T10:30:00Z',
    deployedAt: '2024-01-15T14:00:00Z',
    createdBy: 'Dr. Sarah Johnson',
    artifacts: {
      modelPath: '/models/dropout-predictor/v2.1.4/model.pkl',
      dockerImage: 'ml-registry/dropout-predictor:2.1.4',
      configFile: '/models/dropout-predictor/v2.1.4/config.json',
      weights: '/models/dropout-predictor/v2.1.4/weights.h5',
    },
    metrics: {
      accuracy: 89.5,
      precision: 87.2,
      recall: 85.8,
      f1Score: 86.5,
      trainingTime: 4.2,
      modelSize: 145.7,
      inferenceTime: 45,
    },
    trainingConfig: {
      dataset: 'student_data_2024_q1',
      epochs: 100,
      batchSize: 32,
      learningRate: 0.001,
      optimizer: 'Adam',
    },
    deploymentInfo: {
      environment: 'production',
      instances: 3,
      resources: {
        cpu: '2 vCPU',
        memory: '4 GB',
        gpu: '1 T4',
      },
      traffic: 85,
    },
    performanceHistory: [
      {
        date: '2024-01-15',
        accuracy: 89.5,
        latency: 45,
        throughput: 125,
        errorRate: 0.5,
      },
      {
        date: '2024-01-16',
        accuracy: 89.2,
        latency: 46,
        throughput: 128,
        errorRate: 0.6,
      },
      {
        date: '2024-01-17',
        accuracy: 89.8,
        latency: 44,
        throughput: 132,
        errorRate: 0.4,
      },
    ],
    rollbackInfo: {
      canRollback: true,
      previousVersion: '2.1.3',
    },
  },
  {
    id: 'version-2',
    modelId: 'dropout-predictor',
    modelName: 'Dropout Risk Predictor',
    version: '2.2.0',
    description:
      'Major update with deep learning architecture and attention mechanisms',
    status: 'testing',
    createdAt: '2024-01-18T09:15:00Z',
    createdBy: 'Dr. Sarah Johnson',
    artifacts: {
      modelPath: '/models/dropout-predictor/v2.2.0/model.pkl',
      dockerImage: 'ml-registry/dropout-predictor:2.2.0',
      configFile: '/models/dropout-predictor/v2.2.0/config.json',
      weights: '/models/dropout-predictor/v2.2.0/weights.h5',
    },
    metrics: {
      accuracy: 92.1,
      precision: 91.3,
      recall: 89.7,
      f1Score: 90.5,
      trainingTime: 8.7,
      modelSize: 234.2,
      inferenceTime: 67,
    },
    trainingConfig: {
      dataset: 'student_data_2024_q1_enhanced',
      epochs: 150,
      batchSize: 16,
      learningRate: 0.0005,
      optimizer: 'AdamW',
    },
    performanceHistory: [
      {
        date: '2024-01-18',
        accuracy: 92.1,
        latency: 67,
        throughput: 95,
        errorRate: 0.3,
      },
      {
        date: '2024-01-19',
        accuracy: 91.8,
        latency: 68,
        throughput: 92,
        errorRate: 0.4,
      },
    ],
    rollbackInfo: {
      canRollback: false,
    },
  },
  {
    id: 'version-3',
    modelId: 'performance-forecaster',
    modelName: 'Performance Forecaster',
    version: '1.8.7',
    description:
      'Bug fixes and performance optimizations for grade prediction accuracy',
    status: 'deployed',
    createdAt: '2024-01-12T14:20:00Z',
    deployedAt: '2024-01-12T16:30:00Z',
    createdBy: 'Dr. Michael Chen',
    artifacts: {
      modelPath: '/models/performance-forecaster/v1.8.7/model.pkl',
      dockerImage: 'ml-registry/performance-forecaster:1.8.7',
      configFile: '/models/performance-forecaster/v1.8.7/config.json',
      weights: '/models/performance-forecaster/v1.8.7/weights.h5',
    },
    metrics: {
      accuracy: 82.3,
      precision: 84.1,
      recall: 79.5,
      f1Score: 81.7,
      trainingTime: 2.8,
      modelSize: 89.3,
      inferenceTime: 32,
    },
    trainingConfig: {
      dataset: 'grade_history_2024',
      epochs: 80,
      batchSize: 64,
      learningRate: 0.002,
      optimizer: 'SGD',
    },
    deploymentInfo: {
      environment: 'production',
      instances: 2,
      resources: {
        cpu: '1 vCPU',
        memory: '2 GB',
      },
      traffic: 65,
    },
    performanceHistory: [
      {
        date: '2024-01-12',
        accuracy: 82.3,
        latency: 32,
        throughput: 105,
        errorRate: 1.2,
      },
      {
        date: '2024-01-13',
        accuracy: 82.1,
        latency: 33,
        throughput: 102,
        errorRate: 1.1,
      },
      {
        date: '2024-01-14',
        accuracy: 82.5,
        latency: 31,
        throughput: 108,
        errorRate: 0.9,
      },
    ],
    rollbackInfo: {
      canRollback: true,
      previousVersion: '1.8.6',
    },
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'deployed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'testing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'training':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    case 'archived':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'deployed':
      return <CheckCircle className="h-4 w-4" />;
    case 'testing':
      return <Play className="h-4 w-4" />;
    case 'training':
      return <Clock className="h-4 w-4" />;
    case 'draft':
      return <FileText className="h-4 w-4" />;
    case 'archived':
      return <Package className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

export function ModelVersionManagement({
  className,
}: ModelVersionManagementProps) {
  const [selectedModel, setSelectedModel] =
    useState<string>('dropout-predictor');
  const [selectedVersion, setSelectedVersion] = useState<string>('version-1');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeployDialog, setShowDeployDialog] = useState(false);

  const [newVersionForm, setNewVersionForm] = useState({
    version: '',
    description: '',
    basedOn: '',
    dataset: '',
    epochs: 100,
    batchSize: 32,
    learningRate: 0.001,
  });

  const { data: versions, isLoading } = useGetModelVersionsQuery(selectedModel);
  const [createVersion, { isLoading: isCreating }] =
    useCreateModelVersionMutation();
  const [deployVersion, { isLoading: isDeploying }] =
    useDeployModelVersionMutation();

  const filteredVersions = mockModelVersions.filter(
    version => selectedModel === 'all' || version.modelId === selectedModel
  );

  const selectedVersionData = mockModelVersions.find(
    version => version.id === selectedVersion
  );

  const handleCreateVersion = async () => {
    try {
      await createVersion({
        modelId: selectedModel,
        data: newVersionForm,
      }).unwrap();
      setShowCreateDialog(false);
      setNewVersionForm({
        version: '',
        description: '',
        basedOn: '',
        dataset: '',
        epochs: 100,
        batchSize: 32,
        learningRate: 0.001,
      });
    } catch (error) {
      console.error('Failed to create version:', error);
    }
  };

  const handleDeployVersion = async (versionId: string) => {
    try {
      await deployVersion({ versionId }).unwrap();
      setShowDeployDialog(false);
    } catch (error) {
      console.error('Failed to deploy version:', error);
    }
  };

  const deployedVersions = filteredVersions.filter(
    v => v.status === 'deployed'
  ).length;
  const testingVersions = filteredVersions.filter(
    v => v.status === 'testing'
  ).length;
  const draftVersions = filteredVersions.filter(
    v => v.status === 'draft'
  ).length;

  if (isLoading) {
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
            Model Version Management
          </h1>
          <p className="text-muted-foreground">
            Manage model versions, deployments, and rollbacks across
            environments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-48">
              <GitBranch className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              <SelectItem value="dropout-predictor">
                Dropout Predictor
              </SelectItem>
              <SelectItem value="performance-forecaster">
                Performance Forecaster
              </SelectItem>
              <SelectItem value="learning-pattern">Learning Pattern</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Create Version
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Model Version</DialogTitle>
                <DialogDescription>
                  Create a new version of the selected model with custom
                  configuration
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version">Version Number</Label>
                    <Input
                      id="version"
                      placeholder="e.g., 2.1.5"
                      value={newVersionForm.version}
                      onChange={e =>
                        setNewVersionForm(prev => ({
                          ...prev,
                          version: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="based-on">Based On Version</Label>
                    <Select
                      value={newVersionForm.basedOn}
                      onValueChange={value =>
                        setNewVersionForm(prev => ({ ...prev, basedOn: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select base version" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredVersions.map(version => (
                          <SelectItem key={version.id} value={version.version}>
                            v{version.version}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the changes and improvements in this version"
                    value={newVersionForm.description}
                    onChange={e =>
                      setNewVersionForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataset">Training Dataset</Label>
                  <Select
                    value={newVersionForm.dataset}
                    onValueChange={value =>
                      setNewVersionForm(prev => ({ ...prev, dataset: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student_data_2024_q1">
                        Student Data 2024 Q1
                      </SelectItem>
                      <SelectItem value="student_data_2024_q1_enhanced">
                        Enhanced Student Data 2024 Q1
                      </SelectItem>
                      <SelectItem value="grade_history_2024">
                        Grade History 2024
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="epochs">Epochs</Label>
                    <Input
                      id="epochs"
                      type="number"
                      value={newVersionForm.epochs}
                      onChange={e =>
                        setNewVersionForm(prev => ({
                          ...prev,
                          epochs: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Size</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      value={newVersionForm.batchSize}
                      onChange={e =>
                        setNewVersionForm(prev => ({
                          ...prev,
                          batchSize: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learning-rate">Learning Rate</Label>
                    <Input
                      id="learning-rate"
                      type="number"
                      step="0.0001"
                      value={newVersionForm.learningRate}
                      onChange={e =>
                        setNewVersionForm(prev => ({
                          ...prev,
                          learningRate: parseFloat(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateVersion} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Version'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Deployed Versions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {deployedVersions}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Testing Versions
            </CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {testingVersions}
            </div>
            <p className="text-xs text-muted-foreground">Under evaluation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Draft Versions
            </CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {draftVersions}
            </div>
            <p className="text-xs text-muted-foreground">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Versions
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredVersions.length}</div>
            <p className="text-xs text-muted-foreground">Across all models</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Version List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Model Versions
            </CardTitle>
            <CardDescription>
              All versions for{' '}
              {selectedModel === 'all' ? 'all models' : 'selected model'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredVersions.map(version => (
              <div
                key={version.id}
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-colors',
                  selectedVersion === version.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => setSelectedVersion(version.id)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium">
                      {version.modelName} v{version.version}
                    </h4>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {version.description}
                    </p>
                  </div>
                  <Badge
                    className={cn('text-xs', getStatusColor(version.status))}
                  >
                    {getStatusIcon(version.status)}
                    <span className="ml-1 capitalize">{version.status}</span>
                  </Badge>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-1 font-medium">
                      {version.metrics.accuracy}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <span className="ml-1 font-medium">
                      {version.metrics.modelSize}MB
                    </span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created by {version.createdBy} •{' '}
                  {new Date(version.createdAt).toLocaleDateString()}
                </div>

                <div className="mt-2 flex justify-end gap-1">
                  {version.status === 'testing' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        setShowDeployDialog(true);
                      }}
                    >
                      Deploy
                    </Button>
                  )}
                  {version.status === 'deployed' &&
                    version.rollbackInfo?.canRollback && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs"
                        onClick={e => e.stopPropagation()}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
                    onClick={e => e.stopPropagation()}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Version Details */}
        <Card className="lg:col-span-2">
          {selectedVersionData ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedVersionData.modelName} v
                      {selectedVersionData.version}
                      <Badge
                        className={getStatusColor(selectedVersionData.status)}
                      >
                        {getStatusIcon(selectedVersionData.status)}
                        <span className="ml-1 capitalize">
                          {selectedVersionData.status}
                        </span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedVersionData.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Clone
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="deployment">Deployment</TabsTrigger>
                    <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Performance Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-xl font-bold text-blue-600">
                          {selectedVersionData.metrics.accuracy}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Accuracy
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-xl font-bold text-green-600">
                          {selectedVersionData.metrics.f1Score}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          F1 Score
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-xl font-bold text-purple-600">
                          {selectedVersionData.metrics.inferenceTime}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Inference Time
                        </div>
                      </div>
                      <div className="rounded-lg border p-3 text-center">
                        <div className="text-xl font-bold text-orange-600">
                          {selectedVersionData.metrics.modelSize}MB
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Model Size
                        </div>
                      </div>
                    </div>
                    {/* Rest of TabsContent continues... */}
                  </TabsContent>
                  {/* Other TabsContent sections... */}
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-96 items-center justify-center">
              <div className="text-center">
                <GitBranch className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="font-medium">Select a Model Version</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a version from the list to view detailed information
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Deployment Dialog */}
      <Dialog open={showDeployDialog} onOpenChange={setShowDeployDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deploy Model Version</DialogTitle>
            <DialogDescription>
              Deploy this version to production environment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will deploy the selected version to production and may
                affect live traffic. Make sure the version has been thoroughly
                tested.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label>Traffic Split (%)</Label>
              <Input type="number" defaultValue="100" min="0" max="100" />
            </div>
            <div className="space-y-2">
              <Label>Rollback Strategy</Label>
              <Select defaultValue="automatic">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">
                    Automatic (on error)
                  </SelectItem>
                  <SelectItem value="manual">Manual only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeployDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedVersionData &&
                handleDeployVersion(selectedVersionData.id)
              }
              disabled={isDeploying}
            >
              {isDeploying ? 'Deploying...' : 'Deploy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
