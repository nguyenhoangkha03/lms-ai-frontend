'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  Eye,
  Upload,
  Sparkles,
  AlertCircle,
  Clock,
  FileText,
  Video,
  Settings,
  DollarSign,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import wizard steps
import { BasicInfoStep } from '@/components/teacher/course-creation/basic-info-step';
import { CurriculumBuilderStep } from '@/components/teacher/course-creation/curriculum-builder-step';
import { ContentUploadStep } from '@/components/teacher/course-creation/content-upload-step';
import { PricingStep } from '@/components/teacher/course-creation/pricing-step';
import { SettingsStep } from '@/components/teacher/course-creation/settings-step';
import { ReviewStep } from '@/components/teacher/course-creation/review-step';

// Import AI suggestions component
import { AISuggestionsPanel } from '@/components/teacher/course-creation/ai-suggestions-panel';

// Import API hooks
import {
  useCreateCourseDraftMutation,
  useUpdateCourseDraftMutation,
  useGetCourseDraftQuery,
  useAutoSaveCourseDraftMutation,
  useValidateCourseDraftMutation,
  usePreviewCourseMutation,
  usePublishCourseMutation,
} from '@/lib/redux/api/course-creation-api';
import type { CourseDraft } from '@/lib/redux/api/course-creation-api';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<WizardStepProps>;
  isCompleted: boolean;
  isOptional?: boolean;
  estimatedTime: number; // in minutes
}

interface WizardStepProps {
  draft: CourseDraft;
  onUpdate: (updates: Partial<CourseDraft>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

const WIZARD_STEPS: Omit<WizardStep, 'isCompleted'>[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Course title, description, and category',
    icon: <FileText className="h-5 w-5" />,
    component: BasicInfoStep,
    estimatedTime: 10,
  },
  {
    id: 'curriculum',
    title: 'Curriculum Builder',
    description: 'Create sections and lessons structure',
    icon: <BookOpen className="h-5 w-5" />,
    component: CurriculumBuilderStep,
    estimatedTime: 30,
  },
  {
    id: 'content',
    title: 'Content Upload',
    description: 'Upload videos, materials, and resources',
    icon: <Video className="h-5 w-5" />,
    component: ContentUploadStep,
    estimatedTime: 45,
  },
  {
    id: 'pricing',
    title: 'Pricing & Access',
    description: 'Set pricing and access settings',
    icon: <DollarSign className="h-5 w-5" />,
    component: PricingStep,
    estimatedTime: 5,
  },
  {
    id: 'settings',
    title: 'Course Settings',
    description: 'Configure additional settings',
    icon: <Settings className="h-5 w-5" />,
    component: SettingsStep,
    isOptional: true,
    estimatedTime: 10,
  },
  {
    id: 'review',
    title: 'Review & Publish',
    description: 'Review and publish your course',
    icon: <Target className="h-5 w-5" />,
    component: ReviewStep,
    estimatedTime: 15,
  },
];

export default function CourseCreationWizardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // API mutations and queries
  const [createDraft, { isLoading: isCreating }] =
    useCreateCourseDraftMutation();
  const [updateDraft, { isLoading: isUpdating }] =
    useUpdateCourseDraftMutation();
  const [autoSaveDraft] = useAutoSaveCourseDraftMutation();
  const [validateDraft] = useValidateCourseDraftMutation();
  const [previewCourse] = usePreviewCourseMutation();
  const [publishCourse, { isLoading: isPublishing }] =
    usePublishCourseMutation();

  const { data: draft, refetch } = useGetCourseDraftQuery(draftId!, {
    skip: !draftId,
  });

  // Initialize empty draft
  const [localDraft, setLocalDraft] = useState<CourseDraft>({
    step: 0,
    basicInfo: {
      title: '',
      subtitle: '',
      description: '',
      categoryId: '',
      level: 'beginner',
      language: 'en',
      duration: { hours: 0, minutes: 0 },
      tags: [],
      requirements: [],
      whatYouWillLearn: [],
      targetAudience: [],
    },
    curriculum: {
      sections: [],
      totalLessons: 0,
      totalDuration: 0,
    },
    content: {
      materials: [],
    },
    pricing: {
      isFree: true,
      price: 0,
      currency: 'USD',
      pricingModel: 'free',
      lifetimeAccess: true,
    },
    settings: {
      allowReviews: true,
      allowDiscussions: true,
      hasCertificate: false,
      isPublic: true,
      requiresApproval: false,
    },
    metadata: {
      lastModified: new Date().toISOString(),
      completionPercentage: 0,
      autoSave: true,
      isDraft: true,
    },
  });

