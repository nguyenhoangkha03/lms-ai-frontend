// src/components/ml-management/ABTestingInterface.tsx
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FlaskConical,
  Play,
  Pause,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Settings,
  Plus,
  Eye,
  Download,
  Filter,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  useGetABTestsQuery,
  useCreateABTestMutation,
  useStartABTestMutation,
  useStopABTestMutation,
} from '@/lib/redux/api/ml-model-api';
import { cn } from '@/lib/utils';

interface ABTestingInterfaceProps {
  className?: string;
}

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  controlModel: {
    id: string;
    name: string;
    version: string;
  };
  testModel: {
    id: string;
    name: string;
    version: string;
  };
  trafficSplit: number; // Percentage for test variant
  startDate: string;
  endDate: string;
  targetMetric: string;
  participants: number;
  conversions: {
    control: number;
    test: number;
  };
  confidence: number;
  significance: number;
  lift: number;
  results: {
    date: string;
    controlMetric: number;
    testMetric: number;
    participants: number;
  }[];
}

const mockABTests: ABTest[] = [
  {
    id: 'test-1',
    name: 'Dropout Predictor v2.1 vs v2.2',
    description:
      'Testing improved dropout prediction model with enhanced feature engineering',
    status: 'running',
    controlModel: {
      id: 'dropout-v2.1',
      name: 'Dropout Predictor',
      version: '2.1.4',
    },
    testModel: {
      id: 'dropout-v2.2',
      name: 'Dropout Predictor',
      version: '2.2.0',
    },
    trafficSplit: 20,
    startDate: '2024-01-10T00:00:00Z',
    endDate: '2024-01-24T23:59:59Z',
    targetMetric: 'accuracy',
    participants: 2847,
    conversions: {
      control: 2285,
      test: 574,
    },
    confidence: 95.2,
    significance: 0.023,
    lift: 12.4,
    results: [
      {
        date: '2024-01-10',
        controlMetric: 89.2,
        testMetric: 91.1,
        participants: 245,
      },
      {
        date: '2024-01-11',
        controlMetric: 89.5,
        testMetric: 91.8,
        participants: 287,
      },
      {
        date: '2024-01-12',
        controlMetric: 89.1,
        testMetric: 92.2,
        participants: 298,
      },
      {
        date: '2024-01-13',
        controlMetric: 89.8,
        testMetric: 92.0,
        participants: 276,
      },
      {
        date: '2024-01-14',
        controlMetric: 89.4,
        testMetric: 91.9,
        participants: 289,
      },
    ],
  },
  {
    id: 'test-2',
    name: 'Recommendation Algorithm Optimization',
    description:
      'Testing new collaborative filtering approach vs current content-based model',
    status: 'completed',
    controlModel: {
      id: 'rec-content',
      name: 'Content Recommender',
      version: '1.5.2',
    },
    testModel: {
      id: 'rec-collab',
      name: 'Collaborative Recommender',
      version: '1.0.0',
    },
    trafficSplit: 30,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-10T23:59:59Z',
    targetMetric: 'click_through_rate',
    participants: 4521,
    conversions: {
      control: 3164,
      test: 1357,
    },
    confidence: 99.1,
    significance: 0.001,
    lift: 8.7,
    results: [
      {
        date: '2024-01-01',
        controlMetric: 12.4,
        testMetric: 13.8,
        participants: 452,
      },
      {
        date: '2024-01-02',
        controlMetric: 12.1,
        testMetric: 14.2,
        participants: 478,
      },
      {
        date: '2024-01-03',
        controlMetric: 12.6,
        testMetric: 13.9,
        participants: 445,
      },
      {
        date: '2024-01-04',
        controlMetric: 12.3,
        testMetric: 14.1,
        participants: 467,
      },
      {
        date: '2024-01-05',
        controlMetric: 12.5,
        testMetric: 14.0,
        participants: 429,
      },
    ],
  },
  {
    id: 'test-3',
    name: 'Performance Prediction Enhancement',
    description:
      'Evaluating deep learning model against traditional machine learning approach',
    status: 'draft',
    controlModel: {
      id: 'perf-traditional',
      name: 'Traditional ML Predictor',
      version: '1.8.3',
    },
    testModel: {
      id: 'perf-deep',
      name: 'Deep Learning Predictor',
      version: '1.0.0',
    },
    trafficSplit: 25,
    startDate: '2024-01-16T00:00:00Z',
    endDate: '2024-01-30T23:59:59Z',
    targetMetric: 'mse',
    participants: 0,
    conversions: {
      control: 0,
      test: 0,
    },
    confidence: 0,
    significance: 0,
    lift: 0,
    results: [],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running':
      return <Play className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'paused':
      return <Pause className="h-4 w-4" />;
    case 'draft':
      return <Settings className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function ABTestingInterface({ className }: ABTestingInterfaceProps) {
  const [selectedTest, setSelectedTest] = useState<string>('test-1');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: abTests, isLoading } = useGetABTestsQuery();
  const [createABTest, { isLoading: isCreating }] = useCreateABTestMutation();
  const [startABTest, { isLoading: isStarting }] = useStartABTestMutation();
  const [stopABTest, { isLoading: isStopping }] = useStopABTestMutation();

  const [newTestForm, setNewTestForm] = useState({
    name: '',
    description: '',
    controlModel: '',
    testModel: '',
    trafficSplit: 20,
    targetMetric: '',
    duration: 14,
  });

  const filteredTests = mockABTests.filter(
    test => filterStatus === 'all' || test.status === filterStatus
  );

  const selectedTestData = mockABTests.find(test => test.id === selectedTest);

  const handleCreateTest = async () => {
    try {
      await createABTest(newTestForm).unwrap();
      setShowCreateDialog(false);
      setNewTestForm({
        name: '',
        description: '',
        controlModel: '',
        testModel: '',
        trafficSplit: 20,
        targetMetric: '',
        duration: 14,
      });
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const handleStartTest = async (testId: string) => {
    try {
      await startABTest({ testId }).unwrap();
    } catch (error) {
      console.error('Failed to start A/B test:', error);
    }
  };

  const handleStopTest = async (testId: string) => {
    try {
      await stopABTest({ testId }).unwrap();
    } catch (error) {
      console.error('Failed to stop A/B test:', error);
    }
  };

  const runningTests = mockABTests.filter(
    test => test.status === 'running'
  ).length;
  const completedTests = mockABTests.filter(
    test => test.status === 'completed'
  ).length;
  const totalParticipants = mockABTests.reduce(
    (sum, test) => sum + test.participants,
    0
  );
  const avgLift =
    mockABTests
      .filter(test => test.status === 'completed')
      .reduce((sum, test) => sum + test.lift, 0) / completedTests || 0;

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
            A/B Testing Dashboard
          </h1>
          <p className="text-muted-foreground">
            Design, run, and analyze A/B tests for AI model improvements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New A/B Test</DialogTitle>
                <DialogDescription>
                  Set up a new experiment to compare model performance
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-name">Test Name</Label>
                    <Input
                      id="test-name"
                      placeholder="Enter test name"
                      value={newTestForm.name}
                      onChange={e =>
                        setNewTestForm(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target-metric">Target Metric</Label>
                    <Select
                      value={newTestForm.targetMetric}
                      onValueChange={value =>
                        setNewTestForm(prev => ({
                          ...prev,
                          targetMetric: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="precision">Precision</SelectItem>
                        <SelectItem value="recall">Recall</SelectItem>
                        <SelectItem value="f1_score">F1 Score</SelectItem>
                        <SelectItem value="click_through_rate">
                          Click Through Rate
                        </SelectItem>
                        <SelectItem value="conversion_rate">
                          Conversion Rate
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the test hypothesis and goals"
                    value={newTestForm.description}
                    onChange={e =>
                      setNewTestForm(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="control-model">Control Model</Label>
                    <Select
                      value={newTestForm.controlModel}
                      onValueChange={value =>
                        setNewTestForm(prev => ({
                          ...prev,
                          controlModel: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select control model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dropout-v2.1">
                          Dropout Predictor v2.1
                        </SelectItem>
                        <SelectItem value="performance-v1.8">
                          Performance Forecaster v1.8
                        </SelectItem>
                        <SelectItem value="recommendation-v1.5">
                          Recommendation Engine v1.5
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-model">Test Model</Label>
                    <Select
                      value={newTestForm.testModel}
                      onValueChange={value =>
                        setNewTestForm(prev => ({ ...prev, testModel: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select test model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dropout-v2.2">
                          Dropout Predictor v2.2
                        </SelectItem>
                        <SelectItem value="performance-v2.0">
                          Performance Forecaster v2.0
                        </SelectItem>
                        <SelectItem value="recommendation-v2.0">
                          Recommendation Engine v2.0
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="traffic-split">Traffic Split (%)</Label>
                    <Input
                      id="traffic-split"
                      type="number"
                      min="5"
                      max="50"
                      value={newTestForm.trafficSplit}
                      onChange={e =>
                        setNewTestForm(prev => ({
                          ...prev,
                          trafficSplit: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (days)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="90"
                      value={newTestForm.duration}
                      onChange={e =>
                        setNewTestForm(prev => ({
                          ...prev,
                          duration: parseInt(e.target.value),
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
                <Button onClick={handleCreateTest} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Test'}
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
            <CardTitle className="text-sm font-medium">Running Tests</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningTests}</div>
            <p className="text-xs text-muted-foreground">Active experiments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tests
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests}</div>
            <p className="text-xs text-muted-foreground">
              Finished experiments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalParticipants.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all tests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLift.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              From completed tests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Test List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              A/B Tests
            </CardTitle>
            <CardDescription>
              Manage and monitor your experiments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredTests.map(test => (
              <div
                key={test.id}
                className={cn(
                  'cursor-pointer rounded-lg border p-4 transition-colors',
                  selectedTest === test.id
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => setSelectedTest(test.id)}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="line-clamp-1 text-sm font-medium">
                      {test.name}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {test.description}
                    </p>
                  </div>
                  <Badge
                    className={cn('ml-2 text-xs', getStatusColor(test.status))}
                  >
                    {getStatusIcon(test.status)}
                    <span className="ml-1 capitalize">{test.status}</span>
                  </Badge>
                </div>

                <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Participants:</span>
                    <span className="ml-1 font-medium">
                      {test.participants.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Split:</span>
                    <span className="ml-1 font-medium">
                      {100 - test.trafficSplit}%/{test.trafficSplit}%
                    </span>
                  </div>
                </div>

                {test.status === 'running' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {Math.min(
                          100,
                          (test.participants / 5000) * 100
                        ).toFixed(0)}
                        %
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (test.participants / 5000) * 100)}
                      className="h-1"
                    />
                  </div>
                )}

                {test.status === 'completed' && test.lift > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>+{test.lift.toFixed(1)}% improvement</span>
                  </div>
                )}

                <div className="mt-2 flex justify-end gap-1">
                  {test.status === 'draft' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        handleStartTest(test.id);
                      }}
                      disabled={isStarting}
                    >
                      Start
                    </Button>
                  )}
                  {test.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        handleStopTest(test.id);
                      }}
                      disabled={isStopping}
                    >
                      Stop
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

        {/* Test Details */}
        <Card className="lg:col-span-2">
          {selectedTestData ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {selectedTestData.name}
                      <Badge
                        className={getStatusColor(selectedTestData.status)}
                      >
                        {getStatusIcon(selectedTestData.status)}
                        <span className="ml-1 capitalize">
                          {selectedTestData.status}
                        </span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedTestData.description}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedTestData.participants.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Participants
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedTestData.confidence.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Confidence
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedTestData.lift.toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Lift
                        </div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {selectedTestData.significance.toFixed(3)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          P-value
                        </div>
                      </div>
                    </div>

                    {/* Traffic Split Visualization */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-medium">Traffic Split</h4>
                        <div className="h-32">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  {
                                    name: 'Control',
                                    value: 100 - selectedTestData.trafficSplit,
                                  },
                                  {
                                    name: 'Test',
                                    value: selectedTestData.trafficSplit,
                                  },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                dataKey="value"
                              >
                                {[0, 1].map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip formatter={value => `${value}%`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 font-medium">Model Comparison</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between rounded border p-2">
                            <div>
                              <div className="text-sm font-medium">
                                Control Model
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedTestData.controlModel.name} v
                                {selectedTestData.controlModel.version}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {selectedTestData.conversions.control.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                conversions
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between rounded border p-2">
                            <div>
                              <div className="text-sm font-medium">
                                Test Model
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedTestData.testModel.name} v
                                {selectedTestData.testModel.version}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {selectedTestData.conversions.test.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                conversions
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="performance" className="space-y-4">
                    {selectedTestData.results.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={selectedTestData.results}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="controlMetric"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              name="Control"
                            />
                            <Line
                              type="monotone"
                              dataKey="testMetric"
                              stroke="#10b981"
                              strokeWidth={2}
                              name="Test"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        No performance data available yet
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="space-y-3">
                        <h4 className="font-medium">Test Configuration</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Target Metric:
                            </span>
                            <span className="font-medium">
                              {selectedTestData.targetMetric}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Traffic Split:
                            </span>
                            <span className="font-medium">
                              {100 - selectedTestData.trafficSplit}% /{' '}
                              {selectedTestData.trafficSplit}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Start Date:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                selectedTestData.startDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              End Date:
                            </span>
                            <span className="font-medium">
                              {new Date(
                                selectedTestData.endDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium">
                          Statistical Significance
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Confidence Level:
                            </span>
                            <span className="font-medium">
                              {selectedTestData.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              P-value:
                            </span>
                            <span className="font-medium">
                              {selectedTestData.significance.toFixed(3)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Effect Size:
                            </span>
                            <span className="font-medium">
                              {selectedTestData.lift.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sample Size:
                            </span>
                            <span className="font-medium">
                              {selectedTestData.participants.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedTestData.status === 'completed' && (
                      <div className="mt-4 rounded-lg bg-muted/50 p-4">
                        <h4 className="mb-2 font-medium">Test Results</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedTestData.lift > 0 ? (
                            <>
                              The test variant showed a{' '}
                              <strong>
                                {selectedTestData.lift.toFixed(1)}%
                              </strong>{' '}
                              improvement over the control with{' '}
                              <strong>
                                {selectedTestData.confidence.toFixed(1)}%
                              </strong>{' '}
                              confidence. This result is statistically
                              significant (p ={' '}
                              {selectedTestData.significance.toFixed(3)}).
                            </>
                          ) : (
                            <>
                              The test variant did not show significant
                              improvement over the control. Consider running the
                              test longer or trying a different approach.
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-96 items-center justify-center">
              <div className="text-center">
                <FlaskConical className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="font-medium">Select an A/B Test</h3>
                <p className="text-sm text-muted-foreground">
                  Choose a test from the list to view detailed results and
                  analytics
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
