'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  useBreakpoint,
  getResponsiveValue,
  type Breakpoint,
} from '@/lib/responsive';

type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: ResponsiveValue<string>;
  maxWidth?: ResponsiveValue<string>;
  padding?: ResponsiveValue<string>;
  margin?: ResponsiveValue<string>;
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = {
    xs: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  padding = { xs: '1rem', md: '2rem' },
  margin = 'auto',
  as: Component = 'div',
}) => {
  const currentBreakpoint = useBreakpoint();

  const responsiveClassName = getResponsiveValue(className, currentBreakpoint);
  const responsiveMaxWidth = getResponsiveValue(maxWidth, currentBreakpoint);
  const responsivePadding = getResponsiveValue(padding, currentBreakpoint);
  const responsiveMargin = getResponsiveValue(margin, currentBreakpoint);

  return (
    <Component
      className={cn('w-full', responsiveClassName)}
      style={{
        maxWidth: responsiveMaxWidth,
        padding: responsivePadding,
        margin: responsiveMargin,
      }}
    >
      {children}
    </Component>
  );
};
