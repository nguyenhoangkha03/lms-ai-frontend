'use client';

import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface FormErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function FormErrorFallback({
  error,
  resetErrorBoundary,
}: FormErrorFallbackProps) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Form Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-4">
          Something went wrong with the form. Please try again.
        </p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm font-medium">
            Error details
          </summary>
          <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
            {error.message}
          </pre>
        </details>
        <Button
          variant="outline"
          size="sm"
          onClick={resetErrorBoundary}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FormErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function FormErrorBoundary({
  children,
  fallback: Fallback = FormErrorFallback,
  onError,
}: FormErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback}
      onError={onError}
      onReset={() => {
        // Reset any state if needed
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
