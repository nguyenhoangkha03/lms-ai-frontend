'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface FormRadioGroupProps {
  options: RadioOption[];
  onValueChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const FormRadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroup>,
  FormRadioGroupProps
>(({ className, options, orientation = 'vertical', ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <RadioGroup
      ref={ref}
      id={formItemId}
      className={cn(
        orientation === 'horizontal' && 'flex flex-wrap gap-6',
        className
      )}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    >
      {options.map(option => (
        <div key={option.value} className="flex items-center space-x-2">
          <RadioGroupItem
            value={option.value}
            id={`${formItemId}-${option.value}`}
            disabled={option.disabled}
            className={cn(error && 'border-destructive text-destructive')}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor={`${formItemId}-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {option.label}
            </Label>
            {option.description && (
              <p className="text-xs text-muted-foreground">
                {option.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </RadioGroup>
  );
});

FormRadioGroup.displayName = 'FormRadioGroup';
