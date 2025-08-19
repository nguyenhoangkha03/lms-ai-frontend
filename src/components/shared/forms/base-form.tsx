'use client';

import React from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  submitText?: string;
  submitVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  showSubmitButton?: boolean;
  disabled?: boolean;
  loading?: boolean;
  resetOnSubmit?: boolean;
}

export function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  submitText = 'Submit',
  submitVariant = 'default',
  showSubmitButton = true,
  disabled = false,
  loading = false,
  resetOnSubmit = false,
}: BaseFormProps<T>) {
  const isSubmitting = form.formState.isSubmitting || loading;

  const handleSubmit = form.handleSubmit(async (data: T) => {
    await onSubmit(data);
    if (resetOnSubmit) {
      form.reset();
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
        {children}
        {showSubmitButton && (
          <Button
            type="submit"
            variant={submitVariant}
            disabled={disabled || isSubmitting}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitText}
          </Button>
        )}
      </form>
    </FormProvider>
  );
}
