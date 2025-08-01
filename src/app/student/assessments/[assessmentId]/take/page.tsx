'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetAssessmentQuery,
  useStartAssessmentMutation,
  useGetAssessmentSessionQuery,
  useSubmitAnswerMutation,
  useSessionHeartbeatMutation,
  useReportSecurityEventMutation,
  useSubmitAssessmentMutation,
} from '@/lib/redux/api/assessment-api';
import { AssessmentTimer } from '@/components/assessment/AssessmentTimer';
import { QuestionRenderer } from '@/components/assessment/QuestionRenderer';
import { AssessmentNavigation } from '@/components/assessment/AssessmentNavigation';
import { SecurityMonitor } from '@/components/assessment/SecurityMonitor';
import { ProctoringPanel } from '@/components/assessment/ProctoringPanel';
import { AssessmentProgress } from '@/components/assessment/AssessmentProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  Camera,
  Monitor,
  Clock,
  AlertTriangle,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function TakeAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.assessmentId as string;

  // Session state
  const [sessionId, setSessionId] = useState<string>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [proctoringActive, setProctoringActive] = useState(false);

  // Refs for monitoring
  const heartbeatInterval = useRef<NodeJS.Timeout>();
  const sessionStartTime = useRef<number>();
  const tabSwitchCount = useRef(0);
  const windowBlurCount = useRef(0);
  const mouseMovements = useRef(0);
  const keystrokes = useRef(0);
  const isWindowFocused = useRef(true);

  // API hooks
  const { data: assessment, isLoading: assessmentLoading } =
    useGetAssessmentQuery(assessmentId);
  const { data: session } = useGetAssessmentSessionQuery(sessionId || '', {
    skip: !sessionId,
    pollingInterval: 5000, // Poll every 5 seconds
  });

  const [startAssessment] = useStartAssessmentMutation();
  const [submitAnswer] = useSubmitAnswerMutation();
  const [sessionHeartbeat] = useSessionHeartbeatMutation();
  const [reportSecurityEvent] = useReportSecurityEventMutation();
  const [submitAssessment] = useSubmitAssessmentMutation();

  // Security monitoring functions
  const reportSecurityViolation = useCallback(
    async (eventType: string, metadata?: Record<string, any>) => {
      if (!sessionId) return;

      try {
        await reportSecurityEvent({
          sessionId,
          eventType: eventType as any,
          timestamp: Date.now(),
          metadata,
        }).unwrap();

        setSecurityWarnings(prev => [...prev, `Security event: ${eventType}`]);

        // Check if we should auto-flag the session
        if (assessment?.antiCheatSettings.autoFlagHighRisk) {
          const highRiskEvents = [
            'copy_attempt',
            'paste_attempt',
            'suspicious_behavior',
          ];
          if (highRiskEvents.includes(eventType)) {
            toast.error(
              'Suspicious activity detected. Session may be flagged for review.'
            );
          }
        }
      } catch (error) {
        console.error('Failed to report security event:', error);
      }
    },
    [
      sessionId,
      reportSecurityEvent,
      assessment?.antiCheatSettings.autoFlagHighRisk,
    ]
  );

  // Anti-cheat measures
  const setupAntiCheatMeasures = useCallback(() => {
    if (!assessment?.antiCheatSettings.enabled) return;

    const settings = assessment.antiCheatSettings;

    // Fullscreen requirement
    if (settings.requireFullscreen) {
      const enterFullscreen = async () => {
        try {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } catch (error) {
          toast.error('Fullscreen mode is required for this assessment');
          router.push('/student/assessments');
        }
      };

      const handleFullscreenChange = () => {
        const isNowFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isNowFullscreen);

        if (!isNowFullscreen) {
          reportSecurityViolation('fullscreen_exit');
          toast.warning('Please return to fullscreen mode');
        }
      };

      enterFullscreen();
      document.addEventListener('fullscreenchange', handleFullscreenChange);

      return () => {
        document.removeEventListener(
          'fullscreenchange',
          handleFullscreenChange
        );
      };
    }
  }, [assessment?.antiCheatSettings, reportSecurityViolation, router]);

  const setupEventListeners = useCallback(() => {
    if (!assessment?.antiCheatSettings.enabled) return;

    const settings = assessment.antiCheatSettings;

    // Tab switching detection
    if (settings.detectTabSwitching) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          tabSwitchCount.current += 1;
          reportSecurityViolation('tab_switch', {
            count: tabSwitchCount.current,
          });

          if (tabSwitchCount.current > settings.maxTabSwitches) {
            toast.error(
              `Too many tab switches detected (${tabSwitchCount.current}/${settings.maxTabSwitches})`
            );
          }
        }
      };

      const handleWindowBlur = () => {
        isWindowFocused.current = false;
        windowBlurCount.current += 1;
        reportSecurityViolation('window_blur', {
          count: windowBlurCount.current,
        });
      };

      const handleWindowFocus = () => {
        isWindowFocused.current = true;
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);

      return () => {
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange
        );
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
      };
    }
  }, [assessment?.antiCheatSettings, reportSecurityViolation]);

  const setupCopyPasteBlocking = useCallback(() => {
    if (!assessment?.antiCheatSettings.blockCopyPaste) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportSecurityViolation('copy_attempt');
      toast.warning('Copy operation is not allowed during assessment');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportSecurityViolation('paste_attempt');
      toast.warning('Paste operation is not allowed during assessment');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      reportSecurityViolation('copy_attempt');
      toast.warning('Cut operation is not allowed during assessment');
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
    };
  }, [assessment?.antiCheatSettings.blockCopyPaste, reportSecurityViolation]);

  const setupRightClickBlocking = useCallback(() => {
    if (!assessment?.antiCheatSettings.blockRightClick) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportSecurityViolation('right_click');
      toast.warning('Right-click is disabled during assessment');
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [assessment?.antiCheatSettings.blockRightClick, reportSecurityViolation]);

  const setupKeyboardMonitoring = useCallback(() => {
    if (!assessment?.antiCheatSettings.monitorKeystrokes) return;

    const suspiciousKeyCombinations = [
      ['Control', 'Shift', 'I'], // DevTools
      ['Control', 'Shift', 'C'], // Inspect
      ['Control', 'Shift', 'J'], // Console
      ['F12'], // DevTools
      ['Control', 'U'], // View Source
      ['Control', 'Shift', 'K'], // Console (Firefox)
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      keystrokes.current += 1;

      // Check for suspicious key combinations
      const currentKeys: string[] = [];
      if (e.ctrlKey) currentKeys.push('Control');
      if (e.shiftKey) currentKeys.push('Shift');
      if (e.altKey) currentKeys.push('Alt');
      currentKeys.push(e.key);

      const isSuspicious = suspiciousKeyCombinations.some(combo =>
        combo.every(key => currentKeys.includes(key))
      );

      if (isSuspicious) {
        e.preventDefault();
        reportSecurityViolation('key_combination', {
          keys: currentKeys.join('+'),
        });
        toast.warning('This key combination is not allowed during assessment');
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    assessment?.antiCheatSettings.monitorKeystrokes,
    reportSecurityViolation,
  ]);

  const setupMouseMonitoring = useCallback(() => {
    if (!assessment?.antiCheatSettings.monitorMouseMovement) return;

    const handleMouseMove = () => {
      mouseMovements.current += 1;
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [assessment?.antiCheatSettings.monitorMouseMovement]);

  // Session heartbeat
  const startHeartbeat = useCallback(() => {
    if (!sessionId) return;

    heartbeatInterval.current = setInterval(async () => {
      try {
        await sessionHeartbeat({
          sessionId,
          timestamp: Date.now(),
          isActive: isWindowFocused.current,
          metadata: {
            windowFocused: isWindowFocused.current,
            fullscreenActive: isFullscreen,
            tabSwitchCount: tabSwitchCount.current,
            mouseMovements: mouseMovements.current,
            keystrokes: keystrokes.current,
          },
        }).unwrap();
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000); // Every 30 seconds
  }, [sessionId, sessionHeartbeat, isFullscreen]);

  // Start assessment
  const handleStartAssessment = async () => {
    if (!assessment) return;

    try {
      const result = await startAssessment({
        assessmentId,
        antiCheatConfig: assessment.antiCheatSettings,
      }).unwrap();

      setSessionId(result.id);
      sessionStartTime.current = Date.now();
      toast.success('Assessment started successfully');
    } catch (error) {
      toast.error('Failed to start assessment');
    }
  };

  // Submit answer
  const handleAnswerSubmit = async (questionId: string, answer: any) => {
    if (!sessionId) return;

    const questionStartTime = Date.now();
    const timeSpentOnQuestion =
      questionStartTime - (sessionStartTime.current || 0);

    try {
      const result = await submitAnswer({
        sessionId,
        questionId,
        answer,
        timeSpent: timeSpentOnQuestion,
      }).unwrap();

      setAnswers(prev => ({
        ...prev,
        [questionId]: answer,
      }));

      // Handle adaptive questioning
      if (result.adaptiveAdjustment) {
        toast.info(`Difficulty adjusted: ${result.adaptiveAdjustment.reason}`);
      }

      // Move to next question
      if (result.nextQuestionId) {
        const nextIndex = assessment?.questions.findIndex(
          q => q.id === result.nextQuestionId
        );
        if (nextIndex !== -1) {
          setCurrentQuestionIndex(nextIndex || 0);
        }
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    }
  };

  // Submit assessment
  const handleSubmitAssessment = async () => {
    if (!sessionId) return;

    const confirmSubmit = window.confirm(
      'Are you sure you want to submit your assessment? This action cannot be undone.'
    );

    if (!confirmSubmit) return;

    try {
      await submitAssessment({
        sessionId,
        confirmSubmission: true,
      }).unwrap();

      toast.success('Assessment submitted successfully');
      router.push(`/student/assessments/${assessmentId}/results`);
    } catch (error) {
      toast.error('Failed to submit assessment');
    }
  };

  // Setup effects
  useEffect(() => {
    if (assessment && sessionId) {
      const cleanupFunctions = [
        setupAntiCheatMeasures(),
        setupEventListeners(),
        setupCopyPasteBlocking(),
        setupRightClickBlocking(),
        setupKeyboardMonitoring(),
        setupMouseMonitoring(),
      ].filter(Boolean);

      startHeartbeat();

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup?.());
        if (heartbeatInterval.current) {
          clearInterval(heartbeatInterval.current);
        }
      };
    }
  }, [
    assessment,
    sessionId,
    setupAntiCheatMeasures,
    setupEventListeners,
    setupCopyPasteBlocking,
    setupRightClickBlocking,
    setupKeyboardMonitoring,
    setupMouseMonitoring,
    startHeartbeat,
  ]);

  // Time tracking
  useEffect(() => {
    if (sessionId && sessionStartTime.current) {
      const interval = setInterval(() => {
        setTimeSpent(
          Math.floor((Date.now() - sessionStartTime.current!) / 1000)
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionId]);

  // Prevent page refresh/navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionId) {
        e.preventDefault();
        e.returnValue =
          'Are you sure you want to leave? Your progress will be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessionId]);

  if (assessmentLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-xl font-semibold">Assessment Not Found</h2>
            <p className="mb-4 text-gray-600">
              The assessment you're looking for doesn't exist or has been
              removed.
            </p>
            <Button onClick={() => router.push('/student/assessments')}>
              Back to Assessments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-assessment screen
  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600" />
                {assessment.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assessment Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-4 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                  <div className="font-semibold">
                    {assessment.timeLimit
                      ? `${assessment.timeLimit} minutes`
                      : 'No time limit'}
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="rounded-lg bg-green-50 p-4 text-center">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <div className="font-semibold">
                    {assessment.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Questions</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-4 text-center">
                  <Badge className="mx-auto mb-2 flex h-8 w-8 items-center justify-center">
                    {assessment.totalPoints}
                  </Badge>
                  <div className="font-semibold">
                    {assessment.totalPoints} points
                  </div>
                  <div className="text-sm text-gray-600">Total Score</div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="mb-3 font-semibold">Instructions</h3>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: assessment.instructions }}
                />
              </div>

              {/* Security Requirements */}
              {assessment.antiCheatSettings.enabled && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <div className="mb-2 font-medium">
                      Security Requirements:
                    </div>
                    <ul className="space-y-1 text-sm">
                      {assessment.antiCheatSettings.requireFullscreen && (
                        <li>• Fullscreen mode is required</li>
                      )}
                      {assessment.antiCheatSettings.detectTabSwitching && (
                        <li>• Tab switching will be monitored</li>
                      )}
                      {assessment.antiCheatSettings.blockCopyPaste && (
                        <li>• Copy/paste operations are disabled</li>
                      )}
                      {assessment.antiCheatSettings.requireWebcam && (
                        <li>• Webcam access is required</li>
                      )}
                      {assessment.antiCheatSettings.enableProctoring && (
                        <li>• Session will be proctored</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Proctoring Setup */}
              {assessment.antiCheatSettings.requireWebcam && (
                <ProctoringPanel
                  onSetupComplete={success => setProctoringActive(success)}
                  requirements={{
                    webcam: assessment.antiCheatSettings.requireWebcam,
                    microphone: assessment.antiCheatSettings.audioRecording,
                    faceDetection: assessment.antiCheatSettings.faceDetection,
                  }}
                />
              )}

              {/* Start Button */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={handleStartAssessment}
                  disabled={
                    assessment.antiCheatSettings.requireWebcam &&
                    !proctoringActive
                  }
                  className="px-8"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Start Secure Assessment
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  By starting, you agree to follow all assessment rules and
                  security requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Assessment in progress
  const currentQuestion = assessment.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === assessment.questions.length - 1;

  return (
    <div
      className={cn(
        'min-h-screen bg-gray-900 text-white',
        isFullscreen && 'fixed inset-0 z-50'
      )}
    >
      {/* Security Header */}
      <div className="border-b border-gray-700 bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">Secure Mode</span>
            </div>
            {assessment.antiCheatSettings.enableProctoring && (
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-red-400" />
                <span className="text-sm">Recording</span>
              </div>
            )}
            <SecurityMonitor
              sessionId={sessionId}
              tabSwitchCount={tabSwitchCount.current}
              windowBlurCount={windowBlurCount.current}
              securityWarnings={securityWarnings}
            />
          </div>

          <div className="flex items-center gap-4">
            <AssessmentTimer
              timeLimit={assessment.timeLimit}
              timeSpent={timeSpent}
              onTimeUp={handleSubmitAssessment}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSubmitAssessment}
            >
              Submit Assessment
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Main Assessment Area */}
        <div className="flex flex-1 flex-col">
          {/* Progress Bar */}
          <div className="border-b border-gray-700 p-4">
            <AssessmentProgress
              currentQuestion={currentQuestionIndex + 1}
              totalQuestions={assessment.totalQuestions}
              answered={Object.keys(answers).length}
              showProgress={assessment.settings.showProgressBar}
            />
          </div>

          {/* Question Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {currentQuestion && (
              <QuestionRenderer
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                answer={answers[currentQuestion.id]}
                onAnswerChange={answer => {
                  setAnswers(prev => ({
                    ...prev,
                    [currentQuestion.id]: answer,
                  }));
                }}
                onSubmit={answer =>
                  handleAnswerSubmit(currentQuestion.id, answer)
                }
                showQuestionNumbers={assessment.settings.showQuestionNumbers}
                isSecureMode={assessment.antiCheatSettings.enabled}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="border-t border-gray-700 p-4">
            <AssessmentNavigation
              currentQuestion={currentQuestionIndex}
              totalQuestions={assessment.totalQuestions}
              onPrevious={() =>
                setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
              }
              onNext={() =>
                setCurrentQuestionIndex(prev =>
                  Math.min(assessment.totalQuestions - 1, prev + 1)
                )
              }
              onSubmit={handleSubmitAssessment}
              allowBackNavigation={assessment.settings.allowBackNavigation}
              isLastQuestion={isLastQuestion}
              hasAnsweredCurrent={!!answers[currentQuestion?.id]}
            />
          </div>
        </div>

        {/* Proctoring Sidebar */}
        {assessment.antiCheatSettings.enableProctoring && (
          <div className="w-80 border-l border-gray-700 bg-gray-800">
            <ProctoringPanel
              sessionId={sessionId}
              showPreview={true}
              onSecurityEvent={reportSecurityViolation}
            />
          </div>
        )}
      </div>
    </div>
  );
}
