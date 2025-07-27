'use client';

import React from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { BaseForm } from './base-form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMultiStepForm } from '@/hooks/use-multi-step-form';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MultiStepFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  steps: {
    name: string;
    title: string;
    description?: string;
    component: React.ComponentType<{ form: UseFormReturn<T> }>;
  }[];
  onComplete: (data: T) => Promise<void> | void;
  className?: string;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  validateStep?: (step: number, data: Partial<T>) => boolean | Promise<boolean>;
}

export function MultiStepForm<T extends FieldValues>({
  form,
  steps,
  onComplete,
  className,
  showProgress = true,
  showStepNumbers = true,
  validateStep,
}: MultiStepFormProps<T>) {
  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    completeForm,
    isFirstStep,
    isLastStep,
    progress,
    canGoToStep,
    goToStep,
  } = useMultiStepForm({
    steps: steps.map(s => s.name),
    form,
    validateStep,
    onComplete,
  });

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  return (
    <div className={cn('space-y-8', className)}>
      {/* Step Headers */}
      {showStepNumbers && (
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <button
              key={step.name}
              type="button"
              onClick={() => canGoToStep(index) && goToStep(index)}
              disabled={!canGoToStep(index)}
              className={cn(
                'flex flex-col items-center space-y-2 rounded-lg p-2 transition-colors',
                index === currentStep
                  ? 'bg-primary text-primary-foreground'
                  : index < currentStep
                    ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                    : 'text-muted-foreground',
                canGoToStep(index)
                  ? 'cursor-pointer'
                  : 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  index === currentStep
                    ? 'border-primary-foreground bg-primary-foreground text-primary'
                    : index < currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground'
                )}
              >
                {index + 1}
              </div>
              <span className="text-xs font-medium">{step.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Current Step Content */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{currentStepData.title}</h2>
          {currentStepData.description && (
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          )}
        </div>

        <BaseForm
          form={form}
          onSubmit={async () => {
            if (isLastStep) {
              await completeForm();
            } else {
              await nextStep();
            }
          }}
          showSubmitButton={false}
        >
          <StepComponent form={form} />
        </BaseForm>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <Button
          type="button"
          onClick={async () => {
            if (isLastStep) {
              await completeForm();
            } else {
              await nextStep();
            }
          }}
        >
          {isLastStep ? 'Complete' : 'Next'}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
