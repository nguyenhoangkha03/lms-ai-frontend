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
import { toast } from 'sonner';
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
  useCreateAssessmentTeacherMutation,
  useUpdateAssessmentMutation,
  useGetAssessmentByIdQuery,
  usePublishAssessmentMutation,
  useArchiveAssessmentMutation,
  useDuplicateAssessmentMutation,
  useCreateQuestionsForAssessmentMutation,
} from '@/lib/redux/api/teacher-assessment-api';

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
  assessmentId: initialAssessmentId,
  courseId,
  mode = 'create',
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('builder');
  const [isDirty, setIsDirty] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Track assessment ID for create mode
  const [assessmentId, setAssessmentId] = useState<string | undefined>(
    initialAssessmentId
  );
  const [currentMode, setCurrentMode] = useState(mode);

  // Assessment data state
  const [assessmentData, setAssessmentData] = useState<AssessmentFormData>({
    basicInfo: {
      title: '',
      description: '',
      instructions: '',
      assessmentType: 'quiz',
      courseId: courseId || '',
      lessonId: '',
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
  } = useGetAssessmentByIdQuery(
    { id: assessmentId!, includeQuestions: true },
    {
      skip: !assessmentId || currentMode === 'create',
    }
  );

  const [createAssessment, { isLoading: isCreating }] =
    useCreateAssessmentTeacherMutation();
  const [updateAssessment, { isLoading: isUpdating }] =
    useUpdateAssessmentMutation();
  const [publishAssessment, { isLoading: isPublishing }] =
    usePublishAssessmentMutation();
  const [archiveAssessment, { isLoading: isArchiving }] =
    useArchiveAssessmentMutation();
  const [duplicateAssessment, { isLoading: isDuplicating }] =
    useDuplicateAssessmentMutation();
  const [createQuestionsForAssessment, { isLoading: isCreatingQuestions }] =
    useCreateQuestionsForAssessmentMutation();

  // Load existing assessment data
  useEffect(() => {
    if (
      existingAssessment &&
      (currentMode === 'edit' || currentMode === 'duplicate')
    ) {
      setAssessmentData({
        basicInfo: {
          title:
            currentMode === 'duplicate'
              ? `${existingAssessment.title} (Copy)`
              : existingAssessment.title,
          description: existingAssessment.description,
          instructions: existingAssessment.instructions!,
          assessmentType: existingAssessment.assessmentType,
          courseId: existingAssessment.courseId!,
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
        questions: (existingAssessment.questions || []).map(question => ({
          ...question,
          options: (() => {
            try {
              if (typeof question.options === 'string') {
                return JSON.parse(question.options);
              } else if (Array.isArray(question.options)) {
                return question.options;
              }
              return question.options;
            } catch (e) {
              console.warn('Failed to parse question options:', e);
              return question.options || [];
            }
          })(),
          tags: (() => {
            try {
              if (typeof question.tags === 'string') {
                return JSON.parse(question.tags);
              } else if (Array.isArray(question.tags)) {
                return question.tags;
              }
              return [];
            } catch (e) {
              console.warn('Failed to parse question tags:', e);
              return [];
            }
          })(),
        })),
        antiCheatSettings: (() => {
          try {
            if (typeof existingAssessment.antiCheatSettings === 'string') {
              return JSON.parse(existingAssessment.antiCheatSettings);
            } else if (
              existingAssessment.antiCheatSettings &&
              typeof existingAssessment.antiCheatSettings === 'object'
            ) {
              return existingAssessment.antiCheatSettings;
            }
            return {};
          } catch (e) {
            console.warn('Failed to parse existing antiCheatSettings:', e);
            return {};
          }
        })(),
        gradingRubric: undefined, // Load separately if needed
      });
    }
  }, [existingAssessment, currentMode]);

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
    console.log('=== handleSaveDraft called ===');
    console.log('Current assessmentData:', assessmentData);
    console.log('Current questions:', assessmentData.questions);
    try {
      // Ensure antiCheatSettings is always an object
      const defaultAntiCheatSettings = {
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
      };

      // Parse antiCheatSettings safely
      let parsedAntiCheatSettings = {};
      try {
        if (typeof assessmentData.antiCheatSettings === 'string') {
          parsedAntiCheatSettings = JSON.parse(
            assessmentData.antiCheatSettings
          );
        } else if (
          assessmentData.antiCheatSettings &&
          typeof assessmentData.antiCheatSettings === 'object'
        ) {
          parsedAntiCheatSettings = assessmentData.antiCheatSettings;
        }
      } catch (e) {
        console.warn('Failed to parse antiCheatSettings, using defaults:', e);
        parsedAntiCheatSettings = {};
      }

      const safeAntiCheatSettings = {
        ...defaultAntiCheatSettings,
        ...(parsedAntiCheatSettings || {}),
        proctoring: {
          ...defaultAntiCheatSettings.proctoring,
          ...(parsedAntiCheatSettings?.proctoring || {}),
        },
        lockdown: {
          ...defaultAntiCheatSettings.lockdown,
          ...(parsedAntiCheatSettings?.lockdown || {}),
        },
        monitoring: {
          ...defaultAntiCheatSettings.monitoring,
          ...(parsedAntiCheatSettings?.monitoring || {}),
        },
        violations: {
          ...defaultAntiCheatSettings.violations,
          ...(parsedAntiCheatSettings?.violations || {}),
          warningSystem: {
            ...defaultAntiCheatSettings.violations.warningSystem,
            ...(parsedAntiCheatSettings?.violations?.warningSystem || {}),
          },
          penaltySystem: {
            ...defaultAntiCheatSettings.violations.penaltySystem,
            ...(parsedAntiCheatSettings?.violations?.penaltySystem || {}),
          },
        },
      };

      const assessmentPayload = {
        ...assessmentData.basicInfo,
        ...assessmentData.configuration,
        status: 'draft' as const,
        // Remove questions from payload - backend doesn't accept it
        antiCheatSettings: safeAntiCheatSettings,
        settings: {
          navigation: {
            allowBackward: true,
            showProgress: true,
            confirmBeforeSubmit: true,
          },
          security: {
            preventCopyPaste: safeAntiCheatSettings.monitoring.trackCopyPaste,
            preventPrint: true,
            preventRightClick: true,
            requireFullscreen: safeAntiCheatSettings.lockdown.fullscreenMode,
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

      // Debug: log payload before sending
      console.log(
        'Assessment payload:',
        JSON.stringify(assessmentPayload, null, 2)
      );

      if (currentMode === 'edit' && assessmentId) {
        console.log('=== UPDATE MODE ===');
        await updateAssessment({
          id: assessmentId,
          data: assessmentPayload as Assessment,
        }).unwrap();

        // Save questions to assessment if any exist (for edit mode too)
        if (assessmentData.questions && assessmentData.questions.length > 0) {
          console.log(
            'Saving questions to existing assessment:',
            assessmentData.questions
          );

          // Prepare questions for backend
          const questionsForBackend = assessmentData.questions.map(
            (question, index) => ({
              questionText: question.questionText,
              questionType: question.questionType,
              explanation: question.explanation,
              points: question.points,
              difficulty: question.difficulty,
              orderIndex: index,
              timeLimit: question.timeLimit,
              hint: question.hint,
              options: (() => {
                console.log('=== PROCESSING OPTIONS ===');
                console.log('Original question.options:', question.options);
                console.log('Type of question.options:', typeof question.options);
                
                if (typeof question.options === 'string') {
                  // Parse back to array if it's a string, then let backend stringify
                  try {
                    const parsed = JSON.parse(question.options);
                    console.log('Parsed string back to array:', parsed);
                    return parsed;
                  } catch (e) {
                    console.log('Failed to parse string, returning as-is');
                    return question.options;
                  }
                } else if (Array.isArray(question.options)) {
                  // Send clean array object, let backend stringify
                  const cleanOptions = question.options.map(opt => ({
                    id: opt.id,
                    text: String(opt.text || ''),
                    isCorrect: Boolean(opt.isCorrect),
                    feedback: String(opt.feedback || ''),
                    orderIndex: Number(opt.orderIndex || 0)
                  }));
                  console.log('Sending clean array object to backend:', cleanOptions);
                  return cleanOptions;
                } else {
                  console.log('Options is null/undefined');
                  return null;
                }
              })(),
              correctAnswer: question.correctAnswer,
              tags: question.tags,
              validationRules: question.validationRules,
              attachments: question.attachments || [],
            })
          );

          try {
            // Add questions to the existing assessment
            await createQuestionsForAssessment({
              assessmentId: assessmentId,
              questions: questionsForBackend,
            }).unwrap();

            console.log('Questions saved to existing assessment successfully');
          } catch (questionError) {
            console.error(
              'Error saving questions to existing assessment:',
              questionError
            );
            toast('⚠️ Assessment updated but failed to save questions');
          }
        }

        toast('✅ Assessment Saved Successfully');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const result = await createAssessment(
          assessmentPayload as Assessment
        ).unwrap();

        // Update assessment ID and switch to edit mode internally
        setAssessmentId(result.id);
        setCurrentMode('edit');

        // Save questions to assessment if any exist
        if (assessmentData.questions && assessmentData.questions.length > 0) {
          console.log(
            'Saving questions to assessment:',
            assessmentData.questions
          );

          // Prepare questions for backend (remove temp IDs and add assessmentId)
          const questionsForBackend = assessmentData.questions.map(
            (question, index) => ({
              questionText: question.questionText,
              questionType: question.questionType,
              explanation: question.explanation,
              points: question.points,
              difficulty: question.difficulty,
              orderIndex: index,
              timeLimit: question.timeLimit,
              hint: question.hint,
              options: (() => {
                console.log('=== PROCESSING OPTIONS ===');
                console.log('Original question.options:', question.options);
                console.log('Type of question.options:', typeof question.options);
                
                if (typeof question.options === 'string') {
                  // Parse back to array if it's a string, then let backend stringify
                  try {
                    const parsed = JSON.parse(question.options);
                    console.log('Parsed string back to array:', parsed);
                    return parsed;
                  } catch (e) {
                    console.log('Failed to parse string, returning as-is');
                    return question.options;
                  }
                } else if (Array.isArray(question.options)) {
                  // Send clean array object, let backend stringify
                  const cleanOptions = question.options.map(opt => ({
                    id: opt.id,
                    text: String(opt.text || ''),
                    isCorrect: Boolean(opt.isCorrect),
                    feedback: String(opt.feedback || ''),
                    orderIndex: Number(opt.orderIndex || 0)
                  }));
                  console.log('Sending clean array object to backend:', cleanOptions);
                  return cleanOptions;
                } else {
                  console.log('Options is null/undefined');
                  return null;
                }
              })(),
              correctAnswer: question.correctAnswer,
              tags: question.tags,
              validationRules: question.validationRules,
              attachments: question.attachments || [],
            })
          );

          try {
            // Add questions to the created assessment using RTK Query
            await createQuestionsForAssessment({
              assessmentId: result.id!,
              questions: questionsForBackend,
            }).unwrap();

            console.log('Questions saved successfully');
          } catch (questionError) {
            console.error('Error saving questions:', questionError);
            toast('⚠️ Assessment created but failed to save questions');
          }
        }

        toast('✅ Draft Created Successfully');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // DO NOT redirect - keep user in create flow to complete remaining steps
        // router.push(`/teacher/assessments/${result.id}/edit`); // REMOVED
      }
      setIsDirty(false);
    } catch (error: any) {
      console.log('Lỗi');
      toast('Failed to save assessment. Please try again.');
      console.error('Error saving assessment:', error);
    }
  };

  const handlePublish = async () => {
    if (!assessmentId) {
      toast('Cannot Publish');
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
      toast('Validation Failed');
      return;
    }

    try {
      await publishAssessment(assessmentId).unwrap();
      toast('Assessment Published');
      router.push(`/teacher/courses/${courseId}/assessments`);
    } catch (error: any) {
      toast('Publish Failed');
      console.error('Error publishing assessment:', error);
    }
  };

  const handleArchive = async () => {
    if (!assessmentId) return;

    try {
      await archiveAssessment(assessmentId).unwrap();
      toast('Assessment Archived');
      router.push('/teacher/assessments');
    } catch (error: any) {
      toast('Archive Failed');
      console.error('Error archiving assessment:', error);
    }
  };

  const handleDuplicate = async () => {
    if (!assessmentId) return;

    try {
      const result = await duplicateAssessment(assessmentId).unwrap();
      toast('Assessment Duplicated');
      router.push(`/teacher/assessments/${result.id}/edit`);
    } catch (error: any) {
      toast('Duplicate Failed');
      console.error('Error duplicating assessment:', error);
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
              {mode === 'create' && assessmentId && (
                <span
                  className={`ml-2 text-sm font-normal transition-all duration-500 ${
                    saveSuccess
                      ? 'animate-pulse font-semibold text-green-700'
                      : 'text-green-600'
                  }`}
                >
                  {saveSuccess ? '✅ Just Saved!' : '(Draft Saved)'}
                </span>
              )}
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
            {(existingAssessment || (mode === 'create' && assessmentId)) && (
              <Badge
                variant={
                  existingAssessment?.status === 'published'
                    ? 'default'
                    : 'secondary'
                }
                className={
                  existingAssessment?.status === 'draft' ||
                  (mode === 'create' && assessmentId)
                    ? 'border-green-300 bg-green-100 text-green-800'
                    : ''
                }
              >
                {existingAssessment?.status || 'draft'}
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
                className={
                  saveSuccess
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : ''
                }
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isCreating || isUpdating
                      ? 'Saving...'
                      : mode === 'create' && !assessmentId
                        ? 'Save & Continue'
                        : 'Save Draft'}
                  </>
                )}
              </Button>

              {assessmentId && currentMode === 'edit' && (
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
            disabled={!assessmentId || currentMode === 'create'}
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
                        className={
                          saveSuccess
                            ? 'border-green-300 bg-green-50 text-green-700'
                            : ''
                        }
                      >
                        {saveSuccess ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Saved!
                          </>
                        ) : isCreating || isUpdating ? (
                          'Saving...'
                        ) : (
                          'Save Draft'
                        )}
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
                      assessmentData.antiCheatSettings?.monitoring
                        ?.trackCopyPaste || false,
                    preventPrint: true,
                    preventRightClick: true,
                    requireFullscreen:
                      assessmentData.antiCheatSettings?.lockdown
                        ?.fullscreenMode || false,
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
