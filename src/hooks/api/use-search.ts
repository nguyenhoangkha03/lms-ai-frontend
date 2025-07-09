import { useState, useCallback, useMemo } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useApiQuery } from './use-api-query';

interface SearchOptions {
  debounceMs?: number;
  minLength?: number;
  enabled?: boolean;
}

export const useSearch = <T = any>(
  searchUrl: string,
  options: SearchOptions = {}
) => {
  const { debounceMs = 300, minLength = 2, enabled = true } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const debouncedQuery = useDebouncedValue(query, debounceMs);

  const shouldSearch = useMemo(
    () => enabled && debouncedQuery.length >= minLength,
    [enabled, debouncedQuery, minLength]
  );

  const searchParams = useMemo(
    () => ({
      q: debouncedQuery,
      ...filters,
    }),
    [debouncedQuery, filters]
  );

  const { data, error, isLoading, isFetching, isSuccess, isError, refetch } =
    useApiQuery<T[]>(searchUrl, searchParams, {
      enabled: shouldSearch,
      cacheKey: `search:${searchUrl}:${JSON.stringify(searchParams)}`,
    });

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
  }, []);

  return {
    query,
    debouncedQuery,
    filters,
    data: data || [],
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    updateQuery,
    updateFilters,
    clearSearch,
    refetch,
    hasResults: (data && data.length > 0) || false,
    isSearching: shouldSearch && (isLoading || isFetching),
  };
};
