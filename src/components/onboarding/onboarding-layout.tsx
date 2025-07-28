'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  nextStep,
  previousStep,
  setShowSkipDialog,
  completeOnboarding,
} from '@/lib/redux/slices/onboarding-slice';
import {
  useSkipOnboardingStepMutation,
  useCompleteOnboardingMutation,
} from '@/lib/redux/api/onboarding-api';
import { useRouter } from 'next/navigation';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
  canSkip?: boolean;
  isLoading?: boolean;
  onNext?: () => void | Promise<void>;
  onBack?: () => void;
  onSkip?: () => void;
  showProgress?: boolean;
  showHelp?: boolean;
  helpContent?: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  description,
  canGoBack = true,
  canGoNext = true,
  canSkip = true,
  isLoading = false,
  onNext,
  onBack,
  onSkip,
  showProgress = true,
  showHelp = false,
  helpContent,
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    showSkipDialog,
    isTransitioning,
    totalTimeSpent,
  } = useAppSelector(state => state.onboarding);

  const [skipStep] = useSkipOnboardingStepMutation();
  const [completeOnboardingMutation] = useCompleteOnboardingMutation();
  const [showHelpDialog, setShowHelpDialog] = React.useState(false);

  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Handle next step
  const handleNext = async () => {
    if (onNext) {
      try {
        await onNext();
      } catch (error) {
        console.error('Error in onNext:', error);
        return;
      }
    }

    if (currentStep === totalSteps) {
      // Complete onboarding
      try {
        const result = await completeOnboardingMutation().unwrap();
        dispatch(completeOnboarding());
        router.push(result.redirectUrl || '/student/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
    } else {
      dispatch(nextStep());
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    dispatch(previousStep());
  };

  // Handle skip step
  const handleSkip = async () => {
    if (onSkip) {
      onSkip();
    }

    try {
      await skipStep({ step: currentStep, reason: 'user_skipped' }).unwrap();
      dispatch(nextStep());
    } catch (error) {
      console.error('Error skipping step:', error);
    }

    dispatch(setShowSkipDialog(false));
  };

  // Format time spent
  const formatTimeSpent = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and branding */}
            <div className="flex items-center space-x-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">
                  L
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold">LMS AI Platform</h1>
                <p className="text-sm text-muted-foreground">
                  Student Onboarding
                </p>
              </div>
            </div>

            {/* Progress and controls */}
            <div className="flex items-center space-x-4">
              {/* Time spent */}
              <Badge variant="outline" className="hidden sm:flex">
                Time: {formatTimeSpent(totalTimeSpent)}
              </Badge>

              {/* Help button */}
              {showHelp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHelpDialog(true)}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              )}

              {/* Step indicator */}
              <Badge variant="secondary">
                Step {currentStep} of {totalSteps}
              </Badge>

              {/* Exit button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(setShowSkipDialog(true))}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="mt-4">
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Step header */}
          <div className="mb-8 text-center">
            <motion.h2
              key={`title-${currentStep}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 text-3xl font-bold"
            >
              {title}
            </motion.h2>

            {description && (
              <motion.p
                key={`description-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mx-auto max-w-2xl text-lg text-muted-foreground"
              >
                {description}
              </motion.p>
            )}
          </div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border bg-card p-8 shadow-sm"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex space-x-2">
              {canGoBack && currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isTransitioning}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {canSkip && currentStep < totalSteps && (
                <Button
                  variant="ghost"
                  onClick={() => dispatch(setShowSkipDialog(true))}
                  disabled={isTransitioning}
                  className="text-muted-foreground"
                >
                  Skip this step
                </Button>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canGoNext || isTransitioning || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : currentStep === totalSteps ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Skip confirmation dialog */}
      <Dialog
        open={showSkipDialog}
        onOpenChange={open => dispatch(setShowSkipDialog(open))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip this step?</DialogTitle>
            <DialogDescription>
              You can always complete this setup later in your profile settings.
              However, we recommend completing the full onboarding for the best
              learning experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => dispatch(setShowSkipDialog(false))}
            >
              Go Back
            </Button>
            <Button onClick={handleSkip}>Skip Step</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help dialog */}
      {showHelp && (
        <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Help & Tips</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {helpContent || (
                <p className="text-muted-foreground">
                  No help content available for this step.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowHelpDialog(false)}>Got it</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
