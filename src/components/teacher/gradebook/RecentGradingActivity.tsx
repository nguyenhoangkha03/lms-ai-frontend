'use client';

import {
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  FileText,
  TrendingUp,
  Eye,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function RecentGradingActivity() {
  // Mock data - in real implementation, this would come from API
  const recentActivities = [
    {
      id: '1',
      type: 'grade_submitted',
      studentName: 'Alice Johnson',
      assessmentTitle: 'Midterm Exam',
      score: 92,
      maxScore: 100,
      timestamp: '2024-02-15T14:30:00Z',
      status: 'published',
    },
    {
      id: '2',
      type: 'grade_updated',
      studentName: 'Bob Smith',
      assessmentTitle: 'Essay Assignment',
      score: 85,
      maxScore: 100,
      timestamp: '2024-02-15T13:15:00Z',
      status: 'pending',
    },
    {
      id: '3',
      type: 'ai_grading_completed',
      studentName: 'Carol Davis',
      assessmentTitle: 'Lab Report #4',
      score: 88,
      maxScore: 100,
      timestamp: '2024-02-15T12:45:00Z',
      status: 'needs_review',
    },
    {
      id: '4',
      type: 'bulk_operation',
      description: 'Applied curve to Quiz #6',
      affectedStudents: 25,
      timestamp: '2024-02-15T11:20:00Z',
      status: 'completed',
    },
    {
      id: '5',
      type: 'grade_published',
      studentName: 'David Wilson',
      assessmentTitle: 'Project Presentation',
      score: 95,
      maxScore: 100,
      timestamp: '2024-02-15T10:30:00Z',
      status: 'published',
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'grade_submitted':
      case 'grade_updated':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ai_grading_completed':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'bulk_operation':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'grade_published':
        return <Eye className="h-4 w-4 text-purple-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'needs_review':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatActivityDescription = (activity: any) => {
    switch (activity.type) {
      case 'grade_submitted':
        return `Graded ${activity.assessmentTitle} for ${activity.studentName}`;
      case 'grade_updated':
        return `Updated grade for ${activity.studentName} on ${activity.assessmentTitle}`;
      case 'ai_grading_completed':
        return `AI completed grading ${activity.assessmentTitle} for ${activity.studentName}`;
      case 'bulk_operation':
        return activity.description;
      case 'grade_published':
        return `Published grade to ${activity.studentName} for ${activity.assessmentTitle}`;
      default:
        return 'Unknown activity';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Grading Activity
          </CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map(activity => (
            <div
              key={activity.id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="mt-1">{getActivityIcon(activity.type)}</div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <p className="truncate text-sm font-medium">
                    {formatActivityDescription(activity)}
                  </p>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  {activity.score !== undefined && (
                    <>
                      <span>•</span>
                      <span>
                        {activity.score}/{activity.maxScore} points
                      </span>
                    </>
                  )}
                  {activity.affectedStudents && (
                    <>
                      <span>•</span>
                      <span>{activity.affectedStudents} students</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
