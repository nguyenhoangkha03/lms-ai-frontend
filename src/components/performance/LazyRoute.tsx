import React, { Suspense } from 'react';
import { LazyPages } from '@/lib/performance/code-splitting';
import { PageLoader } from '@/components/performance/page-loader';
import { ErrorBoundary } from '@/lib/error-boundary';

interface LazyRouteProps {
  page: keyof typeof LazyPages;
  fallback?: React.ComponentType;
  [key: string]: any;
}

export const LazyRoute: React.FC<LazyRouteProps> = ({
  page,
  fallback: Fallback = PageLoader,
  ...props
}) => {
  const LazyComponent = LazyPages[page];

  if (!LazyComponent) {
    console.error(`Lazy page "${page}" not found`);
    return <div>Page not found</div>;
  }

  const mergedProps = {
    searchParams: {},
    ...props,
  };

  return (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <LazyComponent {...mergedProps} />
      </Suspense>
    </ErrorBoundary>
  );
};
