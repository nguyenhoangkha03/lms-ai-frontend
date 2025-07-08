import { useState, useCallback, useMemo } from 'react';
import { useApiQuery } from './use-api-query';

interface InfiniteQueryOptions {
  initialPage?: number;
  limit?: number;
  enabled?: boolean;
  getNextPageParam?: (lastPage: any, allPages: any[]) => number | undefined;
}

export const useInfiniteQuery = <T = any>(
  url: string,
  baseParams: Record<string, any> = {},
  options: InfiniteQueryOptions = {}
) => {
  const {
    initialPage = 1,
    limit = 20,
    enabled = true,
    getNextPageParam,
  } = options;

  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const params = useMemo(
    () => ({
      ...baseParams,
      page: currentPage,
      limit,
    }),
    [baseParams, currentPage, limit]
  );

  const {
    data: currentData,
    error,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    refetch: refetchCurrentPage,
  } = useApiQuery(url, params, {
    enabled: enabled && hasNextPage,
    onSuccess: data => {
      const transformedData = ResponseTransformer.pagination<T>(data);

      setPages(prev => {
        const newPages = [...prev];
        const pageIndex = currentPage - initialPage;
        newPages[pageIndex] = transformedData;
        return newPages;
      });

      // Determine if there's a next page
      const nextPage = getNextPageParam
        ? getNextPageParam(transformedData, pages)
        : transformedData.meta.hasNext
          ? currentPage + 1
          : undefined;

      setHasNextPage(nextPage !== undefined);
    },
  });

  const allData = useMemo(() => {
    const items = pages.reduce((acc, page) => {
      if (page?.items) {
        acc.push(...page.items);
      }
      return acc;
    }, []);

    const lastPage = pages[pages.length - 1];

    return {
      items,
      totalItems: lastPage?.meta?.total || 0,
      currentPage,
      hasNextPage,
    };
  }, [pages, currentPage, hasNextPage]);

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    setIsFetchingNextPage(true);
    setCurrentPage(prev => prev + 1);
    setIsFetchingNextPage(false);
  }, [hasNextPage, isFetchingNextPage]);

  const refetch = useCallback(() => {
    setPages([]);
    setCurrentPage(initialPage);
    setHasNextPage(true);
    return refetchCurrentPage();
  }, [initialPage, refetchCurrentPage]);

  return {
    data: allData,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isSuccess,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
};
