'use client';

import React from 'react';
import { useFormField } from '@/components/ui/form';
import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends Omit<TextareaProps, 'error'> {
  description?: string;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ className, description, ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Textarea
      ref={ref}
      id={formItemId}
      className={cn(
        error && 'border-destructive focus-visible:ring-destructive',
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
  );
});

FormTextarea.displayName = 'FormTextarea';
