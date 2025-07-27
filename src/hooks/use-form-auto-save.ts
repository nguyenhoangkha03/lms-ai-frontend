'use client';

import { useEffect, useState, useCallback } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { useDebounce } from './use-debounce';

interface UseFormAutoSaveOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSave: (data: T) => Promise<void>;
  enabled?: boolean;
  debounceMs?: number;
  saveOnUnmount?: boolean;
}

export function useFormAutoSave<T extends FieldValues>({
  form,
  onSave,
  enabled = true,
  debounceMs = 2000,
  saveOnUnmount = true,
}: UseFormAutoSaveOptions<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formData = form.watch();
  const debouncedFormData = useDebounce(formData, debounceMs);

  const saveData = useCallback(
    async (data: T) => {
      if (!enabled) return;

      try {
        setIsSaving(true);
        setSaveError(null);
        await onSave(data);
        setLastSaved(new Date());
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : 'Save failed');
      } finally {
        setIsSaving(false);
      }
    },
    [enabled, onSave]
  );

  useEffect(() => {
    if (enabled && debouncedFormData && form.formState.isDirty) {
      saveData(debouncedFormData);
    }
  }, [debouncedFormData, enabled, saveData, form.formState.isDirty]);

  useEffect(() => {
    return () => {
      if (saveOnUnmount && enabled && form.formState.isDirty) {
        saveData(form.getValues());
      }
    };
  }, [saveOnUnmount, enabled, form, saveData]);

  const manualSave = useCallback(() => {
    return saveData(form.getValues());
  }, [saveData, form]);

  return {
    isSaving,
    lastSaved,
    saveError,
    manualSave,
  };
}
