import { useEffect, useRef, useCallback } from 'react';
import { usePerformance } from '@/components/performance/PerformanceProvider';
import { CacheKeys, CacheConfigs } from '@/lib/performance/code-splitting';

interface UsePerformanceOptimizationOptions {
  enableCaching?: boolean;
  preloadRoutes?: string[];
  trackMetrics?: boolean;
}

export const usePerformanceOptimization = (
  options: UsePerformanceOptimizationOptions = {}
) => {
  const {
    enableCaching = true,
    preloadRoutes = [],
    trackMetrics = true,
  } = options;

  const { cache, monitor } = usePerformance();
  const metricsTracked = useRef(false);

  // Track page metrics
  useEffect(() => {
    if (trackMetrics && !metricsTracked.current) {
      metricsTracked.current = true;

      // Track page load time
      const startTime = performance.now();

      return () => {
        const loadTime = performance.now() - startTime;
        monitor.reportCustomMetric?.('page_load_time', loadTime);
      };
    }
  }, [trackMetrics, monitor]);

  // Preload routes
  useEffect(() => {
    if (preloadRoutes.length > 0) {
      preloadRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }, [preloadRoutes]);

  // Cached API call
  const cachedFetch = useCallback(
    async <T>(
      key: string,
      fetcher: () => Promise<T>,
      cacheType: keyof typeof CacheConfigs = 'user'
    ): Promise<T> => {
      if (!enableCaching) {
        return fetcher();
      }

      const config = CacheConfigs[cacheType];
      return cache.smartGet(key, fetcher, config);
    },
    [cache, enableCaching]
  );

  // Cache invalidation
  const invalidateCache = useCallback(
    (pattern: string) => {
      cache.invalidate(pattern);
    },
    [cache]
  );

  // Performance helpers
  const measureOperation = useCallback(
    <T>(name: string, operation: () => T): T => {
      const start = performance.now();
      const result = operation();
      const duration = performance.now() - start;

      console.log(`Operation "${name}" took ${duration.toFixed(2)}ms`);
      return result;
    },
    []
  );

  return {
    cachedFetch,
    invalidateCache,
    measureOperation,
    cache,
    monitor,
  };
};
