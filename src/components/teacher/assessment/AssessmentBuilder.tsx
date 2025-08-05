'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  Eye,
  Rocket,
  Settings,
  BookOpen,
  Shield,
  BarChart3,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import { AssessmentBasicInfoStep } from './steps/AssessmentBasicInfoStep';
import { AssessmentConfigurationStep } from './steps/AssessmentConfigurationStep';
import { QuestionBuilderStep } from './steps/QuestionBuilderStep';
import { AntiCheatConfigurationStep } from './steps/AntiCheatConfigurationStep';
import { GradingRubricStep } from './steps/GradingRubricStep';
import { AssessmentPreview } from './AssessmentPreview';
import { AssessmentAnalytics } from './AssessmentAnalytics';

import {
  useCreateAssessmentMutation,
  useUpdateAssessmentMutation,
  useGetAssessmentByIdQuery,
  usePublishAssessmentMutation,
  useArchiveAssessmentMutation,
  useDuplicateAssessmentMutation,
} from '@/lib/redux/api/assessment-creation-api';

import { AssessmentFormData, Assessment } from '@/types/assessment';

interface AssessmentBuilderProps {
  assessmentId?: string;
  courseId?: string;
  lessonId?: string;
  mode?: 'create' | 'edit' | 'duplicate';
}

const STEPS = [
  {
    key: 'basic-info',
    label: 'Basic Information',
    icon: BookOpen,
    description: 'Title, description, and type',
  },
  {
    key: 'configuration',
    label: 'Configuration',
    icon: Settings,
    description: 'Timing, attempts, and settings',
  },
  {
    key: 'questions',
    label: 'Questions',
    icon: RefreshCw,
    description: 'Add and manage questions',
  },
  {
    key: 'anti-cheat',
    label: 'Security',
    icon: Shield,
    description: 'Anti-cheat and proctoring',
  },
  {
    key: 'grading',
    label: 'Grading',
    icon: BarChart3,
    description: 'Rubrics and grading options',
  },
];

