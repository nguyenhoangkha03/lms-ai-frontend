'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Clock,
  Brain,
  TrendingUp,
  BarChart3,
  Zap,
  Sun,
  Moon,
  Coffee,
  Sunset,
  Calendar,
  Target,
  Users,
  BookOpen,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
} from 'recharts';

import {
  useGetLearningPatternsQuery,
  useRecognizeLearningPatternsMutation,
} from '@/lib/redux/api/predictive-analytics-api';

interface LearningPatternVisualizationProps {
  studentId?: string;
  showClustering?: boolean;
  interactiveMode?: boolean;
  className?: string;
}

interface LearningPattern {
  id: string;
  patternType:
    | 'engagement'
    | 'time_preference'
    | 'difficulty_progression'
    | 'content_preference';
  description: string;
  confidence: number;
  strength: 'weak' | 'moderate' | 'strong';
  frequency: number;
  lastObserved: string;
  implications: string[];
  recommendations: string[];
  metadata: any;
}

export function LearningPatternVisualization({
  studentId,
  showClustering = false,
  interactiveMode = false,
  className = '',
}: LearningPatternVisualizationProps) {
  const [selectedPatternType, setSelectedPatternType] = useState<string>('all');
  const [minConfidence, setMinConfidence] = useState(0.5);
  const [visiblePatterns, setVisiblePatterns] = useState<string[]>([]);
  const [selectedVisualization, setSelectedVisualization] = useState('radar');

  const {
    data: patterns,
    isLoading: isLoadingPatterns,
    error: patternsError,
    refetch: refetchPatterns,
  } = useGetLearningPatternsQuery({
    studentId,
    patternType:
      selectedPatternType === 'all' ? undefined : selectedPatternType,
    minConfidence,
  });

  const [recognizePatterns, { isLoading: isRecognizing }] =
    useRecognizeLearningPatternsMutation();

  const handleRecognizePatterns = async () => {
    if (!studentId) return;

    try {
      await recognizePatterns({
        studentId,
        analysisWindow: '30d',
        includeWeakPatterns: true,
      }).unwrap();
      await refetchPatterns();
    } catch (error) {
      console.error('Failed to recognize patterns:', error);
    }
  };

  const togglePatternVisibility = (patternId: string) => {
    setVisiblePatterns(prev =>
      prev.includes(patternId)
        ? prev.filter(id => id !== patternId)
        : [...prev, patternId]
    );
  };

  const getPatternIcon = (patternType: string) => {
    switch (patternType) {
      case 'engagement':
        return <Activity className="h-4 w-4" />;
      case 'time_preference':
        return <Clock className="h-4 w-4" />;
      case 'difficulty_progression':
        return <TrendingUp className="h-4 w-4" />;
      case 'content_preference':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'weak':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTimeOfDayIcon = (hour: number) => {
    if (hour >= 6 && hour < 12) return <Sun className="h-4 w-4" />;
    if (hour >= 12 && hour < 17) return <Coffee className="h-4 w-4" />;
    if (hour >= 17 && hour < 21) return <Sunset className="h-4 w-4" />;
    return <Moon className="h-4 w-4" />;
  };

  // Prepare data for radar chart
  const radarData = useMemo(() => {
    if (!patterns) return [];

    const patternTypes = [
      'engagement',
      'time_preference',
      'difficulty_progression',
      'content_preference',
    ];
    return patternTypes.map(type => {
      const typePatterns = patterns.filter(p => p.patternType === type);
      const avgConfidence =
        typePatterns.length > 0
          ? typePatterns.reduce((sum, p) => sum + p.confidence, 0) /
            typePatterns.length
          : 0;
      const avgStrength =
        typePatterns.length > 0
          ? typePatterns.reduce(
              (sum, p) =>
                sum +
                (p.strength === 'strong'
                  ? 3
                  : p.strength === 'moderate'
                    ? 2
                    : 1),
              0
            ) / typePatterns.length
          : 0;

      return {
        pattern: type.replace('_', ' '),
        confidence: Math.round(avgConfidence * 100),
        strength: Math.round(avgStrength * 33.33),
        frequency: typePatterns.reduce((sum, p) => sum + p.frequency, 0),
      };
    });
  }, [patterns]);

  // Prepare data for scatter plot (clustering)
  const scatterData = useMemo(() => {
    if (!patterns || !showClustering) return [];

    return patterns.map(pattern => ({
      confidence: pattern.confidence * 100,
      frequency: pattern.frequency,
      strength:
        pattern.strength === 'strong'
          ? 3
          : pattern.strength === 'moderate'
            ? 2
            : 1,
      type: pattern.patternType,
      description: pattern.description,
    }));
  }, [patterns, showClustering]);

  // Prepare time preference data
  const timePreferenceData = useMemo(() => {
    if (!patterns) return [];

    const timePatterns = patterns.filter(
      p => p.patternType === 'time_preference'
    );
    if (timePatterns.length === 0) return [];

    // Mock time distribution data based on patterns
    const hours = Array.from({ length: 24 }, (_, i) => {
      const activity = Math.random() * 100; // In real app, this would come from actual data
      return {
        hour: i,
        activity,
        timeLabel: `${i.toString().padStart(2, '0')}:00`,
        period:
          i >= 6 && i < 12
            ? 'Morning'
            : i >= 12 && i < 17
              ? 'Afternoon'
              : i >= 17 && i < 21
                ? 'Evening'
                : 'Night',
      };
    });

    return hours;
  }, [patterns]);

  if (isLoadingPatterns) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-28" />
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
              <Brain className="h-5 w-5 text-purple-500" />
              Learning Pattern Analysis
            </CardTitle>
            <CardDescription>
              AI-identified patterns in learning behavior and preferences
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedPatternType}
              onValueChange={setSelectedPatternType}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="time_preference">Time Preference</SelectItem>
                <SelectItem value="difficulty_progression">
                  Difficulty
                </SelectItem>
                <SelectItem value="content_preference">Content</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleRecognizePatterns}
              disabled={isRecognizing}
              size="sm"
            >
              {isRecognizing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Patterns
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!patterns || patterns.length === 0 ? (
          <div className="py-8 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              No learning patterns detected yet
            </p>
            <Button onClick={handleRecognizePatterns} disabled={isRecognizing}>
              {isRecognizing ? (
                <>
                  <Brain className="mr-2 h-4 w-4 animate-pulse" />
                  Analyzing Patterns...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Learning Patterns
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            {/* Pattern Summary */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {patterns.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Patterns</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {patterns.filter(p => p.strength === 'strong').length}
                </div>
                <p className="text-sm text-muted-foreground">Strong Patterns</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (patterns.reduce((sum, p) => sum + p.confidence, 0) /
                      patterns.length) *
                      100
                  )}
                  %
                </div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(patterns.map(p => p.patternType)).size}
                </div>
                <p className="text-sm text-muted-foreground">Pattern Types</p>
              </div>
            </div>

            {/* Visualization Tabs */}
            <Tabs
              value={selectedVisualization}
              onValueChange={setSelectedVisualization}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="radar">Pattern Overview</TabsTrigger>
                <TabsTrigger value="clustering">Pattern Clustering</TabsTrigger>
                <TabsTrigger value="time">Time Preferences</TabsTrigger>
                <TabsTrigger value="detailed">Detailed View</TabsTrigger>
              </TabsList>

              {/* Radar Chart - Pattern Overview */}
              <TabsContent value="radar">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="pattern" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Confidence"
                        dataKey="confidence"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                      <Radar
                        name="Frequency"
                        dataKey="frequency"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.3}
                      />
                      <RechartsTooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              {/* Scatter Plot - Clustering */}
              <TabsContent value="clustering">
                {showClustering && (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart data={scatterData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="confidence"
                          name="Confidence"
                          unit="%"
                          domain={[0, 100]}
                        />
                        <YAxis dataKey="frequency" name="Frequency" />
                        <RechartsTooltip
                          formatter={(value, name) => [value, name]}
                          labelFormatter={label =>
                            `Pattern: ${scatterData[label]?.description || ''}`
                          }
                        />
                        <Scatter
                          name="Patterns"
                          dataKey="strength"
                          fill="#8884d8"
                        >
                          {scatterData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={
                                entry.type === 'engagement'
                                  ? '#8884d8'
                                  : entry.type === 'time_preference'
                                    ? '#82ca9d'
                                    : entry.type === 'difficulty_progression'
                                      ? '#ffc658'
                                      : '#ff7300'
                              }
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              {/* Time Preferences */}
              <TabsContent value="time">
                <div className="space-y-4">
                  <h4 className="font-semibold">Study Time Preferences</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timePreferenceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeLabel" fontSize={10} interval={2} />
                        <YAxis />
                        <RechartsTooltip
                          formatter={value => [
                            `${Math.round(value as number)}%`,
                            'Activity Level',
                          ]}
                          labelFormatter={label => `Time: ${label}`}
                        />
                        <Bar
                          dataKey="activity"
                          fill="#8884d8"
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Peak Activity Times */}
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {['Morning', 'Afternoon', 'Evening', 'Night'].map(
                      period => {
                        const periodData = timePreferenceData.filter(
                          d => d.period === period
                        );
                        const avgActivity =
                          periodData.length > 0
                            ? periodData.reduce(
                                (sum, d) => sum + d.activity,
                                0
                              ) / periodData.length
                            : 0;

                        return (
                          <div
                            key={period}
                            className="rounded-lg border p-3 text-center"
                          >
                            <div className="mb-2 flex items-center justify-center">
                              {getTimeOfDayIcon(
                                period === 'Morning'
                                  ? 9
                                  : period === 'Afternoon'
                                    ? 14
                                    : period === 'Evening'
                                      ? 19
                                      : 23
                              )}
                              <span className="ml-2 text-sm font-medium">
                                {period}
                              </span>
                            </div>
                            <div className="text-lg font-bold">
                              {Math.round(avgActivity)}%
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Detailed Pattern List */}
              <TabsContent value="detailed">
                <div className="space-y-4">
                  {patterns.map(pattern => (
                    <motion.div
                      key={pattern.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getPatternIcon(pattern.patternType)}
                          <div>
                            <h4 className="font-semibold capitalize">
                              {pattern.patternType.replace('_', ' ')} Pattern
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {pattern.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getStrengthColor(pattern.strength)}
                          >
                            {pattern.strength}
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(pattern.confidence * 100)}% confidence
                          </Badge>
                          {interactiveMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                togglePatternVisibility(pattern.id)
                              }
                            >
                              {visiblePatterns.includes(pattern.id) ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Pattern Details */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <TrendingUp className="h-3 w-3" />
                            Implications
                          </h5>
                          <ul className="space-y-1">
                            {pattern.implications
                              ?.slice(0, 3)
                              .map((implication, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-blue-500" />
                                  {implication}
                                </li>
                              ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                            <Target className="h-3 w-3" />
                            Recommendations
                          </h5>
                          <ul className="space-y-1">
                            {pattern.recommendations
                              ?.slice(0, 3)
                              .map((rec, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <div className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-green-500" />
                                  {rec}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>

                      {/* Pattern Metadata */}
                      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Frequency: {pattern.frequency} occurrences</span>
                        <span>
                          Last observed:{' '}
                          {new Date(pattern.lastObserved).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Pattern Insights Summary */}
            <div className="rounded-lg border bg-gradient-to-r from-purple-50 to-blue-50 p-4 dark:from-purple-900/20 dark:to-blue-900/20">
              <h4 className="mb-3 flex items-center gap-2 font-semibold">
                <Brain className="h-4 w-4" />
                Key Insights
              </h4>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Learning Style</h5>
                  <p className="text-sm text-muted-foreground">
                    {patterns.find(p => p.patternType === 'engagement')
                      ?.strength === 'strong'
                      ? 'Highly engaged learner with consistent participation'
                      : 'Moderate engagement with room for improvement'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Optimal Study Time</h5>
                  <p className="text-sm text-muted-foreground">
                    {patterns.find(p => p.patternType === 'time_preference')
                      ?.description ||
                      'Best performance during structured study sessions'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pattern Strength Distribution */}
            <div className="space-y-3">
              <h4 className="font-semibold">Pattern Strength Distribution</h4>
              <div className="space-y-2">
                {['strong', 'moderate', 'weak'].map(strength => {
                  const count = patterns.filter(
                    p => p.strength === strength
                  ).length;
                  const percentage =
                    patterns.length > 0 ? (count / patterns.length) * 100 : 0;

                  return (
                    <div key={strength} className="flex items-center gap-3">
                      <div className="w-16 text-sm capitalize">{strength}</div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {count} patterns
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(percentage)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full transition-all ${
                              strength === 'strong'
                                ? 'bg-green-500'
                                : strength === 'moderate'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Analysis Metadata */}
            <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
              <span>
                Last analysis:{' '}
                {patterns[0]
                  ? new Date(patterns[0].lastObserved).toLocaleDateString()
                  : 'N/A'}
              </span>
              <span>
                Patterns analyzed: {patterns.length} | Confidence threshold:{' '}
                {Math.round(minConfidence * 100)}%
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default LearningPatternVisualization;
