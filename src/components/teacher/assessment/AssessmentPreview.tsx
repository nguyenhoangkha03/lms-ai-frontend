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
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  Clock,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  BookOpen,
  Target,
  Shield,
  Timer,
  Award,
  FileText,
  Camera,
  Monitor,
  Settings,
} from 'lucide-react';

import { Assessment } from '@/types/assessment';

interface AssessmentPreviewProps {
  assessment: Assessment;
  onBack: () => void;
}

export const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  assessment,
  onBack,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(
    assessment.timeLimit ? assessment.timeLimit * 60 : null
  );
  const [isStarted, setIsStarted] = useState(false);

  // Handle answer changes
  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Navigation
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(
      Math.max(0, Math.min(index, assessment.questions.length - 1))
    );
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Get current question
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const progress =
    assessment.questions.length > 0
      ? ((currentQuestionIndex + 1) / assessment.questions.length) * 100
      : 0;
  const answeredCount = Object.keys(answers).length;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render question based on type
  const renderQuestion = (question: any) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case 'multiple_choice':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer || ''}
              onValueChange={value => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.text} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case 'true_false':
        return (
          <div className="space-y-4">
            <RadioGroup
              value={answer || ''}
              onValueChange={value => handleAnswerChange(question.id, value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer">
                  True
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer">
                  False
                </Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 'short_answer':
        return (
          <div className="space-y-4">
            <Input
              value={answer || ''}
              onChange={e => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              className="w-full"
            />
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <Textarea
              value={answer || ''}
              onChange={e => handleAnswerChange(question.id, e.target.value)}
              placeholder="Write your essay response..."
              rows={8}
              className="w-full"
            />
            <div className="text-sm text-muted-foreground">
              Word count:{' '}
              {answer ? answer.split(/\s+/).filter(Boolean).length : 0}
            </div>
          </div>
        );

      case 'fill_in_the_blank':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {question.questionText
                .split('___')
                .map((part: string, index: number) => (
                  <span key={index}>
                    {part}
                    {index < question.questionText.split('___').length - 1 && (
                      <Input
                        className="mx-2 inline-block w-32"
                        value={answer?.[index] || ''}
                        onChange={e => {
                          const newAnswer = { ...answer };
                          newAnswer[index] = e.target.value;
                          handleAnswerChange(question.id, newAnswer);
                        }}
                      />
                    )}
                  </span>
                ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-muted-foreground">
              Question type: {question.questionType}
            </p>
          </div>
        );
    }
  };

  if (!isStarted) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
          <Badge variant="secondary">Preview Mode</Badge>
        </div>

        {/* Assessment Info */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{assessment.title}</CardTitle>
            <CardDescription className="mt-2 text-base">
              {assessment.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Assessment Details */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">
                    {assessment.questions.length}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>

              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">
                    {assessment.timeLimit
                      ? `${assessment.timeLimit} min`
                      : 'Unlimited'}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">Time Limit</div>
              </div>

              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">{assessment.totalPoints}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Points
                </div>
              </div>

              <div className="text-center">
                <div className="mb-1 flex items-center justify-center gap-1">
                  <Award className="h-4 w-4" />
                  <span className="font-medium">
                    {assessment.passingScore}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Passing Score
                </div>
              </div>
            </div>

            {/* Instructions */}
            {assessment.instructions && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Instructions
                  </h3>
                  <div className="prose prose-sm whitespace-pre-wrap text-muted-foreground">
                    {assessment.instructions}
                  </div>
                </div>
              </>
            )}

            {/* Assessment Settings */}
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <Settings className="h-4 w-4" />
                Assessment Settings
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Maximum Attempts:</span>
                    <Badge variant="outline">
                      {assessment.maxAttempts === 99
                        ? 'Unlimited'
                        : assessment.maxAttempts}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Question Order:</span>
                    <Badge variant="outline">
                      {assessment.randomizeQuestions ? 'Randomized' : 'Fixed'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Answer Options:</span>
                    <Badge variant="outline">
                      {assessment.randomizeAnswers ? 'Shuffled' : 'Fixed'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Show Results:</span>
                    <Badge
                      variant={assessment.showResults ? 'default' : 'secondary'}
                    >
                      {assessment.showResults ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Show Correct Answers:</span>
                    <Badge
                      variant={
                        assessment.showCorrectAnswers ? 'default' : 'secondary'
                      }
                    >
                      {assessment.showCorrectAnswers ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Mandatory:</span>
                    <Badge
                      variant={
                        assessment.isMandatory ? 'destructive' : 'secondary'
                      }
                    >
                      {assessment.isMandatory ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Anti-Cheat Settings */}
            {assessment.isProctored && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-medium">
                    <Shield className="h-4 w-4" />
                    Security & Proctoring
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {assessment.antiCheatSettings.proctoring.requireWebcam && (
                      <div className="flex items-center gap-2 text-sm">
                        <Camera className="h-4 w-4 text-blue-600" />
                        <span>Webcam Required</span>
                      </div>
                    )}

                    {assessment.antiCheatSettings.lockdown.fullscreenMode && (
                      <div className="flex items-center gap-2 text-sm">
                        <Monitor className="h-4 w-4 text-blue-600" />
                        <span>Fullscreen Mode</span>
                      </div>
                    )}

                    {assessment.antiCheatSettings.lockdown
                      .preventTabSwitching && (
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span>Tab Switch Prevention</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        This assessment uses proctoring and anti-cheat measures.
                        Make sure you're in a suitable environment before
                        starting.
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Start Button */}
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={() => setIsStarted(true)}
                className="px-8"
              >
                Start Assessment Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Assessment Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onBack} size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Exit Preview
              </Button>
              <div>
                <h2 className="font-semibold">{assessment.title}</h2>
                <Badge variant="secondary" className="mt-1">
                  Preview Mode
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Progress:</span>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-24" />
                  <span className="text-sm text-muted-foreground">
                    {currentQuestionIndex + 1}/{assessment.questions.length}
                  </span>
                </div>
              </div>

              {/* Timer */}
              {timeRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span className="font-mono text-sm">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Question Content */}
        <div className="col-span-9">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {currentQuestionIndex + 1}
                  </div>
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {currentQuestion?.questionType?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {currentQuestion?.points}{' '}
                      {currentQuestion?.points === 1 ? 'point' : 'points'}
                    </Badge>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question Text */}
              <div className="text-lg leading-relaxed">
                {currentQuestion?.questionText}
              </div>

              {/* Question Hint */}
              {currentQuestion?.hint && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-xs text-blue-600">💡</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-blue-900">
                        Hint
                      </div>
                      <div className="mt-1 text-sm text-blue-700">
                        {currentQuestion.hint}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer Area */}
              <div className="space-y-4">
                {currentQuestion && renderQuestion(currentQuestion)}
              </div>

              {/* Question Time Limit */}
              {currentQuestion?.timeLimit && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time limit: {currentQuestion.timeLimit} minutes</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Save Progress
              </Button>
              {answeredCount === assessment.questions.length && (
                <Button className="bg-green-600 hover:bg-green-700">
                  Submit Assessment
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={nextQuestion}
              disabled={
                currentQuestionIndex === assessment.questions.length - 1
              }
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Navigation Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question Navigator</CardTitle>
              <CardDescription>
                {answeredCount}/{assessment.questions.length} answered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {assessment.questions.map((question, index) => {
                  const isAnswered = answers[question.id] !== undefined;
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      onClick={() => goToQuestion(index)}
                      className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground'
                          : isAnswered
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <Separator className="my-4" />

              {/* Legend */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-primary" />
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-green-200 bg-green-100" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100" />
                  <span>Unanswered</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Assessment Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Total Questions:
                  </span>
                  <span className="font-medium">
                    {assessment.questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Answered:</span>
                  <span className="font-medium">{answeredCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">
                    {assessment.questions.length - answeredCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Points:</span>
                  <span className="font-medium">{assessment.totalPoints}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <Flag className="mr-2 h-4 w-4" />
                Flag Question
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                Review Instructions
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </CardContent>
          </Card>

          {/* Security Status */}
          {assessment.isProctored && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Connection: Stable</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Camera: Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Fullscreen: On</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Violations: 0</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Preview Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <Eye className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">Preview Mode Active</h4>
              <p className="mt-1 text-sm text-blue-700">
                This is a preview of how your assessment will appear to
                students. Answers are not saved and no data is recorded.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStarted(false)}
                className="bg-white"
              >
                Restart Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="bg-white"
              >
                Exit Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
