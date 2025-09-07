'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useStartAssessmentMutation,
  useGetAssessmentSessionQuery,
  useSubmitAnswerMutation,
  useSubmitAssessmentMutation,
  useSessionHeartbeatMutation,
  useReportSecurityEventMutation,
} from '@/lib/redux/api/assessment-api';
import { useUpdateLessonProgressMutation } from '@/lib/redux/api/learning-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Timer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Target,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssessmentPlayerProps {
  lesson: any;
  onComplete?: () => void;
  className?: string;
}

export function AssessmentPlayer({ lesson, onComplete, className }: AssessmentPlayerProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState<Record<string, number>>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  
  // Anti-cheat states
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [windowBlurCount, setWindowBlurCount] = useState(0);

  const [startAssessment] = useStartAssessmentMutation();
  const [submitAnswer] = useSubmitAnswerMutation();
  const [submitAssessment] = useSubmitAssessmentMutation();
  const [sessionHeartbeat] = useSessionHeartbeatMutation();
  const [reportSecurityEvent] = useReportSecurityEventMutation();
  const [updateProgress] = useUpdateLessonProgressMutation();

  const { data: session, refetch: refetchSession } = useGetAssessmentSessionQuery(
    sessionId,
    { skip: !sessionId }
  );

  // Start assessment when component mounts
  useEffect(() => {
    if (lesson.assessmentId && !sessionId) {
      handleStartAssessment();
    }
  }, [lesson.assessmentId]);

  // Session heartbeat
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(() => {
      sessionHeartbeat({
        sessionId,
        timestamp: Date.now(),
        isActive: !document.hidden,
        metadata: {
          windowFocused: !document.hidden,
          fullscreenActive: isFullscreen,
          tabSwitchCount,
          mouseMovements: 0, // Can implement mouse tracking
          keystrokes: 0, // Can implement keystroke tracking
        }
      }).catch(console.error);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [sessionId, isFullscreen, tabSwitchCount]);

  // Anti-cheat monitoring
  useEffect(() => {
    if (!sessionId) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWindowBlurCount(prev => prev + 1);
        reportSecurityEvent({
          sessionId,
          eventType: 'window_blur',
          timestamp: Date.now(),
          metadata: { blurCount: windowBlurCount + 1 }
        }).catch(console.error);
        
        toast.warning('Warning: Focus lost detected!');
        setSecurityWarnings(prev => [...prev, 'Window focus lost']);
      }
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      if (!isNowFullscreen && session?.antiCheatConfig?.requireFullscreen) {
        reportSecurityEvent({
          sessionId,
          eventType: 'fullscreen_exit',
          timestamp: Date.now(),
        }).catch(console.error);
        
        toast.error('Warning: Please return to fullscreen mode!');
        setSecurityWarnings(prev => [...prev, 'Fullscreen mode exited']);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block common shortcuts if configured
      if (session?.antiCheatConfig?.blockCopyPaste) {
        if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          reportSecurityEvent({
            sessionId,
            eventType: 'copy_attempt',
            timestamp: Date.now(),
            metadata: { key: e.key }
          }).catch(console.error);
          
          toast.error('Copy/Paste is not allowed!');
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportSecurityEvent({
        sessionId,
        eventType: 'right_click',
        timestamp: Date.now(),
      }).catch(console.error);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [sessionId, session?.antiCheatConfig, windowBlurCount]);

  const handleStartAssessment = async () => {
    try {
      const result = await startAssessment({
        assessmentId: lesson.assessmentId,
        antiCheatConfig: {
          requireFullscreen: true,
          detectTabSwitching: true,
          enableProctoring: false,
          requireWebcam: false,
          blockCopyPaste: true,
        }
      }).unwrap();

      setSessionId(result.sessionToken);
      setStartTime(Date.now());
      
      // Request fullscreen if required
      if (result.antiCheatConfig?.requireFullscreen) {
        document.documentElement.requestFullscreen().catch(console.error);
      }
      
      toast.success('Assessment started successfully!');
    } catch (error) {
      console.error('Failed to start assessment:', error);
      toast.error('Failed to start assessment');
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitAnswer = async (questionId: string, answer: any) => {
    try {
      const questionStartTime = timeSpent[questionId] || Date.now();
      const timeOnQuestion = Date.now() - questionStartTime;

      const result = await submitAnswer({
        sessionId,
        questionId,
        answer,
        timeSpent: timeOnQuestion,
        confidence: 80, // Can implement confidence tracking
      }).unwrap();

      setTimeSpent(prev => ({
        ...prev,
        [questionId]: timeOnQuestion
      }));

      if (result.isCorrect !== undefined) {
        toast.success(
          result.isCorrect ? 'Correct answer!' : 'Incorrect answer'
        );
      }

      // Move to next question or finish
      if (currentQuestionIndex < (session?.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTimeSpent(prev => ({
          ...prev,
          [session?.questions?.[currentQuestionIndex + 1]?.id || '']: Date.now()
        }));
      }

      refetchSession();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      toast.error('Failed to submit answer');
    }
  };

  const handleSubmitAssessment = async () => {
    if (!sessionId) return;

    try {
      const result = await submitAssessment({
        sessionId,
        confirmSubmission: true,
      }).unwrap();

      setIsSubmitted(true);
      
      // Show results based on assessment type
      if (result.autoGraded) {
        toast.success(
          `Assessment completed! Score: ${result.score}/${result.totalPoints} (${result.percentage}%)`
        );
      } else {
        toast.success('Assessment submitted! Your responses will be reviewed manually.');
      }
      
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }

      // Update lesson progress
      if (result.autoGraded && result.percentage >= 70) { // Pass threshold
        try {
          await updateProgress({
            lessonId: lesson.id,
            progressPercentage: 100,
            timeSpent: Math.floor((Date.now() - startTime) / 1000),
            completed: true,
          });
        } catch (error) {
          console.error('Failed to update lesson progress:', error);
        }
      }

      // Call onComplete after 2 seconds to show results
      setTimeout(() => {
        onComplete?.();
      }, 2000);

    } catch (error) {
      console.error('Failed to submit assessment:', error);
      toast.error('Failed to submit assessment');
    }
  };

  if (!lesson.assessmentId) {
    return (
      <div className={cn('p-8 text-center', className)}>
        <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold">No Assessment Available</h3>
        <p className="text-gray-600">This lesson doesn't have an assessment.</p>
        {onComplete && (
          <Button onClick={onComplete} className="mt-4">
            Continue
          </Button>
        )}
      </div>
    );
  }

  if (!session && sessionId) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-600" />
          <h3 className="mb-2 text-lg font-semibold">Assessment Completed!</h3>
          <p className="text-gray-600">
            Your responses have been submitted and will be graded automatically.
          </p>
          
          {securityWarnings.length > 0 && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Security Warnings</span>
              </div>
              <ul className="mt-2 text-sm text-yellow-700">
                {securityWarnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = session?.questions?.[currentQuestionIndex];
  const progress = session?.questions?.length ? 
    ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Assessment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {session?.title || 'Assessment'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {session?.timeLimit && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {Math.floor((session.timeLimit - (Date.now() - startTime)) / 60000)}m left
                </Badge>
              )}
              {isFullscreen ? (
                <Badge className="bg-green-100 text-green-800">
                  <Shield className="mr-1 h-3 w-3" />
                  Secured
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Not Secured
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {session?.questions?.length || 0}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {currentQuestionIndex + 1}
              </div>
              Question {currentQuestionIndex + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-lg leading-relaxed">{currentQuestion.question}</p>
            </div>

            {/* Multiple Choice */}
            {currentQuestion.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* True/False */}
            {currentQuestion.type === 'true_false' && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true" className="cursor-pointer">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false" className="cursor-pointer">False</Label>
                </div>
              </RadioGroup>
            )}

            {/* Essay/Short Answer */}
            {['essay', 'short_answer'].includes(currentQuestion.type) && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={currentQuestion.type === 'essay' ? 8 : 4}
              />
            )}

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex === (session?.questions?.length || 0) - 1 ? (
                <Button
                  onClick={handleSubmitAssessment}
                  disabled={!answers[currentQuestion.id]}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Assessment
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmitAnswer(currentQuestion.id, answers[currentQuestion.id])}
                  disabled={!answers[currentQuestion.id]}
                >
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Warnings */}
      {securityWarnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Security Alerts ({securityWarnings.length})</span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              Your session is being monitored. Please avoid suspicious activities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}