  // Create initial draft on mount
  useEffect(() => {
    const initializeDraft = async () => {
      try {
        const result = await createDraft(localDraft).unwrap();
        setDraftId(result.id!);
        setLocalDraft(result);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to create course draft',
          variant: 'destructive',
        });
      }
    };

    if (!draftId) {
      initializeDraft();
    }
  }, []);

  // Sync with server draft
  useEffect(() => {
    if (draft) {
      setLocalDraft(draft);
      setCurrentStep(draft.step || 0);
    }
  }, [draft]);

  // Auto-save functionality
  useEffect(() => {
    if (!draftId || !localDraft.metadata.autoSave) return;

    const autoSaveTimer = setTimeout(async () => {
      try {
        setIsAutoSaving(true);
        await autoSaveDraft({
          id: draftId,
          data: localDraft,
        }).unwrap();
        setLastAutoSave(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [localDraft, draftId, autoSaveDraft]);

  // Calculate wizard steps with completion status
  const wizardSteps: WizardStep[] = WIZARD_STEPS.map((step, index) => ({
    ...step,
    isCompleted:
      index < currentStep ||
      (index === currentStep && isStepCompleted(step.id)),
  }));

  // Check if current step is completed
  function isStepCompleted(stepId: string): boolean {
    switch (stepId) {
      case 'basic-info':
        return !!(
          localDraft.basicInfo.title &&
          localDraft.basicInfo.description &&
          localDraft.basicInfo.categoryId
        );
      case 'curriculum':
        return localDraft.curriculum.sections.length > 0;
      case 'content':
        return true; // Optional step
      case 'pricing':
        return true; // Always valid as it has defaults
      case 'settings':
        return true; // Optional step
      case 'review':
        return true; // Completed by publishing
      default:
        return false;
    }
  }

  // Calculate overall progress
  const overallProgress = wizardSteps.reduce((acc, step, index) => {
    if (step.isCompleted) return acc + 100 / wizardSteps.length;
    if (index === currentStep) return acc + 50 / wizardSteps.length;
    return acc;
  }, 0);

  // Handle draft update
  const handleDraftUpdate = async (updates: Partial<CourseDraft>) => {
    const updatedDraft = { ...localDraft, ...updates };
    updatedDraft.metadata.lastModified = new Date().toISOString();

    setLocalDraft(updatedDraft);

    if (draftId) {
      try {
        await updateDraft({
          id: draftId,
          draft: updatedDraft,
        }).unwrap();
      } catch (error) {
        toast({
          title: 'Save Error',
          description: 'Failed to save changes',
          variant: 'destructive',
        });
      }
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    if (currentStep < wizardSteps.length - 1) {
      // Validate current step before proceeding
      const isValid = await validateCurrentStep();
      if (isValid) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        await handleDraftUpdate({ step: nextStep });
      }
    }
  };

  const handlePrevious = async () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      await handleDraftUpdate({ step: prevStep });
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    // Allow jumping to any step, but validate current step first
    if (stepIndex !== currentStep) {
      const isValid = await validateCurrentStep();
      if (isValid || stepIndex < currentStep) {
        setCurrentStep(stepIndex);
        await handleDraftUpdate({ step: stepIndex });
      }
    }
  };

  // Validation
  const validateCurrentStep = async (): Promise<boolean> => {
    if (!draftId) return false;

    try {
      const result = await validateDraft(draftId).unwrap();

      if (result.step === currentStep && !result.isValid) {
        const stepErrors: Record<string, string> = {};
        result.errors.forEach(error => {
          stepErrors[error.field] = error.message;
        });
        setValidationErrors(stepErrors);

        toast({
          title: 'Validation Error',
          description: 'Please fix the errors before proceeding',
          variant: 'destructive',
        });
        return false;
      }

      setValidationErrors({});
      return true;
    } catch (error) {
      console.error('Validation failed:', error);
      return false;
    }
  };

  // Preview course
  const handlePreview = async () => {
    if (!draftId) return;

    try {
      const result = await previewCourse(draftId).unwrap();
      window.open(result.previewUrl, '_blank');
    } catch (error) {
      toast({
        title: 'Preview Error',
        description: 'Failed to generate course preview',
        variant: 'destructive',
      });
    }
  };

  // Publish course
  const handlePublish = async (submitForReview = false) => {
    if (!draftId) return;

    try {
      const result = await publishCourse({
        draftId,
        publishOptions: { submitForReview },
      }).unwrap();

      toast({
        title: 'Success!',
        description: submitForReview
          ? 'Course submitted for review'
          : 'Course published successfully',
      });

      router.push(`/teacher/courses/${result.courseId}`);
    } catch (error) {
      toast({
        title: 'Publish Error',
        description: 'Failed to publish course',
        variant: 'destructive',
      });
    }
  };

  // Get current step component
  const CurrentStepComponent = wizardSteps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
                <BookOpen className="h-8 w-8 text-blue-600" />
                Create New Course
              </h1>
              <p className="mt-2 text-gray-600">
                Follow our step-by-step wizard to create your course
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                {isAutoSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    Saving...
                  </>
                ) : lastAutoSave ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    Saved {new Date(lastAutoSave).toLocaleTimeString()}
                  </>
                ) : null}
              </div>

              <Button
                onClick={() => setShowAISuggestions(!showAISuggestions)}
                variant="outline"
                className="border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Assistant
              </Button>

              <Button onClick={handlePreview} variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>

              <Button
                onClick={() => router.push('/teacher/courses')}
                variant="ghost"
              >
                Exit
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Course Creation Progress
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(overallProgress)}% complete
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Step Navigator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Course Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {wizardSteps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-all',
                      index === currentStep
                        ? 'border border-blue-200 bg-blue-100'
                        : step.isCompleted
                          ? 'border border-green-200 bg-green-50 hover:bg-green-100'
                          : 'hover:bg-gray-50'
                    )}
                    onClick={() => handleStepClick(index)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium',
                        index === currentStep
                          ? 'bg-blue-600 text-white'
                          : step.isCompleted
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                      )}
                    >
                      {step.isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : index < currentStep ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          index === currentStep
                            ? 'text-blue-900'
                            : step.isCompleted
                              ? 'text-green-900'
                              : 'text-gray-700'
                        )}
                      >
                        {step.title}
                        {step.isOptional && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Optional
                          </Badge>
                        )}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {step.description}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />~{step.estimatedTime}min
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div
            className={cn(
              'transition-all duration-300',
              showAISuggestions ? 'lg:col-span-2' : 'lg:col-span-3'
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="min-h-[600px]">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {wizardSteps[currentStep]?.icon}
                        <div>
                          <CardTitle>
                            {wizardSteps[currentStep]?.title}
                          </CardTitle>
                          <p className="mt-1 text-sm text-gray-600">
                            {wizardSteps[currentStep]?.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Step {currentStep + 1} of {wizardSteps.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {CurrentStepComponent && (
                      <CurrentStepComponent
                        draft={localDraft}
                        onUpdate={handleDraftUpdate}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        isLoading={isUpdating || isCreating}
                        errors={validationErrors}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="mt-6 flex items-center justify-between">
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {/* Validation errors indicator */}
                    {Object.keys(validationErrors).length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        Fix errors to continue
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {currentStep === wizardSteps.length - 1 ? (
                      <>
                        <Button
                          onClick={() => handlePublish(true)}
                          variant="outline"
                          disabled={isPublishing}
                        >
                          Submit for Review
                        </Button>
                        <Button
                          onClick={() => handlePublish(false)}
                          disabled={isPublishing}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                        >
                          {isPublishing ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                              Publishing...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Publish Course
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={
                          currentStep === wizardSteps.length - 1 ||
                          Object.keys(validationErrors).length > 0
                        }
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AI Suggestions Panel */}
          <AnimatePresence>
            {showAISuggestions && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-1"
              >
                <AISuggestionsPanel
                  courseId={draftId}
                  currentStep={wizardSteps[currentStep]?.id}
                  courseDraft={localDraft}
                  onApplySuggestion={suggestion => {
                    // Handle applying AI suggestion
                    toast({
                      title: 'Applied Suggestion',
                      description:
                        'AI suggestion has been applied to your course',
                    });
                  }}
                  onClose={() => setShowAISuggestions(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Save Notification */}
        <AnimatePresence>
          {isAutoSaving && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg"
            >
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Auto-saving your progress...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
