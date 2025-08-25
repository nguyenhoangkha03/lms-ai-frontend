'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { WelcomeStep } from '@/components/onboarding/steps/welcome-step';
import { CategorySelectionStep } from '@/components/onboarding/steps/category-selection-step';
import { SkillAssessmentStep } from '@/components/onboarding/steps/skill-assessment-step';
import { PreferencesSetupStep } from '@/components/onboarding/steps/preferences-setup-step';
import { LearningPathSelectionStep } from '@/components/onboarding/steps/learning-path-selection-step';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setOnboardingActive,
  loadOnboardingProgress,
  setCurrentStep,
  setLoading,
  setError,
  setSelectedCategory,
} from '@/lib/redux/slices/onboarding-slice';
import {
  useGetOnboardingProgressQuery,
  useUpdateOnboardingProgressMutation,
  useCompleteOnboardingMutation,
  useSkipOnboardingStepMutation,
  useSelectLearningPathMutation,
} from '@/lib/redux/api/onboarding-api';

// Define step configuration
const STEP_CONFIG = [
  {
    id: 1,
    title: 'Welcome to LMS AI Platform',
    description: "Let's set up your personalized learning experience",
    canGoBack: false,
    canSkip: false,
    showHelp: true,
  },
  {
    id: 2,
    title: 'Choose Your Learning Focus', 
    description: 'Select the main subject area you want to learn',
    canGoBack: true,
    canSkip: false, // Must choose category
    showHelp: true,
  },
  {
    id: 3,
    title: 'Skill Assessment',
    description: 'Customized questions based on your chosen focus',
    canGoBack: true,
    canSkip: true,
    showHelp: true,
  },
  {
    id: 4,
    title: 'Learning Preferences',
    description: 'Customize your learning experience to match your style',
    canGoBack: true,
    canSkip: true, 
    showHelp: true,
  },
  {
    id: 5,
    title: 'Choose Your Learning Path',
    description: 'Select a personalized curriculum designed for your goals',
    canGoBack: true,
    canSkip: false,
    showHelp: true,
  },
] as const;

export default function StudentOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentStep, isCompleted, isActive, isLoading, selectedPath, selectedCategory } = useAppSelector(state => state.onboarding);

  const { data: progressData, isLoading: isLoadingProgress } = useGetOnboardingProgressQuery();
  const [updateProgress] = useUpdateOnboardingProgressMutation();
  const [completeOnboarding] = useCompleteOnboardingMutation();
  const [skipStep] = useSkipOnboardingStepMutation();
  const [selectPath] = useSelectLearningPathMutation();

  // Initialize onboarding
  useEffect(() => {
    if (progressData) {
      dispatch(loadOnboardingProgress(progressData));

      if (progressData.onboardingCompleted) {
        router.push('/student/dashboard');
        return;
      }

      dispatch(setOnboardingActive(true));
    }
  }, [progressData, dispatch, router]);

  // Centralized navigation handlers
  const handleNext = async (stepData?: any) => {
    if (isLoading) return;

    dispatch(setLoading(true));
    
    try {
      if (currentStep === 1) {
        // Step 1: Welcome - mark as completed
        await updateProgress({ 
          step: currentStep, 
          data: { welcomeCompleted: true }
        }).unwrap();
      } else if (currentStep === 2) {
        // Step 2: Category Selection - validate category selection
        if (!stepData?.selectedCategory) {
          dispatch(setError('Please select a learning category to continue.'));
          return;
        }
        dispatch(setSelectedCategory(stepData.selectedCategory));
      }
      
      if (currentStep === STEP_CONFIG.length) {
        // Step 5: Learning Path Selection - need to select path first
        if (!selectedPath) {
          dispatch(setError('Please select a learning path to continue.'));
          return;
        }
        
        // Select learning path first
        await selectPath({
          pathId: selectedPath.id,
          customization: {},
        }).unwrap();
        
        // Complete onboarding
        const result = await completeOnboarding().unwrap();
        router.push(result.redirectUrl || '/student/dashboard');
      } else {
        // Update progress and move to next step
        await updateProgress({ 
          step: currentStep, 
          data: { ...stepData, categoryId: selectedCategory }
        }).unwrap();
        
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (error) {
      console.error('Error progressing step:', error);
      dispatch(setError('Failed to save progress. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !isLoading) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handleSkip = async (reason = 'user_skipped') => {
    if (isLoading) return;
    
    dispatch(setLoading(true));
    
    try {
      await skipStep({ step: currentStep, reason }).unwrap();
      dispatch(setCurrentStep(currentStep + 1));
    } catch (error) {
      console.error('Error skipping step:', error);
      dispatch(setError('Failed to skip step. Please try again.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Loading state
  if (isLoadingProgress) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your onboarding progress...</p>
        </div>
      </div>
    );
  }

  // Completed state
  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Onboarding Complete! 🎉</h2>
          <p className="text-muted-foreground">Welcome to your personalized learning journey.</p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Inactive state
  if (!isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
          <p className="text-muted-foreground">Let's set up your personalized learning experience.</p>
          <button
            onClick={() => dispatch(setOnboardingActive(true))}
            className="rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  // Get current step configuration
  const currentStepConfig = STEP_CONFIG[currentStep - 1];
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return (
          <CategorySelectionStep 
            onCategorySelect={(categoryId) => {
              dispatch(setSelectedCategory(categoryId));
            }}
            selectedCategory={selectedCategory}
          />
        );
      case 3:
        return <SkillAssessmentStep />;
      case 4:
        return <PreferencesSetupStep />;
      case 5:
        return <LearningPathSelectionStep />;
      default:
        return <WelcomeStep />;
    }
  };

  // Check if we can proceed to next step
  const canProceed = () => {
    switch (currentStep) {
      case 2: // Category selection step
        return !!selectedCategory;
      case 5: // Learning path selection step
        return !!selectedPath;
      default:
        return true;
    }
  };

  // Main render - simplified layout
  return (
    <OnboardingLayout
      title={currentStepConfig?.title || 'Onboarding'}
      description={currentStepConfig?.description}
      canGoBack={currentStepConfig?.canGoBack && currentStep > 1}
      canSkip={currentStepConfig?.canSkip}
      showHelp={currentStepConfig?.showHelp}
      isLoading={isLoading}
      canProceed={canProceed()}
      onNext={() => handleNext({ selectedCategory })}
      onBack={handleBack}
      onSkip={handleSkip}
    >
      {renderStepContent()}
    </OnboardingLayout>
  );
}
