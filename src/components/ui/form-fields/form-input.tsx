'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import { Input, InputProps } from '@/components/ui/enhanced-input';
import { cn } from '@/lib/utils';

interface FormInputProps extends Omit<InputProps, 'error'> {
  description?: string;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, description, ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } =
      useFormField();

    return (
      <Input
        ref={ref}
        id={formItemId}
        className={cn(className)}
        error={error?.message}
        aria-describedby={
          !error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`
        }
        aria-invalid={!!error}
        {...props}
      />
    );
  }
);

FormInput.displayName = 'FormInput';
