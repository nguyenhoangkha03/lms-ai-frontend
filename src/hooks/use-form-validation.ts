'use client';

import { useCallback } from 'react';
import { UseFormReturn, FieldValues, Path } from 'react-hook-form';

export function useFormValidation<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  const validateField = useCallback(
    async (field: Path<T>): Promise<boolean> => {
      const result = await form.trigger(field);
      return result;
    },
    [form]
  );

  const validateFields = useCallback(
    async (fields: Path<T>[]): Promise<boolean> => {
      const result = await form.trigger(fields);
      return result;
    },
    [form]
  );

  const validateAllFields = useCallback(async (): Promise<boolean> => {
    const result = await form.trigger();
    return result;
  }, [form]);

  const getFieldError = useCallback(
    (field: Path<T>): string | undefined => {
      return form.formState.errors[field]?.message as string | undefined;
    },
    [form.formState.errors]
  );

  const hasFieldError = useCallback(
    (field: Path<T>): boolean => {
      return Boolean(form.formState.errors[field]);
    },
    [form.formState.errors]
  );

  const hasAnyErrors = useCallback((): boolean => {
    return Object.keys(form.formState.errors).length > 0;
  }, [form.formState.errors]);

  const clearFieldError = useCallback(
    (field: Path<T>) => {
      form.clearErrors(field);
    },
    [form]
  );

  const setFieldError = useCallback(
    (field: Path<T>, message: string) => {
      form.setError(field, { type: 'manual', message });
    },
    [form]
  );

  return {
    validateField,
    validateFields,
    validateAllFields,
    getFieldError,
    hasFieldError,
    hasAnyErrors,
    clearFieldError,
    setFieldError,
  };
}
