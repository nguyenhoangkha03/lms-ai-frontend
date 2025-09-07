'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  useGetAssessmentQuery,
  useGetAssessmentAttemptsQuery,
  useGetAIFeedbackQuery,
} from '@/lib/redux/api/assessment-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Download,
  Eye,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import AILessonRecommendations from '@/components/ai/ai-lesson-recommendations';

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const assessmentId = params.assessmentId as string;

  const { data: assessment, isLoading: assessmentLoading } =
    useGetAssessmentQuery(assessmentId);

  const { data: attempts, isLoading: attemptsLoading } =
    useGetAssessmentAttemptsQuery(assessmentId);

  const latestAttempt = attempts?.[0];

  const { data: aiFeedback, error: aiFeedbackError } = useGetAIFeedbackQuery(
    latestAttempt?.sessionId || '',
    {
      skip: true,
    }
  );

  if (aiFeedbackError) {
    console.log('AI Feedback not available:', aiFeedbackError);
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return {
        level: 'Excellent',
        color: 'bg-green-500',
        icon: Trophy,
        description: 'Outstanding performance!',
      };
    if (percentage >= 80)
      return {
        level: 'Good',
        color: 'bg-blue-500',
        icon: Target,
        description: 'Well done!',
      };
    if (percentage >= 70)
      return {
        level: 'Satisfactory',
        color: 'bg-yellow-500',
        icon: CheckCircle,
        description: 'Acceptable performance',
      };
    return {
      level: 'Needs Improvement',
      color: 'bg-red-500',
      icon: AlertTriangle,
      description: 'More practice needed',
    };
  };

  if (assessmentLoading || attemptsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (!assessment || !latestAttempt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Results Not Found</h2>
            <p className="mb-4 text-gray-600">
              No assessment results found. The assessment may not be completed
              yet.
            </p>
            <Button onClick={() => router.push('/student/assessments')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const performance = getPerformanceLevel(latestAttempt.percentage);
  const PerformanceIcon = performance.icon;
  const correctAnswers = latestAttempt.answers.filter(a => a.isCorrect).length;

  console.log('assessment', latestAttempt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Assessment Results
              </h1>
              <p className="text-gray-600">
                {assessment?.title || 'Assessment'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">
                  Attempt {latestAttempt.attemptNumber} of{' '}
                  {assessment?.maxAttempts || 'N/A'}
                </Badge>
                <Badge
                  variant={latestAttempt.passed ? 'default' : 'destructive'}
                >
                  {latestAttempt.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/student/assessments')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Assessments
              </Button>
              {(assessment?.maxAttempts || 1) > 1 &&
                attempts &&
                attempts.length < (assessment?.maxAttempts || 1) &&
                !latestAttempt.passed && (
                  <Button
                    onClick={() =>
                      router.push(`/student/assessments/${assessmentId}/take`)
                    }
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retake Assessment
                  </Button>
                )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Results */}
          <div className="space-y-6 lg:col-span-2">
            {/* Score Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <PerformanceIcon
                    className={cn(
                      'h-6 w-6',
                      getScoreColor(latestAttempt.percentage)
                    )}
                  />
                  Overall Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div
                      className={cn(
                        'mb-2 text-4xl font-bold',
                        getScoreColor(latestAttempt.percentage)
                      )}
                    >
                      {latestAttempt.score}
                    </div>
                    <div className="text-gray-600">Points Earned</div>
                    <div className="text-sm text-gray-500">
                      out of {latestAttempt.maxScore}
                    </div>
                  </div>

                  <div className="text-center">
                    <div
                      className={cn(
                        'mb-2 text-4xl font-bold',
                        getScoreColor(latestAttempt.percentage)
                      )}
                    >
                      {Math.round(latestAttempt.percentage)}%
                    </div>
                    <div className="text-gray-600">Percentage</div>
                    <div className="text-sm text-gray-500">
                      Required: {assessment.passingScore}%
                    </div>
                  </div>

                  <div className="text-center">
                    <Badge
                      className={cn(
                        'mb-2 px-4 py-2 text-lg text-white',
                        performance.color
                      )}
                    >
                      {performance.level}
                    </Badge>
                    <div className="text-sm text-gray-600">
                      {performance.description}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Score Progress</span>
                    <span>{latestAttempt.percentage}%</span>
                  </div>
                  <Progress value={latestAttempt.percentage} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span className="font-medium">
                      Passing: {assessment.passingScore}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-green-600">
                    {correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                  <div className="text-xs text-gray-500">
                    out of {latestAttempt.answers.length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-blue-600">
                    {formatTime(latestAttempt.timeSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                  <div className="text-xs text-gray-500">
                    Avg:{' '}
                    {formatTime(
                      Math.round(
                        latestAttempt.timeSpent / latestAttempt.answers.length
                      )
                    )}{' '}
                    per question
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <div className="mb-1 text-2xl font-bold text-purple-600">
                    {Math.round(
                      (correctAnswers / latestAttempt.answers.length) * 100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                  <div className="text-xs text-gray-500">
                    Questions answered correctly
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Question-by-Question Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {latestAttempt.answers.map((answer, index) => {
                    const question = assessment?.questions?.[index];
                    const option = JSON.parse(question?.options as any)?.find(
                      (option: any) => option.isCorrect === true
                    );
                    const answerText = JSON.parse(
                      question?.options as any
                    )?.find((option: any) => option.id === answer.answer)?.text;
                    console.log('question', question);
                    console.log('answerText', answerText);
                    if (!question) {
                      // Show a placeholder if question data is not available
                      return (
                        <div key={index} className="rounded-lg border p-4">
                          <div className="text-sm text-gray-500">
                            Question {index + 1} - Question details not
                            available
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={answer.questionId || index}
                        className={cn(
                          'rounded-lg border p-4 transition-colors',
                          answer.isCorrect
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        )}
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Question {index + 1}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.points || 1} points
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {question.questionType?.replace('_', ' ') ||
                                  'Question'}
                              </Badge>
                            </div>
                            <h4 className="mb-1 font-medium">
                              {question.questionText || `Question ${index + 1}`}
                            </h4>
                            {answer.isCorrect ? (
                              ''
                            ) : (
                              <p className="line-clamp-2 text-sm font-medium text-red-600">
                                <span className="mr-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                  You choose
                                </span>
                                {(answerText || '').replace(/<[^>]*>/g, '')}
                              </p>
                            )}

                            <p className="mt-1 line-clamp-2 text-sm font-medium text-green-600">
                              <span className="mr-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                The correct answer
                              </span>
                              {(option.text || '').replace(/<[^>]*>/g, '')}
                            </p>
                          </div>
                          <div className="ml-4 flex items-center gap-3">
                            <div className="text-right text-sm">
                              <div className="font-medium">
                                {answer.isCorrect ? question.points : 0}/
                                {question.points || 1}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(
                                  Math.floor((answer.timeSpent || 0) / 1000)
                                )}
                              </div>
                            </div>
                            {answer.isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-600" />
                            )}
                          </div>
                        </div>

                        {/* Show explanation for incorrect answers */}
                        {!answer.isCorrect && question.explanation && (
                          <Alert className="mt-3 border-blue-200 bg-blue-50">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-blue-800">
                              <strong>Explanation:</strong>{' '}
                              {question.explanation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI Lesson Recommendations */}
            <AILessonRecommendations
              userId={user?.id || ''}
              assessmentAttemptId={latestAttempt?.sessionId || ''}
              onLessonSelect={(lessonId) => {
                router.push(`/student/courses/lessons/${lessonId}`);
              }}
            />

            {/* AI Feedback */}
            {aiFeedback && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    AI-Powered Learning Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Overall Performance */}
                  <div>
                    <h4 className="mb-3 font-medium">Performance Summary</h4>
                    <p className="rounded-lg bg-gray-50 p-3 text-gray-700">
                      {aiFeedback.overallPerformance}
                    </p>
                  </div>

                  {/* Strengths */}
                  {aiFeedback.strengthAreas &&
                    aiFeedback.strengthAreas.length > 0 && (
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-medium text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          Your Strengths
                        </h4>
                        <ul className="space-y-2">
                          {aiFeedback.strengthAreas.map((strength, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Improvement Areas */}
                  {aiFeedback.improvementAreas &&
                    aiFeedback.improvementAreas.length > 0 && (
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-medium text-orange-700">
                          <Target className="h-4 w-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="space-y-2">
                          {aiFeedback.improvementAreas.map((area, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-500" />
                              <span className="text-sm">{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Recommendations */}
                  {aiFeedback.recommendations &&
                    aiFeedback.recommendations.length > 0 && (
                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-medium text-blue-700">
                          <BookOpen className="h-4 w-4" />
                          Learning Recommendations
                        </h4>
                        <ul className="space-y-2">
                          {aiFeedback.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                              <span className="text-sm">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Next Steps */}
                  {aiFeedback.nextSteps && aiFeedback.nextSteps.length > 0 && (
                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-medium text-purple-700">
                        <TrendingUp className="h-4 w-4" />
                        Recommended Next Steps
                      </h4>
                      <div className="space-y-3">
                        {aiFeedback.nextSteps.map((step, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 rounded-lg bg-purple-50 p-3"
                          >
                            <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white">
                              {index + 1}
                            </div>
                            <span className="text-sm text-purple-800">
                              {step}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attempt Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Attempt Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempt Number:</span>
                    <span className="font-medium">
                      {latestAttempt.attemptNumber}/{assessment.maxAttempts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Spent:</span>
                    <span className="font-medium">
                      {formatTime(latestAttempt.timeSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">
                      {new Date(latestAttempt.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted:</span>
                    <span className="font-medium">
                      {new Date(latestAttempt.submittedAt!).toLocaleString()}
                    </span>
                  </div>
                </div>

                {latestAttempt.flagged && (
                  <Alert className="border-yellow-500 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Flagged for Review:</strong>{' '}
                      {latestAttempt.flagReason}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="mr-2 h-4 w-4" />
                  Review All Answers
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                </Button>
                {latestAttempt.passed && (
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="mr-2 h-4 w-4" />
                    Get Certificate
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Previous Attempts */}
            {attempts && attempts.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {attempts.slice(1).map(attempt => (
                      <div
                        key={attempt.id}
                        className="flex items-center justify-between rounded bg-gray-50 p-3"
                      >
                        <div>
                          <div className="font-medium">
                            Attempt {attempt.attempt}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(
                              attempt.submittedAt!
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={cn(
                              'font-bold',
                              getScoreColor(attempt.percentage)
                            )}
                          >
                            {Math.round(attempt.percentage)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {attempt.passed ? 'Passed' : 'Failed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
