'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  optional?: boolean;
}

interface StepperProps {
  steps: Step[];
  currentStep: string;
  completedSteps?: string[];
  onStepClick?: (stepId: string) => void;
  className?: string;
  variant?: 'default' | 'simple';
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  onStepClick,
  className,
  variant = 'default',
  orientation = 'horizontal',
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);

  const getStepStatus = (step: Step, index: number) => {
    if (completedSteps.includes(step.id)) return 'completed';
    if (step.id === currentStep) return 'current';
    if (index < currentIndex) return 'completed';
    return 'upcoming';
  };

  const renderStep = (step: Step, index: number) => {
    const status = getStepStatus(step, index);
    const isClickable =
      onStepClick && (status === 'completed' || status === 'current');

    const stepContent = (
      <div
        className={cn(
          'flex items-center gap-3',
          orientation === 'vertical' && 'flex-col text-center',
          isClickable && 'group cursor-pointer'
        )}
      >
        {/* Step Circle */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
            status === 'completed' &&
              'border-primary bg-primary text-primary-foreground',
            status === 'current' && 'border-primary bg-background text-primary',
            status === 'upcoming' &&
              'border-muted-foreground text-muted-foreground',
            isClickable && 'group-hover:border-primary'
          )}
        >
          {status === 'completed' ? (
            <Check className="h-5 w-5" />
          ) : step.icon ? (
            step.icon
          ) : (
            <span className="text-sm font-medium">{index + 1}</span>
          )}
        </div>

        {/* Step Content */}
        {variant === 'default' && (
          <div
            className={cn(
              'flex flex-col',
              orientation === 'vertical' && 'text-center'
            )}
          >
            <div
              className={cn(
                'text-sm font-medium',
                status === 'current' && 'text-foreground',
                status === 'completed' && 'text-foreground',
                status === 'upcoming' && 'text-muted-foreground'
              )}
            >
              {step.title}
              {step.optional && (
                <span className="ml-1 text-xs text-muted-foreground">
                  (Optional)
                </span>
              )}
            </div>
            {step.description && (
              <div className="mt-1 text-xs text-muted-foreground">
                {step.description}
              </div>
            )}
          </div>
        )}
      </div>
    );

    const handleClick = () => {
      if (isClickable) {
        onStepClick(step.id);
      }
    };

    return (
      <div
        key={step.id}
        className={cn(
          'flex items-center',
          orientation === 'horizontal' ? 'flex-1' : 'w-full'
        )}
        onClick={handleClick}
      >
        {stepContent}
      </div>
    );
  };

  const renderConnector = (index: number) => {
    if (index === steps.length - 1) return null;

    const isCompleted =
      index < currentIndex || completedSteps.includes(steps[index].id);

    return (
      <div
        key={`connector-${index}`}
        className={cn(
          'transition-colors',
          orientation === 'horizontal'
            ? 'mx-4 h-0.5 flex-1'
            : 'mx-auto my-2 h-6 w-0.5',
          isCompleted ? 'bg-primary' : 'bg-muted'
        )}
      />
    );
  };

  return (
    <div
      className={cn(
        'flex',
        orientation === 'horizontal' ? 'items-center' : 'flex-col',
        className
      )}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          {renderStep(step, index)}
          {renderConnector(index)}
        </React.Fragment>
      ))}
    </div>
  );
};
