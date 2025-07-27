'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FormCheckboxProps {
  children?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const FormCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  FormCheckboxProps
>(({ className, children, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        ref={ref}
        id={formItemId}
        className={cn(
          error && 'border-destructive data-[state=checked]:bg-destructive',
          className
        )}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
      {children && (
        <label
          htmlFor={formItemId}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {children}
        </label>
      )}
    </div>
  );
});

FormCheckbox.displayName = 'FormCheckbox';
