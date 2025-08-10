'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Users,
  BookOpen,
  Target,
  Clock,
  Award,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface Insight {
  id: string;
  type: 'recommendation' | 'alert' | 'opportunity' | 'trend';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: {
    value: number | string;
    trend?: 'up' | 'down' | 'stable';
    change?: number;
  };
  actions: Array<{
    label: string;
    type: 'primary' | 'secondary';
    url?: string;
  }>;
  affectedStudents?: number;
  estimatedImpact?: string;
  category: 'engagement' | 'performance' | 'content' | 'assessment' | 'behavior';
}

interface AnalyticsInsightsProps {
  insights?: Insight[];
  isLoading?: boolean;
}

// Mock insights data
const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'alert',
    priority: 'high',
    title: 'Declining Engagement in Neural Networks Module',
    description: 'Student engagement has dropped 25% in the Neural Networks module. Students are spending 40% less time on video content and discussion participation is down.',
    metric: {
      value: '25%',
      trend: 'down',
      change: -25,
    },
    actions: [
      { label: 'Review Content', type: 'primary', url: '/teacher/content/neural-networks' },
      { label: 'Send Motivational Message', type: 'secondary' },
    ],
    affectedStudents: 32,
    estimatedImpact: 'High - may affect final course completion',
    category: 'engagement',
  },
  {
    id: '2',
    type: 'recommendation',
    priority: 'medium',
    title: 'Optimal Time for Live Sessions',
    description: 'Analysis shows your students are most active between 10 AM - 12 PM and 7 PM - 9 PM. Scheduling live sessions during these times could increase participation by up to 35%.',
    metric: {
      value: '35%',
      trend: 'up',
      change: 35,
    },
    actions: [
      { label: 'Schedule Session', type: 'primary', url: '/teacher/live-sessions/create' },
      { label: 'View Full Analysis', type: 'secondary' },
    ],
    affectedStudents: 67,
    estimatedImpact: 'Medium - improved real-time engagement',
    category: 'behavior',
  },
  {
    id: '3',
    type: 'opportunity',
    priority: 'medium',
    title: 'High-Performing Students Ready for Advanced Content',
    description: '15 students consistently score above 90% and complete assignments early. They would benefit from additional challenging material or mentorship opportunities.',
    metric: {
      value: '15',
      trend: 'stable',
    },
    actions: [
      { label: 'Create Advanced Track', type: 'primary' },
      { label: 'Setup Peer Mentoring', type: 'secondary' },
    ],
    affectedStudents: 15,
    estimatedImpact: 'High - improved student satisfaction and retention',
    category: 'performance',
  },
  {
    id: '4',
    type: 'trend',
    priority: 'low',
    title: 'Steady Improvement in Python Assignments',
    description: 'Average scores for Python assignments have increased by 12% over the last 4 weeks. Students are showing consistent improvement in coding fundamentals.',
    metric: {
      value: '12%',
      trend: 'up',
      change: 12,
    },
    actions: [
      { label: 'View Detailed Progress', type: 'secondary' },
      { label: 'Share Success Story', type: 'secondary' },
    ],
    affectedStudents: 45,
    estimatedImpact: 'Positive - continued skill development',
    category: 'performance',
  },
  {
    id: '5',
    type: 'alert',
    priority: 'high',
    title: 'Assessment Difficulty Mismatch',
    description: 'The "Advanced Algorithms" quiz has a 23% pass rate, significantly lower than course average. Consider reviewing question difficulty or providing additional preparation materials.',
    metric: {
      value: '23%',
      trend: 'down',
      change: -54,
    },
    actions: [
      { label: 'Review Assessment', type: 'primary', url: '/teacher/assessments/advanced-algorithms' },
      { label: 'Add Prep Materials', type: 'secondary' },
    ],
    affectedStudents: 41,
    estimatedImpact: 'High - may affect course progression',
    category: 'assessment',
  },
];

const getInsightIcon = (type: string, category: string) => {
  switch (type) {
    case 'recommendation':
      return <Lightbulb className="h-5 w-5 text-blue-500" />;
    case 'alert':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'opportunity':
      return <Target className="h-5 w-5 text-green-500" />;
    case 'trend':
      return <TrendingUp className="h-5 w-5 text-purple-500" />;
    default:
      return <Brain className="h-5 w-5 text-gray-500" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'engagement':
      return <Users className="h-4 w-4" />;
    case 'performance':
      return <Award className="h-4 w-4" />;
    case 'content':
      return <BookOpen className="h-4 w-4" />;
    case 'assessment':
      return <CheckCircle className="h-4 w-4" />;
    case 'behavior':
      return <Clock className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

export function AnalyticsInsights({ insights = mockInsights, isLoading = false }: AnalyticsInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-lg border-white/30 shadow-xl">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-slate-200 rounded-lg"></div>
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const sortedInsights = insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">AI-Powered Insights</h2>
            <p className="text-slate-600">Smart recommendations to improve your teaching effectiveness</p>
          </div>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">High Priority</p>
                <p className="text-2xl font-bold text-red-900">
                  {insights.filter(i => i.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {insights.filter(i => i.priority === 'medium').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">Recommendations</p>
                <p className="text-2xl font-bold text-blue-900">
                  {insights.filter(i => i.type === 'recommendation').length}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Opportunities</p>
                <p className="text-2xl font-bold text-green-900">
                  {insights.filter(i => i.type === 'opportunity').length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="space-y-4">
        {sortedInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                      {getInsightIcon(insight.type, insight.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{insight.title}</h3>
                        <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                          {insight.priority} priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <div className="flex items-center space-x-1">
                            {getCategoryIcon(insight.category)}
                            <span className="capitalize">{insight.category}</span>
                          </div>
                        </Badge>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>

                  {insight.metric && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-slate-800">
                          {insight.metric.value}
                        </span>
                        {insight.metric.trend && (
                          <div className={`flex items-center space-x-1 ${
                            insight.metric.trend === 'up' ? 'text-green-600' :
                            insight.metric.trend === 'down' ? 'text-red-600' : 'text-slate-600'
                          }`}>
                            {insight.metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                            {insight.metric.trend === 'down' && <TrendingUp className="h-4 w-4 rotate-180" />}
                            {insight.metric.change && (
                              <span className="text-sm font-medium">
                                {insight.metric.change > 0 ? '+' : ''}{insight.metric.change}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Affected Students:</span>
                      <span className="font-medium text-slate-800">{insight.affectedStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Estimated Impact:</span>
                      <span className="font-medium text-slate-800">{insight.estimatedImpact}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    {insight.actions.map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.type === 'primary' ? 'default' : 'outline'}
                        size="sm"
                        className={action.type === 'primary' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
                      >
                        {action.label}
                        {action.url && <ArrowRight className="ml-2 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Items Summary */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-purple-500" />
            Quick Action Items
          </CardTitle>
          <CardDescription>
            Priority actions based on current insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedInsights.slice(0, 3).map((insight, index) => (
              <div key={insight.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-200/50">
                <div className="flex items-center space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                    <span className="text-xs font-medium text-purple-700">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{insight.title}</span>
                </div>
                <Button size="sm" variant="ghost" className="text-purple-600">
                  Take Action
                  <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}