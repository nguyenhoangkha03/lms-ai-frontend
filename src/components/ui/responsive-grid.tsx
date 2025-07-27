'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  useBreakpoint,
  getResponsiveValue,
  type Breakpoint,
} from '@/lib/responsive';

type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<string>;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = '1rem',
  className,
}) => {
  const currentBreakpoint = useBreakpoint();

  const responsiveColumns = getResponsiveValue(columns, currentBreakpoint);
  const responsiveGap = getResponsiveValue(gap, currentBreakpoint);

  return (
    <div
      className={cn('grid', className)}
      style={{
        gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        gap: responsiveGap,
      }}
    >
      {children}
    </div>
  );
};
