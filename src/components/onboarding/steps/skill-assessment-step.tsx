'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Brain,
  Target,
  BarChart3,
  BookOpen,
  Users,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  startAssessment,
  answerAssessmentQuestion,
  setCurrentQuestionIndex,
  setAssessmentTimeRemaining,
  completeAssessment,
} from '@/lib/redux/slices/onboarding-slice';
import {
  useGetSkillAssessmentQuery,
  useSubmitSkillAssessmentMutation,
  type AssessmentQuestion,
  type AssessmentResponse,
} from '@/lib/redux/api/onboarding-api';

interface SkillAssessmentStepProps {
  onNext: () => void;
  onBack: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  technical: <Brain className="h-5 w-5" />,
  analytical: <BarChart3 className="h-5 w-5" />,
  creative: <Lightbulb className="h-5 w-5" />,
  communication: <Users className="h-5 w-5" />,
  learning: <BookOpen className="h-5 w-5" />,
  problem_solving: <Target className="h-5 w-5" />,
};

export const SkillAssessmentStep: React.FC<SkillAssessmentStepProps> = ({
  onNext,
  onBack,
}) => {
  const dispatch = useAppDispatch();
  const {
    assessmentStarted,
    assessmentInProgress,
    currentQuestionIndex,
    assessmentResponses,
    assessmentTimeRemaining,
    assessmentResult,
  } = useAppSelector(state => state.onboarding);

  const { data: assessment, isLoading } = useGetSkillAssessmentQuery();
  const [submitAssessment, { isLoading: isSubmitting }] =
    useSubmitSkillAssessmentMutation();

  const [currentAnswer, setCurrentAnswer] = useState<
    string | number | string[]
  >('');
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  useEffect(() => {
    if (assessmentInProgress && assessmentTimeRemaining > 0) {
      const timer = setInterval(() => {
        dispatch(setAssessmentTimeRemaining(assessmentTimeRemaining - 1));
      }, 1000);

      return () => clearInterval(timer);
    }

    if (assessmentTimeRemaining === 0 && assessmentInProgress) {
      handleSubmitAssessment();
    }
  }, [assessmentInProgress, assessmentTimeRemaining, dispatch]);

  const handleStartAssessment = () => {
    if (assessment) {
      dispatch(startAssessment());
      dispatch(setAssessmentTimeRemaining(assessment.timeLimit * 60)); // Convert to seconds
      setQuestionStartTime(Date.now());
    }
  };

  const handleAnswerChange = (value: string | number | string[]) => {
    setCurrentAnswer(value);
  };

  const handleNextQuestion = () => {
    if (!assessment || currentAnswer === '') return;

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const timeSpent = Date.now() - questionStartTime;

    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      answer: currentAnswer,
      timeSpent,
    };

    dispatch(answerAssessmentQuestion(response));

    if (currentQuestionIndex < assessment.questions.length - 1) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex + 1));
      setCurrentAnswer('');
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitAssessment();
    }
  };

  // Go to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      dispatch(setCurrentQuestionIndex(currentQuestionIndex - 1));

      // Load previous answer if exists
      const prevResponse = assessmentResponses.find(
        r => r.questionId === assessment?.questions[currentQuestionIndex - 1].id
      );
      setCurrentAnswer(prevResponse?.answer || '');
      setQuestionStartTime(Date.now());
    }
  };

  // Submit assessment
  const handleSubmitAssessment = async () => {
    try {
      const result = await submitAssessment({
        responses: assessmentResponses,
      }).unwrap();

      dispatch(completeAssessment(result));
    } catch (error) {
      console.error('Error submitting assessment:', error);
    }
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get progress percentage
  const getProgress = () => {
    if (!assessment) return 0;
    return ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Show results if completed
  if (assessmentResult) {
    return (
      <AssessmentResults
        result={assessmentResult}
        onNext={onNext}
        onRetake={() => {
          dispatch(startAssessment());
          setCurrentAnswer('');
          setQuestionStartTime(Date.now());
        }}
      />
    );
  }

  // Show pre-assessment screen
  if (!assessmentStarted) {
    return (
      <PreAssessmentScreen
        assessment={assessment!}
        onStart={handleStartAssessment}
        onBack={onBack}
      />
    );
  }

  // Show assessment in progress
  if (assessmentInProgress && assessment) {
    const currentQuestion = assessment.questions[currentQuestionIndex];

    return (
      <div className="space-y-6">
        {/* Assessment header */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="px-3 py-1">
              Question {currentQuestionIndex + 1} of{' '}
              {assessment.questions.length}
            </Badge>
            <div className="flex items-center space-x-2">
              {categoryIcons[currentQuestion.category]}
              <span className="text-sm font-medium capitalize">
                {currentQuestion.category.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span
                className={
                  assessmentTimeRemaining < 300
                    ? 'font-medium text-destructive'
                    : ''
                }
              >
                {formatTime(assessmentTimeRemaining)}
              </span>
            </div>
            {assessmentTimeRemaining < 300 && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={getProgress()} className="h-2" />

        {/* Question content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQuestion.questionText}
            </CardTitle>
            {currentQuestion.skillArea && (
              <CardDescription>
                Skill Area: {currentQuestion.skillArea}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <QuestionInput
              question={currentQuestion}
              value={currentAnswer}
              onChange={handleAnswerChange}
            />

            {/* Hint */}
            {currentQuestion.hint && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Hint:</strong> {currentQuestion.hint}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSubmitAssessment}
              disabled={isSubmitting}
            >
              Submit Assessment
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={currentAnswer === '' || isSubmitting}
            >
              {currentQuestionIndex === assessment.questions.length - 1
                ? 'Finish'
                : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Question input component
const QuestionInput: React.FC<{
  question: AssessmentQuestion;
  value: string | number | string[];
  onChange: (value: string | number | string[]) => void;
}> = ({ question, value, onChange }) => {
  switch (question.type) {
    case 'multiple_choice':
      return (
        <RadioGroup
          value={value as string}
          onValueChange={onChange}
          className="space-y-3"
        >
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="cursor-pointer">
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case 'true_false':
      return (
        <RadioGroup
          value={value as string}
          onValueChange={onChange}
          className="space-y-3"
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
      );

    case 'scale_rating':
      return (
        <div className="space-y-4">
          <div className="px-3">
            <Slider
              value={[(value as number) || 5]}
              onValueChange={values => onChange(values[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
          <div className="flex justify-between px-3 text-sm text-muted-foreground">
            <span>1 - Strongly Disagree</span>
            <span>Current: {value || 5}</span>
            <span>10 - Strongly Agree</span>
          </div>
        </div>
      );

    case 'text_input':
      return (
        <Textarea
          value={value as string}
          onChange={e => onChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          className="w-full"
        />
      );

    default:
      return null;
  }
};

// Pre-assessment screen component
const PreAssessmentScreen: React.FC<{
  assessment: any;
  onStart: () => void;
  onBack: () => void;
}> = ({ assessment, onStart, onBack }) => (
  <div className="space-y-8">
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
        <Brain className="h-12 w-12 text-primary" />
      </div>
      <div>
        <h3 className="mb-2 text-2xl font-bold">Skill Assessment</h3>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          This assessment will help us understand your current skills and
          knowledge level to create a personalized learning path just for you.
        </p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Assessment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <Clock className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="font-medium">{assessment.timeLimit} minutes</p>
            <p className="text-sm text-muted-foreground">Time limit</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <Target className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="font-medium">{assessment.totalQuestions} questions</p>
            <p className="text-sm text-muted-foreground">Total questions</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <BarChart3 className="mx-auto mb-2 h-6 w-6 text-primary" />
            <p className="font-medium">Mixed levels</p>
            <p className="text-sm text-muted-foreground">Difficulty</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <strong>Important:</strong> Please ensure you have a stable internet
        connection and won't be interrupted during the assessment. You can only
        take this assessment once.
      </AlertDescription>
    </Alert>

    <div className="flex justify-between">
      <Button variant="outline" onClick={onBack}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Button onClick={onStart} size="lg">
        Start Assessment
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);

// Assessment results component
const AssessmentResults: React.FC<{
  result: any;
  onNext: () => void;
  onRetake: () => void;
}> = ({ result, onNext, onRetake }) => (
  <div className="space-y-8">
    <div className="space-y-4 text-center">
      <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-4">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <div>
        <h3 className="mb-2 text-2xl font-bold">Assessment Complete!</h3>
        <p className="text-muted-foreground">
          Great job! Here are your results and personalized recommendations.
        </p>
      </div>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Your Skill Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg bg-primary/5 p-6 text-center">
          <div className="mb-1 text-3xl font-bold text-primary">
            {Math.round(result.overallScore)}/100
          </div>
          <p className="text-sm text-muted-foreground">Overall Score</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Skill Breakdown</h4>
          {Object.entries(result.skillScores).map(([skill, score]) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="capitalize">{skill.replace('_', ' ')}</span>
                <span className="font-medium">
                  {Math.round(score as number)}/100
                </span>
              </div>
              <Progress value={score as number} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {result.recommendations.map((rec: string, index: number) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-sm">{rec}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>

    <div className="flex justify-between">
      <Button variant="outline" onClick={onRetake}>
        Retake Assessment
      </Button>
      <Button onClick={onNext} size="lg">
        Continue Setup
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  </div>
);
