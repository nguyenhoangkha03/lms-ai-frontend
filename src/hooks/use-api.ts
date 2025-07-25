import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import type { AxiosRequestConfig } from 'axios';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  transform?: (data: any) => T;
}

export const useApi = <T = any>(
  config: AxiosRequestConfig,
  options: UseApiOptions<T> = {}
) => {
  const { immediate = true, onSuccess, onError, transform } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const execute = async (overrideConfig?: AxiosRequestConfig) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.request({
        ...config,
        ...overrideConfig,
      });

      const responseData = transform ? transform(response.data) : response.data;
      setData(responseData);
      onSuccess?.(responseData);

      return responseData;
    } catch (err) {
      setError(err);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute(),
  };
};
