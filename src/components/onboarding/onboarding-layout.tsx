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
  canSkip?: boolean;
  canProceed?: boolean;
  isLoading?: boolean;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  onSkip: () => void;
  showProgress?: boolean;
  showHelp?: boolean;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  title,
  description,
  canGoBack = false,
  canSkip = false,
  canProceed = true,
  isLoading = false,
  onNext,
  onBack,
  onSkip,
  showProgress = true,
  showHelp = false,
}) => {
  const dispatch = useAppDispatch();
  const { currentStep, totalSteps, showSkipDialog, totalTimeSpent, error } = 
    useAppSelector(state => state.onboarding);

  // Calculate progress percentage
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Simple event handlers - delegate to parent
  const handleNext = async () => {
    try {
      await onNext();
    } catch (error) {
      console.error('Error in handleNext:', error);
    }
  };

  const handleBack = () => {
    onBack();
  };

  const handleSkip = async () => {
    try {
      await onSkip();
      dispatch(setShowSkipDialog(false));
    } catch (error) {
      console.error('Error in handleSkip:', error);
    }
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

              {/* Help button - removed for simplicity */}

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
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-center text-destructive">
              {error}
            </div>
          )}

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
              {canGoBack && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {canSkip && (
                <Button
                  variant="ghost"
                  onClick={() => dispatch(setShowSkipDialog(true))}
                  disabled={isLoading}
                  className="text-muted-foreground"
                >
                  Skip this step
                </Button>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={isLoading || !canProceed}
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

    </div>
  );
};
