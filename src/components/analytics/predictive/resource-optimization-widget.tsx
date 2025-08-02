'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Clock,
  BookOpen,
  Calendar,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Text,
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  useGetResourceOptimizationsQuery,
  useGenerateResourceOptimizationMutation,
} from '@/lib/redux/api/predictive-analytics-api';

interface ResourceOptimizationWidgetProps {
  studentId?: string;
  courseId?: string;
  showDetails?: boolean;
  className?: string;
}

interface ResourceOptimization {
  id: string;
  resourceType: 'time' | 'content' | 'difficulty' | 'schedule';
  currentUtilization: number;
  optimalUtilization: number;
  recommendations: string[];
  expectedImprovement: number;
  priority: number;
  implementationCost: number;
}

export function ResourceOptimizationWidget({
  studentId,
  courseId,
  showDetails = true,
  className = '',
}: ResourceOptimizationWidgetProps) {
  const [selectedResourceType, setSelectedResourceType] =
    useState<string>('all');
  const [optimizationGoal, setOptimizationGoal] = useState('efficiency');

  const {
    data: optimizations,
    isLoading: isLoadingOptimizations,
    error: optimizationsError,
    refetch: refetchOptimizations,
  } = useGetResourceOptimizationsQuery({
    studentId,
    courseId,
    resourceType:
      selectedResourceType === 'all' ? undefined : selectedResourceType,
  });

  const [generateOptimization, { isLoading: isGenerating }] =
    useGenerateResourceOptimizationMutation();

  const handleGenerateOptimization = async () => {
    if (!studentId) return;

    try {
      await generateOptimization({
        studentId,
        courseId,
        resourceTypes:
          selectedResourceType === 'all' ? undefined : [selectedResourceType],
        optimizationGoals: [optimizationGoal],
      }).unwrap();
      await refetchOptimizations();
    } catch (error) {
      console.error('Failed to generate optimization:', error);
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'time':
        return <Clock className="h-4 w-4" />;
      case 'content':
        return <BookOpen className="h-4 w-4" />;
      case 'difficulty':
        return <Target className="h-4 w-4" />;
      case 'schedule':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getUtilizationColor = (current: number, optimal: number) => {
    const efficiency = (current / optimal) * 100;
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getImprovementDirection = (expectedImprovement: number) => {
    if (expectedImprovement > 0) {
      return {
        icon: <ArrowUpRight className="h-3 w-3" />,
        color: 'text-green-600',
        label: 'Improvement',
      };
    } else {
      return {
        icon: <ArrowDownRight className="h-3 w-3" />,
        color: 'text-red-600',
        label: 'Decline',
      };
    }
  };

  // Prepare chart data
  const utilizationData =
    optimizations?.map(opt => ({
      resource: opt.resourceType,
      current: Math.round(opt.currentUtilization * 100),
      optimal: Math.round(opt.optimalUtilization * 100),
      gap: Math.round((opt.optimalUtilization - opt.currentUtilization) * 100),
    })) || [];

  const improvementData =
    optimizations?.map(opt => ({
      resource: opt.resourceType,
      improvement: Math.round(opt.expectedImprovement * 100),
      priority: opt.priority,
      cost: opt.implementationCost,
    })) || [];

  const pieData =
    optimizations?.map((opt, index) => ({
      name: opt.resourceType,
      value: Math.round(opt.expectedImprovement * 100),
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index % 4],
    })) || [];

  if (isLoadingOptimizations) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-32 w-full" />
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
              <Zap className="h-5 w-5 text-orange-500" />
              Resource Optimization
            </CardTitle>
            <CardDescription>
              AI-powered recommendations for optimal resource utilization
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedResourceType}
              onValueChange={setSelectedResourceType}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="schedule">Schedule</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={optimizationGoal}
              onValueChange={setOptimizationGoal}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efficiency">Efficiency</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="retention">Retention</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleGenerateOptimization}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Optimize
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!optimizations || optimizations.length === 0 ? (
          <div className="py-8 text-center">
            <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No optimization recommendations available
            </p>
            <Button
              onClick={handleGenerateOptimization}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Optimizations...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Generate Optimizations
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {optimizations.length}
                </div>
                <p className="text-sm text-muted-foreground">Optimizations</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  +
                  {Math.round(
                    optimizations.reduce(
                      (sum, opt) => sum + opt.expectedImprovement,
                      0
                    ) * 100
                  )}
                  %
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Improvement
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {optimizations.filter(opt => opt.priority >= 7).length}
                </div>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    optimizations.reduce(
                      (sum, opt) => sum + opt.implementationCost,
                      0
                    ) / optimizations.length
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Avg Cost</p>
              </div>
            </div>

            {showDetails && (
              <Tabs defaultValue="utilization" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="utilization">
                    Current vs Optimal
                  </TabsTrigger>
                  <TabsTrigger value="improvements">
                    Expected Improvements
                  </TabsTrigger>
                  <TabsTrigger value="recommendations">
                    Recommendations
                  </TabsTrigger>
                </TabsList>

                {/* Utilization Chart */}
                <TabsContent value="utilization">
                  <div className="space-y-4">
                    <h4 className="font-semibold">
                      Resource Utilization Analysis
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={utilizationData} barGap={10}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="resource"
                            fontSize={12}
                            tick={({ x, y, payload }) => (
                              <Text
                                x={x}
                                y={y + 10}
                                textAnchor="middle"
                                fontSize={12}
                              >
                                {String(payload.value).charAt(0).toUpperCase() +
                                  String(payload.value).slice(1)}
                              </Text>
                            )}
                          />
                          <YAxis unit="%" fontSize={12} />
                          <RechartsTooltip
                            formatter={(value, name) => [
                              `${value}%`,
                              name === 'current' ? 'Current' : 'Optimal',
                            ]}
                            labelFormatter={label => `Resource: ${label}`}
                          />
                          <Bar
                            dataKey="current"
                            fill="#ef4444"
                            name="Current"
                            radius={[2, 2, 0, 0]}
                          />
                          <Bar
                            dataKey="optimal"
                            fill="#10b981"
                            name="Optimal"
                            radius={[2, 2, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>

                {/* Improvements Chart */}
                <TabsContent value="improvements">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Expected Improvements</h4>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}%`}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={value => [
                                `${value}%`,
                                'Expected Improvement',
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3">
                        {improvementData.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-2">
                              {getResourceIcon(item.resource)}
                              <span className="font-medium capitalize">
                                {item.resource}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                {getImprovementDirection(item.improvement).icon}
                                <span
                                  className={`font-bold ${getImprovementDirection(item.improvement).color}`}
                                >
                                  {Math.abs(item.improvement)}%
                                </span>
                              </div>
                              <Badge variant="outline" className="mt-1">
                                P{item.priority}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Detailed Recommendations */}
                <TabsContent value="recommendations">
                  <div className="space-y-4">
                    {optimizations.map((optimization, index) => (
                      <motion.div
                        key={optimization.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-lg border p-4"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-muted p-2">
                              {getResourceIcon(optimization.resourceType)}
                            </div>
                            <div>
                              <h4 className="font-semibold capitalize">
                                {optimization.resourceType} Optimization
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Current:{' '}
                                {Math.round(
                                  optimization.currentUtilization * 100
                                )}
                                % | Optimal:{' '}
                                {Math.round(
                                  optimization.optimalUtilization * 100
                                )}
                                %
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                optimization.priority >= 7
                                  ? 'border-red-500 text-red-600'
                                  : optimization.priority >= 4
                                    ? 'border-yellow-500 text-yellow-600'
                                    : 'border-blue-500 text-blue-600'
                              }
                            >
                              Priority {optimization.priority}
                            </Badge>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline">
                                    Cost: {optimization.implementationCost}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Implementation cost (1-10 scale)</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>

                        {/* Utilization Progress */}
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Current Utilization</span>
                            <span
                              className={getUtilizationColor(
                                optimization.currentUtilization,
                                optimization.optimalUtilization
                              )}
                            >
                              {Math.round(
                                optimization.currentUtilization * 100
                              )}
                              %
                            </span>
                          </div>
                          <Progress
                            value={optimization.currentUtilization * 100}
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              Gap to optimal:{' '}
                              {Math.round(
                                (optimization.optimalUtilization -
                                  optimization.currentUtilization) *
                                  100
                              )}
                              %
                            </span>
                            <span>
                              Expected improvement: +
                              {Math.round(
                                optimization.expectedImprovement * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-2">
                          <h5 className="flex items-center gap-2 text-sm font-semibold">
                            <Lightbulb className="h-3 w-3" />
                            Recommendations
                          </h5>
                          <ul className="space-y-1">
                            {optimization.recommendations
                              .slice(0, 3)
                              .map((rec, recIndex) => (
                                <li
                                  key={recIndex}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                                  {rec}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Quick Implementation Guide */}
            {!showDetails && (
              <div className="space-y-3">
                <h4 className="font-semibold">Quick Wins</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {optimizations
                    .filter(
                      opt =>
                        opt.implementationCost <= 3 &&
                        opt.expectedImprovement > 0.1
                    )
                    .slice(0, 4)
                    .map((opt, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border bg-green-50 p-3 dark:bg-green-900/10"
                      >
                        {getResourceIcon(opt.resourceType)}
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">
                            {opt.resourceType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            +{Math.round(opt.expectedImprovement * 100)}%
                            improvement
                          </p>
                        </div>
                        <Badge variant="outline" className="text-green-600">
                          Low Cost
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-xs text-muted-foreground">
                Last optimization: {new Date().toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchOptimizations()}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
