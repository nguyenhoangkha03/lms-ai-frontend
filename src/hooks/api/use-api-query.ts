import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api/client';
import { ApiCache } from '@/lib/api/cache';
import { useNetworkStatus } from '../utils/use-network-status';

interface QueryOptions {
  enabled?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: boolean;
  retryAttempts?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApiQuery = <T = any>(
  url: string,
  params?: Record<string, any>,
  options: QueryOptions = {}
) => {
  const {
    enabled = true,
    cacheKey,
    cacheTTL,
    refetchOnWindowFocus = true,
    refetchOnMount = true,
    retry = true,
    retryAttempts = 3,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const cache = useRef(ApiCache.getInstance());
  const { isOnline } = useNetworkStatus();
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback(() => {
    return cacheKey || `${url}:${JSON.stringify(params || {})}`;
  }, [url, params, cacheKey]);

  const fetchData = useCallback(
    async (isRefetch = false) => {
      if (!enabled || !isOnline) return;

      const key = getCacheKey();

      // Check cache first (except for refetch)
      if (!isRefetch) {
        const cachedData = cache.current.get<T>(key);
        if (cachedData) {
          setData(cachedData);
          setIsSuccess(true);
          setIsError(false);
          setError(null);
          onSuccess?.(cachedData);
          return;
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setIsFetching(true);
      if (!data || !isRefetch) {
        setIsLoading(true);
      }
      setIsError(false);
      setError(null);

      let attempts = 0;
      const maxAttempts = retry ? retryAttempts : 1;

      while (attempts < maxAttempts) {
        try {
          const response = await apiClient.get<T>(url, {
            params,
            signal: abortControllerRef.current.signal,
          });

          setData(response);
          setIsSuccess(true);
          setIsError(false);
          setError(null);

          // Cache the response
          if (cacheTTL !== 0) {
            cache.current.set(key, response, cacheTTL);
          }

          onSuccess?.(response);
          break;
        } catch (err: any) {
          if (err.name === 'AbortError') {
            return; // Request was cancelled
          }

          attempts++;

          if (attempts >= maxAttempts) {
            setIsError(true);
            setError(err);
            setIsSuccess(false);
            onError?.(err);
          } else {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }
      }

      setIsLoading(false);
      setIsFetching(false);
    },
    [
      enabled,
      isOnline,
      url,
      params,
      getCacheKey,
      data,
      retry,
      retryAttempts,
      cacheTTL,
      onSuccess,
      onError,
    ]
  );

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    const key = getCacheKey();
    cache.current.delete(key);
  }, [getCacheKey]);

  // Initial fetch
  useEffect(() => {
    if (refetchOnMount) {
      fetchData();
    }
  }, [fetchData, refetchOnMount]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchData, refetchOnWindowFocus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch,
    invalidate,
  };
};
