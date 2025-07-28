'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { WelcomeStep } from '@/components/onboarding/steps/welcome-step';
import { SkillAssessmentStep } from '@/components/onboarding/steps/skill-assessment-step';
import { PreferencesSetupStep } from '@/components/onboarding/steps/preferences-setup-step';
import { LearningPathSelectionStep } from '@/components/onboarding/steps/learning-path-selection-step';
import { WelcomeDashboardStep } from '@/components/onboarding/steps/welcome-dashboard-step';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setOnboardingActive,
  loadOnboardingProgress,
  nextStep,
  setCurrentStep,
} from '@/lib/redux/slices/onboarding-slice';
import {
  useGetOnboardingProgressQuery,
  useUpdateOnboardingProgressMutation,
} from '@/lib/redux/api/onboarding-api';

export default function StudentOnboardingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentStep, isCompleted, isActive, isTransitioning } =
    useAppSelector(state => state.onboarding);

  const { data: progressData, isLoading } = useGetOnboardingProgressQuery();
  const [updateProgress] = useUpdateOnboardingProgressMutation();

  // Initialize onboarding
  useEffect(() => {
    if (progressData) {
      dispatch(loadOnboardingProgress(progressData));

      if (progressData.onboardingCompleted) {
        // Redirect to dashboard if already completed
        router.push('/student/dashboard');
        return;
      }

      dispatch(setOnboardingActive(true));
    }
  }, [progressData, dispatch, router]);

  // Prevent access if loading or completed
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">
            Loading your onboarding progress...
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Onboarding Already Complete</h2>
          <p className="text-muted-foreground">
            You've already completed the onboarding process.
          </p>
          <button
            onClick={() => router.push('/student/dashboard')}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle step progression
  const handleStepNext = async (stepData?: any) => {
    try {
      await updateProgress({ step: currentStep + 1, data: stepData }).unwrap();
      dispatch(nextStep());
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Handle onboarding completion
  const handleComplete = async () => {
    try {
      await updateProgress({ step: 5, data: { completed: true } }).unwrap();
      router.push('/student/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const stepConfig = {
    1: {
      title: 'Welcome to LMS AI Platform',
      description: "Let's set up your personalized learning experience",
      canGoBack: false,
      canSkip: false,
      showHelp: true,
      helpContent: (
        <div className="space-y-4">
          <p>
            Welcome to your AI-powered learning journey! This onboarding process
            will help us create a personalized experience tailored just for you.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">What we'll cover:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Assess your current skill level</li>
              <li>• Set up your learning preferences</li>
              <li>• Choose your learning path</li>
              <li>• Configure your study schedule</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            This process takes about 10-15 minutes and can be paused at any
            time.
          </p>
        </div>
      ),
    },
    2: {
      title: 'Skill Assessment',
      description: 'Help us understand your current knowledge level',
      canSkip: true,
      canGoBack: true,
      showHelp: true,
      helpContent: (
        <div className="space-y-4">
          <p>
            The skill assessment helps our AI understand your current knowledge
            level and learning style.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Tips for the assessment:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Answer honestly - there are no wrong answers</li>
              <li>• Take your time to read each question carefully</li>
              <li>• You can go back to previous questions</li>
              <li>• The assessment adapts to your responses</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Your responses help us recommend the best courses and learning paths
            for you.
          </p>
        </div>
      ),
    },
    3: {
      title: 'Learning Preferences',
      description: 'Customize your learning experience to match your style',
      canSkip: true,
      canGoBack: true,
      showHelp: true,
      helpContent: (
        <div className="space-y-4">
          <p>
            Setting up your preferences helps us personalize your learning
            experience.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">We'll help you set up:</h4>
            <ul className="space-y-1 text-sm">
              <li>
                • Your preferred learning style (visual, auditory, hands-on)
              </li>
              <li>• Best times for studying</li>
              <li>• Session duration preferences</li>
              <li>• Learning goals and interests</li>
              <li>• Notification preferences</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            You can always change these settings later in your profile.
          </p>
        </div>
      ),
    },
    4: {
      title: 'Choose Your Learning Path',
      description: 'Select a personalized curriculum designed for your goals',
      canSkip: false,
      canGoBack: true,
      showHelp: true,
      helpContent: (
        <div className="space-y-4">
          <p>
            Based on your assessment and preferences, we've curated learning
            paths that match your goals.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">AI Recommendations:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Paths are ranked by compatibility with your profile</li>
              <li>• Each path includes carefully selected courses</li>
              <li>• Estimated completion times are personalized</li>
              <li>• You can customize any path to fit your needs</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            Don't worry - you can always add more courses or switch paths later.
          </p>
        </div>
      ),
    },
    5: {
      title: 'Welcome to Your Dashboard',
      description: 'Your personalized learning environment is ready!',
      canGoBack: false,
      canSkip: false,
      showHelp: true,
      helpContent: (
        <div className="space-y-4">
          <p>
            Congratulations! Your personalized learning environment is now set
            up.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Your dashboard includes:</h4>
            <ul className="space-y-1 text-sm">
              <li>• Progress tracking for all your courses</li>
              <li>• AI-powered recommendations</li>
              <li>• Personalized study schedule</li>
              <li>• Achievement system</li>
              <li>• Quick access to all learning tools</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground">
            You can always return to modify your preferences in the settings.
          </p>
        </div>
      ),
    },
  };

  const currentStepConfig = stepConfig[currentStep as keyof typeof stepConfig];

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={() => handleStepNext()} />;

      case 2:
        return (
          <SkillAssessmentStep
            onNext={() => handleStepNext()}
            onBack={() => dispatch(setCurrentStep(1))}
          />
        );

      case 3:
        return (
          <PreferencesSetupStep
            onNext={() => handleStepNext()}
            onBack={() => dispatch(setCurrentStep(2))}
          />
        );

      case 4:
        return (
          <LearningPathSelectionStep
            onNext={() => handleStepNext()}
            onBack={() => dispatch(setCurrentStep(3))}
          />
        );

      case 5:
        return <WelcomeDashboardStep onComplete={handleComplete} />;

      default:
        return <WelcomeStep onNext={() => handleStepNext()} />;
    }
  };

  if (!isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <h2 className="text-2xl font-bold">Onboarding Not Active</h2>
          <p className="text-muted-foreground">
            The onboarding process is not currently active.
          </p>
          <button
            onClick={() => dispatch(setOnboardingActive(true))}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      title={currentStepConfig?.title || 'Onboarding'}
      description={currentStepConfig?.description}
      canGoBack={currentStepConfig?.canGoBack}
      canSkip={currentStepConfig?.canSkip}
      showHelp={currentStepConfig?.showHelp}
      helpContent={currentStepConfig?.helpContent}
      isLoading={isTransitioning}
    >
      {renderStepContent()}
    </OnboardingLayout>
  );
}
