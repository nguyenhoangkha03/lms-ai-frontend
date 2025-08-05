import { useEffect, useRef } from 'react';
import { LMSPerformanceAnalytics } from '@/lib/performance/analytics-integration';

export const usePerformanceTracking = (pageName?: string) => {
  const analytics = LMSPerformanceAnalytics.getInstance();
  const startTime = useRef(Date.now());
  const observed = useRef(false);

  useEffect(() => {
    if (observed.current) return;
    observed.current = true;

    const trackPageLoad = () => {
      const loadTime = Date.now() - startTime.current;
      analytics.trackPageLoad(pageName || window.location.pathname, loadTime);
    };

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
    }

    // Track Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals/attribution').then((webVitals: any) => {
        webVitals.getCLS(console.log);
        webVitals.getFID(console.log);
        webVitals.getFCP(console.log);
        webVitals.getLCP(console.log);
        webVitals.getTTFB(console.log);
      });
    }

    // Track resource loading
    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          analytics.trackResourceLoad(
            resourceEntry.name,
            resourceEntry.duration,
            resourceEntry.transferSize || 0
          );
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => {
      window.removeEventListener('load', trackPageLoad);
      observer.disconnect();
    };
  }, [analytics, pageName]);

  // Manual tracking functions
  const trackCustomTiming = (name: string, startTime: number) => {
    const duration = Date.now() - startTime;
    analytics.trackUserTiming(name, duration);
  };

  const trackError = (error: Error, context: string) => {
    analytics.trackError(error, context);
  };

  return {
    trackCustomTiming,
    trackError,
  };
};
