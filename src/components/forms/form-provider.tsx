'use client';

import React, { createContext, useContext } from 'react';
import { FormErrorBoundary } from './form-error-boundary';

interface FormContextValue {
  showValidationErrors: boolean;
  autoSave: boolean;
  persistForm: boolean;
  defaultErrorMessages: Record<string, string>;
}

const FormContext = createContext<FormContextValue>({
  showValidationErrors: true,
  autoSave: false,
  persistForm: false,
  defaultErrorMessages: {},
});

export const useFormContext = () => useContext(FormContext);

interface FormProviderProps {
  children: React.ReactNode;
  config?: Partial<FormContextValue>;
  enableErrorBoundary?: boolean;
}

export function FormProvider({
  children,
  config = {},
  enableErrorBoundary = true,
}: FormProviderProps) {
  const contextValue: FormContextValue = {
    showValidationErrors: true,
    autoSave: false,
    persistForm: false,
    defaultErrorMessages: {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      min: 'Value is too small',
      max: 'Value is too large',
    },
    ...config,
  };

  const content = (
    <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>
  );

  if (enableErrorBoundary) {
    return <FormErrorBoundary>{content}</FormErrorBoundary>;
  }

  return content;
}