export const AssessmentBuilder: React.FC<AssessmentBuilderProps> = ({
  assessmentId,
  courseId,
  lessonId,
  mode = 'create',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('builder');
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Assessment data state
  const [assessmentData, setAssessmentData] = useState<AssessmentFormData>({
    basicInfo: {
      title: '',
      description: '',
      instructions: '',
      assessmentType: 'quiz',
      courseId: courseId || '',
      lessonId: lessonId,
    },
    configuration: {
      maxAttempts: 1,
      passingScore: 70,
      weight: 1,
      randomizeQuestions: false,
      randomizeAnswers: false,
      showResults: true,
      showCorrectAnswers: true,
      isMandatory: false,
      isProctored: false,
      gradingMethod: 'automatic',
    },
    questions: [],
    antiCheatSettings: {
      proctoring: {
        enabled: false,
        requireWebcam: false,
        requireMicrophone: false,
        recordSession: false,
        identityVerification: false,
        faceDetection: false,
        voiceDetection: false,
        environmentScan: false,
      },
      lockdown: {
        fullscreenMode: false,
        preventTabSwitching: false,
        preventWindowSwitching: false,
        blockExternalApps: false,
        allowedApplications: [],
        preventVirtualMachine: false,
        preventMultipleMonitors: false,
      },
      monitoring: {
        trackMouseMovement: false,
        trackKeystrokes: false,
        trackFocusLoss: true,
        trackTabSwitching: true,
        trackCopyPaste: true,
        screenshotInterval: 300,
        heartbeatInterval: 30,
      },
      violations: {
        suspiciousActivityThreshold: 3,
        autoSubmitOnViolation: false,
        warningSystem: {
          enabled: true,
          maxWarnings: 3,
          warningTypes: ['tab_switch', 'window_blur', 'copy_attempt'],
        },
        penaltySystem: {
          enabled: false,
          penaltyPerViolation: 5,
          maxPenalty: 25,
        },
      },
    },
  });

  // API hooks
  const {
    data: existingAssessment,
    isLoading: isLoadingAssessment,
    error: loadError,
  } = useGetAssessmentByIdQuery(assessmentId!, {
    skip: !assessmentId || mode === 'create',
  });

  const [createAssessment, { isLoading: isCreating }] =
    useCreateAssessmentMutation();
  const [updateAssessment, { isLoading: isUpdating }] =
    useUpdateAssessmentMutation();
  const [publishAssessment, { isLoading: isPublishing }] =
    usePublishAssessmentMutation();
  const [archiveAssessment, { isLoading: isArchiving }] =
    useArchiveAssessmentMutation();
  const [duplicateAssessment, { isLoading: isDuplicating }] =
    useDuplicateAssessmentMutation();

  // Load existing assessment data
  useEffect(() => {
    if (existingAssessment && (mode === 'edit' || mode === 'duplicate')) {
      setAssessmentData({
        basicInfo: {
          title:
            mode === 'duplicate'
              ? `${existingAssessment.title} (Copy)`
              : existingAssessment.title,
          description: existingAssessment.description,
          instructions: existingAssessment.instructions,
          assessmentType: existingAssessment.assessmentType,
          courseId: existingAssessment.courseId,
          lessonId: existingAssessment.lessonId,
        },
        configuration: {
          timeLimit: existingAssessment.timeLimit,
          maxAttempts: existingAssessment.maxAttempts,
          passingScore: existingAssessment.passingScore,
          weight: existingAssessment.weight,
          availableFrom: existingAssessment.availableFrom,
          availableUntil: existingAssessment.availableUntil,
          randomizeQuestions: existingAssessment.randomizeQuestions,
          randomizeAnswers: existingAssessment.randomizeAnswers,
          showResults: existingAssessment.showResults,
          showCorrectAnswers: existingAssessment.showCorrectAnswers,
          isMandatory: existingAssessment.isMandatory,
          isProctored: existingAssessment.isProctored,
          gradingMethod: existingAssessment.gradingMethod,
        },
        questions: existingAssessment.questions || [],
        antiCheatSettings: existingAssessment.antiCheatSettings,
        gradingRubric: undefined, // Load separately if needed
      });
    }
  }, [existingAssessment, mode]);

  // Get current step component
  const getCurrentStepComponent = () => {
    switch (STEPS[currentStep].key) {
      case 'basic-info':
        return (
          <AssessmentBasicInfoStep
            data={assessmentData.basicInfo}
            onUpdate={(data: any) => handleStepUpdate('basicInfo', data)}
            errors={validationErrors}
          />
        );
      case 'configuration':
        return (
          <AssessmentConfigurationStep
            data={assessmentData.configuration}
            onUpdate={(data: any) => handleStepUpdate('configuration', data)}
            errors={validationErrors}
          />
        );
      case 'questions':
        return (
          <QuestionBuilderStep
            questions={assessmentData.questions}
            assessmentType={assessmentData.basicInfo.assessmentType}
            courseId={assessmentData.basicInfo.courseId}
            lessonId={assessmentData.basicInfo.lessonId}
            onUpdate={questions => handleStepUpdate('questions', questions)}
            errors={validationErrors}
          />
        );
      case 'anti-cheat':
        return (
          <AntiCheatConfigurationStep
            data={assessmentData.antiCheatSettings}
            onUpdate={data => handleStepUpdate('antiCheatSettings', data)}
            errors={validationErrors}
          />
        );
      case 'grading':
        return (
          <GradingRubricStep
            rubric={assessmentData.gradingRubric}
            assessmentType={assessmentData.basicInfo.assessmentType}
            gradingMethod={assessmentData.configuration.gradingMethod}
            onUpdate={(data: any) => handleStepUpdate('gradingRubric', data)}
            errors={validationErrors}
          />
        );
      default:
        return null;
    }
  };

  // Handle step data updates
  const handleStepUpdate = useCallback((stepKey: string, data: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [stepKey]: data,
    }));
    setIsDirty(true);

    // Clear validation errors for this step
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(stepKey)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  }, []);

  // Validation
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};
    const currentStepKey = STEPS[currentStep].key;

    switch (currentStepKey) {
      case 'basic-info':
        if (!assessmentData.basicInfo.title.trim()) {
          errors['basicInfo.title'] = 'Title is required';
        }
        if (!assessmentData.basicInfo.description.trim()) {
          errors['basicInfo.description'] = 'Description is required';
        }
        if (!assessmentData.basicInfo.courseId) {
          errors['basicInfo.courseId'] = 'Course selection is required';
        }
        break;

      case 'configuration':
        if (assessmentData.configuration.maxAttempts < 1) {
          errors['configuration.maxAttempts'] =
            'At least 1 attempt is required';
        }
        if (
          assessmentData.configuration.passingScore < 0 ||
          assessmentData.configuration.passingScore > 100
        ) {
          errors['configuration.passingScore'] =
            'Passing score must be between 0 and 100';
        }
        break;

      case 'questions':
        if (assessmentData.questions.length === 0) {
          errors['questions'] = 'At least one question is required';
        }
        assessmentData.questions.forEach((question, index) => {
          if (!question.questionText.trim()) {
            errors[`questions.${index}.questionText`] =
              'Question text is required';
          }
          if (question.points <= 0) {
            errors[`questions.${index}.points`] =
              'Points must be greater than 0';
          }
        });
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate completion progress
  const getCompletionProgress = (): number => {
    let completed = 0;
    let total = STEPS.length;

    // Basic info
    if (
      assessmentData.basicInfo.title &&
      assessmentData.basicInfo.description
    ) {
      completed++;
    }

    // Configuration
    if (
      assessmentData.configuration.maxAttempts > 0 &&
      assessmentData.configuration.passingScore >= 0
    ) {
      completed++;
    }

    // Questions
    if (assessmentData.questions.length > 0) {
      completed++;
    }

    // Anti-cheat (optional)
    completed++; // Always count as complete since it's optional

    // Grading (optional)
    completed++; // Always count as complete since it's optional

    return Math.round((completed / total) * 100);
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  // Save handlers
  const handleSaveDraft = async () => {
    try {
      const assessmentPayload = {
        ...assessmentData.basicInfo,
        ...assessmentData.configuration,
        status: 'draft' as const,
        questions: assessmentData.questions,
        antiCheatSettings: assessmentData.antiCheatSettings,
        settings: {
          navigation: {
            allowBackward: true,
            showProgress: true,
            confirmBeforeSubmit: true,
          },
          security: {
            preventCopyPaste:
              assessmentData.antiCheatSettings.monitoring.trackCopyPaste,
            preventPrint: true,
            preventRightClick: true,
            requireFullscreen:
              assessmentData.antiCheatSettings.lockdown.fullscreenMode,
          },
          display: {
            questionsPerPage: 1,
            showQuestionNumbers: true,
            showTimer: true,
            theme: 'light' as const,
          },
          accessibility: {
            screenReader: true,
            largeText: false,
            highContrast: false,
            keyboardNavigation: true,
          },
        },
      };

      if (mode === 'edit' && assessmentId) {
        await updateAssessment({
          id: assessmentId,
          data: assessmentPayload as Assessment,
        }).unwrap();
        toast({
          title: 'Assessment Saved',
          description: 'Your changes have been saved successfully.',
        });
      } else {
        const result = await createAssessment(
          assessmentPayload as Assessment
        ).unwrap();
        toast({
          title: 'Assessment Created',
          description: 'Your assessment has been saved as draft.',
        });
        // Redirect to edit mode with the new assessment ID
        router.push(`/teacher/assessments/${result.id}/edit`);
      }
      setIsDirty(false);
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description:
          error.message || 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    if (!assessmentId) {
      toast({
        title: 'Cannot Publish',
        description: 'Please save the assessment first.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all steps
    let isValid = true;
    for (let i = 0; i < STEPS.length; i++) {
      setCurrentStep(i);
      if (!validateCurrentStep()) {
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      toast({
        title: 'Validation Failed',
        description: 'Please fix all validation errors before publishing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await publishAssessment(assessmentId).unwrap();
      toast({
        title: 'Assessment Published',
        description: 'Your assessment is now available to students.',
      });
      router.push('/teacher/assessments');
    } catch (error: any) {
      toast({
        title: 'Publish Failed',
        description:
          error.message || 'Failed to publish assessment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async () => {
    if (!assessmentId) return;

    try {
      await archiveAssessment(assessmentId).unwrap();
      toast({
        title: 'Assessment Archived',
        description: 'The assessment has been archived.',
      });
      router.push('/teacher/assessments');
    } catch (error: any) {
      toast({
        title: 'Archive Failed',
        description: error.message || 'Failed to archive assessment.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    if (!assessmentId) return;

    try {
      const result = await duplicateAssessment(assessmentId).unwrap();
      toast({
        title: 'Assessment Duplicated',
        description: 'A copy of the assessment has been created.',
      });
      router.push(`/teacher/assessments/${result.id}/edit`);
    } catch (error: any) {
      toast({
        title: 'Duplicate Failed',
        description: error.message || 'Failed to duplicate assessment.',
        variant: 'destructive',
      });
    }
  };

  const handlePreview = () => {
    setActiveTab('preview');
  };

  // Loading state
  if (isLoadingAssessment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-red-500" />
          <p className="text-red-600">Failed to load assessment</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const completionProgress = getCompletionProgress();
  const canPublish =
    completionProgress === 100 && assessmentData.questions.length > 0;

  return (
    <div className="container mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {mode === 'create'
                ? 'Create New Assessment'
                : mode === 'duplicate'
                  ? 'Duplicate Assessment'
                  : 'Edit Assessment'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {assessmentData.basicInfo.title || 'Untitled Assessment'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Completion Progress */}
            <div className="flex min-w-[120px] items-center gap-2">
              <Progress value={completionProgress} className="w-16" />
              <span className="text-sm font-medium">{completionProgress}%</span>
            </div>

            {/* Status Badge */}
            {existingAssessment && (
              <Badge
                variant={
                  existingAssessment.status === 'published'
                    ? 'default'
                    : existingAssessment.status === 'draft'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {existingAssessment.status}
              </Badge>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                disabled={assessmentData.questions.length === 0}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={isCreating || isUpdating}
              >
                <Save className="mr-2 h-4 w-4" />
                {isCreating || isUpdating ? 'Saving...' : 'Save Draft'}
              </Button>

              {assessmentId && mode === 'edit' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </Button>
              )}

              <Button
                onClick={handlePublish}
                disabled={!canPublish || isPublishing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Rocket className="mr-2 h-4 w-4" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>

        {/* Dirty state indicator */}
        {isDirty && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            You have unsaved changes
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger
            value="preview"
            disabled={assessmentData.questions.length === 0}
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            disabled={!assessmentId || mode === 'create'}
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Steps Navigation */}
            <div className="col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Steps</CardTitle>
                  <CardDescription>
                    Complete all steps to publish your assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = index === currentStep;
                    const isCompleted =
                      index < currentStep ||
                      (index === 0 &&
                        assessmentData.basicInfo.title &&
                        assessmentData.basicInfo.description) ||
                      (index === 1 &&
                        assessmentData.configuration.maxAttempts > 0) ||
                      (index === 2 && assessmentData.questions.length > 0) ||
                      index > 2; // Anti-cheat and grading are optional

                    return (
                      <button
                        key={step.key}
                        onClick={() => handleStepClick(index)}
                        className={`w-full rounded-lg p-3 text-left transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : isCompleted
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <StepIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium">
                              {step.label}
                            </div>
                            <div className="mt-1 text-xs opacity-75">
                              {step.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Step Content */}
            <div className="col-span-9">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {React.createElement(STEPS[currentStep].icon, {
                          className: 'h-5 w-5',
                        })}
                        {STEPS[currentStep].label}
                      </CardTitle>
                      <CardDescription>
                        {STEPS[currentStep].description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      Step {currentStep + 1} of {STEPS.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>{getCurrentStepComponent()}</CardContent>

                {/* Step Navigation */}
                <div className="border-t bg-gray-50/50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                    >
                      Previous
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isCreating || isUpdating}
                      >
                        Save Draft
                      </Button>

                      {currentStep < STEPS.length - 1 ? (
                        <Button onClick={handleNext}>Next</Button>
                      ) : (
                        <Button
                          onClick={handlePublish}
                          disabled={!canPublish || isPublishing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isPublishing
                            ? 'Publishing...'
                            : 'Publish Assessment'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <AssessmentPreview
            assessment={
              {
                ...assessmentData.basicInfo,
                ...assessmentData.configuration,
                questions: assessmentData.questions,
                antiCheatSettings: assessmentData.antiCheatSettings,
                id: assessmentId || 'preview',
                teacherId: 'current-user',
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'current-user',
                updatedBy: 'current-user',
                settings: {
                  navigation: {
                    allowBackward: true,
                    showProgress: true,
                    confirmBeforeSubmit: true,
                  },
                  security: {
                    preventCopyPaste:
                      assessmentData.antiCheatSettings.monitoring
                        .trackCopyPaste,
                    preventPrint: true,
                    preventRightClick: true,
                    requireFullscreen:
                      assessmentData.antiCheatSettings.lockdown.fullscreenMode,
                  },
                  display: {
                    questionsPerPage: 1,
                    showQuestionNumbers: true,
                    showTimer: true,
                    theme: 'light',
                  },
                  accessibility: {
                    screenReader: true,
                    largeText: false,
                    highContrast: false,
                    keyboardNavigation: true,
                  },
                },
              } as Assessment
            }
            onBack={() => setActiveTab('builder')}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {assessmentId && (
            <AssessmentAnalytics
              assessmentId={assessmentId}
              onBack={() => setActiveTab('builder')}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentBuilder;
