import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number) => void;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    exponentialBackoff = true,
    onRetry,
  } = options;

  const [attempts, setAttempts] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setAttempts(attempt);
          const result = await fn();
          setAttempts(0);
          setIsRetrying(false);
          return result;
        } catch (error) {
          lastError = error as Error;

          if (attempt < maxAttempts) {
            setIsRetrying(true);
            onRetry?.(attempt);

            const currentDelay = exponentialBackoff
              ? delay * Math.pow(2, attempt - 1)
              : delay;

            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }
        }
      }

      setIsRetrying(false);
      throw lastError!;
    },
    [maxAttempts, delay, exponentialBackoff, onRetry]
  );

  const reset = useCallback(() => {
    setAttempts(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    attempts,
    isRetrying,
    reset,
    canRetry: attempts < maxAttempts,
  };
};
