import { useCallback } from 'react';
import { useApiQuery } from './use-api-query';
import { useApiMutation } from './use-api-mutation';
import { usePaginatedQuery } from './use-paginated-query';
import { useInfiniteQuery } from './use-infinite-query';
import { useSearch } from './use-search';
import { useUpload } from './use-upload';

export const useEnhancedApi = () => {
  // Query wrapper
  const query = useCallback((url: string, params?: any, options?: any) => {
    return useApiQuery(url, params, options);
  }, []);

  // Mutation wrapper
  const mutation = useCallback((mutationFn: any, options?: any) => {
    return useApiMutation(mutationFn, options);
  }, []);

  // Paginated query wrapper
  const paginatedQuery = useCallback(
    (url: string, params?: any, options?: any) => {
      return usePaginatedQuery(url, params, options);
    },
    []
  );

  // Infinite query wrapper
  const infiniteQuery = useCallback(
    (url: string, params?: any, options?: any) => {
      return useInfiniteQuery(url, params, options);
    },
    []
  );

  // Search wrapper
  const search = useCallback((url: string, options?: any) => {
    return useSearch(url, options);
  }, []);

  // Upload wrapper
  const upload = useCallback((url: string, options?: any) => {
    return useUpload(url, options);
  }, []);

  return {
    query,
    mutation,
    paginatedQuery,
    infiniteQuery,
    search,
    upload,
  };
};
