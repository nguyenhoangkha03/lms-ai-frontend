'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  FieldValues,
  Path,
} from 'react-hook-form';
import { z } from 'zod';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseFormWithSchemaOptions<T extends FieldValues>
  extends UseFormProps<T> {
  schema: z.ZodSchema<T, any, any>;
  onSubmitSuccess?: (data: T) => void;
  onSubmitError?: (error: Error) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormWithSchema<T extends FieldValues>({
  schema,
  onSubmitSuccess,
  onSubmitError,
  showSuccessToast = true,
  showErrorToast = true,
  successMessage = 'Form submitted successfully!',
  errorMessage = 'Something went wrong. Please try again.',
  ...formOptions
}: UseFormWithSchemaOptions<T>): UseFormReturn<T> & {
  handleSubmit: (
    onSubmit: (data: T) => Promise<void> | void
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  setFieldError: (field: Path<T>, message: string) => void;
  clearErrors: () => void;
  isSubmitting: boolean;
} {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    ...formOptions,
  });

  const handleSubmit = useCallback(
    (onSubmit: (data: T) => Promise<void> | void) =>
      form.handleSubmit(async (data: T) => {
        try {
          await onSubmit(data);
          onSubmitSuccess?.(data);
          if (showSuccessToast) {
            toast.success(successMessage);
          }
        } catch (error) {
          const errorInstance =
            error instanceof Error ? error : new Error(String(error));
          onSubmitError?.(errorInstance);
          if (showErrorToast) {
            toast.error(errorMessage);
          }
        }
      }),
    [
      form,
      onSubmitSuccess,
      onSubmitError,
      showSuccessToast,
      showErrorToast,
      successMessage,
      errorMessage,
    ]
  );

  const setFieldError = useCallback(
    (field: Path<T>, message: string) => {
      form.setError(field, { type: 'manual', message });
    },
    [form]
  );

  const clearErrors = useCallback(() => {
    form.clearErrors();
  }, [form]);

  return {
    ...form,
    handleSubmit: handleSubmit as UseFormReturn<T>['handleSubmit'],
    setFieldError,
    clearErrors,
    isSubmitting: form.formState.isSubmitting,
  };
}
