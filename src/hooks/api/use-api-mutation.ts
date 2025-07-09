import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/hooks/ui/use-toast';

interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  onSettled?: (
    data: TData | undefined,
    error: any,
    variables: TVariables
  ) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export const useApiMutation = <TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: MutationOptions<TData, TVariables> = {}
) => {
  const {
    onSuccess,
    onError,
    onSettled,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
  } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const { toast } = useToast();

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      setError(null);
      setData(undefined);

      try {
        const result = await mutationFn(variables);

        setData(result);
        setIsSuccess(true);

        if (showSuccessToast) {
          toast({
            type: 'success',
            message: successMessage,
          });
        }

        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);

        return result;
      } catch (err) {
        setError(err);
        setIsError(true);

        if (showErrorToast) {
          const errorMessage =
            err?.response?.data?.message || err?.message || 'An error occurred';
          toast({
            type: 'error',
            message: errorMessage,
          });
        }

        onError?.(err, variables);
        onSettled?.(undefined, err, variables);

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      mutationFn,
      onSuccess,
      onError,
      onSettled,
      showSuccessToast,
      showErrorToast,
      successMessage,
      toast,
    ]
  );

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
  }, []);

  return {
    mutate,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    reset,
  };
};
