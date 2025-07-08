import { useState, useCallback, useMemo } from 'react';
import { useApiQuery } from './use-api-query';
import {
  RequestTransformer,
  ResponseTransformer,
} from '@/lib/api/transformers';

interface PaginatedQueryOptions {
  initialPage?: number;
  initialLimit?: number;
  enabled?: boolean;
  keepPreviousData?: boolean;
}

export const usePaginatedQuery = <T = any>(
  url: string,
  baseParams: Record<string, any> = {},
  options: PaginatedQueryOptions = {}
) => {
  const {
    initialPage = 1,
    initialLimit = 20,
    enabled = true,
    keepPreviousData = true,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [previousData, setPreviousData] = useState<any>(null);

  const params = useMemo(
    () =>
      RequestTransformer.paginationParams({
        ...baseParams,
        page,
        limit,
      }),
    [baseParams, page, limit]
  );

  const {
    data: rawData,
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch,
  } = useApiQuery(url, params, {
    enabled,
    cacheKey: `${url}:paginated:${JSON.stringify(params)}`,
    onSuccess: data => {
      if (keepPreviousData) {
        setPreviousData(data);
      }
    },
  });

  const data = useMemo(() => {
    if (rawData) {
      return ResponseTransformer.pagination<T>(rawData);
    }

    if (keepPreviousData && previousData) {
      return ResponseTransformer.pagination<T>(previousData);
    }

    return null;
  }, [rawData, previousData, keepPreviousData]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (data && newPage >= 1 && newPage <= data.meta.totalPages) {
        setPage(newPage);
      }
    },
    [data]
  );

  const nextPage = useCallback(() => {
    if (data?.meta.hasNext) {
      setPage(prev => prev + 1);
    }
  }, [data?.meta.hasNext]);

  const previousPage = useCallback(() => {
    if (data?.meta.hasPrevious) {
      setPage(prev => prev - 1);
    }
  }, [data?.meta.hasPrevious]);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
  }, [initialPage, initialLimit]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch,

    // Pagination controls
    page,
    limit,
    goToPage,
    nextPage,
    previousPage,
    changeLimit,
    reset,

    // Pagination info
    hasNext: data?.meta.hasNext || false,
    hasPrevious: data?.meta.hasPrevious || false,
    totalPages: data?.meta.totalPages || 0,
    total: data?.meta.total || 0,
  };
};
