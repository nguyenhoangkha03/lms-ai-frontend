'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { ErrorInfo, ErrorType } from '@/lib/errors/error-handler';

interface ApiErrorProps {
  error: ErrorInfo;
  onRetry?: () => void;
  className?: string;
}

export function ApiError({ error, onRetry, className }: ApiErrorProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '🌐';
      case ErrorType.AUTHENTICATION:
        return '🔐';
      case ErrorType.AUTHORIZATION:
        return '🚫';
      case ErrorType.NOT_FOUND:
        return '🔍';
      case ErrorType.SERVER:
        return '🖥️';
      default:
        return '⚠️';
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return 'Connection Error';
      case ErrorType.AUTHENTICATION:
        return 'Authentication Required';
      case ErrorType.AUTHORIZATION:
        return 'Access Denied';
      case ErrorType.NOT_FOUND:
        return 'Not Found';
      case ErrorType.SERVER:
        return 'Server Error';
      case ErrorType.VALIDATION:
        return 'Validation Error';
      default:
        return 'Error';
    }
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <span>{getErrorIcon()}</span>
        {getErrorTitle()}
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p>{error.message}</p>

        {error.details && error.details.length > 0 && (
          <ul className="mt-2 list-inside list-disc text-sm">
            {error.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}

        {error.status && (
          <p className="text-muted-foreground mt-2 text-xs">
            Status: {error.status} {error.code && `(${error.code})`}
          </p>
        )}

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-3"
          >
            <RefreshCw className="mr-1 h-3 w-3" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
