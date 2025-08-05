'use client';

import React, { Suspense } from 'react';
import { usePerformanceTracking } from '@/hooks/usePerformanceTracking';
import { ErrorBoundary } from '@/lib/error-boundary';
import { LazyComponents } from '@/lib/performance/code-splitting';
import { LMSPerformanceAnalytics } from '@/lib/performance/analytics-integration';

interface OptimizedLayoutProps {
  children: React.ReactNode;
  pageName?: string;
}

export const OptimizedLayout: React.FC<OptimizedLayoutProps> = ({
  children,
  pageName,
}) => {
  usePerformanceTracking(pageName);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header - Load immediately */}
        <header className="border-b">
          <Suspense
            fallback={<div className="h-16 animate-pulse bg-gray-100" />}
          >
            <LazyComponents.NavigationHeader />
          </Suspense>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer - Load lazily */}
        <Suspense fallback={null}>
          <LazyComponents.Footer />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
};

export const performanceAnalytics = LMSPerformanceAnalytics.getInstance();
