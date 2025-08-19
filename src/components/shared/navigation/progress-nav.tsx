'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/enhanced-button';
import { Progress } from '@/components/ui/progress';

interface ProgressNavProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onStepClick?: (step: number) => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  showProgress?: boolean;
  showStepCounter?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

export const ProgressNav: React.FC<ProgressNavProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onStepClick,
  previousDisabled = false,
  nextDisabled = false,
  showProgress = true,
  showStepCounter = true,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  className,
}) => {
  const progressValue = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <Progress value={progressValue} className="h-2" />
          {showStepCounter && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progressValue)}% complete</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={previousDisabled || currentStep === 1}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
        >
          {previousLabel}
        </Button>

        {/* Step Dots */}
        {onStepClick && (
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }, (_, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <button
                  key={stepNumber}
                  onClick={() => onStepClick(stepNumber)}
                  className={cn(
                    'h-3 w-3 rounded-full transition-colors',
                    isActive && 'bg-primary',
                    isCompleted && 'bg-primary/60',
                    !isActive &&
                      !isCompleted &&
                      'bg-muted hover:bg-muted-foreground/20'
                  )}
                  aria-label={`Go to step ${stepNumber}`}
                />
              );
            })}
          </div>
        )}

        <Button
          onClick={onNext}
          disabled={nextDisabled || currentStep === totalSteps}
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          {nextLabel}
        </Button>
      </div>
    </div>
  );
};
