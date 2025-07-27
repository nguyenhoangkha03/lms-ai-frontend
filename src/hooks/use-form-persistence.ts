'use client';

import { useEffect, useCallback } from 'react';
import { UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form';

interface UseFormPersistenceOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  key: string;
  enabled?: boolean;
  storage?: 'localStorage' | 'sessionStorage';
  exclude?: (keyof T)[];
  debounceMs?: number;
}

export function useFormPersistence<T extends FieldValues>({
  form,
  key,
  enabled = true,
  storage = 'localStorage',
  exclude = [],
  debounceMs = 1000,
}: UseFormPersistenceOptions<T>) {
  const { watch, reset, getValues } = form;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    try {
      const storageKey = `form_${key}`;
      const savedData = window[storage].getItem(storageKey);

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        const filteredData = Object.fromEntries(
          Object.entries(parsedData).filter(
            ([key]) => !exclude.includes(key as keyof T)
          )
        );

        reset(filteredData as DefaultValues<T>);
      }
    } catch (error) {
      console.warn('Failed to load form data from storage:', error);
    }
  }, [key, enabled, storage, exclude, reset]);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const subscription = watch(data => {
      const timeoutId = setTimeout(() => {
        try {
          const storageKey = `form_${key}`;

          const filteredData = Object.fromEntries(
            Object.entries(data).filter(
              ([key, value]) =>
                !exclude.includes(key as keyof T) && value !== undefined
            )
          );

          window[storage].setItem(storageKey, JSON.stringify(filteredData));
        } catch (error) {
          console.warn('Failed to save form data to storage:', error);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [watch, key, enabled, storage, exclude, debounceMs]);

  const clearStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = `form_${key}`;
      window[storage].removeItem(storageKey);
    } catch (error) {
      console.warn('Failed to clear form data from storage:', error);
    }
  }, [key, storage]);

  return {
    clearStorage,
  };
}
