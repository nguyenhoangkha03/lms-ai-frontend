'use client';

import {
  ChevronLeft,
  Calendar,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  FileText,
  Target,
  Award,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface StudentGradeDetailsProps {
  studentId: string;
  gradebookId: string;
  onBack: () => void;
}

export function StudentGradeDetails({
  studentId,
  gradebookId,
  onBack,
}: StudentGradeDetailsProps) {
  // Mock data - in real implementation, this would come from API
  const studentData = {
    id: studentId,
    name: 'John Doe',
    email: 'john.doe@email.com',
    avatar: null,
    enrollmentDate: '2024-01-15',
    overallGrade: 85.5,
    overallPercentage: 85.5,
    letterGrade: 'B',
    rank: 12,
    attendance: 92,
    participation: 88,
    lastActivity: '2024-02-15T10:30:00Z',
    riskLevel: 'low',
    trends: {
      recent: 'improving',
      direction: 'up',
      change: 5.2,
    },
    grades: [
      {
        assessmentId: 'assess-1',
        assessmentTitle: 'Midterm Exam',
        score: 88,
        maxScore: 100,
        percentage: 88,
        submittedAt: '2024-02-10T14:00:00Z',
        gradedAt: '2024-02-12T09:00:00Z',
        status: 'graded',
        feedback:
          'Excellent understanding of key concepts. Work on showing more detailed steps in calculations.',
        isPublished: true,
      },
      {
        assessmentId: 'assess-2',
        assessmentTitle: 'Essay Assignment',
        score: 82,
        maxScore: 100,
        percentage: 82,
        submittedAt: '2024-02-05T16:30:00Z',
        gradedAt: '2024-02-07T11:00:00Z',
        status: 'graded',
        feedback:
          'Good argumentation and structure. Consider strengthening your conclusion.',
        isPublished: true,
      },
      {
        assessmentId: 'assess-3',
        assessmentTitle: 'Lab Report #3',
        score: 90,
        maxScore: 100,
        percentage: 90,
        submittedAt: '2024-01-28T12:00:00Z',
        gradedAt: '2024-01-30T15:00:00Z',
        status: 'graded',
        feedback: 'Thorough analysis and clear presentation of results.',
        isPublished: true,
      },
      {
        assessmentId: 'assess-4',
        assessmentTitle: 'Quiz #5',
        score: 0,
        maxScore: 50,
        percentage: 0,
        submittedAt: null,
        gradedAt: null,
        status: 'missing',
        feedback: null,
        isPublished: false,
      },
    ],
    analytics: {
      strengths: ['Problem solving', 'Critical thinking', 'Research skills'],
      improvements: ['Time management', 'Attention to detail'],
      predictions: {
        finalGrade: 87.2,
        confidence: 0.85,
        riskFactors: [],
      },
    },
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {studentData.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{studentData.name}</h2>
            <p className="text-muted-foreground">{studentData.email}</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.letterGrade}</div>
            <div className="text-sm text-muted-foreground">
              {studentData.overallPercentage}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{studentData.rank}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />+
              {studentData.trends.change}% trend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.attendance}%</div>
            <Progress value={studentData.attendance} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                studentData.riskLevel === 'low' ? 'default' : 'destructive'
              }
              className="capitalize"
            >
              {studentData.riskLevel}
            </Badge>
            <div className="mt-1 text-xs text-muted-foreground">
              Last activity:{' '}
              {new Date(studentData.lastActivity).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="grades" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        {/* Grades Tab */}
        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentData.grades.map((grade, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">
                            {grade.assessmentTitle}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {grade.submittedAt
                                ? `Submitted: ${new Date(grade.submittedAt).toLocaleDateString()}`
                                : 'Not submitted'}
                            </span>
                            {grade.gradedAt && (
                              <>
                                <span>•</span>
                                <span>
                                  Graded:{' '}
                                  {new Date(
                                    grade.gradedAt
                                  ).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {grade.feedback && (
                        <div className="mt-3 rounded-lg bg-muted p-3">
                          <p className="text-sm">{grade.feedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <div
                        className={`text-lg font-bold ${getGradeColor(grade.percentage)}`}
                      >
                        {grade.status === 'missing'
                          ? 'Missing'
                          : `${grade.score}/${grade.maxScore}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {grade.status === 'missing'
                          ? ''
                          : `${grade.percentage}%`}
                      </div>
                      <Badge className={getStatusColor(grade.status)}>
                        {grade.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentData.analytics.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentData.analytics.improvements.map(
                    (improvement, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{improvement}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Predictive Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Predicted Final Grade:</span>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {studentData.analytics.predictions.finalGrade}%
                    </div>
                    <Badge variant="outline">
                      {(
                        studentData.analytics.predictions.confidence * 100
                      ).toFixed(1)}
                      % confidence
                    </Badge>
                  </div>
                </div>

                <Progress
                  value={studentData.analytics.predictions.finalGrade}
                  className="h-3"
                />

                {studentData.analytics.predictions.riskFactors.length === 0 ? (
                  <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <p className="text-sm text-green-700 dark:text-green-400">
                      No risk factors identified. Student is on track for
                      success.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {studentData.analytics.predictions.riskFactors.map(
                      (factor: string, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20"
                        >
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {factor}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  No Communication History
                </h3>
                <p className="mb-4 text-muted-foreground">
                  No messages or communications with this student yet.
                </p>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
