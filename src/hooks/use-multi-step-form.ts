'use client';

import { useState, useCallback } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

interface UseMultiStepFormOptions<T extends FieldValues> {
  steps: string[];
  form: UseFormReturn<T>;
  onStepChange?: (step: number, stepName: string) => void;
  onComplete?: (data: T) => void;
  validateStep?: (step: number, data: Partial<T>) => boolean | Promise<boolean>;
}

export function useMultiStepForm<T extends FieldValues>({
  steps,
  form,
  onStepChange,
  onComplete,
  validateStep,
}: UseMultiStepFormOptions<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const nextStep = useCallback(async () => {
    if (currentStep < steps.length - 1) {
      if (validateStep) {
        const isValid = await validateStep(currentStep, form.getValues());
        if (!isValid) return false;
      }

      const nextStepIndex = currentStep + 1;
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(nextStepIndex);
      onStepChange?.(nextStepIndex, steps[nextStepIndex]);
      return true;
    }
    return false;
  }, [currentStep, steps.length, validateStep, form, onStepChange]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      onStepChange?.(prevStepIndex, steps[prevStepIndex]);
      return true;
    }
    return false;
  }, [currentStep, onStepChange, steps]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        onStepChange?.(step, steps[step]);
        return true;
      }
      return false;
    },
    [steps, onStepChange]
  );

  const completeForm = useCallback(async () => {
    if (validateStep) {
      const isValid = await validateStep(currentStep, form.getValues());
      if (!isValid) return false;
    }

    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onComplete?.(form.getValues());
    return true;
  }, [currentStep, validateStep, form, onComplete]);

  const isStepCompleted = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const canGoToStep = useCallback(
    (step: number) => {
      return (
        step <= currentStep ||
        (step === currentStep + 1 && isStepCompleted(currentStep))
      );
    },
    [currentStep, isStepCompleted]
  );

  return {
    currentStep,
    currentStepName: steps[currentStep],
    totalSteps: steps.length,
    steps,
    nextStep,
    prevStep,
    goToStep,
    completeForm,
    isStepCompleted,
    canGoToStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    progress: Math.round(((currentStep + 1) / steps.length) * 100),
  };
}
